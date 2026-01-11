const Approval = require('../models/Approval');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const User = require('../models/User');

/**
 * Determine required approvals based on the request type and entity
 * @param {string} entityType - The type of entity (Order, Medicine, User)
 * @param {string} requestType - The type of request (create, update, delete, etc.)
 * @param {Object} requestDetails - Details about the request
 * @returns {Array} - Array of required approval roles
 */
const determineRequiredApprovals = (entityType, requestType, requestDetails) => {
  const approvalRoles = [];
  
  // Order approvals
  if (entityType === 'Order') {
    if (requestType === 'create') {
      // Orders above a certain value need financial approval
      if (requestDetails.pricing && requestDetails.pricing.total > 5000) {
        approvalRoles.push('finance_manager');
      }
      
      // All orders need operations manager approval
      approvalRoles.push('operations_manager');
      
      // High-value orders need senior manager approval
      if (requestDetails.pricing && requestDetails.pricing.total > 10000) {
        approvalRoles.push('senior_manager');
      }
    }
    
    if (requestType === 'update' || requestType === 'cancel') {
      // Updates to orders need operations manager approval
      approvalRoles.push('operations_manager');
    }
  }
  
  // Medicine approvals
  if (entityType === 'Medicine') {
    if (requestType === 'create') {
      // New medicines need compliance manager approval
      approvalRoles.push('compliance_manager');
    }
    
    if (requestType === 'update') {
      // Updates to medicines need compliance manager approval
      approvalRoles.push('compliance_manager');
    }
  }
  
  // User approvals
  if (entityType === 'User') {
    if (requestType === 'create') {
      // Creating users with certain roles needs senior manager approval
      if (requestDetails.role === 'admin' || 
          requestDetails.role === 'operations_manager' || 
          requestDetails.role === 'compliance_manager' || 
          requestDetails.role === 'finance_manager') {
        approvalRoles.push('senior_manager');
      }
    }
    
    if (requestType === 'update') {
      // Role changes need senior manager approval
      if (requestDetails.role && 
          (requestDetails.role === 'admin' || 
           requestDetails.role === 'operations_manager' || 
           requestDetails.role === 'compliance_manager' || 
           requestDetails.role === 'finance_manager' || 
           requestDetails.role === 'senior_manager')) {
        approvalRoles.push('senior_manager');
      }
    }
  }
  
  return approvalRoles;
};

/**
 * Create an approval request
 * @param {Object} user - The requesting user
 * @param {string} entityType - The type of entity (Order, Medicine, User)
 * @param {string} relatedEntityId - The ID of the related entity
 * @param {string} requestType - The type of request (create, update, delete, etc.)
 * @param {Object} requestDetails - Details about the request
 * @returns {Object} - The created approval object or null if no approval needed
 */
const createApprovalRequest = async (user, entityType, relatedEntityId, requestType, requestDetails) => {
  // Determine required approvals based on entity type and request
  const requiredApprovalRoles = determineRequiredApprovals(entityType, requestType, requestDetails);
  
  // If no approvals required, return null
  if (requiredApprovalRoles.length === 0) {
    return null;
  }
  
  // Create approval with required approvals
  const approval = new Approval({
    relatedEntity: relatedEntityId,
    entityType,
    requestType,
    requestDetails,
    requestedBy: user._id,
    requiredApprovals: requiredApprovalRoles.map(role => ({ role }))
  });
  
  await approval.save();
  return approval;
};

/**
 * Check if a user can approve a specific request
 * @param {Object} user - The user attempting to approve
 * @param {Object} approval - The approval object
 * @returns {boolean} - True if user can approve, false otherwise
 */
const canUserApprove = (user, approval) => {
  // Admin can never approve requests
  if (user.role === 'admin') {
    return false;
  }
  
  // Check if user has one of the required approval roles
  const requiredRoleForUser = approval.requiredApprovals.find(item => item.role === user.role);
  
  // If user has a required role and hasn't approved yet
  return requiredRoleForUser && !requiredRoleForUser.isApproved;
};

/**
 * Process an approved request
 * @param {Object} approval - The approved approval object
 * @returns {boolean} - True if processing successful, false otherwise
 */
const processApprovedRequest = async (approval) => {
  try {
    // Check if all required approvals are completed
    const allApproved = approval.requiredApprovals.every(item => item.isApproved);
    
    if (!allApproved) {
      return false;
    }
    
    // Update approval status
    approval.status = 'approved';
    approval.isCompleted = true;
    approval.updatedAt = Date.now();
    
    // Process based on entity type and request type
    switch (approval.entityType) {
      case 'Order':
        return await processOrderApproval(approval);
      case 'Medicine':
        return await processMedicineApproval(approval);
      case 'User':
        return await processUserApproval(approval);
      default:
        console.error(`Unknown entity type: ${approval.entityType}`);
        return false;
    }
  } catch (error) {
    console.error('Error processing approval:', error);
    return false;
  }
};

/**
 * Process an approved order request
 * @param {Object} approval - The approved approval object
 * @returns {boolean} - True if processing successful, false otherwise
 */
const processOrderApproval = async (approval) => {
  try {
    const order = await Order.findById(approval.relatedEntity);
    
    if (!order) {
      console.error(`Order not found: ${approval.relatedEntity}`);
      return false;
    }
    
    if (approval.requestType === 'create') {
      // Update order status
      order.status = 'confirmed';
      order.timeline.push({
        status: 'confirmed',
        note: 'Order confirmed after approval process',
        updatedBy: approval.requestedBy
      });
      await order.save();
    } else if (approval.requestType === 'update') {
      // Apply the updates from requestDetails
      const { status, items, shipping, payment } = approval.requestDetails;
      
      if (status) {
        order.status = status;
        order.timeline.push({
          status,
          note: 'Status updated after approval',
          updatedBy: approval.requestedBy
        });
      }
      
      // Apply other updates as needed
      
      await order.save();
    }
    
    return true;
  } catch (error) {
    console.error('Error processing order approval:', error);
    return false;
  }
};

/**
 * Process an approved medicine request
 * @param {Object} approval - The approved approval object
 * @returns {boolean} - True if processing successful, false otherwise
 */
const processMedicineApproval = async (approval) => {
  try {
    // Implementation specific to medicine approvals
    return true;
  } catch (error) {
    console.error('Error processing medicine approval:', error);
    return false;
  }
};

/**
 * Process an approved user request
 * @param {Object} approval - The approved approval object
 * @returns {boolean} - True if processing successful, false otherwise
 */
const processUserApproval = async (approval) => {
  try {
    const user = await User.findById(approval.relatedEntity);
    
    if (!user) {
      console.error(`User not found: ${approval.relatedEntity}`);
      return false;
    }
    
    if (approval.requestType === 'create') {
      // User would have already been created in pending state
      user.isActive = true;
      await user.save();
    } else if (approval.requestType === 'update') {
      // Apply the updates from requestDetails
      const { role, isActive } = approval.requestDetails;
      
      if (role) {
        user.role = role;
      }
      
      if (isActive !== undefined) {
        user.isActive = isActive;
      }
      
      await user.save();
    }
    
    return true;
  } catch (error) {
    console.error('Error processing user approval:', error);
    return false;
  }
};

module.exports = {
  determineRequiredApprovals,
  createApprovalRequest,
  canUserApprove,
  processApprovedRequest
};
