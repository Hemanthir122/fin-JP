const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const https = require('https');
const http = require('http');

// Fetch company logo from external API
router.get('/fetch-logo/:companyName', async (req, res) => {
    try {
        const companyName = req.params.companyName;
        
        // Try different domain formats
        const domains = [
            companyName.toLowerCase().replace(/\s+/g, '') + '.com',
            companyName.toLowerCase().replace(/\s+/g, '-') + '.com',
            companyName.toLowerCase().replace(/\s+/g, '') + '.in',
            companyName.toLowerCase().replace(/\s+/g, '') + '.io',
            companyName.toLowerCase().replace(/\s+/g, '') + '.co'
        ];
        
        // Function to check if URL exists
        const checkUrl = (url) => {
            return new Promise((resolve) => {
                const protocol = url.startsWith('https') ? https : http;
                protocol.get(url, (response) => {
                    if (response.statusCode === 200) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }).on('error', () => {
                    resolve(false);
                });
            });
        };
        
        // Try Clearbit Logo API
        for (const domain of domains) {
            const logoUrl = `https://logo.clearbit.com/${domain}`;
            
            const exists = await checkUrl(logoUrl);
            if (exists) {
                return res.json({ 
                    success: true, 
                    logoUrl: logoUrl,
                    source: 'clearbit'
                });
            }
        }
        
        // If no logo found
        res.json({ 
            success: false, 
            message: 'Logo not found',
            logoUrl: null 
        });
        
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// Get all companies for autocomplete (only from jobs and internships, not walkins)
router.get('/', async (req, res) => {
    try {
        const Job = require('../models/Job');
        
        // Get jobs and internships with company info
        const jobs = await Job.find({
            type: { $in: ['job', 'internship'] },
            isActive: true,
            status: 'published'
        }).select('company companyLogo');
        
        // Create a map to store unique companies with their logos
        const companyMap = new Map();
        
        jobs.forEach(job => {
            if (job.company && !companyMap.has(job.company)) {
                companyMap.set(job.company, {
                    name: job.company,
                    logo: job.companyLogo || null
                });
            }
        });
        
        // Convert map to array and sort alphabetically
        const companies = Array.from(companyMap.values()).sort((a, b) => 
            a.name.localeCompare(b.name)
        );
        
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
