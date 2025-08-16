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

// Get all medicines
router.get('/', auth, getMedicines);

// Get categories
router.get('/categories', auth, getCategories);

// Search by batch number
router.get('/batch/:batchNumber', auth, getMedicineByBatch);

// Get single medicine
router.get('/:id', auth, getMedicine);

// Create medicine (only suppliers and admins)
router.post('/', auth, authorize('admin', 'supplier'), createMedicine);

// Update medicine
router.put('/:id', auth, updateMedicine);

// Delete medicine
router.delete('/:id', auth, (req, res, next) => {
  console.log('Delete medicine request for ID:', req.params.id);
  console.log('User role:', req.user.role);
  // All users can delete, actual authorization check is done in controller
  next();
}, deleteMedicine);

module.exports = router;
