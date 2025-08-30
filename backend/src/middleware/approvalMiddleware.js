const { createApprovalRequest } = require('../services/approvalService');

/**
 * Middleware to check if an action requires approval and create an approval request
 * @param {string} entityType - The type of entity (Order, Medicine, User)
 * @param {string} requestType - The type of request (create, update, delete, etc.)
 * @param {function} getEntityId - Function to extract entity ID from request
 * @param {function} getRequestDetails - Function to extract request details
 * @param {boolean} shouldProceed - Whether to proceed with the original request (true) or stop and wait for approval (false)
 * @returns {function} Middleware function
 */

/**
 * Middleware to check if user has permission to access approval functions
 * Only Senior Manager, Finance Manager, Operations Manager, and Compliance Manager roles can access
 */
const checkApprovalAccess = (req, res, next) => {
  const approvalRoles = ['senior_manager', 'finance_manager', 'operations_manager', 'compliance_manager'];
  
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required',
    });
  }
  
  // Explicitly deny admin access to approval functions
  if (req.user.role === 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Administrators do not have permission to access approval functions',
    });
  }
  
  if (!approvalRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access approval functions',
    });
  }
  
  next();
};

/**
 * Helper function to check if a user is an approval manager
 * @param {Object} user - User object
 * @returns {boolean} - True if user is an approval manager
 */
const isApprovalManager = (user) => {
  // Admin is never considered an approval manager
  if (user && user.role === 'admin') return false;
  
  const approvalRoles = ['senior_manager', 'finance_manager', 'operations_manager', 'compliance_manager'];
  return user && approvalRoles.includes(user.role);
};
const requireApproval = (entityType, requestType, getEntityId, getRequestDetails, shouldProceed = false) => {
  return async (req, res, next) => {
    try {
      // Skip approval check for manager roles
      if (['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(req.user.role)) {
        return next();
      }
      
      const entityId = getEntityId(req);
      const requestDetails = getRequestDetails(req);
      
      // Create approval request
      const approval = await createApprovalRequest(
        req.user,
        entityType,
        entityId,
        requestType,
        requestDetails
      );
      
      // If no approval needed or we should proceed, continue to the next middleware
      if (!approval || shouldProceed) {
        return next();
      }
      
      // Otherwise, stop here and return the approval request
      return res.status(202).json({
        success: true,
        message: 'Your request has been submitted for approval',
        data: {
          approvalId: approval._id,
          status: approval.status,
          requiredApprovals: approval.requiredApprovals.map(item => item.role)
        }
      });
    } catch (error) {
      console.error('Approval middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing approval request',
        error: error.message
      });
    }
  };
};

module.exports = {
  requireApproval,
  checkApprovalAccess,
  isApprovalManager
};
