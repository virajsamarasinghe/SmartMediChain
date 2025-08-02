const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
const User = require('../models/User');
const { authorize } = require('../middleware/auth');

// @desc    Get dashboard analytics
// @route   GET /api/analytics/dashboard
// @access  Private
const getDashboardAnalytics = async (req, res) => {
  try {
    const { period = '30' } = req.query; // days
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // Build query based on user role
    let userFilter = {};
    if (req.user.role !== 'admin') {
      userFilter = {
        $or: [
          { customer: req.user.id },
          { supplier: req.user.id },
          { createdBy: req.user.id }
        ]
      };
    }

    // Basic counts
    const totalMedicines = await Medicine.countDocuments(
      req.user.role === 'admin' ? {} : { createdBy: req.user.id }
    );
    
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: daysAgo },
      ...userFilter
    });
    
    const totalRevenue = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: daysAgo },
          ...userFilter
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$pricing.total' }
        }
      }
    ]);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: daysAgo },
          ...userFilter
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top selling medicines
    const topMedicines = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: daysAgo },
          ...userFilter
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.medicine',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'medicines',
          localField: '_id',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' }
    ]);

    // Daily sales trend
    const salesTrend = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: daysAgo },
          ...userFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$pricing.total' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Low stock alerts
    const lowStockCount = await Medicine.countDocuments({
      'batchInfo.quantity': { $lte: 10 },
      status: 'active',
      ...(req.user.role !== 'admin' && { createdBy: req.user.id })
    });

    // Expiring medicines count
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const expiringSoonCount = await Medicine.countDocuments({
      'batchInfo.expiryDate': {
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      },
      status: 'active',
      ...(req.user.role !== 'admin' && { createdBy: req.user.id })
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalMedicines,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          lowStockCount,
          expiringSoonCount
        },
        ordersByStatus,
        topMedicines,
        salesTrend
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
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
    const { 
      period = '30',
      groupBy = 'day' // day, week, month
    } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    let userFilter = {};
    if (req.user.role !== 'admin') {
      userFilter = {
        $or: [
          { supplier: req.user.id }
        ]
      };
    }

    // Group by format
    let dateFormat;
    switch (groupBy) {
      case 'week':
        dateFormat = '%Y-W%U';
        break;
      case 'month':
        dateFormat = '%Y-%m';
        break;
      default:
        dateFormat = '%Y-%m-%d';
    }

    const salesData = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: daysAgo },
          ...userFilter
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$createdAt'
            }
          },
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$pricing.total' },
          totalItems: { $sum: { $sum: '$items.quantity' } },
          averageOrderValue: { $avg: '$pricing.total' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Category-wise sales
    const categorySales = await Order.aggregate([
      {
        $match: {
          status: 'delivered',
          createdAt: { $gte: daysAgo },
          ...userFilter
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'medicines',
          localField: 'items.medicine',
          foreignField: '_id',
          as: 'medicine'
        }
      },
      { $unwind: '$medicine' },
      {
        $group: {
          _id: '$medicine.category',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        salesData,
        categorySales
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get inventory analytics
// @route   GET /api/analytics/inventory
// @access  Private
const getInventoryAnalytics = async (req, res) => {
  try {
    let query = { status: 'active' };
    if (req.user.role !== 'admin') {
      query.createdBy = req.user.id;
    }

    // Inventory value by category
    const inventoryByCategory = await Medicine.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$category',
          totalItems: { $sum: 1 },
          totalQuantity: { $sum: '$batchInfo.quantity' },
          totalValue: {
            $sum: {
              $multiply: ['$batchInfo.quantity', '$pricing.costPrice']
            }
          }
        }
      },
      { $sort: { totalValue: -1 } }
    ]);

    // Stock levels
    const stockLevels = await Medicine.aggregate([
      { $match: query },
      {
        $bucket: {
          groupBy: '$batchInfo.quantity',
          boundaries: [0, 10, 50, 100, 500, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            medicines: { $push: { name: '$name', quantity: '$batchInfo.quantity' } }
          }
        }
      }
    ]);

    // Expiry analysis
    const now = new Date();
    const thirtyDays = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const ninetyDays = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const expiryAnalysis = await Medicine.aggregate([
      { $match: query },
      {
        $bucket: {
          groupBy: '$batchInfo.expiryDate',
          boundaries: [new Date(0), now, thirtyDays, ninetyDays, new Date('2099-12-31')],
          default: 'Far Future',
          output: {
            count: { $sum: 1 },
            totalValue: {
              $sum: {
                $multiply: ['$batchInfo.quantity', '$pricing.costPrice']
              }
            }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        inventoryByCategory,
        stockLevels,
        expiryAnalysis
      }
    });
  } catch (error) {
    console.error('Get inventory analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get user analytics (Admin only)
// @route   GET /api/analytics/users
// @access  Private (Admin)
const getUserAnalytics = async (req, res) => {
  try {
    // User registration trends
    const userTrends = await User.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Users by role
    const usersByRole = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: ['$isActive', 1, 0]
            }
          },
          verified: {
            $sum: {
              $cond: ['$isVerified', 1, 0]
            }
          }
        }
      }
    ]);

    // Organization types
    const organizationTypes = await User.aggregate([
      {
        $match: {
          'organization.type': { $exists: true }
        }
      },
      {
        $group: {
          _id: '$organization.type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        userTrends,
        usersByRole,
        organizationTypes
      }
    });
  } catch (error) {
    console.error('Get user analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/dashboard', getDashboardAnalytics);
router.get('/sales', getSalesAnalytics);
router.get('/inventory', getInventoryAnalytics);
router.get('/users', authorize('admin'), getUserAnalytics);

module.exports = router;
