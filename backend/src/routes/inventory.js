const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const { authorize } = require('../middleware/auth');

// @desc    Get inventory overview
// @route   GET /api/inventory
// @access  Private
const getInventoryOverview = async (req, res) => {
  try {
    const { category, status = 'active', lowStock = 10 } = req.query;

    // Build query based on user role
    let query = { status };
    if (req.user.role !== 'admin') {
      query.createdBy = req.user.id;
    }
    if (category) query.category = category;

    const medicines = await Medicine.find(query)
      .populate('createdBy', 'name organization')
      .sort({ 'batchInfo.quantity': 1 });

    // Calculate statistics
    const totalItems = medicines.length;
    const totalValue = medicines.reduce((sum, med) => 
      sum + (med.batchInfo.quantity * med.pricing.costPrice), 0
    );
    
    const lowStockItems = medicines.filter(med => 
      med.batchInfo.quantity <= parseInt(lowStock)
    );
    
    const expiredItems = medicines.filter(med => med.isExpired);
    
    const expiringSoonItems = medicines.filter(med => {
      const daysUntilExpiry = med.daysUntilExpiry;
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
    });

    // Category breakdown
    const categoryBreakdown = await Medicine.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$batchInfo.quantity' },
          totalValue: { 
            $sum: { 
              $multiply: ['$batchInfo.quantity', '$pricing.costPrice'] 
            } 
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalItems,
          totalValue: Math.round(totalValue * 100) / 100,
          lowStockCount: lowStockItems.length,
          expiredCount: expiredItems.length,
          expiringSoonCount: expiringSoonItems.length
        },
        medicines,
        lowStockItems,
        expiredItems,
        expiringSoonItems,
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Get inventory overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get low stock items
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockItems = async (req, res) => {
  try {
    const { threshold = 10 } = req.query;

    let query = { 
      status: 'active',
      'batchInfo.quantity': { $lte: parseInt(threshold) }
    };

    if (req.user.role !== 'admin') {
      query.createdBy = req.user.id;
    }

    const lowStockItems = await Medicine.find(query)
      .populate('createdBy', 'name organization')
      .sort({ 'batchInfo.quantity': 1 });

    res.json({
      success: true,
      data: { lowStockItems }
    });
  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get expiring medicines
// @route   GET /api/inventory/expiring
// @access  Private
const getExpiringMedicines = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    let query = {
      status: 'active',
      'batchInfo.expiryDate': {
        $gte: new Date(),
        $lte: futureDate
      }
    };

    if (req.user.role !== 'admin') {
      query.createdBy = req.user.id;
    }

    const expiringMedicines = await Medicine.find(query)
      .populate('createdBy', 'name organization')
      .sort({ 'batchInfo.expiryDate': 1 });

    res.json({
      success: true,
      data: { expiringMedicines }
    });
  } catch (error) {
    console.error('Get expiring medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get inventory movements
// @route   GET /api/inventory/movements
// @access  Private
const getInventoryMovements = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      medicineId,
      dateFrom,
      dateTo,
      type
    } = req.query;

    // Build query for orders that affect inventory
    let query = {
      status: { $in: ['delivered', 'cancelled'] }
    };

    if (req.user.role !== 'admin') {
      query.$or = [
        { customer: req.user.id },
        { supplier: req.user.id }
      ];
    }

    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const movements = await Order.find(query)
      .populate('customer', 'name organization')
      .populate('supplier', 'name organization')
      .populate('items.medicine', 'name category batchInfo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Filter by medicine if specified
    let filteredMovements = movements;
    if (medicineId) {
      filteredMovements = movements.filter(order =>
        order.items.some(item => item.medicine._id.toString() === medicineId)
      );
    }

    const totalCount = await Order.countDocuments(query);

    res.json({
      success: true,
      data: {
        movements: filteredMovements,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get inventory movements error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update medicine stock
// @route   PUT /api/inventory/:id/stock
// @access  Private (Supplier, Admin)
const updateStock = async (req, res) => {
  try {
    const { quantity, reason } = req.body;

    if (!quantity || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and reason are required'
      });
    }

    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && medicine.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this medicine stock'
      });
    }

    const oldQuantity = medicine.batchInfo.quantity;
    medicine.batchInfo.quantity = parseInt(quantity);
    await medicine.save();

    // Create inventory movement record (you could create a separate model for this)
    // For now, we'll just return the update info

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        medicine,
        movement: {
          oldQuantity,
          newQuantity: parseInt(quantity),
          difference: parseInt(quantity) - oldQuantity,
          reason,
          updatedBy: req.user.id,
          updatedAt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/', getInventoryOverview);
router.get('/low-stock', getLowStockItems);
router.get('/expiring', getExpiringMedicines);
router.get('/movements', getInventoryMovements);
router.put('/:id/stock', authorize('admin', 'supplier', 'manufacturer'), updateStock);

module.exports = router;
