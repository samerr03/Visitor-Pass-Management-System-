const Visitor = require('../models/Visitor');
const generatePassId = require('../utils/generatePassId');

// @desc    Get all visitors with filtering and search
// @route   GET /api/visitors
// @access  Private/Admin/Security
const getAllVisitors = async (req, res, next) => {
    try {
        const { status, keyword } = req.query;
        let query = {};

        // Filter by status if provided (active/completed)
        if (status) {
            query.status = status.toLowerCase();
        }

        // Search by keyword (name, phone, passId)
        if (keyword) {
            const regex = new RegExp(keyword, 'i');
            query.$or = [
                { name: regex },
                { phone: regex },
                { passId: regex }
            ];
        }

        const visitors = await Visitor.find(query)
            .sort({ entryTime: -1 })
            .populate('createdBy', 'name email');

        res.json(visitors);
    } catch (error) {
        next(error);
    }
};

// @desc    Get visitor by Pass ID (Scan)
// @route   GET /api/visitors/scan/:passId
// @access  Private/Security/Admin
const getVisitorByPassId = async (req, res, next) => {
    try {
        const visitor = await Visitor.findOne({ passId: req.params.passId })
            .populate('createdBy', 'name email');

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor pass not found' });
        }

        res.json(visitor);
    } catch (error) {
        next(error);
    }
};

// @desc    Create a new visitor pass
// @route   POST /api/visitors
// @access  Private/Security/Admin
const createVisitor = async (req, res, next) => {
    try {
        const { name, phone, purpose, idProofNumber, personToMeet } = req.body;
        // Fix: Store relative path 'uploads/filename.ext' to ensure it works on frontend
        const photo = req.file ? `uploads/${req.file.filename}` : null;

        const passId = await generatePassId();

        const visitor = await Visitor.create({
            name,
            phone,
            purpose,
            idProofNumber,
            personToMeet,
            photo, // Save photo path
            passId,
            cardGenerated: true,
            createdBy: req.user._id,
        });

        res.status(201).json(visitor);
    } catch (error) {
        next(error);
    }
};

// @desc    Mark visitor exit
// @route   PATCH /api/visitors/:id/exit
// @access  Private/Security/Admin
const markExit = async (req, res, next) => {
    try {
        const visitor = await Visitor.findById(req.params.id);

        if (!visitor) {
            return res.status(404).json({ message: 'Visitor not found' });
        }

        if (visitor.status === 'completed') {
            return res.status(400).json({ message: 'Visitor already checked out' });
        }

        visitor.exitTime = Date.now();
        visitor.status = 'completed';
        await visitor.save();

        res.json(visitor);
    } catch (error) {
        next(error);
    }
};

// @desc    Get today's visitors
// @route   GET /api/visitors/today
// @access  Private/Security/Admin
const getTodaysVisitors = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const visitors = await Visitor.find({
            createdAt: { $gte: today },
        }).sort({ entryTime: -1 });

        res.json(visitors);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllVisitors,
    createVisitor,
    markExit,
    getTodaysVisitors,
    getVisitorByPassId,
};
