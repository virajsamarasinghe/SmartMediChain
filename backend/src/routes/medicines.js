const express = require('express');
const router = express.Router();
const {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getCategories,
  getMedicineByBatch
} = require('../controllers/medicineController');
const { auth, authorize } = require('../middleware/auth');

/**
 * @swagger
 * /api/medicines:
 *   get:
 *     summary: Get all medicines
 *     description: Retrieve a list of all medicines with optional filtering and pagination
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by medicine category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search medicines by name or generic name
 *     responses:
 *       200:
 *         description: Medicines retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MedicineList'
 *   post:
 *     summary: Create new medicine
 *     description: Add a new medicine to the inventory (Admin/Supplier only)
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - genericName
 *               - category
 *               - batchInfo
 *               - pricing
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Paracetamol 500mg"
 *               genericName:
 *                 type: string
 *                 example: "Acetaminophen"
 *               category:
 *                 type: string
 *                 example: "Pain Relief"
 *               description:
 *                 type: string
 *                 example: "Pain and fever relief medication"
 *               batchInfo:
 *                 type: object
 *                 properties:
 *                   batchNumber:
 *                     type: string
 *                     example: "BATCH001"
 *                   quantity:
 *                     type: number
 *                     example: 100
 *                   manufacturingDate:
 *                     type: string
 *                     format: date
 *                     example: "2024-01-15"
 *                   expiryDate:
 *                     type: string
 *                     format: date
 *                     example: "2026-01-15"
 *               pricing:
 *                 type: object
 *                 properties:
 *                   costPrice:
 *                     type: number
 *                     example: 10.50
 *                   sellingPrice:
 *                     type: number
 *                     example: 15.00
 *     responses:
 *       201:
 *         description: Medicine created successfully
 *       403:
 *         description: Forbidden - Insufficient permissions
 *
 * /api/medicines/categories:
 *   get:
 *     summary: Get medicine categories
 *     description: Retrieve all available medicine categories
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Pain Relief", "Antibiotics", "Vitamins"]
 *
 * /api/medicines/batch/{batchNumber}:
 *   get:
 *     summary: Get medicine by batch number
 *     description: Retrieve medicine information using batch number
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: batchNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Batch number of the medicine
 *     responses:
 *       200:
 *         description: Medicine found
 *       404:
 *         description: Medicine not found
 *
 * /api/medicines/{id}:
 *   get:
 *     summary: Get single medicine
 *     description: Retrieve detailed information about a specific medicine
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine retrieved successfully
 *       404:
 *         description: Medicine not found
 *   put:
 *     summary: Update medicine
 *     description: Update medicine information
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               batchInfo:
 *                 type: object
 *                 properties:
 *                   quantity:
 *                     type: number
 *               pricing:
 *                 type: object
 *                 properties:
 *                   costPrice:
 *                     type: number
 *                   sellingPrice:
 *                     type: number
 *     responses:
 *       200:
 *         description: Medicine updated successfully
 *       404:
 *         description: Medicine not found
 *   delete:
 *     summary: Delete medicine
 *     description: Delete a medicine from the inventory
 *     tags: [Medicines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Medicine ID
 *     responses:
 *       200:
 *         description: Medicine deleted successfully
 *       404:
 *         description: Medicine not found
 */

// Get all medicines (restricted to non-manager roles)
router.get('/', auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), getMedicines);

// Get categories (restricted to non-manager roles)
router.get('/categories', auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), getCategories);

// Search by batch number (restricted to non-manager roles)
router.get('/batch/:batchNumber', auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), getMedicineByBatch);

// Get single medicine (restricted to non-manager roles)
router.get('/:id', auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), getMedicine);

// Create medicine (only suppliers and admins)
router.post('/', auth, authorize('admin', 'supplier'), createMedicine);

// Update medicine (restricted to non-manager roles)
router.put('/:id', auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), updateMedicine);

// Delete medicine (restricted to non-manager roles)
router.delete('/:id', auth, authorize('admin', 'supplier', 'hospital', 'pharmacy_stock_manager', 'pharmacy_order_manager'), deleteMedicine);

module.exports = router;
