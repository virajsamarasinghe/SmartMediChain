const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

// @desc    Get analytics dashboard data
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const Medicine = require('../models/Medicine');
    const Order = require('../models/Order');
    const User = require('../models/User');
    
    // Get basic counts
    const totalMedicines = await Medicine.countDocuments({ status: 'active' });
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ isActive: true });
    
    // Get orders by status
    const ordersByStatus = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Get medicines by category
    const medicinesByCategory = await Medicine.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Get recent orders
    const recentOrders = await Order.find()
      .populate('customer', 'name organization')
      .populate('supplier', 'name organization')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        summary: {
          totalMedicines,
          totalOrders,
          totalUsers
        },
        ordersByStatus,
        medicinesByCategory,
        recentOrders
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private
const getSalesAnalytics = async (req, res) => {
  try {
    const Order = require('../models/Order');
    const { timeRange = '30d' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      default:
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
    }
    
    const salesData = await Order.aggregate([
      { $match: { createdAt: dateFilter, status: { $in: ['delivered', 'shipped'] } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          totalSales: { $sum: '$pricing.total' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      data: { salesData }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/dashboard', auth, getDashboardAnalytics);
router.get('/sales', auth, getSalesAnalytics);

module.exports = router;