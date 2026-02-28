const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Company = require('../models/Company');
const { sendNewJobNotification } = require('../services/telegram');

// Get all jobs with filters
router.get('/', async (req, res) => {
    try {
        const { search, location, type, company, page = 1, limit = 12 } = req.query;

        // Build match query
        let matchQuery = {
            isActive: true,
            $and: []
        };

        // Filter by status (default to 'published' unless 'all' or specific status requested)
        if (req.query.status && req.query.status !== 'all') {
            matchQuery.$and.push({ status: req.query.status });
        } else if (req.query.status !== 'all') {
            // For public: ONLY show explicitly published jobs (strict filtering)
            matchQuery.$and.push({
                status: 'published'
            });
            // Exclude expired jobs for public listing (treat endDate as inclusive of the day)
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            matchQuery.$and.push({
                $or: [
                    { endDate: { $exists: false } },
                    { endDate: null },
                    { endDate: { $gte: todayStart } }
                ]
            });
        }

        // Add cache control to reduce re-fetching, but disable for admin (status=all)
        if (req.query.status === 'all') {
            res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        } else {
            res.set('Cache-Control', 'public, max-age=10'); // 10 seconds for quick updates
        }

        // Search filter
        if (search) {
            matchQuery.$and.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { company: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } }
                ]
            });
        }

        // Location filter
        if (location) {
            matchQuery.location = { $regex: location, $options: 'i' };
        }

        // Type filter (job, internship, walkin)
        if (type) {
            matchQuery.type = type;
        }

        // Company filter (supports multiple companies)
        if (company) {
            // Check if company is a comma-separated list or array
            const companies = typeof company === 'string' ? company.split(',').map(c => c.trim()) : company;
            
            if (companies.length > 0) {
                matchQuery.$and.push({
                    company: { $in: companies }
                });
            }
        }

        // Clean up empty $and to avoid unintended behavior
        if (Array.isArray(matchQuery.$and) && matchQuery.$and.length === 0) {
            delete matchQuery.$and;
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
        console.log('GET /jobs/latest - Fetching published jobs only');
        
        // Treat endDate as inclusive of the entire day
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const jobs = await Job.aggregate([
            {
                $match: {
                    isActive: true,
                    status: 'published',  // MUST be explicitly published
                    $or: [
                        { endDate: { $exists: false } },
                        { endDate: null },
                        { endDate: { $gte: todayStart } }
                    ]
                }
            },
            {
                // Create a sortDate field: use publishedAt with fallback to createdAt
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

        console.log(`GET /jobs/latest - Returning ${jobs.length} published jobs`);
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get unique locations for filter
router.get('/locations', async (req, res) => {
    try {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const locations = await Job.distinct('location', {
            isActive: true,
            status: 'published',
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: todayStart } }
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
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const roles = await Job.distinct('title', {
            isActive: true,
            status: 'published',
            $or: [
                { endDate: { $exists: false } },
                { endDate: null },
                { endDate: { $gte: todayStart } }
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

        const isAdminView = req.query.view === 'admin';

        if (!isAdminView) {
            // Treat endDate as inclusive of the day
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const isExpired = job.endDate && new Date(job.endDate) < todayStart;
            const isPublished = job.status === 'published';

            if (!job.isActive || !isPublished || isExpired) {
                return res.status(404).json({ message: 'Job not found' });
            }
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
        
        // Save or update company information
        if (jobData.company && jobData.company.trim()) {
            try {
                const companyData = {
                    name: jobData.company.trim()
                };
                
                // Add logo if provided
                if (jobData.companyLogo && jobData.companyLogo.trim()) {
                    companyData.logo = jobData.companyLogo.trim();
                }
                
                // Add about company if provided
                if (jobData.aboutCompany && jobData.aboutCompany.trim()) {
                    companyData.aboutCompany = jobData.aboutCompany.trim();
                }
                
                // Use findOneAndUpdate with upsert to create or update company
                await Company.findOneAndUpdate(
                    { name: { $regex: `^${companyData.name}$`, $options: 'i' } },
                    { $set: companyData },
                    { upsert: true, new: true }
                );
                
                console.log(`✅ Company "${companyData.name}" saved/updated in database`);
            } catch (companyError) {
                console.error('⚠️ Failed to save company (non-blocking):', companyError.message);
            }
        }
        
        // Handle different statuses
        if (jobData.status === 'published') {
            jobData.publishedAt = new Date();
        } else if (jobData.status === 'scheduled') {
            // Validate scheduledPublishAt is provided and in the future
            if (!jobData.scheduledPublishAt) {
                return res.status(400).json({ message: 'scheduledPublishAt is required for scheduled posts' });
            }
            const scheduledDate = new Date(jobData.scheduledPublishAt);
            if (scheduledDate <= new Date()) {
                return res.status(400).json({ message: 'Scheduled date must be in the future' });
            }
        } else {
            // Default to draft
            jobData.status = 'draft';
        }

        const job = new Job(jobData);
        const savedJob = await job.save();
        
        // Send Telegram notification only if published immediately
        if (savedJob.status === 'published') {
            console.log('🔔 New job published, sending Telegram notification...');
            sendNewJobNotification(savedJob).catch(err => {
                console.error('⚠️ Telegram notification failed (non-blocking):', err.message);
            });
        } else if (savedJob.status === 'scheduled') {
            console.log(`📅 Job scheduled for: ${savedJob.scheduledPublishAt}`);
        }
        
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

        // Save or update company information if company details are being updated
        if (req.body.company && req.body.company.trim()) {
            try {
                const companyData = {
                    name: req.body.company.trim()
                };
                
                // Add logo if provided
                if (req.body.companyLogo && req.body.companyLogo.trim()) {
                    companyData.logo = req.body.companyLogo.trim();
                }
                
                // Add about company if provided
                if (req.body.aboutCompany && req.body.aboutCompany.trim()) {
                    companyData.aboutCompany = req.body.aboutCompany.trim();
                }
                
                // Use findOneAndUpdate with upsert to create or update company
                await Company.findOneAndUpdate(
                    { name: { $regex: `^${companyData.name}$`, $options: 'i' } },
                    { $set: companyData },
                    { upsert: true, new: true }
                );
                
                console.log(`✅ Company "${companyData.name}" saved/updated in database`);
            } catch (companyError) {
                console.error('⚠️ Failed to save company (non-blocking):', companyError.message);
            }
        }

        // Check status transitions
        const currentStatus = job.status;
        const newStatus = req.body.status;

        // Handle scheduled status
        if (newStatus === 'scheduled') {
            if (!req.body.scheduledPublishAt) {
                return res.status(400).json({ message: 'scheduledPublishAt is required for scheduled posts' });
            }
            const scheduledDate = new Date(req.body.scheduledPublishAt);
            if (scheduledDate <= new Date()) {
                return res.status(400).json({ message: 'Scheduled date must be in the future' });
            }
            // Explicitly set status to scheduled
            req.body.status = 'scheduled';
            console.log(`📅 Setting job status to scheduled for: ${req.body.scheduledPublishAt}`);
        }

        // Check if we are moving to published status
        const willBePublished = newStatus === 'published';
        const wasNotPublished = currentStatus !== 'published';

        // If publishing (from draft or scheduled), update timestamps
        if (wasNotPublished && willBePublished) {
            const now = new Date();
            const updateData = {
                ...req.body,
                status: 'published',
                publishedAt: now,
                createdAt: now
            };

            const updatedJob = await Job.findOneAndUpdate(
                { _id: req.params.id },
                { $set: updateData },
                { new: true, timestamps: false }
            );
            
            // Send Telegram notification when publishing
            console.log('🔔 Job published, sending Telegram notification...');
            sendNewJobNotification(updatedJob).catch(err => {
                console.error('⚠️ Telegram notification failed (non-blocking):', err.message);
            });
            
            return res.json(updatedJob);
        }

        // For other updates (including scheduled), use findOneAndUpdate for consistency
        const updateData = { ...req.body };
        
        const updatedJob = await Job.findOneAndUpdate(
            { _id: req.params.id },
            { $set: updateData },
            { new: true, runValidators: true }
        );
        
        if (updatedJob.status === 'scheduled') {
            console.log(`📅 Job scheduled/rescheduled for: ${updatedJob.scheduledPublishAt}`);
        } else if (updatedJob.status === 'draft') {
            console.log(`📝 Job saved as draft`);
        }
        
        res.json(updatedJob);
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

// Submit feedback (useful/not useful)
router.post('/:id/feedback', async (req, res) => {
    try {
        const { type } = req.body; // 'useful' or 'notUseful'

        if (!type || !['useful', 'notUseful'].includes(type)) {
            return res.status(400).json({ message: 'Invalid feedback type' });
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Increment the appropriate counter
        if (type === 'useful') {
            job.usefulCount = (job.usefulCount || 0) + 1;
        } else {
            job.notUsefulCount = (job.notUsefulCount || 0) + 1;
        }

        await job.save();
        res.json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get feedback stats for admin
router.get('/admin/feedback-stats', async (req, res) => {
    try {
        const { type, sortBy = 'usefulCount', order = 'desc' } = req.query;

        let query = { isActive: true };
        if (type) {
            query.type = type;
        }

        const sortOrder = order === 'asc' ? 1 : -1;
        const sortField = sortBy === 'notUsefulCount' ? 'notUsefulCount' : 'usefulCount';

        const jobs = await Job.find(query)
            .select('title company type usefulCount notUsefulCount createdAt')
            .sort({ [sortField]: sortOrder })
            .limit(100);

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

