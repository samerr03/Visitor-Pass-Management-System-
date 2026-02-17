// @desc    Get audit logs
// @route   GET /api/audit-logs
// @access  Private/Admin
const getAuditLogs = async (req, res, next) => {
    try {
        const { AuditLog } = req.models;
        const { action, startDate, endDate, performedBy } = req.query;
        let query = {};

        if (action) {
            query.action = action;
        }

        if (performedBy) {
            query['performedBy.name'] = { $regex: performedBy, $options: 'i' };
        }

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) {
                query.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                // Set end date to end of day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const logs = await AuditLog.find(query)
            .sort({ createdAt: -1 })
            .limit(limit)
            .skip(skip);

        const total = await AuditLog.countDocuments(query);

        res.json({
            logs,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAuditLogs
};
