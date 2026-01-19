const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const Admin = require('./models/Admin');

const updatePassword = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to Database');

        const email = 'hemanthirgowda122@gmail.com';
        const newPassword = 'hemu@2002';

        const admin = await Admin.findOne({ email });

        if (admin) {
            admin.password = newPassword;
            await admin.save();
            console.log(`Password updated successfully for ${email}`);
        } else {
            console.log(`Admin ${email} not found. Creating new admin...`);
            await Admin.create({
                email,
                password: newPassword
            });
            console.log('New admin created');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error updating password:', error);
        process.exit(1);
    }
};

updatePassword();
