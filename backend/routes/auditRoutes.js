const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const modelContext = require('../middleware/modelContext');

router.route('/')
    .get(protect, modelContext, authorize('admin'), getAuditLogs);

module.exports = router;
