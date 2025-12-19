const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Company = require('../models/Company');

// Get all jobs with filters
router.get('/', async (req, res) => {
    try {
        const { search, location, type, company, page = 1, limit = 12 } = req.query;

        let query = {
            isActive: true,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        };

        // Search filter
        if (search) {
            query = {
                $and: [
                    query,
                    {
                        $or: [
                            { title: { $regex: search, $options: 'i' } },
                            { company: { $regex: search, $options: 'i' } },
                            { location: { $regex: search, $options: 'i' } }
                        ]
                    }
                ]
            };
        }

        // Location filter
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Type filter (job, internship, walkin)
        if (type) {
            query.type = type;
        }

        // Company filter
        if (company) {
            query.company = { $regex: company, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Job.countDocuments(query);

        res.json({
            jobs,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            total
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get latest 9 jobs for homepage
router.get('/latest', async (req, res) => {
    try {
        const jobs = await Job.find({
            isActive: true,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        })

            .sort({ createdAt: -1 })
            .limit(9);

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unique locations for filter
router.get('/locations', async (req, res) => {
    try {
        const locations = await Job.distinct('location', {
            isActive: true,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        });

        res.json(locations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unique job titles/roles for filter
router.get('/roles', async (req, res) => {
    try {
        const roles = await Job.distinct('title', {
            isActive: true,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        });

        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get jobs by company
router.get('/company/:companyName', async (req, res) => {
    try {
        const jobs = await Job.find({
            company: { $regex: req.params.companyName, $options: 'i' },
            isActive: true,
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: new Date() } }
            ]
        }).sort({ createdAt: -1 });


        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new job
router.post('/', async (req, res) => {
    try {
        const job = new Job(req.body);
        const savedJob = await job.save();

        // Save/update company for autocomplete feature
        const existingCompany = await Company.findOne({
            name: { $regex: `^${req.body.company}$`, $options: 'i' }
        });

        if (!existingCompany) {
            const newCompany = new Company({
                name: req.body.company,
                logo: req.body.companyLogo || ''
            });
            await newCompany.save();
        } else if (req.body.companyLogo && !existingCompany.logo) {
            existingCompany.logo = req.body.companyLogo;
            await existingCompany.save();
        }

        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update job
router.put('/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json(job);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete job
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
