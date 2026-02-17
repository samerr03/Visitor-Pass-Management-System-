const express = require('express');
const router = express.Router();
const {
    createSecurityUser,
    deleteUser,
    getDashboardStats,
    getAllVisitors,
    searchVisitors,
    getSecurityUsers,
    getVisitorAnalytics,
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware'); // Import upload middleware
const { createSecurityUserValidation, validate } = require('../middleware/validationMiddleware');

const demoBlock = require('../middleware/demoBlock');
const modelContext = require('../middleware/modelContext');

router.use(protect);
router.use(modelContext); // Apply DB context switch after auth
router.use(authorize('admin'));

router.post('/create-security', demoBlock, upload.single('photo'), createSecurityUserValidation, validate, createSecurityUser);
router.delete('/user/:id', demoBlock, deleteUser);
router.get('/dashboard', getDashboardStats);
router.get('/visitors', getAllVisitors);
router.get('/visitors/search', searchVisitors);
router.get('/security-users', getSecurityUsers);
router.get('/analytics/visitors', getVisitorAnalytics);

module.exports = router;
