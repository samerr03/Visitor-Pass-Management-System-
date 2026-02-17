const { getProdConnection, getDemoConnection } = require('../config/db');
const { getModels } = require('../models/ModelFactory');

const modelContext = (req, res, next) => {
    try {
        // 1. Determine which DB to use
        // Check both req.user (if authenticated) and possibly a header or query param if needed (but usually req.user)
        // Note: protect middleware runs BEFORE this, so req.user is set.

        let connection;
        let isDemoMode = false;

        if (req.user && req.user.isDemo) {
            connection = getDemoConnection();
            isDemoMode = true;
            console.log(`[ModelContext] Switching to DEMO DB for user: ${req.user.email}`);
        } else {
            connection = getProdConnection();
            isDemoMode = false;
        }

        if (!connection) {
            // Should not happen if server started correctly
            console.error('Database connection not established!');
            return res.status(500).json({ message: 'Database connection error' });
        }

        // 2. Get Models for that connection
        const models = getModels(connection);

        // 3. Attach to request
        req.models = models;
        req.isDemoMode = isDemoMode;

        next();
    } catch (error) {
        console.error('Model Context Error:', error);
        res.status(500).json({ message: 'Internal Server Error (Context)' });
    }
};

module.exports = modelContext;
