const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

// Seed Admin
const seedAdmin = async (req, res, next) => {
    try {
        const exists = await User.findOne({ email: 'admin@example.com' });

        if (exists) {
            return res.json({ message: 'Admin already exists' });
        }

        const admin = await User.create({
            name: 'Admin',
            email: 'admin@example.com',
            password: '123456',
            role: 'admin',
        });

        res.status(201).json(admin);
    } catch (error) {
        next(error);
    }
};

// Login
const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id),
        });

    } catch (error) {
        next(error);
    }
};

// Refresh
const refresh = async (req, res) => {
    res.json({ message: "Token refresh endpoint" });
};

// Logout
const logoutUser = async (req, res) => {
    res.json({ message: "Logged out successfully" });
};

// Get User Profile
const getProfile = async (req, res) => {
    const user = await User.findById(req.user._id);
    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            staffId: user.staffId,
            photo: user.photo,
            photoUrl: user.photo ? `${process.env.BASE_URL || 'http://localhost:5000'}/${user.photo.replace(/\\/g, '/')}` : null,
            phone: user.phone,
            designation: user.designation,
            isActive: user.isActive
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
};

// Update Password
const updatePassword = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.password = req.body.password;
            await user.save();
            res.json({ message: 'Password updated successfully' });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// Update Profile Photo
const updateProfilePhoto = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);

        if (user) {
            // Force forward slashes for cross-platform consistency
            const normalizedPath = `uploads/${req.file.filename}`;
            user.photo = normalizedPath;
            await user.save();

            const photoUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/${normalizedPath}`;

            res.json({
                message: 'Photo updated successfully',
                photo: user.photo,
                photoUrl
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    seedAdmin,
    loginUser,
    refresh,
    logoutUser,
    getProfile,
    updatePassword,
    updateProfilePhoto
};
