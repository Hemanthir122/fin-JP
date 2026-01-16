const mongoose = require('mongoose');

const walkinSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for search functionality
walkinSchema.index({ company: 'text', description: 'text' });

module.exports = mongoose.model('Walkin', walkinSchema);
