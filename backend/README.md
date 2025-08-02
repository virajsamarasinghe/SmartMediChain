# SmartMediChain Backend API

A comprehensive Express.js backend for SmartMediChain - a blockchain-based medical supply chain management system.

## 🚀 Features

- **User Management**: Registration, authentication, role-based authorization
- **Medicine Management**: CRUD operations, batch tracking, expiry monitoring
- **Order Management**: Order processing, status tracking, inventory updates
- **Inventory Management**: Stock monitoring, low stock alerts, expiry tracking
- **Analytics**: Dashboard analytics, sales reports, inventory insights
- **Security**: JWT authentication, password hashing, rate limiting
- **Database**: MongoDB with Mongoose ODM
- **Validation**: Request validation with Joi

## 🏗️ Architecture

```
src/
├── app.js                 # Main application file
├── config/
│   └── database.js       # Database configuration
├── controllers/          # Route controllers
│   ├── authController.js
│   └── medicineController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   ├── errorHandler.js
│   └── notFound.js
├── models/              # Mongoose models
│   ├── User.js
│   ├── Medicine.js
│   └── Order.js
├── routes/              # Express routes
│   ├── auth.js
│   ├── medicines.js
│   ├── orders.js
│   ├── users.js
│   ├── suppliers.js
│   ├── inventory.js
│   └── analytics.js
├── validation/          # Request validation schemas
│   ├── userValidation.js
│   └── medicineValidation.js
├── utils/
│   └── helpers.js       # Utility functions
└── seeds/
    └── index.js         # Database seeding
```

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure Environment Variables**
   Edit `.env` file with your settings:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/smartmedichain
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   ```

5. **Start MongoDB**
   Make sure MongoDB is running on your system

6. **Seed the Database (Optional)**
   ```bash
   npm run seed
   ```

7. **Start the Server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user (Admin only)
- `PUT /api/users/:id/toggle-status` - Toggle user status (Admin only)

### Medicines
- `GET /api/medicines` - Get all medicines
- `GET /api/medicines/:id` - Get single medicine
- `POST /api/medicines` - Create medicine (Supplier/Admin)
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine
- `GET /api/medicines/categories` - Get medicine categories
- `GET /api/medicines/batch/:batchNumber` - Search by batch number

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order

### Suppliers
- `GET /api/suppliers` - Get all suppliers
- `GET /api/suppliers/:id` - Get single supplier
- `GET /api/suppliers/types` - Get supplier types

### Inventory
- `GET /api/inventory` - Get inventory overview
- `GET /api/inventory/low-stock` - Get low stock items
- `GET /api/inventory/expiring` - Get expiring medicines
- `GET /api/inventory/movements` - Get inventory movements
- `PUT /api/inventory/:id/stock` - Update medicine stock

### Analytics
- `GET /api/analytics/dashboard` - Get dashboard analytics
- `GET /api/analytics/sales` - Get sales analytics
- `GET /api/analytics/inventory` - Get inventory analytics
- `GET /api/analytics/users` - Get user analytics (Admin only)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Admin**: Full system access
- **Supplier**: Manage medicines, view orders
- **Manufacturer**: Create medicines, manage inventory
- **Distributor**: Manage orders, view analytics
- **Hospital**: Place orders, manage prescriptions
- **Retailer**: Place orders, manage sales
- **Patient**: View prescriptions, place orders

## 📊 Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: Enum,
  organization: Object,
  profile: Object,
  isActive: Boolean,
  isVerified: Boolean
}
```

### Medicine Model
```javascript
{
  name: String,
  category: Enum,
  manufacturer: Object,
  composition: Array,
  dosageForm: String,
  pricing: Object,
  batchInfo: Object,
  storage: Object,
  regulatory: Object,
  status: Enum
}
```

### Order Model
```javascript
{
  orderNumber: String (unique),
  orderType: Enum,
  customer: ObjectId,
  supplier: ObjectId,
  items: Array,
  pricing: Object,
  status: Enum,
  shipping: Object,
  payment: Object
}
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 🔧 Development

```bash
# Start development server with nodemon
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Seed database
npm run seed
```

## 📝 Logging

The application uses Morgan for HTTP request logging:
- Development: `dev` format
- Production: `combined` format

## 🛡️ Security Features

- Password hashing with bcryptjs
- JWT token authentication
- Rate limiting
- CORS configuration
- Helmet security headers
- Input validation with Joi
- MongoDB injection protection

## 🚀 Deployment

1. **Environment Variables**
   Set all required environment variables for production

2. **Database**
   Ensure MongoDB is accessible in production

3. **Process Manager**
   Use PM2 or similar for process management:
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name "smartmedichain-api"
   ```

## 📈 Monitoring

- Health check endpoint: `GET /health`
- Monitor logs for errors and performance
- Set up alerts for critical issues

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**SmartMediChain Backend API** - Secure, scalable, and comprehensive medical supply chain management.
