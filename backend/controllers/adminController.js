// @desc    Register a new staff member (security)
// @route   POST /api/admin/create-security
// @access  Private/Admin
const createSecurityUser = async (req, res, next) => {
    try {
        const { User } = req.models;
        console.log('createSecurityUser Request Body:', req.body);
        console.log('createSecurityUser Request File:', req.file);
        const { name, email, password, phone, designation, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            // Delete uploaded file if user exists to avoid clutter
            if (req.file) {
                const fs = require('fs');
                fs.unlinkSync(req.file.path);
            }
            return res.status(400).json({
                message: 'User already exists'
            });
        }

        // Generate Staff ID: STF + Year + Random 4 digits (e.g., STF20241023)
        // Or simpler: STF-timestamp specific
        const year = new Date().getFullYear();
        const random = Math.floor(1000 + Math.random() * 9000);
        const staffId = `STF${year}${random}`;

        // Handle Photo path
        let photo = '';
        if (req.file) {
            // Store relative path
            photo = `uploads/${req.file.filename}`;
        }

        // For demo users, ensure they are created with the same demo flag? 
        // Or maybe just let them be regular users in the demo DB.
        // If we are in demo mode (req.isDemoMode), new users are created in demo DB.

        const user = await User.create({
            name,
            email,
            password,
            phone,
            designation: designation || 'Security Staff',
            role: role || 'security',
            staffId,
            photo,
            isActive: true
        });

        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            staffId: user.staffId,
            photo: user.photo,
            photoUrl: user.photo ? `${process.env.BASE_URL || 'http://localhost:5000'}/${user.photo.replace(/\\/g, '/')}` : null
        });

    } catch (error) {
        next(error);
    }
};


// @desc    Delete a user
// @route   DELETE /api/admin/user/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const { User } = req.models;
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === 'admin') {
            res.status(400);
            throw new Error('Cannot delete admin user');
        }

        // Delete photo file if exists
        // Note: For demo mode, we might want to skip physical file deletion to avoid impacting others if shared?
        // But since we use unique files, it's ok.
        if (user.photo) {
            const fs = require('fs');
            const path = require('path');
            const filePath = path.join(__dirname, '..', user.photo);
            if (fs.existsSync(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                } catch (e) { console.error("Error deleting file", e); }
            }
        }

        await User.deleteOne({ _id: req.params.id });
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    const { User, Visitor } = req.models;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalVisitorsToday = await Visitor.countDocuments({
        createdAt: { $gte: today },
    });

    const activePasses = await Visitor.countDocuments({ status: 'active' });
    const completedVisits = await Visitor.countDocuments({ status: 'completed' });
    const totalSecurityStaff = await User.countDocuments({ role: 'security' });

    res.json({
        totalVisitorsToday,
        activePasses,
        completedVisits,
        totalSecurityStaff,
    });
};

// @desc    Get all visitors with pagination
// @route   GET /api/admin/visitors
// @access  Private/Admin
const getAllVisitors = async (req, res) => {
    const { Visitor } = req.models;
    const page = Number(req.query.page) || 1;
    let pageSize = 10;

    if (req.query.limit === 'all') {
        pageSize = 0; // 0 usually means no limit in some logics, but let's handle it explicitly
    } else if (req.query.limit) {
        pageSize = Number(req.query.limit);
    }

    const count = await Visitor.countDocuments({});

    let query = Visitor.find({}).populate('createdBy', 'name').sort({ createdAt: -1 });

    if (req.query.limit !== 'all') {
        query = query.limit(pageSize).skip(pageSize * (page - 1));
    }

    const visitors = await query;

    res.json({
        visitors,
        page,
        pages: req.query.limit === 'all' ? 1 : Math.ceil(count / pageSize),
        total: count
    });
};

// @desc    Search visitors
// @route   GET /api/admin/visitors/search
// @access  Private/Admin
const searchVisitors = async (req, res) => {
    const { Visitor } = req.models;
    const keyword = req.query.keyword
        ? {
            $or: [
                { name: { $regex: req.query.keyword, $options: 'i' } },
                { phone: { $regex: req.query.keyword, $options: 'i' } },
            ],
        }
        : {};

    const visitors = await Visitor.find({ ...keyword }).populate('createdBy', 'name');
    res.json(visitors);
};

// @desc    Get all staff (admin + security)
// @route   GET /api/admin/security-users
// @access  Private/Admin
const getSecurityUsers = async (req, res) => {
    const { User } = req.models;
    // get all users except the one making the request (optional, but good practice). 
    // For now, let's return all so they can see themselves too.
    // Or just all users.
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
};

// @desc    Get visitor analytics
// @route   GET /api/admin/analytics/visitors
// @access  Private/Admin
const getVisitorAnalytics = async (req, res) => {
    const { Visitor } = req.models;
    try {
        const range = req.query.range || '7days';
        let matchStage = {};
        let groupBy = {};
        let sortStage = { _id: 1 }; // Ascending date

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        if (range === '7days') {
            const last7Days = new Date();
            last7Days.setDate(today.getDate() - 6);
            last7Days.setHours(0, 0, 0, 0);

            matchStage = {
                entryTime: { $gte: last7Days, $lte: today }
            };

            groupBy = {
                $dateToString: { format: "%Y-%m-%d", date: "$entryTime" }
            };
        } else if (range === 'weekly') {
            // Last 4 weeks
            const last4Weeks = new Date();
            last4Weeks.setDate(today.getDate() - 28);
            last4Weeks.setHours(0, 0, 0, 0);

            matchStage = {
                entryTime: { $gte: last4Weeks, $lte: today }
            };

            // Group by Week of Year (ISO)
            groupBy = {
                $dateToString: { format: "%Y-W%V", date: "$entryTime" }
            };
        }

        const analytics = await Visitor.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 }
                }
            },
            { $sort: sortStage }
        ]);

        // Transform for frontend: { date: "2024-02-10", count: 5 }
        const formattedData = analytics.map(item => ({
            date: item._id,
            count: item.count
        }));

        // Fill in missing dates for '7days' to ensure continuous chart
        if (range === '7days') {
            const filledData = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date();
                d.setDate(today.getDate() - i);
                const dateStr = d.toISOString().split('T')[0];
                const found = formattedData.find(item => item.date === dateStr);
                filledData.push({
                    date: dateStr,
                    count: found ? found.count : 0
                });
            }
            return res.json(filledData);
        }

        res.json(formattedData);

    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    createSecurityUser,
    deleteUser,
    getDashboardStats,
    getAllVisitors,
    searchVisitors,
    getSecurityUsers,
    getVisitorAnalytics,
};
