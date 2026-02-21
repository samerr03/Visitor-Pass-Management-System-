const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { seedAdmin, loginUser, refresh, logoutUser, getProfile, updatePassword, updateProfilePhoto, forgotPassword, resetPassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const modelContext = require('../middleware/modelContext');
const demoBlock = require('../middleware/demoBlock');
const upload = require('../middleware/uploadMiddleware'); // Assuming upload is defined here based on the Code Edit

router.post('/seed-admin', seedAdmin);
router.post('/login', loginUser);
router.post('/refresh-token', refresh);
router.post('/logout', logoutUser);

const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    message: { message: 'Too many password reset requests from this IP, please try again after 15 minutes.' }
});

router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.route('/profile')
    .get(protect, modelContext, getProfile);
router.put('/profile/password', protect, modelContext, demoBlock, updatePassword);
router.put('/profile/photo', protect, modelContext, upload.single('photo'), updateProfilePhoto);

module.exports = router;
