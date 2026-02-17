const demoLimit = async (req, res, next) => {
    try {
        if (!req.user?.isDemo) return next();

        const { Visitor } = req.models; // demo model
        const demoSessionId = req.user.demoSessionId;

        // Session Limit: Only 2 visitors per login session
        // If demoSessionId is missing (legacy/error), we might default to blocking or old behavior
        // But for new flow:

        const sessionCount = await Visitor.countDocuments({
            createdBy: req.user._id,
            demoSessionId: demoSessionId
        });

        if (sessionCount >= 2) {
            return res.status(403).json({
                message: "Demo limit reached: Only 2 visitors per login session are allowed. Please catch a break or relogin to reset."
            });
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = demoLimit;
