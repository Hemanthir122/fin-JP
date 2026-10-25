require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Job = require('./models/Job');
const { startScheduler } = require('./services/scheduler');
const { startAutoDeleteScheduler } = require('./services/autoDeleteService');

// Route imports
const jobRoutes = require('./routes/jobRoutes');
const walkinRoutes = require('./routes/walkinRoutes');
const companyRoutes = require('./routes/companyRoutes');
const authRoutes = require('./routes/authRoutes');
const externalJobRoutes = require('./routes/externalJobRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Start the scheduler for scheduled posts
startScheduler();

// Auto-delete scheduler DISABLED — jobs are kept indefinitely
// startAutoDeleteScheduler();

// Middleware
app.use(cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging — only log non-GET requests to reduce noise
app.use((req, res, next) => {
    if (req.method !== 'GET') {
        console.log(`${req.method} ${req.path}`);
    }
    next();
});

// Cleanup: delete ALL jobs older than 30 days (any status) + deactivate expired endDate jobs
async function cleanupExpiredJobs() {
    try {
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // 1. Delete every job created more than 30 days ago, regardless of status
        const deleted = await Job.deleteMany({ createdAt: { $lt: thirtyDaysAgo } });
        if (deleted.deletedCount > 0) {
            console.log(`[Cleanup] Deleted ${deleted.deletedCount} jobs older than 30 days`);
        }

        // 2. Deactivate jobs whose endDate has passed (but are still within 30 days)
        const deactivated = await Job.updateMany(
            { endDate: { $lt: now }, isActive: true },
            { $set: { isActive: false } }
        );
        if (deactivated.modifiedCount > 0) {
            console.log(`[Cleanup] Deactivated ${deactivated.modifiedCount} jobs with expired endDate`);
        }

    } catch (error) {
        console.error('[Cleanup] Error:', error.message);
    }
}

// Run cleanup on every cold start (covers Vercel serverless cold boots)
cleanupExpiredJobs();

// Also run daily in long-lived environments (Railway, Render, local dev)
setInterval(cleanupExpiredJobs, 24 * 60 * 60 * 1000);

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/walkins', walkinRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/external-jobs', externalJobRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'JobsConnect API is running' });
});

// Cron endpoint — call this from Vercel Cron (daily) to reliably clean up old jobs
// Vercel dashboard: Settings → Cron Jobs → path: /api/cron/cleanup, schedule: 0 0 * * *
app.get('/api/cron/cleanup', async (req, res) => {
    // Simple shared secret to prevent public abuse
    const secret = req.headers['x-cron-secret'] || req.query.secret;
    if (process.env.CRON_SECRET && secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    try {
        await cleanupExpiredJobs();
        res.json({ ok: true, ran: new Date().toISOString() });
    } catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});

// Repair: backfill missing company logos from external DB into Job documents
app.post('/api/repair/backfill-logos', async (req, res) => {
    try {
        const externalDbService = require('./services/externalDbService');

        // Get all jobs with empty companyLogo
        const jobs = await Job.find({
            $or: [{ companyLogo: '' }, { companyLogo: { $exists: false } }, { companyLogo: null }]
        }).select('_id company companyLogo').lean();

        console.log(`[Backfill] Found ${jobs.length} jobs with missing logos`);

        // Get all logos from external DB at once
        const allLogos = await externalDbService.getAllCompanyLogos();

        let updated = 0;
        let skipped = 0;

        for (const job of jobs) {
            const logo = allLogos[job.company];
            if (logo) {
                await Job.findByIdAndUpdate(job._id, { $set: { companyLogo: logo } });
                updated++;
            } else {
                skipped++;
            }
        }

        console.log(`[Backfill] Updated: ${updated}, Skipped (no logo found): ${skipped}`);
        res.json({ total: jobs.length, updated, skipped });
    } catch (e) {
        console.error('[Backfill] Error:', e.message);
        res.status(500).json({ error: e.message });
    }
});

// Temp debug: list external DB collections
app.get('/api/debug-external-db', async (req, res) => {
    try {
        const { MongoClient } = require('mongodb');
        const client = new MongoClient('mongodb+srv://hemanthir122_db_user:ir961152HH@cluster0.cbhrplv.mongodb.net/?appName=Cluster0', { serverSelectionTimeoutMS: 10000 });
        await client.connect();
        const adminDb = client.db().admin();
        const dbs = await adminDb.listDatabases();
        const result = { databases: {} };
        for (const db of dbs.databases) {
            const cols = await client.db(db.name).listCollections().toArray();
            result.databases[db.name] = {};
            for (const col of cols) {
                const count = await client.db(db.name).collection(col.name).countDocuments();
                const sample = await client.db(db.name).collection(col.name).findOne();
                result.databases[db.name][col.name] = {
                    count,
                    sampleKeys: sample ? Object.keys(sample) : []
                };
            }
        }
        await client.close();
        res.json(result);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Debug: Check what's in local ExternalJob collection
app.get('/api/debug-local-jobs', async (req, res) => {
    try {
        const ExternalJob = require('./models/ExternalJob');
        const total = await ExternalJob.countDocuments();
        const sample = await ExternalJob.findOne();
        const companies = await ExternalJob.distinct('company');
        res.json({
            total,
            sampleJob: sample,
            companies: companies.slice(0, 20)
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
