const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardAnalytics:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             summary:
 *               type: object
 *               properties:
 *                 totalMedicines:
 *                   type: number
 *                   example: 150
 *                 totalOrders:
 *                   type: number
 *                   example: 75
 *                 totalUsers:
 *                   type: number
 *                   example: 25
 *             ordersByStatus:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "pending"
 *                   count:
 *                     type: number
 *                     example: 10
 *             medicinesByCategory:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "antibiotics"
 *                   count:
 *                     type: number
 *                     example: 25
 *             recentOrders:
 *               type: array
 *               items:
 *                 type: object
 *     SalesAnalytics:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             salesData:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "2024-01-15"
 *                   totalSales:
 *                     type: number
 *                     example: 1250.50
 *                   orderCount:
 *                     type: number
 *                     example: 5
 */

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get analytics dashboard data
 *     description: Retrieve comprehensive dashboard analytics including medicine counts, order statistics, and recent activity
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardAnalytics'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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

/**
 * @swagger
 * /api/analytics/sales:
 *   get:
 *     summary: Get sales analytics
 *     description: Retrieve sales analytics data for a specified time range
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *           default: 30d
 *         description: Time range for sales data (7 days, 30 days, or 90 days)
 *     responses:
 *       200:
 *         description: Sales analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SalesAnalytics'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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