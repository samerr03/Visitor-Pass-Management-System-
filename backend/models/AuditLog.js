const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    action: {
        type: String,
        required: true,
        enum: ['ENTRY', 'EXIT', 'DELETE', 'CREATE', 'APPROVE']
    },
    visitorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Visitor',
        required: false // Visitor might be deleted, so ID is kept but reference might break if not handled carefully, or just store ID string
    },
    visitorName: {
        type: String,
        required: true
    },
    performedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        role: {
            type: String,
            required: true
        }
    },
    ipAddress: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = auditLogSchema;
