const express = require('express');
const router = express.Router();

const { getPassStatus, updatePassStatus } = require('../controllers/passController');
const { protect } = require('../middleware/authMiddleware');
const modelContext = require('../middleware/modelContext');

// Routes mapped to /api/passes

// Get details (Could be public if scanning QR directly, but let's secure it for safety if needed. 
// Actually, QR might be scanned by anyone, but security should only check in. 
// We'll allow GET without protection for dynamic verification page to load details for anyone scanning, 
// OR we protect it so only logged in staff can see. The request: "When QR code is scanned: It should open the verification page with pass details". We will make GET public mapping.)
router.route('/:passId').get(modelContext, getPassStatus);

// Update status (Check-In) - Requires security/admin protection
router.route('/:passId/status').patch(protect, modelContext, updatePassStatus);

module.exports = router;
