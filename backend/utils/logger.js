const logAction = async (req, action, visitor, notes = '') => {
    try {
        if (!req.user) {
            console.warn('Audit Log Warning: No user found in request');
            return;
        }

        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;

        // Use injected model if available (for demo mode isolation), fallback to standard model (Prod)
        let AuditLogModel = req.models?.AuditLog;

        if (!AuditLogModel) {
            const { getProdConnection } = require('../config/db');
            const { getModels } = require('../models/ModelFactory');
            const conn = getProdConnection();
            if (conn) {
                AuditLogModel = getModels(conn).AuditLog;
            }
        }

        if (!AuditLogModel) {
            console.warn('Audit Log Warning: Could not resolve AuditLog model');
            return;
        }

        await AuditLogModel.create({
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
