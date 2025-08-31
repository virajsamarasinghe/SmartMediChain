const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('express-async-errors');
require('dotenv').config();

// Import routes with error handling
let authRoutes, userRoutes, medicineRoutes, orderRoutes, supplierRoutes, inventoryRoutes, analyticsRoutes, aiRoutes, blockchainRoutes, approvalRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
  console.error('❌ Auth routes stack:', error.stack);
}

try {
  userRoutes = require('./routes/users');
  console.log('✅ User routes loaded');
} catch (error) {
  console.error('❌ Failed to load user routes:', error.message);
}

try {
  medicineRoutes = require('./routes/medicines');
  console.log('✅ Medicine routes loaded');
} catch (error) {
  console.error('❌ Failed to load medicine routes:', error.message);
}

try {
  orderRoutes = require('./routes/orders');
  console.log('✅ Order routes loaded');
} catch (error) {
  console.error('❌ Failed to load order routes:', error.message);
}

try {
  supplierRoutes = require('./routes/suppliers');
  console.log('✅ Supplier routes loaded');
} catch (error) {
  console.error('❌ Failed to load supplier routes:', error.message);
}

try {
  inventoryRoutes = require('./routes/inventory');
  console.log('✅ Inventory routes loaded');
} catch (error) {
  console.error('❌ Failed to load inventory routes:', error.message);
}

try {
  analyticsRoutes = require('./routes/analytics');
  console.log('✅ Analytics routes loaded');
} catch (error) {
  console.error('❌ Failed to load analytics routes:', error.message);
}

try {
  aiRoutes = require('./routes/ai');
  console.log('✅ AI routes loaded');
} catch (error) {
  console.error('❌ Failed to load AI routes:', error.message);
  console.error('❌ AI routes stack:', error.stack);
}

try {
  blockchainRoutes = require('./routes/blockchain');
  console.log('✅ Blockchain routes loaded');
} catch (error) {
  console.error('❌ Failed to load blockchain routes:', error.message);
}

try {
  approvalRoutes = require('./routes/approvals');
  console.log('✅ Approval routes loaded');
} catch (error) {
  console.error('❌ Failed to load approval routes:', error.message);
}

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { auth } = require('./middleware/auth');

// Import config
const connectDB = require('./config/database');

// Create Express app
const app = express();

// Connect to MongoDB
connectDB();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://frontend:3000',
    'http://20.36.128.93:3000',
    'http://20.36.128.93:3001',
    'https://20.36.128.93:3000',
    'https://20.36.128.93:3001',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Handle preflight requests
app.options('*', cors());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'SmartMediChain API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Debug endpoint to test routing
app.get('/debug', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Debug endpoint working',
    routes_loaded: {
      auth: !!authRoutes,
      users: !!userRoutes,
      medicines: !!medicineRoutes,
      orders: !!orderRoutes,
      suppliers: !!supplierRoutes,
      inventory: !!inventoryRoutes,
      analytics: !!analyticsRoutes,
      ai: !!aiRoutes,
      blockchain: !!blockchainRoutes,
      approvals: !!approvalRoutes
    }
  });
});

// API Routes - only register if loaded successfully
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered');
}

if (userRoutes) {
  app.use('/api/users', auth, userRoutes);
  console.log('✅ User routes registered');
}

if (medicineRoutes) {
  app.use('/api/medicines', auth, medicineRoutes);
  console.log('✅ Medicine routes registered');
}

if (orderRoutes) {
  app.use('/api/orders', auth, orderRoutes);
  console.log('✅ Order routes registered');
}

if (supplierRoutes) {
  app.use('/api/suppliers', auth, supplierRoutes);
  console.log('✅ Supplier routes registered');
}

if (inventoryRoutes) {
  app.use('/api/inventory', auth, inventoryRoutes);
  console.log('✅ Inventory routes registered');
}

if (analyticsRoutes) {
  app.use('/api/analytics', auth, analyticsRoutes);
  console.log('✅ Analytics routes registered');
}

if (aiRoutes) {
  app.use('/api/ai', aiRoutes);
  console.log('✅ AI routes registered');
}

if (blockchainRoutes) {
  app.use('/api/blockchain', blockchainRoutes);
  console.log('✅ Blockchain routes registered');
}

if (approvalRoutes) {
  app.use('/api/approvals', auth, approvalRoutes);
  console.log('✅ Approval routes registered');
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SmartMediChain API server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Database: ${process.env.MONGODB_URI}`);
  console.log(`🌐 Server accessible on all network interfaces`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = app;
