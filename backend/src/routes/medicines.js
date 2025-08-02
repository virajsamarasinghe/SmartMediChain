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
const { authorize } = require('../middleware/auth');

// Get all medicines
router.get('/', getMedicines);

// Get categories
router.get('/categories', getCategories);

// Search by batch number
router.get('/batch/:batchNumber', getMedicineByBatch);

// Get single medicine
router.get('/:id', getMedicine);

// Create medicine (only suppliers, manufacturers, admins)
router.post('/', authorize('admin', 'supplier', 'manufacturer'), createMedicine);

// Update medicine
router.put('/:id', updateMedicine);

// Delete medicine
router.delete('/:id', deleteMedicine);

module.exports = router;
