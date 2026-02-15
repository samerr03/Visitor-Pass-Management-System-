const AuditLog = require('../models/AuditLog');

/**
 * Logs an action to the audit/audit log collection.
 * @param {Object} req - The express request object (contains user and ip)
 * @param {String} action - The action type (ENTRY, EXIT, DELETE, CREATE, APPROVE)
 * @param {Object} visitor - The visitor object involved in the action
 * @param {String} notes - Optional notes about the action
 */
const logAction = async (req, action, visitor, notes = '') => {
    try {
        if (!req.user) {
            console.warn('Audit Log Warning: No user found in request');
            return;
        }

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

        await AuditLog.create({
            action,
            visitorId: visitor._id,
            visitorName: visitor.name,
            performedBy: {
                userId: req.user._id,
                name: req.user.name,
                role: req.user.role
            },
            ipAddress: ip,
            notes
        });

    } catch (error) {
        // We log the error but do not throw it to prevent blocking the main request
        console.error('Audit Log Error:', error);
    }
};

module.exports = logAction;
