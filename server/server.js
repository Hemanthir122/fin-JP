require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

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
