const express = require('express');
const router = express.Router();

const {
    getAllVisitors,
    createVisitor,
    markExit,
    getTodaysVisitors,
    getVisitorByPassId,
} = require('../controllers/visitorController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

const { createVisitorValidation, validate } = require('../middleware/validationMiddleware');

router.route('/')
    .get(protect, authorize('admin', 'security'), getAllVisitors)
    .post(protect, authorize('security'), upload.single('photo'), createVisitorValidation, validate, createVisitor);

router.route('/today')
    .get(protect, authorize('admin', 'security'), getTodaysVisitors);

router.route('/scan/:passId')
    .get(protect, authorize('security', 'admin'), getVisitorByPassId);

router.route('/:id/checkout')
    .put(protect, authorize('security'), markExit);

router.route('/:id/exit')
    .patch(protect, authorize('security'), markExit);

module.exports = router;
