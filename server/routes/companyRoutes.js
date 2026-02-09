const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// Get all companies for autocomplete
router.get('/', async (req, res) => {
    try {
        const companies = await Company.find().sort({ name: 1 });
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get company by name
router.get('/:name', async (req, res) => {
    try {
        const company = await Company.findOne({
            name: { $regex: `^${req.params.name}$`, $options: 'i' }
        });

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search companies (for autocomplete)
router.get('/search/:query', async (req, res) => {
    try {
        const companies = await Company.find({
            name: { $regex: req.params.query, $options: 'i' }
        }).limit(10);

        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update company logo by name
router.put('/:name', async (req, res) => {
    try {
        const { logo } = req.body;

        if (!logo || logo.trim() === '') {
            return res.status(400).json({ message: 'Logo URL is required' });
        }

        const company = await Company.findOneAndUpdate(
            { name: { $regex: `^${req.params.name}$`, $options: 'i' } },
            { logo: logo.trim() },
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({
            message: 'Company logo updated successfully',
            company: company
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update company about section and other details
router.patch('/:name', async (req, res) => {
    try {
        const { logo, aboutCompany } = req.body;
        const updateData = {};

        if (logo && logo.trim() !== '') {
            updateData.logo = logo.trim();
        }

        if (aboutCompany && aboutCompany.trim() !== '') {
            updateData.aboutCompany = aboutCompany.trim();
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const company = await Company.findOneAndUpdate(
            { name: { $regex: `^${req.params.name}$`, $options: 'i' } },
            updateData,
            { new: true, runValidators: true }
        );

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json({
            message: 'Company updated successfully',
            company: company
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
