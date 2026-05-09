const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const https = require('https');
const http = require('http');

// Fetch company logo from external API
router.get('/fetch-logo/:companyName', async (req, res) => {
    try {
        const companyName = req.params.companyName;
        const domains = [
            companyName.toLowerCase().replace(/\s+/g, '') + '.com',
            companyName.toLowerCase().replace(/\s+/g, '-') + '.com',
            companyName.toLowerCase().replace(/\s+/g, '') + '.in',
            companyName.toLowerCase().replace(/\s+/g, '') + '.io',
            companyName.toLowerCase().replace(/\s+/g, '') + '.co'
        ];

        const checkUrl = (url) => new Promise((resolve) => {
            const protocol = url.startsWith('https') ? https : http;
            protocol.get(url, (response) => {
                resolve(response.statusCode === 200);
            }).on('error', () => resolve(false));
        });

        for (const domain of domains) {
            const logoUrl = `https://logo.clearbit.com/${domain}`;
            if (await checkUrl(logoUrl)) {
                return res.json({ success: true, logoUrl, source: 'clearbit' });
            }
        }

        res.json({ success: false, message: 'Logo not found', logoUrl: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get all companies (from published jobs)
router.get('/', async (req, res) => {
    try {
        const Job = require('../models/Job');
        const jobs = await Job.find({
            type: { $in: ['job', 'internship'] },
            isActive: true,
            status: 'published'
        }).select('company companyLogo');

        const companyMap = new Map();
        jobs.forEach(job => {
            if (!job.company) return;
            if (!companyMap.has(job.company)) {
                companyMap.set(job.company, { name: job.company, logo: job.companyLogo || null, jobCount: 0 });
            }
            companyMap.get(job.company).jobCount += 1;
        });

        const companies = Array.from(companyMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get company by name
router.get('/:name', async (req, res) => {
    try {
        const company = await Company.findOne({
            name: { $regex: new RegExp('^' + req.params.name + '$', 'i') }
        });
        if (!company) return res.status(404).json({ message: 'Company not found' });
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Search companies
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

// Update company logo by name (PUT)
router.put('/:name', async (req, res) => {
    try {
        const { logo, aboutCompany } = req.body;
        if (!logo || !logo.trim()) {
            return res.status(400).json({ message: 'Logo URL is required' });
        }

        const updateData = { logo: logo.trim() };
        if (aboutCompany && aboutCompany.trim()) updateData.aboutCompany = aboutCompany.trim();

        const nameRegex = new RegExp('^' + req.params.name + '$', 'i');

        const company = await Company.findOneAndUpdate(
            { name: { $regex: nameRegex } },
            updateData,
            { new: true, runValidators: true }
        );
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Propagate logo to all Job documents
        const Job = require('../models/Job');
        await Job.updateMany(
            { company: { $regex: nameRegex } },
            { $set: { companyLogo: logo.trim() } }
        );

        res.json({ message: 'Company logo updated successfully', company });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save or create company logo
router.post('/logo', async (req, res) => {
    try {
        const { company, logo } = req.body;
        if (!company || !company.trim()) return res.status(400).json({ message: 'Company name is required' });
        if (!logo || !logo.trim()) return res.status(400).json({ message: 'Logo URL is required' });

        const nameRegex = new RegExp('^' + company.trim() + '$', 'i');
        let savedCompany = await Company.findOneAndUpdate(
            { name: { $regex: nameRegex } },
            { logo: logo.trim() },
            { new: true, runValidators: true }
        );

        if (!savedCompany) {
            savedCompany = new Company({ name: company.trim(), logo: logo.trim() });
            await savedCompany.save();
        }

        res.json({ message: 'Company logo saved successfully', company: savedCompany });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update company details (PATCH)
router.patch('/:name', async (req, res) => {
    try {
        const { logo, aboutCompany } = req.body;
        const updateData = {};
        if (logo && logo.trim()) updateData.logo = logo.trim();
        if (aboutCompany && aboutCompany.trim()) updateData.aboutCompany = aboutCompany.trim();

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const nameRegex = new RegExp('^' + req.params.name + '$', 'i');

        const company = await Company.findOneAndUpdate(
            { name: { $regex: nameRegex } },
            updateData,
            { new: true, runValidators: true }
        );
        if (!company) return res.status(404).json({ message: 'Company not found' });

        // Propagate logo to all Job documents if logo was updated
        if (updateData.logo) {
            const Job = require('../models/Job');
            await Job.updateMany(
                { company: { $regex: nameRegex } },
                { $set: { companyLogo: updateData.logo } }
            );
        }

        res.json({ message: 'Company updated successfully', company });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
