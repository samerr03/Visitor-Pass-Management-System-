
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true,
    },
    phone: {
        type: String,
        required: true,
        index: true,
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address'],
    },
    purpose: {
        type: String,
        required: true,
    },
    idProofNumber: {
        type: String,
        required: true,
    },
    personToMeet: {
        type: String,
        required: true,
    },
    photo: {
        type: String,
    },
    qrCode: {
        type: String,
    },
    passId: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    entryTime: {
        type: Date,
        default: Date.now,
    },
    exitTime: {
        type: Date,
    },
    cardGenerated: {
        type: Boolean,
        default: true,
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'USED', 'EXPIRED'],
        default: 'ACTIVE',
        index: true,
    },
    expiryTime: {
        type: Date,
        default: () => new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    demoSessionId: {
        type: String,
        index: true,
    },
}, { timestamps: true });

// Text index for search
visitorSchema.index({ name: 'text', phone: 'text', passId: 'text' });

// Index for search performance
visitorSchema.index({ name: 'text', phone: 'text' });

module.exports = visitorSchema;
