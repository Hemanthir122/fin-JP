const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Walkin = require('../models/Walkin');

// Get dashboard stats
router.get('/', async (req, res) => {
    try {
        const totalJobs = await Job.countDocuments({ type: 'job', isActive: true });
        const totalInternships = await Job.countDocuments({ type: 'internship', isActive: true });
        // Count walk-ins from Walkin collection with status published
        const totalWalkins = await Walkin.countDocuments({ status: 'published', isActive: true });
        const totalAll = await Job.countDocuments({ isActive: true }) + totalWalkins;

        // Recent jobs
        const recentJobs = await Job.find({ isActive: true })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title company type createdAt');

        res.json({
            totalJobs,
            totalInternships,
            totalWalkins,
            totalAll,
            recentJobs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
