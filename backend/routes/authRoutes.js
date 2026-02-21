const express = require('express');
const router = express.Router();
const { seedAdmin, loginUser, refresh, logoutUser, getProfile, updatePassword, updateProfilePhoto } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const modelContext = require('../middleware/modelContext');
const demoBlock = require('../middleware/demoBlock');
const upload = require('../middleware/uploadMiddleware'); // Assuming upload is defined here based on the Code Edit

router.post('/seed-admin', seedAdmin);
router.post('/login', loginUser);
router.post('/refresh-token', refresh);
router.post('/logout', logoutUser);

router.route('/profile')
    .get(protect, modelContext, getProfile);
router.put('/profile/password', protect, modelContext, demoBlock, updatePassword);
router.put('/profile/photo', protect, modelContext, upload.single('photo'), updateProfilePhoto);

module.exports = router;
