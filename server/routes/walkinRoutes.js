const express = require('express');
const router = express.Router();
const Walkin = require('../models/Walkin');
const Company = require('../models/Company');
const { sendNewWalkinNotification } = require('../services/telegram');

// Get all walkins with filters
router.get('/', async (req, res) => {
    try {
        const { search, company, page = 1, limit = 12 } = req.query;

        let query = { isActive: true };

        // Filter by status (default to 'published' unless 'all' or specific status requested)
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        } else if (req.query.status !== 'all') {
            // For public: ONLY show explicitly published walkins (strict filtering)
            query.status = 'published';
        }

        // Add cache control to reduce re-fetching, but disable for admin (status=all)
        if (req.query.status === 'all') {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        } else {
            res.set('Cache-Control', 'public, max-age=10'); // 10 seconds
        }

        // Search filter
        if (search) {
            query = {
                $and: [
                    query,
                    {
                        $or: [
                            { company: { $regex: search, $options: 'i' } },
                            { description: { $regex: search, $options: 'i' } }
                        ]
                    }
                ]
            };
        }

        // Company filter
        if (company) {
            if (query.$and) {
                query.$and.push({ company: { $regex: company, $options: 'i' } });
            } else {
                query.company = { $regex: company, $options: 'i' };
            }
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Use aggregation to sort by publishedAt with fallback to createdAt
        const walkins = await Walkin.aggregate([
            { $match: query },
            {
                $addFields: {
                    sortDate: { $ifNull: ['$publishedAt', '$createdAt'] }
                }
            },
            { $sort: { sortDate: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        const total = await Walkin.countDocuments(query);

        res.json({
            walkins,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get latest walkins for homepage
router.get('/latest', async (req, res) => {
    try {
        console.log('GET /walkins/latest - Fetching published walkins only');
        
        const walkins = await Walkin.find({
            isActive: true,
            status: 'published'  // MUST be explicitly published
        })
            .sort({ publishedAt: -1, createdAt: -1 })
            .limit(9);

        console.log(`GET /walkins/latest - Returning ${walkins.length} published walkins`);
        res.json(walkins);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single walkin by ID
router.get('/:id', async (req, res) => {
    try {
        const walkin = await Walkin.findById(req.params.id);

        if (!walkin) {
            return res.status(404).json({ message: 'Walkin not found' });
        }

        const isAdminView = req.query.view === 'admin';

        if (!isAdminView) {
            // Only treat explicit 'published' as published; draft should NOT be public
            const isPublished = walkin.status === 'published';

            if (!walkin.isActive || !isPublished) {
                return res.status(404).json({ message: 'Walkin not found or not published' });
            }
        }

        res.json(walkin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new walkin
router.post('/', async (req, res) => {
    try {
        // Default to draft unless an explicit valid status is provided
        let status = req.body.status || 'draft';
        if (!['draft', 'published'].includes(status)) {
            status = 'draft';
        }

        const walkinData = {
            company: req.body.company,
            description: req.body.description,
            status
        };

        if (walkinData.status === 'published') {
            walkinData.publishedAt = new Date();
        }

        const walkin = new Walkin(walkinData);
        const savedWalkin = await walkin.save();

        // Save/update company for autocomplete feature
        const existingCompany = await Company.findOne({
            name: { $regex: `^${req.body.company}$`, $options: 'i' }
        });

        if (!existingCompany) {
            const newCompany = new Company({
                name: req.body.company,
                logo: ''
            });
            await newCompany.save();
        }

        // Send Telegram notification if walkin is published
        if (savedWalkin.status === 'published') {
            console.log('🔔 New walkin published, sending Telegram notification...');
            sendNewWalkinNotification(savedWalkin).catch(err => {
                console.error('⚠️ Telegram notification failed (non-blocking):', err.message);
            });
        }

        res.status(201).json(savedWalkin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update walkin
router.put('/:id', async (req, res) => {
    try {
        const walkin = await Walkin.findById(req.params.id);
        if (!walkin) {
            return res.status(404).json({ message: 'Walkin not found' });
        }

        // Ensure incoming status is valid; preserve existing if omitted
        let newStatus = req.body.status || walkin.status;
        if (!['draft', 'published'].includes(newStatus)) {
            newStatus = 'draft';
        }

        // Check if we are moving from a non-published state to published
        const isCurrentlyPublished = walkin.status === 'published';
        const willBePublished = newStatus === 'published';

        if (!isCurrentlyPublished && willBePublished) {
            // Only set publishedAt when first publishing, don't modify createdAt
            walkin.publishedAt = new Date();
            walkin.markModified('publishedAt');
        }

        // Update fields
        walkin.company = req.body.company;
        walkin.description = req.body.description;
        walkin.status = newStatus;

        const savedWalkin = await walkin.save({ timestamps: false });
        
        // Send Telegram notification when publishing a draft
        if (!isCurrentlyPublished && willBePublished) {
            console.log('🔔 Draft walkin published, sending Telegram notification...');
            sendNewWalkinNotification(savedWalkin).catch(err => {
                console.error('⚠️ Telegram notification failed (non-blocking):', err.message);
            });
        }
        
        res.json(savedWalkin);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete walkin
router.delete('/:id', async (req, res) => {
    try {
        const walkin = await Walkin.findByIdAndDelete(req.params.id);

        if (!walkin) {
            return res.status(404).json({ message: 'Walkin not found' });
        }

        res.json({ message: 'Walkin deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Submit feedback (useful/not useful)
router.post('/:id/feedback', async (req, res) => {
    try {
        const { type } = req.body; // 'useful' or 'notUseful'

        if (!type || !['useful', 'notUseful'].includes(type)) {
            return res.status(400).json({ message: 'Invalid feedback type' });
        }

        const walkin = await Walkin.findById(req.params.id);
        if (!walkin) {
            return res.status(404).json({ message: 'Walkin not found' });
        }

        // Increment the appropriate counter
        if (type === 'useful') {
            walkin.usefulCount = (walkin.usefulCount || 0) + 1;
        } else {
            walkin.notUsefulCount = (walkin.notUsefulCount || 0) + 1;
        }

        await walkin.save();
        res.json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

