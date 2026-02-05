require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Job = require('./models/Job');

// Route imports
const jobRoutes = require('./routes/jobRoutes');
const walkinRoutes = require('./routes/walkinRoutes');
const companyRoutes = require('./routes/companyRoutes');
const statsRoutes = require('./routes/statsRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: '*',
    credentials: false
}));

app.use(express.json());

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

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'JobsConnect API is running' });
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
