const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Company = require('../models/Company');

// Get all jobs with filters
router.get('/', async (req, res) => {
    try {
        const { search, location, type, company, page = 1, limit = 12 } = req.query;

        // Build match query
        let matchQuery = {
            isActive: true
        };

        // Filter by status (default to 'published' unless 'all' or specific status requested)
        if (req.query.status && req.query.status !== 'all') {
            matchQuery.status = req.query.status;
        } else if (req.query.status !== 'all') {
            matchQuery.$or = [
                { status: 'published' },
                { status: { $exists: false } }
            ];
        }

        // Add cache control to reduce re-fetching, but disable for admin (status=all)
        if (req.query.status === 'all') {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        } else {
            res.set('Cache-Control', 'public, max-age=10'); // 10 seconds for quick updates
        }

        // Search filter
        if (search) {
            matchQuery.$and = [
                {
                    $or: [
                        { title: { $regex: search, $options: 'i' } },
                        { company: { $regex: search, $options: 'i' } },
                        { location: { $regex: search, $options: 'i' } }
                    ]
                }
            ];
        }

        // Location filter
        if (location) {
            matchQuery.location = { $regex: location, $options: 'i' };
        }

        // Type filter (job, internship, walkin)
        if (type) {
            matchQuery.type = type;
        }

        // Company filter
        if (company) {
            matchQuery.company = { $regex: company, $options: 'i' };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Use aggregation to sort by publishedAt with fallback to createdAt
        const jobs = await Job.aggregate([
            { $match: matchQuery },
            {
                $addFields: {
                    sortDate: { $ifNull: ['$publishedAt', '$createdAt'] }
                }
            },
            { $sort: { sortDate: -1 } },
            { $skip: skip },
            { $limit: parseInt(limit) }
        ]);

        const total = await Job.countDocuments(matchQuery);

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
        // Use aggregation to sort by publishedAt with fallback to createdAt
        const jobs = await Job.aggregate([
            {
                $match: {
                    isActive: true,
                    $or: [
                        { status: 'published' },
                        { status: { $exists: false } }
                    ],
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: new Date() } }
                    ]
                }
            },
            {
                // Create a sortDate field: use publishedAt if exists, otherwise createdAt
                $addFields: {
                    sortDate: { $ifNull: ['$publishedAt', '$createdAt'] }
                }
            },
            {
                $sort: { sortDate: -1 }
            },
            {
                $limit: 9
            }
        ]);

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
                { status: 'published' },
                { status: { $exists: false } }
            ],
            $and: [
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: new Date() } }
                    ]
                }
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
                { status: 'published' },
                { status: { $exists: false } }
            ],
            $and: [
                {
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: new Date() } }
                    ]
                }
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
        const { page = 1, limit = 12 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {
            company: { $regex: req.params.companyName, $options: 'i' },
            isActive: true,
            $or: [
                { status: 'published' },
                { status: { $exists: false } }
            ]
            // Showing expired jobs here too for history
        };

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Job.countDocuments(query);

        res.set('Cache-Control', 'public, max-age=300');

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
        const jobData = { ...req.body };
        // If posting directly as published, set publishedAt
        if (jobData.status === 'published') {
            jobData.publishedAt = new Date();
        }

        const job = new Job(jobData);
        const savedJob = await job.save();
        res.status(201).json(savedJob);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update job
router.put('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if we are moving from a non-published state to published
        const isCurrentlyPublished = job.status === 'published';
        const willBePublished = req.body.status === 'published';

        // If publishing a draft, use direct update to force createdAt change
        if (!isCurrentlyPublished && willBePublished) {
            const now = new Date();
            const updateData = {
                ...req.body,
                status: 'published',
                publishedAt: now,
                createdAt: now
            };

            // Use findOneAndUpdate to bypass Mongoose's protection of createdAt
            const updatedJob = await Job.findOneAndUpdate(
                { _id: req.params.id },
                { $set: updateData },
                { new: true, timestamps: false }
            );
            return res.json(updatedJob);
        }

        // For other updates, use normal save
        Object.assign(job, req.body);
        const savedJob = await job.save();
        res.json(savedJob);
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
