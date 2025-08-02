const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  refreshToken,
  logout,
  changePassword
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);

// Protected routes
router.get('/me', auth, getMe);
router.post('/logout', auth, logout);
router.put('/change-password', auth, changePassword);

module.exports = router;
