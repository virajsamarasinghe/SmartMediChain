const Approval = require('../models/Approval');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const User = require('../models/User');
const SmartContractService = require('../services/smartContractService');
const mongoose = require('mongoose');

// Initialize blockchain service
const smartContractService = new SmartContractService();
let isBlockchainInitialized = false;

// Initialize blockchain service on startup
const initializeBlockchain = async () => {
  if (!isBlockchainInitialized) {
    try {
      await smartContractService.initialize();
      isBlockchainInitialized = true;
      console.log('Blockchain service initialized in approval controller');
    } catch (error) {
      console.error('Failed to initialize blockchain service in approval controller:', error);
      // Continue without blockchain functionality
    }
  }
};

// Call initialization
initializeBlockchain();

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
    console.log(`🔍 Looking for ${entityType} with ID: ${relatedEntity}`);
    console.log(`🔍 Entity found:`, entity ? `✅ Yes (ID: ${entity._id})` : '❌ No');
    
    if (!entity) {
      console.error(`❌ ${entityType} not found with ID: ${relatedEntity}`);
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
      
      // Log approval to blockchain
      let blockchainResult = null;
      if (isBlockchainInitialized) {
        try {
          // Get order details for blockchain logging
          let blockchainOrderId = null;
          if (approval.entityType === 'Order' && approval.relatedEntity) {
            const order = await Order.findById(approval.relatedEntity);
            if (order && order.metadata && order.metadata.blockchainOrderId) {
              blockchainOrderId = order.metadata.blockchainOrderId;
            }
          }

          if (blockchainOrderId) {
            const approvalResult = await smartContractService.submitManagerApproval(
              blockchainOrderId,
              {
                approved: true,
                managerName: req.user.name || req.user.email,
                role: req.user.role,
                comments: comments || 'Approved via management system'
              }
            );

            if (approvalResult.success) {
              blockchainResult = {
                logged: true,
                transactionHash: approvalResult.transactionHash,
                blockNumber: approvalResult.blockNumber,
                gasUsed: approvalResult.gasUsed
              };
              console.log(`🔗 Approval logged to blockchain - TX: ${approvalResult.transactionHash}`);
            } else {
              blockchainResult = {
                logged: false,
                error: approvalResult.error
              };
              console.error('❌ Failed to log approval to blockchain:', approvalResult.error);
            }
          } else {
            console.log('⚠️  No blockchain order ID found - skipping blockchain logging');
          }
        } catch (blockchainError) {
          console.error('❌ Blockchain logging error during approval:', blockchainError);
          blockchainResult = {
            logged: false,
            error: blockchainError.message
          };
        }
      }

      // Store blockchain metadata in approval
      if (blockchainResult) {
        approval.metadata = approval.metadata || {};
        approval.metadata.blockchain = blockchainResult;
      }
      
      // Update the related entity status based on approval
      if (approval.entityType === 'Order' && approval.relatedEntity) {
        try {
          const order = await Order.findById(approval.relatedEntity);
          if (order) {
            // Update order status to approved
            order.status = 'approved';
            order.approvalStatus = 'approved';
            order.updatedAt = new Date();
            
            // Store blockchain metadata in order as well
            if (blockchainResult) {
              order.metadata = order.metadata || {};
              order.metadata.approvalBlockchain = blockchainResult;
            }
            
            await order.save();
            
            console.log(`✅ Order ${order._id} status updated to approved after approval completion`);
          }
        } catch (orderError) {
          console.error('❌ Error updating order status after approval:', orderError);
        }
      }
      
      // Handle other entity types if needed
      if (approval.entityType === 'Medicine' && approval.relatedEntity) {
        try {
          const medicine = await Medicine.findById(approval.relatedEntity);
          if (medicine) {
            // Update medicine approval status if needed
            medicine.approvalStatus = 'approved';
            medicine.updatedAt = new Date();
            await medicine.save();
            
            console.log(`✅ Medicine ${medicine._id} status updated to approved`);
          }
        } catch (medicineError) {
          console.error('❌ Error updating medicine status after approval:', medicineError);
        }
      }
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
    
    // Log rejection to blockchain
    let blockchainResult = null;
    if (isBlockchainInitialized) {
      try {
        // Get order details for blockchain logging
        let blockchainOrderId = null;
        if (approval.entityType === 'Order' && approval.relatedEntity) {
          const order = await Order.findById(approval.relatedEntity);
          if (order && order.metadata && order.metadata.blockchainOrderId) {
            blockchainOrderId = order.metadata.blockchainOrderId;
          }
        }

        if (blockchainOrderId) {
          const rejectionResult = await smartContractService.submitManagerApproval(
            blockchainOrderId,
            {
              approved: false,
              managerName: req.user.name || req.user.email,
              role: req.user.role,
              comments: comments
            }
          );

          if (rejectionResult.success) {
            blockchainResult = {
              logged: true,
              transactionHash: rejectionResult.transactionHash,
              blockNumber: rejectionResult.blockNumber,
              gasUsed: rejectionResult.gasUsed
            };
            console.log(`🔗 Rejection logged to blockchain - TX: ${rejectionResult.transactionHash}`);
          } else {
            blockchainResult = {
              logged: false,
              error: rejectionResult.error
            };
            console.error('❌ Failed to log rejection to blockchain:', rejectionResult.error);
          }
        } else {
          console.log('⚠️  No blockchain order ID found - skipping blockchain logging for rejection');
        }
      } catch (blockchainError) {
        console.error('❌ Blockchain logging error during rejection:', blockchainError);
        blockchainResult = {
          logged: false,
          error: blockchainError.message
        };
      }
    }

    // Store blockchain metadata in approval
    if (blockchainResult) {
      approval.metadata = approval.metadata || {};
      approval.metadata.blockchain = blockchainResult;
    }
    
    // Update the related entity status based on rejection
    if (approval.entityType === 'Order' && approval.relatedEntity) {
      try {
        const order = await Order.findById(approval.relatedEntity);
        if (order) {
          // Update order status to rejected
          order.status = 'rejected';
          order.approvalStatus = 'rejected';
          order.rejectionReason = comments;
          order.rejectedBy = req.user._id;
          order.updatedAt = new Date();
          
          // Store blockchain metadata in order as well
          if (blockchainResult) {
            order.metadata = order.metadata || {};
            order.metadata.approvalBlockchain = blockchainResult;
          }
          
          await order.save();
          
          console.log(`❌ Order ${order._id} status updated to rejected after approval rejection`);
        }
      } catch (orderError) {
        console.error('❌ Error updating order status after rejection:', orderError);
      }
    }
    
    // Handle other entity types if needed
    if (approval.entityType === 'Medicine' && approval.relatedEntity) {
      try {
        const medicine = await Medicine.findById(approval.relatedEntity);
        if (medicine) {
          // Update medicine approval status if needed
          medicine.approvalStatus = 'rejected';
          medicine.rejectionReason = comments;
          medicine.updatedAt = new Date();
          await medicine.save();
          
          console.log(`❌ Medicine ${medicine._id} status updated to rejected`);
        }
      } catch (medicineError) {
        console.error('❌ Error updating medicine status after rejection:', medicineError);
      }
    }
    
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
