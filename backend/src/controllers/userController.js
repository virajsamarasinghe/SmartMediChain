const User = require('../models/User');
const { 
  updateProfileSchema,
  adminCreateUserSchema, 
  adminUpdateUserSchema, 
  adminSetPasswordSchema 
} = require('../validation/userValidation');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin only)
const getAllUsers = async (req, res) => {
  try {
    // Add pagination and filtering
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Filter options
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isActive !== undefined) filter.isActive = req.query.isActive === 'true';
    
    // Execute query
    const users = await User.find(filter)
      .select('-password -refreshTokens')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await User.countDocuments(filter);
    
    res.json({
      success: true,
      data: { 
        users,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private (Admin only)
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new user (by admin)
// @route   POST /api/users
// @access  Private (Admin only)
const createUser = async (req, res) => {
  try {
    // Validate request body
    const { error } = adminCreateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { email, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Check if the user being created has a special role that requires approval
    const requiresApproval = ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'].includes(role);
    
    // If admin is creating a special role and they are not a senior manager, create approval request
    if (requiresApproval && req.user.role !== 'senior_manager') {
      const { createApprovalRequest } = require('../services/approvalService');
      
      // Create the user in inactive state
      const userToCreate = {
        ...req.body,
        isActive: false // User will be inactive until approved
      };
      
      const user = await User.create(userToCreate);
      
      // Create approval request
      const approval = await createApprovalRequest(
        req.user,
        'User',
        user._id,
        'create',
        req.body
      );
      
      return res.status(202).json({
        success: true,
        message: 'User creation request submitted for approval',
        data: { 
          user: user.getPublicProfile(),
          approval: {
            id: approval._id,
            status: approval.status,
            requiredApprovals: approval.requiredApprovals.map(item => item.role)
          }
        }
      });
    }
    
    // For regular users or if admin has sufficient permissions, create directly
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: user.getPublicProfile() }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user creation'
    });
  }
};

// @desc    Update user (by admin)
// @route   PUT /api/users/:id
// @access  Private (Admin only)
const updateUser = async (req, res) => {
  try {
    // Validate request body
    const { error } = adminUpdateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // If email is being updated, check for duplicates
    if (req.body.email) {
      const existingUser = await User.findOne({ 
        email: req.body.email,
        _id: { $ne: req.params.id }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email address is already in use'
        });
      }
    }
    
    // Find the user first to check current role
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if the update includes role changes that require approval
    const { role } = req.body;
    const specialRoles = ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager', 'admin'];
    const roleChanged = role && role !== user.role;
    const isSpecialRoleChange = roleChanged && (specialRoles.includes(role) || specialRoles.includes(user.role));
    
    // If trying to change to/from a special role and requester is not a senior manager
    if (isSpecialRoleChange && req.user.role !== 'senior_manager') {
      const { createApprovalRequest } = require('../services/approvalService');
      
      // Create approval request
      const approval = await createApprovalRequest(
        req.user,
        'User',
        user._id,
        'update',
        req.body
      );
      
      return res.status(202).json({
        success: true,
        message: 'User update request submitted for approval',
        data: { 
          user: user,
          approval: {
            id: approval._id,
            status: approval.status,
            requiredApprovals: approval.requiredApprovals.map(item => item.role)
          }
        }
      });
    }
    
    // Update user directly if no approval needed
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user update'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }
    
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during user deletion'
    });
  }
};

// @desc    Set user password (by admin)
// @route   PUT /api/users/:id/reset-password
// @access  Private (Admin only)
const setUserPassword = async (req, res) => {
  try {
    // Validate request body
    const { error } = adminSetPasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update password
    user.password = req.body.password;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password updated successfully',
      data: {}
    });
  } catch (error) {
    console.error('Set password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password update'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    // Validate request body
    const { error } = updateProfileSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    
    const { name, profile, organization } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, profile, organization },
      { new: true, runValidators: true }
    ).select('-password -refreshTokens');
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile update'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  setUserPassword,
  getUserProfile,
  updateUserProfile
};
