const logAction = require('../utils/logger');

// @desc    Get pass details by passId (Public/Protected depending on use case. Currently verifying requires no auth but we can secure it if needed, or leave it public to scan)
// @route   GET /api/passes/:passId
// @access  Public
const getPassStatus = async (req, res, next) => {
    try {
        const { Visitor } = req.models; // Use modelContext
        const { passId } = req.params;

        const visitor = await Visitor.findOne({ passId }).populate('createdBy', 'name email');

        if (!visitor) {
            return res.status(404).json({ message: 'Invalid Pass' });
        }

        // Dynamic Expiry Check
        if (visitor.status === 'ACTIVE' && visitor.expiryTime < new Date()) {
            visitor.status = 'EXPIRED';
            await visitor.save(); // auto-update state
        }

        // Disable caching explicitly on the backend response
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        res.json(visitor);
    } catch (error) {
        next(error);
    }
};

// @desc    Update pass status (Check-In process)
// @route   PATCH /api/passes/:passId/status
// @access  Private/Security, Admin
const updatePassStatus = async (req, res, next) => {
    try {
        const { Visitor } = req.models;
        const { passId } = req.params;
        const { status } = req.body; // Expecting 'USED' usually

        if (!['ACTIVE', 'USED', 'EXPIRED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const visitor = await Visitor.findOne({ passId });

        if (!visitor) {
            return res.status(404).json({ message: 'Invalid Pass' });
        }

        // Check if expired
        if (visitor.status === 'ACTIVE' && visitor.expiryTime < new Date()) {
            visitor.status = 'EXPIRED';
            await visitor.save();
            return res.status(400).json({ message: 'Pass has expired', visitor });
        }

        // If trying to use an already used/expired pass
        if (visitor.status !== 'ACTIVE' && status === 'USED') {
            return res.status(400).json({ message: `Pass is already ${visitor.status.toLowerCase()}` });
        }

        visitor.status = status;

        // If checking in, make sure normal status is active
        if (status === 'USED') {
            // Audit Log
            await logAction(req, 'UPDATE', visitor, `Pass Checked-In (${passId})`);
        }

        await visitor.save();

        res.json({ message: `Pass status updated to ${status}`, visitor });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPassStatus,
    updatePassStatus
};
