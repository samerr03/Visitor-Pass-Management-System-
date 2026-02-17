const demoGuard = (req, res, next) => {
    if (req.user && req.user.isDemo) {
        const method = req.method;
        const path = req.path;

        // 1. Block all DELETE requests
        if (method === 'DELETE') {
            return res.status(403).json({
                message: 'Demo Restricted: Deletion is disabled in demo mode.'
            });
        }

        // 2. Block specific destructive endpoints
        // Example: Changing passwords, updating settings, export
        // Note: Check-in/Check-out (PUT) should be ALLOWED for functionality

        // Block Profile Updates (except photo which might be fun, but let's restrict for safety)
        if (path.includes('/profile') && method === 'PUT') {
            return res.status(403).json({
                message: 'Demo Restricted: Profile updates are disabled.'
            });
        }

        // Block Password Updates
        if (path.includes('/password') && method === 'PUT') {
            return res.status(403).json({
                message: 'Demo Restricted: Password changes are disabled.'
            });
        }

        // Block Admin User Management (Create/Update)
        // Check if path is /api/admin/staff or similar if implemented
        if (path.includes('/staff') && (method === 'POST' || method === 'PUT')) {
            return res.status(403).json({
                message: 'Demo Restricted: Managing staff is disabled.'
            });
        }
    }
    next();
};

module.exports = demoGuard;
