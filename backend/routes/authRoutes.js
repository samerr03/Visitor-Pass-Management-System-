const express = require('express');
const router = express.Router();
const { seedAdmin, loginUser, refresh, logoutUser, getProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/seed', seedAdmin);
router.post('/login', loginUser);
router.post('/refresh', refresh);
router.post('/logout', logoutUser);
router.get('/profile', protect, getProfile);
router.put('/update-password', protect, updatePassword);
router.patch('/profile/photo', protect, require('../middleware/uploadMiddleware').single('photo'), require('../controllers/authController').updateProfilePhoto);

module.exports = router;
