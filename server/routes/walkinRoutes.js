const express = require('express');
const router = express.Router();
const Walkin = require('../models/Walkin');
const Company = require('../models/Company');

// Get all walkins with filters
router.get('/', async (req, res) => {
    try {
        const { search, company, page = 1, limit = 12 } = req.query;

        let query = { isActive: true };

        // Search filter
        if (search) {
            query.$or = [
                { company: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Company filter
        if (company) {
            query.company = { $regex: company, $options: 'i' };
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
        const walkins = await Walkin.find({ isActive: true })
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
        const walkin = new Walkin({
            company: req.body.company,
            description: req.body.description
        });
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
        const walkin = await Walkin.findByIdAndUpdate(
            req.params.id,
            {
                company: req.body.company,
                description: req.body.description
            },
            { new: true, runValidators: true }
        );

        if (!walkin) {
            return res.status(404).json({ message: 'Walkin not found' });
        }

        res.json(walkin);
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
