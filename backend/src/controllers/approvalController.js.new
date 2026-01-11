const Approval = require('../models/Approval');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const mongoose = require('mongoose');

// @desc    Create a new approval request
// @route   POST /api/approvals
// @access  Private
const createApproval = async (req, res) => {
  try {
    const { relatedEntity, entityType, requestType, requestDetails, requiredApprovals } = req.body;
    
    // Validate that the entity exists
    let entityModel;
    switch (entityType) {
      case 'Order':
        entityModel = Order;
        break;
      case 'Medicine':
        entityModel = Medicine;
        break;
      case 'User':
        entityModel = User;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Invalid entity type: ${entityType}`
        });
    }
    
    const entity = await entityModel.findById(relatedEntity);
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: `${entityType} not found with ID: ${relatedEntity}`
      });
    }
    
    // Create approval with required approvals
    const newApproval = new Approval({
      relatedEntity,
      entityType,
      requestType,
      requestDetails,
      requestedBy: req.user._id,
      requiredApprovals: requiredApprovals.map(role => ({ role }))
    });
    
    await newApproval.save();
    
    res.status(201).json({
      success: true,
      data: newApproval,
      message: 'Approval request created successfully'
    });
  } catch (error) {
    console.error('Create approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create approval request',
      error: error.message
    });
  }
};

// @desc    Get all approval requests
// @route   GET /api/approvals
// @access  Private
const getApprovals = async (req, res) => {
  try {
    const { status, entityType, role } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter
    const filter = {};
    
    if (status) filter.status = status;
    if (entityType) filter.entityType = entityType;
    
    // Filter based on user role
    if (['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(req.user.role)) {
      // For approval managers, show requests that need their approval
      filter['requiredApprovals.role'] = req.user.role;
    } else if (req.user.role === 'admin') {
      // Admin users can view approvals but cannot modify them (no filter)
      // They see all approvals for monitoring purposes
    } else {
      // For other users, only show their requests
      filter.requestedBy = req.user._id;
    }
    
    // If role filter is specified, filter by that specific required approval role
    if (role) {
      filter['requiredApprovals.role'] = role;
    }
    
    const approvals = await Approval.find(filter)
      .populate('requestedBy', 'name email role')
      .populate({
        path: 'requiredApprovals.approvedBy',
        select: 'name email role'
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Approval.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        approvals,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve approvals',
      error: error.message
    });
  }
};

// @desc    Get approval request by ID
// @route   GET /api/approvals/:id
// @access  Private
const getApprovalById = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id)
      .populate('requestedBy', 'name email role')
      .populate({
        path: 'requiredApprovals.approvedBy',
        select: 'name email role'
      });
      
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }
    
    // Check if user has permission to view this approval
    if (req.user.role !== 'admin' && 
        !['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(req.user.role) && 
        !approval.requestedBy._id.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this approval request'
      });
    }
    
    res.status(200).json({
      success: true,
      data: approval
    });
  } catch (error) {
    console.error('Get approval by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve approval request',
      error: error.message
    });
  }
};

// @desc    Update approval (give approval)
// @route   PUT /api/approvals/:id/approve
// @access  Private (Only for approval roles)
const approveRequest = async (req, res) => {
  try {
    const { comments } = req.body;
    
    // Check if user has one of the approval roles - admin explicitly cannot approve
    const approvalRoles = ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'];
    if (!approvalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve requests'
      });
    }
    
    // Double check to ensure admin cannot approve even if they somehow reach this point
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrators do not have access to the approval system'
      });
    }
    
    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }
    
    if (approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request cannot be approved because it is ${approval.status}`
      });
    }
    
    // Find the specific approval required for the user's role
    const approvalIndex = approval.requiredApprovals.findIndex(item => item.role === req.user.role);
    
    if (approvalIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'Your approval is not required for this request'
      });
    }
    
    // Update the approval
    approval.requiredApprovals[approvalIndex].isApproved = true;
    approval.requiredApprovals[approvalIndex].approvedBy = req.user._id;
    approval.requiredApprovals[approvalIndex].approvedAt = Date.now();
    
    if (comments) {
      approval.requiredApprovals[approvalIndex].comments = comments;
    }
    
    // Check if all required approvals are completed
    const allApproved = approval.requiredApprovals.every(item => item.isApproved);
    
    if (allApproved) {
      approval.status = 'approved';
      approval.updatedAt = Date.now();
      
      // TODO: Process the approved request (e.g., update order status, etc.)
      // This would be implemented based on the specific business logic
    }
    
    await approval.save();
    
    res.status(200).json({
      success: true,
      data: approval,
      message: allApproved ? 'Request fully approved' : 'Your approval has been recorded'
    });
  } catch (error) {
    console.error('Approve request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process approval',
      error: error.message
    });
  }
};

// @desc    Reject approval request
// @route   PUT /api/approvals/:id/reject
// @access  Private (Only for approval roles)
const rejectRequest = async (req, res) => {
  try {
    const { comments } = req.body;
    
    if (!comments) {
      return res.status(400).json({
        success: false,
        message: 'Comments are required when rejecting a request'
      });
    }
    
    // Check if user has one of the approval roles - admin explicitly cannot reject
    const approvalRoles = ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'];
    if (!approvalRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to reject requests'
      });
    }
    
    // Double check to ensure admin cannot reject even if they somehow reach this point
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrators do not have access to the approval system'
      });
    }
    
    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }
    
    if (approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request cannot be rejected because it is ${approval.status}`
      });
    }
    
    // Find the specific approval required for the user's role
    const approvalIndex = approval.requiredApprovals.findIndex(item => item.role === req.user.role);
    
    if (approvalIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'Your approval is not required for this request'
      });
    }
    
    // Update the approval status
    approval.status = 'rejected';
    approval.requiredApprovals[approvalIndex].comments = comments;
    approval.requiredApprovals[approvalIndex].approvedBy = req.user._id;
    approval.requiredApprovals[approvalIndex].approvedAt = Date.now();
    approval.updatedAt = Date.now();
    
    await approval.save();
    
    res.status(200).json({
      success: true,
      data: approval,
      message: 'Request has been rejected'
    });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process rejection',
      error: error.message
    });
  }
};

// @desc    Cancel an approval request
// @route   PUT /api/approvals/:id/cancel
// @access  Private (Only for requester or approval managers)
const cancelRequest = async (req, res) => {
  try {
    const approval = await Approval.findById(req.params.id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }
    
    // Admin can never modify approvals, including cancel
    if (req.user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Administrators do not have permission to cancel approval requests'
      });
    }
    
    // Check if user has permission (must be the requester or a manager)
    const isApprovalManager = ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(req.user.role);
    if (!approval.requestedBy.equals(req.user._id) && !isApprovalManager) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to cancel this request'
      });
    }
    
    if (approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This request cannot be cancelled because it is ${approval.status}`
      });
    }
    
    approval.status = 'cancelled';
    approval.updatedAt = Date.now();
    
    await approval.save();
    
    res.status(200).json({
      success: true,
      data: approval,
      message: 'Request has been cancelled'
    });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel request',
      error: error.message
    });
  }
};

module.exports = {
  createApproval,
  getApprovals,
  getApprovalById,
  approveRequest,
  rejectRequest,
  cancelRequest
};
