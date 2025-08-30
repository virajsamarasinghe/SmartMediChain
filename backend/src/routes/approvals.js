const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { checkApprovalAccess } = require('../middleware/approvalMiddleware');
const {
  createApproval,
  getApprovals,
  getApprovalById,
  approveRequest,
  rejectRequest,
  cancelRequest
} = require('../controllers/approvalController');

// All routes require authentication
router.use(auth);

// Get all approvals with filters
// Only approval managers can see all approvals they can approve, others see only their own
router.get('/', getApprovals);

// Get a specific approval by ID
router.get('/:id', getApprovalById);

// Create new approval request
// Anyone can create an approval request
router.post('/', createApproval);

// Approve a request (only approval managers can access, explicitly no admin)
router.put('/:id/approve', checkApprovalAccess, approveRequest);

// Reject a request (only approval managers can access, explicitly no admin)
router.put('/:id/reject', checkApprovalAccess, rejectRequest);

// Cancel a request (only creator or approval managers can access, explicitly no admin)
router.put('/:id/cancel', cancelRequest);

module.exports = router;
