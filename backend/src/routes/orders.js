const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const { auth, authorize } = require('../middleware/auth');
const SmartContractService = require('../services/smartContractService');

// Initialize blockchain service
const smartContractService = new SmartContractService();
let isBlockchainInitialized = false;

// Initialize blockchain service on startup
const initializeBlockchain = async () => {
  if (!isBlockchainInitialized) {
    try {
      await smartContractService.initialize();
      isBlockchainInitialized = true;
      console.log('✅ Blockchain service initialized for orders');
    } catch (error) {
      console.error('⚠️  Failed to initialize blockchain service for orders:', error.message);
      // Continue without blockchain functionality
    }
  }
};

initializeBlockchain();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders
 *     description: Retrieve orders with filtering and pagination
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, shipped, delivered, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *     responses:
 *       200:
 *         description: Orders retrieved successfully
 *   post:
 *     summary: Create new order
 *     description: Place a new order for medicines
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - supplier
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     medicine:
 *                       type: string
 *                       example: "64a1b2c3d4e5f6789012345"
 *                     quantity:
 *                       type: number
 *                       example: 50
 *               supplier:
 *                 type: string
 *                 example: "64a1b2c3d4e5f6789012346"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 example: "medium"
 *               notes:
 *                 type: string
 *                 example: "Urgent delivery required"
 *     responses:
 *       201:
 *         description: Order created successfully
 */

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      orderType,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo
    } = req.query;

    // Debug logging
    console.log('Get orders - User:', req.user.id, 'Role:', req.user.role);
    
    // Build query based on user role
    let query = {};

    if (req.user.role !== 'admin') {
      // Non-admin users can only see their own orders
      query.$or = [
        { customer: req.user.id },
        { supplier: req.user.id }
      ];
      console.log('Non-admin query:', query);
    } else {
      console.log('Admin user - showing all orders');
    }

    // Add filters
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;
    if (priority) query.priority = priority;
    if (search) {
      query.orderNumber = { $regex: search, $options: 'i' };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
      if (dateTo) query.createdAt.$lte = new Date(dateTo);
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const orders = await Order.find(query)
      .populate('customer', 'name email organization')
      .populate('supplier', 'name email organization')
      .populate('items.medicine', 'name category dosageForm')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Order.countDocuments(query);
    console.log('Orders found:', orders.length, 'Total count:', totalCount);
    console.log('Query used:', JSON.stringify(query));
    
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
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
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email organization profile')
      .populate('supplier', 'name email organization profile')
      .populate('items.medicine', 'name category dosageForm manufacturer pricing')
      .populate('timeline.updatedBy', 'name');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has access to this order
    if (req.user.role !== 'admin' &&
      order.customer._id.toString() !== req.user.id &&
      order.supplier._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    res.json({
      success: true,
      data: { order }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const {
      orderType,
      supplier,
      items,
      shipping,
      payment,
      prescription,
      notes,
      priority
    } = req.body;

    // Validate items and calculate pricing
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const medicine = await Medicine.findById(item.medicine);
      if (!medicine) {
        return res.status(400).json({
          success: false,
          message: `Medicine with ID ${item.medicine} not found`
        });
      }

      // Convert quantity to number to ensure proper calculations
      const numQuantity = parseInt(item.quantity);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${medicine.name}`
        });
      }

      if (medicine.batchInfo.quantity < numQuantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient quantity for ${medicine.name}. Available: ${medicine.batchInfo.quantity}`
        });
      }

      const itemTotal = numQuantity * medicine.pricing.sellingPrice;
      subtotal += itemTotal;

      processedItems.push({
        medicine: medicine._id,
        quantity: numQuantity,
        unitPrice: medicine.pricing.sellingPrice,
        totalPrice: itemTotal,
        batchNumber: medicine.batchInfo.batchNumber,
        expiryDate: medicine.batchInfo.expiryDate
      });
    }

    // Calculate total pricing
    const tax = subtotal * 0.1; // 10% tax
    const shippingCost = shipping?.method === 'express' ? 20 : 10;
    const total = subtotal + tax + shippingCost;

    // Create order
    const order = await Order.create({
      orderType,
      customer: req.user.id,
      supplier,
      items: processedItems,
      pricing: {
        subtotal,
        tax,
        shipping: shippingCost,
        total
      },
      shipping,
      payment,
      prescription,
      notes,
      priority,
      createdBy: req.user.id
    });

    // Update medicine quantities
    for (const item of items) {
      await Medicine.findByIdAndUpdate(
        item.medicine,
        { $inc: { 'batchInfo.quantity': -item.quantity } }
      );
    }

    // Record order on blockchain
    if (isBlockchainInitialized) {
      try {
        const totalQuantity = processedItems.reduce((sum, item) => sum + item.quantity, 0);
        const firstMedicine = await Medicine.findById(processedItems[0].medicine);
        
        const blockchainTx = await smartContractService.placeOrder({
          medicineId: order._id.toString(),
          medicineName: firstMedicine.name,
          quantity: totalQuantity,
          pricePerUnit: total / totalQuantity
        });

        // Update order with blockchain transaction details
        order.blockchain = {
          transactionHash: blockchainTx.hash,
          blockNumber: blockchainTx.blockNumber,
          smartContractAddress: smartContractService.contractAddress
        };
        await order.save();
        
        console.log(`✅ Order ${order.orderNumber} recorded on blockchain: ${blockchainTx.hash}`);
      } catch (blockchainError) {
        console.error('⚠️  Failed to record order on blockchain:', blockchainError.message);
        // Continue without blockchain - order is still created in database
      }
    }

    // Populate and return order
    const populatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email organization')
      .populate('supplier', 'name email organization')
      .populate('items.medicine', 'name category dosageForm');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: populatedOrder }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private
const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' &&
      order.supplier.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    // Update status
    order.status = status;

    // Add to timeline
    order.timeline.push({
      status,
      note,
      updatedBy: req.user.id
    });

    // Update payment status if delivered
    if (status === 'delivered' && order.payment.method === 'cash') {
      order.payment.status = 'paid';
      order.payment.paidAt = new Date();
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('customer', 'name email organization')
      .populate('supplier', 'name email organization')
      .populate('timeline.updatedBy', 'name');

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order: updatedOrder }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id).populate('items.medicine');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Can only cancel pending or confirmed orders
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel order in current status'
      });
    }

    // Restore medicine quantities
    for (const item of order.items) {
      await Medicine.findByIdAndUpdate(
        item.medicine._id,
        { $inc: { 'batchInfo.quantity': item.quantity } }
      );
    }

    // Update order
    order.status = 'cancelled';
    order.timeline.push({
      status: 'cancelled',
      note: reason || 'Order cancelled by customer',
      updatedBy: req.user.id
    });

    await order.save();

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete order (permanently remove from database)
// @route   DELETE /api/orders/:id
// @access  Private (Admin only)
const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization - only admin can delete orders
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete orders - admin access required'
      });
    }

    // Log the deletion action
    console.log(`Order ${order._id} deleted by admin ${req.user.id} on ${new Date().toISOString()}`);

    // Delete the order
    await Order.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Order permanently deleted',
      data: null
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Routes
router.get('/', auth, getOrders);
router.get('/:id', auth, getOrder);
router.post('/', auth, createOrder);
router.put('/:id/status', auth, updateOrderStatus);
router.put('/:id/cancel', auth, cancelOrder);
router.delete('/:id', auth, authorize('admin'), deleteOrder);

module.exports = router;
