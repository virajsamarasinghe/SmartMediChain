const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  setUserPassword,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

// Admin routes for user management
router.get('/', auth, authorize('admin'), getAllUsers);
router.post('/', auth, authorize('admin'), createUser);
router.get('/:id', auth, authorize('admin'), getUserById);
router.put('/:id', auth, authorize('admin'), updateUser);
router.delete('/:id', auth, authorize('admin'), deleteUser);
router.put('/:id/reset-password', auth, authorize('admin'), setUserPassword);

// User profile routes
router.get('/profile', auth, getUserProfile);
router.put('/profile', auth, updateUserProfile);

module.exports = router;