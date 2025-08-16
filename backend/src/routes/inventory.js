const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// @desc    Get inventory summary
// @route   GET /api/inventory
// @access  Private
const getInventorySummary = async (req, res) => {
  try {
    const Medicine = require('../models/Medicine');
    
    const totalMedicines = await Medicine.countDocuments({ status: 'active' });
    const lowStockMedicines = await Medicine.countDocuments({ 
      status: 'active',
      'batchInfo.quantity': { $lt: 20 }
    });
    const expiringMedicines = await Medicine.countDocuments({
      status: 'active',
      'batchInfo.expiryDate': { 
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    });
    
    const totalValue = await Medicine.aggregate([
      { $match: { status: 'active' } },
      { 
        $group: { 
          _id: null, 
          total: { 
            $sum: { 
              $multiply: ['$batchInfo.quantity', '$pricing.costPrice'] 
            } 
          } 
        } 
      }
    ]);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalMedicines,
          lowStockMedicines,
          expiringMedicines,
          totalValue: totalValue[0]?.total || 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get low stock medicines
// @route   GET /api/inventory/low-stock
// @access  Private
const getLowStockMedicines = async (req, res) => {
  try {
    const Medicine = require('../models/Medicine');
    const { threshold = 20 } = req.query;
    
    const medicines = await Medicine.find({
      status: 'active',
      'batchInfo.quantity': { $lt: parseInt(threshold) }
    }).populate('createdBy', 'name organization');
    
    res.json({
      success: true,
      data: { medicines }
    });
  } catch (error) {
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
    const Medicine = require('../models/Medicine');
    const { days = 30 } = req.query;
    
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + parseInt(days));
    
    const medicines = await Medicine.find({
      status: 'active',
      'batchInfo.expiryDate': { $lte: expiryDate }
    }).populate('createdBy', 'name organization');
    
    res.json({
      success: true,
      data: { medicines }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/', auth, getInventorySummary);
router.get('/low-stock', auth, getLowStockMedicines);
router.get('/expiring', auth, getExpiringMedicines);

module.exports = router;