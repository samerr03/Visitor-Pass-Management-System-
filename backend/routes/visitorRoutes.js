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

const demoBlock = require('../middleware/demoBlock');
const modelContext = require('../middleware/modelContext');

const demoLimit = require('../middleware/demoLimit');

router.route('/')
    .get(protect, modelContext, authorize('admin', 'security'), getAllVisitors)
    .post(protect, modelContext, authorize('security'), demoLimit, upload.single('photo'), createVisitorValidation, validate, createVisitor);
// Note: createVisitor IS allowed for demo users (in demo DB) as per requirements.

router.route('/today')
    .get(protect, modelContext, authorize('admin', 'security'), getTodaysVisitors);

router.route('/scan/:passId')
    .get(protect, modelContext, authorize('security', 'admin'), getVisitorByPassId);

router.route('/:id/checkout')
    .put(protect, modelContext, authorize('security'), markExit);
// note: checkout IS allowed for demo users.

router.route('/:id/exit')
    .patch(protect, modelContext, authorize('security'), markExit);

router.route('/:id')
    .delete(protect, modelContext, authorize('admin'), demoBlock, require('../controllers/visitorController').deleteVisitor);

module.exports = router;
