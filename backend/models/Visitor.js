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
        type: String, // Path to uploaded image
    },
    qrCode: {
        type: String, // Optional: store base64 or URL if needed
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
        enum: ['active', 'completed'],
        default: 'active',
        index: true,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    demoSessionId: {
        type: String, // Links visitor to the specific demo session
        index: true,
    },
}, { timestamps: true });

// Text index for search
visitorSchema.index({ name: 'text', phone: 'text', passId: 'text' });

// Index for search performance
visitorSchema.index({ name: 'text', phone: 'text' });

module.exports = visitorSchema;
