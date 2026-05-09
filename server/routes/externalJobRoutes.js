const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Company = require('../models/Company');
const externalDbService = require('../services/externalDbService');
const { sendNewJobNotification } = require('../services/telegram');
const { getDeletedExternalJobs } = require('../services/autoDeleteService');

// IMPORTANT: More specific routes MUST come before general routes
// This prevents GET / from matching /stats, /filters/options, etc.

// Get deleted external jobs (auto-deleted after 7 days)
router.get('/deleted', async (req, res) => {
    try {
        const deletedJobs = await getDeletedExternalJobs(100);
        res.json({
            total: deletedJobs.length,
            jobs: deletedJobs
        });
    } catch (error) {
        console.error('[GET /deleted] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Test external database connection
router.get('/test-connection', async (req, res) => {
    try {
        console.log('🧪 Testing external database connection...');
        const collection = await externalDbService.getJobsCollection();
        const count = await collection.countDocuments();
        console.log(`✅ Connection successful! Found ${count} jobs`);
        res.json({ 
            success: true, 
            message: 'External database connection successful',
            totalJobs: count 
        });
    } catch (error) {
        console.error('❌ Connection test failed:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'External database connection failed',
            error: error.message 
        });
    }
});

// Get external job statistics - FROM EXTERNAL DB
router.get('/stats', async (req, res) => {
    try {
        const stats = await externalDbService.getExternalJobStats();
        res.json({
            totalJobs: stats.totalJobs,
            companiesCount: stats.companiesCount
        });
    } catch (error) {
        console.error('[GET /stats] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Get filter options (for dropdowns) - FROM EXTERNAL DB
router.get('/filters/options', async (req, res) => {
    try {
        const options = await externalDbService.getFilterOptions();
        
        console.log(`[GET /filters/options] Found ${options.companies?.length || 0} companies`);
        
        res.json({
            companies: options.companies || [],
            countries: options.countries || []
        });
    } catch (error) {
        console.error('[GET /filters/options] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Get all company logos from external DB
router.get('/company-logos/all', async (req, res) => {
    try {
        const logos = await externalDbService.getAllCompanyLogos();
        res.json(logos);
    } catch (error) {
        console.error('[GET /company-logos/all] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Get specific company logo
router.get('/company-logos/:company', async (req, res) => {
    try {
        const logo = await externalDbService.getCompanyLogo(req.params.company);
        res.json({ company: req.params.company, logo: logo });
    } catch (error) {
        console.error('[GET /company-logos/:company] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Save company logo to external DB
router.post('/company-logos', async (req, res) => {
    try {
        const { company, logo } = req.body;
        
        if (!company || !logo) {
            return res.status(400).json({ message: 'Company name and logo URL are required' });
        }
        
        await externalDbService.saveCompanyLogo(company, logo);
        res.json({ message: 'Logo saved successfully', company, logo });
    } catch (error) {
        console.error('[POST /company-logos] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Approve job - Save to main Job DB and mark as approved in external DB
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['approved', 'rejected', 'pending', 'draft'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        
        console.log('[PATCH /:id/status] Updating job status:', req.params.id, 'to', status);
        
        // Get the job from external DB
        const collection = await externalDbService.getJobsCollection();
        const { ObjectId } = require('mongodb');
        
        let externalJob;
        try {
            externalJob = await collection.findOne({ _id: new ObjectId(req.params.id) });
        } catch (e) {
            externalJob = null;
        }
        
        if (!externalJob) {
            return res.status(404).json({ message: 'Job not found in external database' });
        }
        
        let internalJobId = null;  // Declare outside the if block
        
        // If approving, create a new Job in the main Job collection (or reuse existing if internalJobId exists)
        if (status === 'approved') {
            internalJobId = externalJob.internalJobId;
            
            // Get company logo from external DB
            const companyLogo = await externalDbService.getCompanyLogo(externalJob.company);
            console.log(`[PATCH /:id/status] Company: ${externalJob.company}, Logo found: ${!!companyLogo}`);
            
            // Save logo to the external job document as well
            if (companyLogo) {
                await collection.updateOne(
                    { _id: new ObjectId(req.params.id) },
                    { $set: { companyLogo: companyLogo } }
                );
                console.log(`[PATCH /:id/status] Logo saved to external job document`);
            } else {
                console.log(`[PATCH /:id/status] No logo found for company: ${externalJob.company}`);
            }
            
            if (internalJobId) {
                // Job was previously approved - check if it still exists in main DB
                try {
                    const existingJob = await Job.findById(internalJobId);
                    if (existingJob) {
                        // Job still exists, just update it to be active again
                        existingJob.isActive = true;
                        existingJob.status = 'published';
                        existingJob.companyLogo = companyLogo || existingJob.companyLogo;
                        await existingJob.save();
                        console.log('[PATCH /:id/status] Reactivated existing internal job:', internalJobId);
                        
                        // Send Telegram notification for reactivated external job
                        console.log('🔔 External job reactivated, sending Telegram notification...');
                        sendNewJobNotification(existingJob).catch(err => {
                            console.error('⚠️ Telegram notification failed for reactivated external job (non-blocking):', err.message);
                        });
                    } else {
                        // Job was deleted, create a new one
                        throw new Error('Job not found');
                    }
                } catch (e) {
                    // Job doesn't exist, create a new one
                    const newJob = new Job({
                        title: externalJob.role,
                        company: externalJob.company,
                        companyLogo: companyLogo || '',
                        location: Array.isArray(externalJob.location) 
                            ? externalJob.location.join(', ') 
                            : externalJob.location,
                        country: Array.isArray(externalJob.country) 
                            ? externalJob.country.join(', ') 
                            : (externalJob.country || ''), // Convert array to string
                        package: externalJob.salary || 'Not specified',
                        experience: externalJob.experience || 'Not specified',
                        type: 'job',
                        jobType: externalJob.job_type || '', // Save job_type from external job
                        description: externalJob.description || `${externalJob.role} position at ${externalJob.company}`,
                        skills: externalJob.skills || [],
                        applyLink: externalJob.apply_link || '',
                        status: 'published',
                        publishedAt: new Date(),
                        isActive: true,
                        isExternalJob: true,
                        externalJobApprovedAt: new Date(),
                        autoDeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                    });
                    
                    const savedJob = await newJob.save();
                    internalJobId = savedJob._id.toString();
                    console.log('[PATCH /:id/status] Created new internal job:', internalJobId);
                    
                    // Send Telegram notification for external job approval
                    console.log('🔔 External job approved, sending Telegram notification...');
                    sendNewJobNotification(savedJob).catch(err => {
                        console.error('⚠️ Telegram notification failed for external job (non-blocking):', err.message);
                    });
                }
            } else {
                // First time approving this job
                const newJob = new Job({
                    title: externalJob.role,
                    company: externalJob.company,
                    companyLogo: companyLogo || '',
                    location: Array.isArray(externalJob.location) 
                        ? externalJob.location.join(', ') 
                        : externalJob.location,
                    country: Array.isArray(externalJob.country) 
                        ? externalJob.country.join(', ') 
                        : (externalJob.country || ''), // Convert array to string
                    package: externalJob.salary || 'Not specified',
                    experience: externalJob.experience || 'Not specified',
                    type: 'job',
                    jobType: externalJob.job_type || '', // Save job_type from external job
                    description: externalJob.description || `${externalJob.role} position at ${externalJob.company}`,
                    skills: externalJob.skills || [],
                    applyLink: externalJob.apply_link || '',
                    status: 'published',
                    publishedAt: new Date(),
                    isActive: true,
                    isExternalJob: true,
                    externalJobApprovedAt: new Date(),
                    autoDeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
                });
                
                const savedJob = await newJob.save();
                internalJobId = savedJob._id.toString();
                console.log('[PATCH /:id/status] Job saved to main DB:', internalJobId);
                
                // Send Telegram notification for external job approval
                console.log('🔔 External job approved, sending Telegram notification...');
                sendNewJobNotification(savedJob).catch(err => {
                    console.error('⚠️ Telegram notification failed for external job (non-blocking):', err.message);
                });
            }
            
            // Update status in external DB with internal job ID
            await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { status: 'approved', approvedAt: new Date(), internalJobId: internalJobId } }
            );
        } else if (status === 'rejected') {
            // Mark as rejected/deleted
            await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { status: 'rejected', rejectedAt: new Date() } }
            );
        } else if (status === 'pending') {
            // Restore to pending - also delete from main Job DB if it exists
            internalJobId = externalJob.internalJobId;
            if (internalJobId) {
                try {
                    await Job.findByIdAndDelete(internalJobId);
                    console.log('[PATCH /:id/status] Deleted internal job:', internalJobId);
                } catch (e) {
                    console.error('[PATCH /:id/status] Error deleting internal job:', e.message);
                }
            }
            
            await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { status: 'pending' }, $unset: { approvedAt: '', rejectedAt: '', internalJobId: '' } }
            );
        } else if (status === 'draft') {
            // Save to main Job DB as draft (not published, no Telegram notification)
            internalJobId = externalJob.internalJobId;
            const companyLogo = await externalDbService.getCompanyLogo(externalJob.company);

            if (internalJobId) {
                // Already has an internal job - update it to draft
                try {
                    const existingJob = await Job.findById(internalJobId);
                    if (existingJob) {
                        existingJob.status = 'draft';
                        existingJob.isActive = true;
                        existingJob.companyLogo = companyLogo || existingJob.companyLogo;
                        await existingJob.save();
                        console.log('[PATCH /:id/status] Updated existing internal job to draft:', internalJobId);
                    } else {
                        throw new Error('Job not found');
                    }
                } catch (e) {
                    // Create new draft job
                    const draftJob = new Job({
                        title: externalJob.role,
                        company: externalJob.company,
                        companyLogo: companyLogo || '',
                        location: Array.isArray(externalJob.location)
                            ? externalJob.location.join(', ')
                            : externalJob.location,
                        country: Array.isArray(externalJob.country)
                            ? externalJob.country.join(', ')
                            : (externalJob.country || ''),
                        package: externalJob.salary || 'Not specified',
                        experience: externalJob.experience || 'Not specified',
                        type: 'job',
                        jobType: externalJob.job_type || '',
                        description: externalJob.description || `${externalJob.role} position at ${externalJob.company}`,
                        skills: externalJob.skills || [],
                        applyLink: externalJob.apply_link || '',
                        status: 'draft',
                        isActive: true,
                        isExternalJob: true,
                        externalJobApprovedAt: new Date(),
                        autoDeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    });
                    const savedDraft = await draftJob.save();
                    internalJobId = savedDraft._id.toString();
                    console.log('[PATCH /:id/status] Created new draft job:', internalJobId);
                }
            } else {
                // First time - create as draft
                const draftJob = new Job({
                    title: externalJob.role,
                    company: externalJob.company,
                    companyLogo: companyLogo || '',
                    location: Array.isArray(externalJob.location)
                        ? externalJob.location.join(', ')
                        : externalJob.location,
                    country: Array.isArray(externalJob.country)
                        ? externalJob.country.join(', ')
                        : (externalJob.country || ''),
                    package: externalJob.salary || 'Not specified',
                    experience: externalJob.experience || 'Not specified',
                    type: 'job',
                    jobType: externalJob.job_type || '',
                    description: externalJob.description || `${externalJob.role} position at ${externalJob.company}`,
                    skills: externalJob.skills || [],
                    applyLink: externalJob.apply_link || '',
                    status: 'draft',
                    isActive: true,
                    isExternalJob: true,
                    externalJobApprovedAt: new Date(),
                    autoDeleteAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                });
                const savedDraft = await draftJob.save();
                internalJobId = savedDraft._id.toString();
                console.log('[PATCH /:id/status] Created draft job:', internalJobId);
            }

            await collection.updateOne(
                { _id: new ObjectId(req.params.id) },
                { $set: { status: 'draft', draftedAt: new Date(), internalJobId: internalJobId } }
            );
        }
        
        console.log('[PATCH /:id/status] Status updated in external DB');
        
        // If approved, fetch the logo and include it in response
        let responseData = { 
            message: 'Job status updated successfully', 
            status: status
        };
        
        if (status === 'approved') {
            const companyLogo = await externalDbService.getCompanyLogo(externalJob.company);
            responseData.companyLogo = companyLogo || '';
            responseData.internalJobId = internalJobId;
        }
        
        res.json(responseData);
        
    } catch (error) {
        console.error('[PATCH /:id/status] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Sync jobs from external scraper database
router.post('/sync', async (req, res) => {
    try {
        console.log('[SYNC] Starting sync with params:', req.body);
        const { limit = 100, company, department, country, experience, skills } = req.body;
        
        const externalJobs = await externalDbService.syncJobsFromExternal({
            company,
            department,
            country,
            experience,
            skills
        }, limit);
        
        console.log(`[SYNC] Fetched ${externalJobs.length} jobs from external DB`);
        
        res.json({
            message: 'Sync completed',
            total: externalJobs.length,
            jobs: externalJobs
        });
        
    } catch (error) {
        console.error('[SYNC] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Get external jobs with filters and pagination - FETCH DIRECTLY FROM EXTERNAL DB
// This MUST be last because it's the most general route
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, company, location, department, jobType, experience, search, status } = req.query;
        console.log('[GET /external-jobs] Filters:', { company, location, department, jobType, experience, search, status, page });

        const result = await externalDbService.getJobsFromExternal(
            { company, location, department, jobType, experience, search, status },
            parseInt(page), parseInt(limit)
        );

        console.log(`[GET /external-jobs] Found ${result.total} jobs`);
        res.json(result);
    } catch (error) {
        console.error('[GET /external-jobs] Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
