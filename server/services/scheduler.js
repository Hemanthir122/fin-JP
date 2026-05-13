const Job = require('../models/Job');
const Walkin = require('../models/Walkin');
const { sendNewJobNotification, sendNewWalkinNotification } = require('./telegram');

/**
 * Check and publish scheduled jobs
 * Runs periodically to check if any scheduled jobs should be published
 */
async function checkAndPublishScheduledJobs() {
    try {
        const now = new Date();
        
        // Find all scheduled jobs that should be published now
        const scheduledJobs = await Job.find({
            status: 'scheduled',
            scheduledPublishAt: { $lte: now },
            isActive: true
        });

        if (scheduledJobs.length > 0) {
            console.log(`📋 Found ${scheduledJobs.length} scheduled job(s) to publish`);
        }

        for (const job of scheduledJobs) {
            try {
                // Update job status to published
                job.status = 'published';
                job.publishedAt = now;
                await job.save();

                console.log(`✅ Published scheduled job: ${job.title} at ${job.company}`);

                // Send Telegram notification
                sendNewJobNotification(job).catch(err => {
                    console.error('⚠️ Telegram notification failed for scheduled job:', err.message);
                });

            } catch (error) {
                console.error(`❌ Failed to publish job ${job._id}:`, error.message);
            }
        }

        // Find all scheduled walkins that should be published now
        const scheduledWalkins = await Walkin.find({
            status: 'scheduled',
            scheduledPublishAt: { $lte: now },
            isActive: true
        });

        if (scheduledWalkins.length > 0) {
            console.log(`📋 Found ${scheduledWalkins.length} scheduled walkin(s) to publish`);
        }

        for (const walkin of scheduledWalkins) {
            try {
                // Update walkin status to published
                walkin.status = 'published';
                walkin.publishedAt = now;
                await walkin.save();

                console.log(`✅ Published scheduled walkin: ${walkin.company}`);

                // Send Telegram notification
                sendNewWalkinNotification(walkin).catch(err => {
                    console.error('⚠️ Telegram notification failed for scheduled walkin:', err.message);
                });

            } catch (error) {
                console.error(`❌ Failed to publish walkin ${walkin._id}:`, error.message);
            }
        }

    } catch (error) {
        console.error('❌ Error in scheduler:', error.message);
    }
}

/**
 * Start the scheduler
 * Checks every minute for scheduled posts
 */
function startScheduler() {
    console.log('🚀 Scheduler started - checking every 5 minutes for scheduled posts');
    
    // Run immediately on start
    checkAndPublishScheduledJobs();
    
    // Then run every 5 minutes (300000 ms) — reduced from 1 minute
    setInterval(checkAndPublishScheduledJobs, 300000);
}

module.exports = {
    checkAndPublishScheduledJobs,
    startScheduler
};
