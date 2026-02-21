const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { getProdConnection } = require('../config/db');
const { getModels } = require('../models/ModelFactory');
const sendEmail = require('../utils/sendEmail');

// Generate Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

// Start of Auth Controller
// Helper to get Prod User Model safely
const getProdUser = () => {
    const conn = getProdConnection();
    if (!conn) throw new Error("Database not initialized");
    return getModels(conn).User;
};

// Seed Admin
const seedAdmin = async (req, res, next) => {
    try {
        const User = getProdUser();
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
        let { email, password } = req.body;
        email = email.toLowerCase().trim();
        console.log(`[Login Attempt] Email: ${email}`);

        const User = getProdUser();
        const user = await User.findOne({ email });

        if (!user) {
            console.log('[Login Failed] User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if demo user account matches strict demo password if needed, 
        // but robust hash check matches anyway.

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            console.log('[Login Failed] Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // --- Demo Session Logic ---
        if (user.isDemo) {
            const { v4: uuidv4 } = require('uuid');
            user.demoSessionId = uuidv4();
            await user.save();
            console.log(`[Demo Login] Assigned new session ID: ${user.demoSessionId}`);
        }
        // --------------------------

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isDemo: user.isDemo,
            demoSessionId: user.demoSessionId, // Optional: send to frontend if needed
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
const getProfile = async (req, res, next) => {
    try {
        console.log(`[GetProfile] Outputting profile for user: ${req.user._id} (${req.user.email})`); // DEBUG

        // req.models is populated by modelContext middleware based on isDemo flag
        // This ensures if I am a demo user, I get my data from Demo DB (if that's the logic)
        // OR: User Profile data always comes from Prod DB? 
        // Actually, for consistency, the Middleware determines the source of truth.
        // If I am demo_admin, do I exist in Demo DB? Yes, synced.

        const { User } = req.models; // Context-aware model

        const user = await User.findById(req.user._id);
        if (user) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                staffId: user.staffId,
                photo: user.photo,
                photoUrl: user.photo
                    ? (user.photo.startsWith('http')
                        ? user.photo
                        : `${process.env.BASE_URL || 'http://localhost:5000'}/${user.photo.replace(/\\/g, '/').replace(/^\//, '')}`)
                    : null,
                phone: user.phone,
                designation: user.designation,
                isActive: user.isActive,
                isDemo: user.isDemo
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};

// Update Password
const updatePassword = async (req, res, next) => {
    try {
        const { User } = req.models;
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

        const { User } = req.models;
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

// Forgot Password
const forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;
        const User = getProdUser();

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(404).json({ message: 'There is no user with that email' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Hash token and set to resetPasswordToken field
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Set expire to 15 minutes
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

        await user.save();

        // Create reset URL
        const protocol = req.protocol === 'https' ? 'https' : 'http';
        const hostname = req.get('host');

        // Determine base frontend URL: fallback to localhost if missing
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

        const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) have requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message
            });

            res.status(200).json({ success: true, message: 'Email sent' });
        } catch (error) {
            console.error(error);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();

            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        next(error);
    }
};

// Reset Password
const resetPassword = async (req, res, next) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex');

        const User = getProdUser();

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            role: user.role
        });
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
    updateProfilePhoto,
    forgotPassword,
    resetPassword
};
