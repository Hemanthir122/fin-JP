const Job = require('../models/Job');

/**
 * Auto-delete external jobs after 7 days
 * Runs periodically to check and delete expired jobs
 */
async function autoDeleteExpiredExternalJobs() {
    try {
        const now = new Date();
        
        // Find all external jobs that have passed their auto-delete date
        const expiredJobs = await Job.find({
            isExternalJob: true,
            isActive: true,
            autoDeleteAt: { $lte: now }
        });

        if (expiredJobs.length === 0) {
            console.log('[Auto-Delete] No expired external jobs to delete');
            return { deleted: 0, jobs: [] };
        }

        console.log(`[Auto-Delete] Found ${expiredJobs.length} expired external jobs`);

        // Mark jobs as inactive instead of deleting them
        const result = await Job.updateMany(
            {
                isExternalJob: true,
                isActive: true,
                autoDeleteAt: { $lte: now }
            },
            {
                $set: { 
                    isActive: false,
                    status: 'expired'
                }
            }
        );

        console.log(`[Auto-Delete] Marked ${result.modifiedCount} external jobs as inactive`);

        return {
            deleted: result.modifiedCount,
            jobs: expiredJobs.map(j => ({
                id: j._id,
                title: j.title,
                company: j.company,
                approvedAt: j.externalJobApprovedAt,
                deletedAt: now
            }))
        };
    } catch (error) {
        console.error('[Auto-Delete] Error:', error.message);
        return { deleted: 0, jobs: [], error: error.message };
    }
}

/**
 * Get list of deleted external jobs
 */
async function getDeletedExternalJobs(limit = 100) {
    try {
        const deletedJobs = await Job.find({
            isExternalJob: true,
            isActive: false,
            status: 'expired'
        })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .select('title company location externalJobApprovedAt autoDeleteAt updatedAt');

        return deletedJobs;
    } catch (error) {
        console.error('[Auto-Delete] Error getting deleted jobs:', error.message);
        return [];
    }
}

/**
 * Start the auto-delete scheduler
 * Runs every hour to check for expired jobs
 */
function startAutoDeleteScheduler() {
    console.log('🗑️  Auto-delete scheduler started for external jobs (7-day expiry)');
    
    // Run immediately on startup
    autoDeleteExpiredExternalJobs();
    
    // Run every hour (3600000 ms)
    setInterval(autoDeleteExpiredExternalJobs, 3600000);
}

module.exports = {
    autoDeleteExpiredExternalJobs,
    getDeletedExternalJobs,
    startAutoDeleteScheduler
};
