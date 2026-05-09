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
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');
const externalJobRoutes = require('./routes/externalJobRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Start the scheduler for scheduled posts
startScheduler();

// Start the auto-delete scheduler for external jobs
startAutoDeleteScheduler();

// Middleware
app.use(cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, req.body);
    next();
});

// Auto-delete jobs with expired endDate
async function cleanupExpiredJobs() {
    try {
        const now = new Date();
        const result = await Job.updateMany(
            {
                endDate: { $lt: now },
                isActive: true
            },
            {
                $set: { isActive: false }
            }
        );
        if (result.modifiedCount > 0) {
            console.log(`[Job Cleanup] Marked ${result.modifiedCount} expired jobs as inactive`);
        }
    } catch (error) {
        console.error('[Job Cleanup] Error:', error.message);
    }
}

// Run cleanup on server start
cleanupExpiredJobs();

// Run cleanup every 5 minutes (300000 ms)
setInterval(cleanupExpiredJobs, 300000);

// Routes
app.use('/api/jobs', jobRoutes);
app.use('/api/walkins', walkinRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/external-jobs', externalJobRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'JobsConnect API is running' });
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
