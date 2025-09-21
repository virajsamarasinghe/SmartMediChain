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

/**
 * @swagger
 * /api/approvals:
 *   get:
 *     summary: Get all approvals
 *     description: Retrieve approval requests with filtering options
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, cancelled]
 *         description: Filter by approval status
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by approval type
 *     responses:
 *       200:
 *         description: Approvals retrieved successfully
 *   post:
 *     summary: Create approval request
 *     description: Create a new approval request
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 example: "order_approval"
 *               description:
 *                 type: string
 *                 example: "Approval required for high-value order"
 *               relatedEntity:
 *                 type: string
 *                 example: "64a1b2c3d4e5f6789012345"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 example: "medium"
 *     responses:
 *       201:
 *         description: Approval request created successfully
 *
 * /api/approvals/{id}:
 *   get:
 *     summary: Get approval by ID
 *     description: Retrieve specific approval request details
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Approval ID
 *     responses:
 *       200:
 *         description: Approval retrieved successfully
 *       404:
 *         description: Approval not found
 *
 * /api/approvals/{id}/approve:
 *   put:
 *     summary: Approve request
 *     description: Approve a pending approval request (Manager only)
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Approval ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comments:
 *                 type: string
 *                 example: "Approved after review"
 *     responses:
 *       200:
 *         description: Request approved successfully
 *       403:
 *         description: Forbidden - Insufficient permissions
 *
 * /api/approvals/{id}/reject:
 *   put:
 *     summary: Reject request
 *     description: Reject a pending approval request (Manager only)
 *     tags: [Approvals]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Approval ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Insufficient documentation"
 *               comments:
 *                 type: string
 *                 example: "Please provide additional details"
 *     responses:
 *       200:
 *         description: Request rejected successfully
 *       403:
 *         description: Forbidden - Insufficient permissions
 */

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
