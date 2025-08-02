const express = require('express');
const router = express.Router();
const User = require('../models/User');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      organizationType,
      isVerified,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query for suppliers
    const query = {
      role: { $in: ['supplier', 'manufacturer', 'distributor'] },
      isActive: true
    };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'organization.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (organizationType) {
      query['organization.type'] = organizationType;
    }

    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const suppliers = await User.find(query)
      .select('-password -refreshTokens')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await User.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        suppliers,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = async (req, res) => {
  try {
    const supplier = await User.findOne({
      _id: req.params.id,
      role: { $in: ['supplier', 'manufacturer', 'distributor'] }
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
    console.error('Get supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get supplier types
// @route   GET /api/suppliers/types
// @access  Private
const getSupplierTypes = async (req, res) => {
  try {
    const types = ['supplier', 'manufacturer', 'distributor'];
    
    // Get type counts
    const typeCounts = await User.aggregate([
      { 
        $match: { 
          role: { $in: types },
          isActive: true 
        } 
      },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const typesWithCounts = types.map(type => {
      const found = typeCounts.find(item => item._id === type);
      return {
        name: type,
        count: found ? found.count : 0
      };
    });

    res.json({
      success: true,
      data: { types: typesWithCounts }
    });
  } catch (error) {
    console.error('Get supplier types error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/', getSuppliers);
router.get('/types', getSupplierTypes);
router.get('/:id', getSupplier);

module.exports = router;
