const express = require('express');
const router = express.Router();
const Walkin = require('../models/Walkin');
const Company = require('../models/Company');

// Get all walkins with filters
router.get('/', async (req, res) => {
    try {
        const { search, company, page = 1, limit = 12 } = req.query;

        let query = { isActive: true };

        // Filter by status (default to 'published' unless 'all' or specific status requested)
        // Also handle backward compatibility for missing status field
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        } else if (req.query.status !== 'all') {
            query.$or = [
                { status: 'published' },
                { status: { $exists: false } }
            ];
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

        const walkins = await Walkin.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

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
        const walkins = await Walkin.find({
            isActive: true,
            $or: [
                { status: 'published' },
                { status: { $exists: false } }
            ]
        })
            .sort({ createdAt: -1 })
            .limit(9);

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

        res.json(walkin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new walkin
router.post('/', async (req, res) => {
    try {
        const walkinData = {
            company: req.body.company,
            description: req.body.description,
            status: req.body.status || 'published' // Walkins are usually published directly
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

        // Check if we are moving from a non-published state to published
        const isCurrentlyPublished = walkin.status === 'published';
        const willBePublished = req.body.status === 'published';

        if (!isCurrentlyPublished && willBePublished) {
            walkin.publishedAt = new Date();
            walkin.createdAt = new Date();
            walkin.markModified('createdAt');
            walkin.markModified('publishedAt');
        }

        // Update fields
        walkin.company = req.body.company;
        walkin.description = req.body.description;
        walkin.status = req.body.status;

        const savedWalkin = await walkin.save({ timestamps: false });
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

module.exports = router;
