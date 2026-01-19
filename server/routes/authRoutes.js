const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email: email.toLowerCase() });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Simple password check (in production, use bcrypt)
        if (admin.password !== password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            success: true,
            message: 'Login successful',
            admin: { email: admin.email }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Check if admin exists, if not create default admin
router.get('/init', async (req, res) => {
    try {
        const adminExists = await Admin.findOne({ email: 'hemanthirgowda122@gmail.com' });

        if (!adminExists) {
            const admin = new Admin({
                email: 'hemanthirgowda122@gmail.com',
                password: 'hemu@2002'
            });
            await admin.save();
            res.json({ message: 'Admin created' });
        } else {
            res.json({ message: 'Admin already exists' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Verify session
router.get('/verify', async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(401).json({ authenticated: false });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });

    if (admin) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

module.exports = router;
