const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     InventorySummary:
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
 *                 lowStockMedicines:
 *                   type: number
 *                   example: 12
 *                 expiringMedicines:
 *                   type: number
 *                   example: 8
 *                 totalValue:
 *                   type: number
 *                   example: 125000.50
 *     Medicine:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "64a1b2c3d4e5f6789012345"
 *         name:
 *           type: string
 *           example: "Paracetamol"
 *         genericName:
 *           type: string
 *           example: "Acetaminophen"
 *         category:
 *           type: string
 *           example: "Pain Relief"
 *         batchInfo:
 *           type: object
 *           properties:
 *             batchNumber:
 *               type: string
 *               example: "BATCH001"
 *             quantity:
 *               type: number
 *               example: 15
 *             expiryDate:
 *               type: string
 *               format: date
 *               example: "2024-12-31"
 *         pricing:
 *           type: object
 *           properties:
 *             costPrice:
 *               type: number
 *               example: 10.50
 *             sellingPrice:
 *               type: number
 *               example: 15.00
 *         status:
 *           type: string
 *           enum: [active, inactive, expired]
 *           example: "active"
 *     MedicineList:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             medicines:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Medicine'
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get inventory summary
 *     description: Retrieve comprehensive inventory statistics including total medicines, low stock alerts, and expiring items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InventorySummary'
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

/**
 * @swagger
 * /api/inventory/low-stock:
 *   get:
 *     summary: Get low stock medicines
 *     description: Retrieve medicines that are below the specified stock threshold
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *           default: 20
 *         description: Stock threshold below which medicines are considered low stock
 *     responses:
 *       200:
 *         description: Low stock medicines retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicineList'
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

/**
 * @swagger
 * /api/inventory/expiring:
 *   get:
 *     summary: Get expiring medicines
 *     description: Retrieve medicines that are expiring within the specified number of days
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: number
 *           default: 30
 *         description: Number of days from now to check for expiring medicines
 *     responses:
 *       200:
 *         description: Expiring medicines retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicineList'
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