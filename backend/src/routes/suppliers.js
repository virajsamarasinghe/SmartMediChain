const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const User = require('../models/User');
    const suppliers = await User.find({ 
      role: { $in: ['supplier', 'manufacturer'] },
      isActive: true 
    }).select('-password -refreshTokens');
    
    res.json({
      success: true,
      data: { suppliers }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get supplier by ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = async (req, res) => {
  try {
    const User = require('../models/User');
    const supplier = await User.findOne({
      _id: req.params.id,
      role: { $in: ['supplier', 'manufacturer'] }
    }).select('-password -refreshTokens');
    
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }
    
    res.json({
      success: true,
      data: { supplier }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/', auth, getSuppliers);
router.get('/:id', auth, getSupplier);

module.exports = router;