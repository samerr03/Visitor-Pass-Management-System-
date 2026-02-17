const demoBlock = (req, res, next) => {
    // Check if user is authenticated and marked as demo
    if (req.user && req.user.isDemo) {

        // Block all DELETE requests
        if (req.method === 'DELETE') {
            return res.status(403).json({
                message: "This action is disabled in demo mode."
            });
        }

        // Block creating new staff/admin users (POST to /api/admin/create-security or similar)
        // Also block updating sensitive fields
        if (req.method === 'POST' && req.baseUrl.includes('/api/admin')) {
            return res.status(403).json({
                message: "This action is disabled in demo mode."
            });
        }

        // Block Export (GET to /api/visitors/export)
        if (req.method === 'GET' && req.path.includes('/export')) {
            return res.status(403).json({
                message: "This action is disabled in demo mode."
            });
        }

        // Block Configuration Changes (PUT/PATCH to specific routes)
        if ((req.method === 'PUT' || req.method === 'PATCH') &&
            (req.path.includes('/settings') || req.path.includes('/config') || req.path.includes('/profile') || req.path.includes('/password'))) {
            return res.status(403).json({
                message: "This action is disabled in demo mode."
            });
        }
    }

    next();
};

module.exports = demoBlock;
