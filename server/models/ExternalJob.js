const mongoose = require('mongoose');

const externalJobSchema = new mongoose.Schema({
    // Original fields from external scraper DB
    company: {
        type: String,
        required: true,
        trim: true
    },
    job_id: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: mongoose.Schema.Types.Mixed, // String or Array
        required: true
    },
    country: {
        type: mongoose.Schema.Types.Mixed, // String or Array
        default: ''
    },
    department: {
        type: String,
        default: ''
    },
    experience: {
        type: String,
        default: ''
    },
    job_type: {
        type: String,
        default: ''
    },
    salary: {
        type: String,
        default: ''
    },
    skills: [{
        type: String
    }],
    description: {
        type: String,
        default: ''
    },
    apply_link: {
        type: String,
        default: ''
    },
    scraped_at: {
        type: String,
        required: true
    },
    created_at: {
        type: String,
        required: true
    },
    
    // Admin approval workflow fields
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'published', 'scheduled_delete'],
        default: 'pending'
    },
    adminNotes: {
        type: String,
        default: ''
    },
    approvedBy: {
        type: String,
        default: ''
    },
    approvedAt: {
        type: Date
    },
    publishedAt: {
        type: Date
    },
    scheduleDeleteAt: {
        type: Date,
        default: null
    },
    
    // Company logo management
    companyLogo: {
        type: String,
        default: ''
    },
    
    // Mapping to internal job format
    mappedToInternalJob: {
        type: Boolean,
        default: false
    },
    internalJobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
    }
}, {
    timestamps: true
});

// Indexes for efficient querying
externalJobSchema.index({ company: 1 });
externalJobSchema.index({ status: 1 });
externalJobSchema.index({ job_id: 1 });
externalJobSchema.index({ scraped_at: -1 });
externalJobSchema.index({ country: 1 });
externalJobSchema.index({ department: 1 });

module.exports = mongoose.model('ExternalJob', externalJobSchema);