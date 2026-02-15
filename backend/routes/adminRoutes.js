const express = require('express');
const router = express.Router();
const {
    createSecurityUser,
    deleteUser,
    getDashboardStats,
    getAllVisitors,
    searchVisitors,
    getSecurityUsers,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware
const { createSecurityUserValidation, validate } = require('../middleware/validationMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.post('/create-security', upload.single('photo'), createSecurityUserValidation, validate, createSecurityUser);
router.delete('/user/:id', deleteUser);
router.get('/dashboard', getDashboardStats);
router.get('/visitors', getAllVisitors);
router.get('/visitors/search', searchVisitors);
router.get('/security-users', getSecurityUsers);

module.exports = router;
