const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    companyLogo: {
        type: String,
        default: ''
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
    package: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['job', 'internship', 'walkin'],
        default: 'job'
    },
    description: {
        type: String,
        required: true
    },
    skills: [{
        type: String
    }],
    responsibilities: [{
        type: String
    }],
    qualifications: [{
        type: String
    }],
    applyLink: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    endDate: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for search functionality
jobSchema.index({ title: 'text', company: 'text', location: 'text' });

module.exports = mongoose.model('Job', jobSchema);
