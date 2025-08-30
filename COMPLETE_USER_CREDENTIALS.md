# 🔐 Complete User Credentials for SmartMediChain

## 📋 **All Predefined Users & Passwords**

### **1. System Administrator**

- **Email:** `admin@smartmedichain.com`
- **Password:** `admin123`
- **Role:** Admin
- **Access:** Full system access, user management, all features

### **2. Supply Chain Users**

#### **Supplier**

- **Email:** `supplier@medisupply.com`
- **Password:** `supplier123`
- **Role:** Supplier
- **Organization:** MediSupply Corporation

#### **Manufacturer**

- **Email:** `manufacturer@pharmatech.com`
- **Password:** `manufacturer123`
- **Role:** Supplier (Manufacturer)
- **Organization:** PharmaTech Manufacturing Ltd

### **3. Healthcare Organizations**

#### **Hospital**

- **Email:** `hospital@citygeneral.com`
- **Password:** `hospital123`
- **Role:** Hospital
- **Organization:** City General Hospital

#### **Pharmacy**

- **Email:** `pharmacy@centralpharm.com`
- **Password:** `pharmacy123`
- **Role:** Retailer (Pharmacy)
- **Organization:** Central Pharmacy Chain

### **4. Management & Approval Users**

#### **Operations Manager**

- **Email:** `operations@smartmedichain.com`
- **Password:** `operations123`
- **Role:** Operations Manager
- **Access:** Order approvals, operational oversight

#### **Compliance Manager**

- **Email:** `compliance@smartmedichain.com`
- **Password:** `compliance123`
- **Role:** Compliance Manager
- **Access:** Regulatory compliance, medicine validation

#### **Finance Manager**

- **Email:** `finance@smartmedichain.com`
- **Password:** `finance123`
- **Role:** Finance Manager
- **Access:** Financial approvals, budget oversight

#### **Senior Manager**

- **Email:** `senior@smartmedichain.com`
- **Password:** `senior123`
- **Role:** Senior Manager
- **Access:** High-level approvals, strategic decisions

## 🚀 **How to Initialize Users**

### **Option 1: Run Seed Script**

```bash
cd backend
node src/seeds/index.js
```

### **Option 2: Manual Database Seeding**

If you're using Docker:

```bash
docker exec -it smartmedichain-backend-1 node src/seeds/index.js
```

## 🔧 **Fixed Issues**

### **1. API URL Configuration**

- ✅ Fixed double `/api` in URLs (was `/api/api/auth/login`, now `/api/auth/login`)
- ✅ Updated frontend services to use correct backend URLs
- ✅ Blockchain service now connects properly

### **2. Authentication Flow**

- ✅ Login/logout endpoints working correctly
- ✅ Token management fixed
- ✅ Role-based access control implemented

### **3. Blockchain Validation**

- ✅ Blockchain status endpoint accessible
- ✅ Medicine authenticity validation working
- ✅ Order verification through blockchain

## 📱 **User Interface Access**

### **Dashboard Features by Role:**

#### **Admin Users**

- User management
- System configuration
- All blockchain features
- Complete medicine management

#### **Manager Users (Operations, Compliance, Finance, Senior)**

- Approval dashboard
- Pending requests review
- Blockchain validation
- Limited medicine access

#### **Healthcare Users (Hospital, Pharmacy)**

- Order placement
- Medicine inventory
- Blockchain verification
- Order tracking

#### **Supply Chain Users (Supplier, Manufacturer)**

- Medicine catalog management
- Order fulfillment
- Supply chain tracking
- Blockchain logging

## 🔍 **Testing the System**

### **1. Test Authentication**

```bash
node test-auth-endpoints.js
```

### **2. Test Blockchain Validation**

```bash
node test-blockchain-validation.js
```

### **3. Manual Testing Steps**

1. Start the application (frontend + backend)
2. Navigate to login page
3. Use any of the above credentials
4. Verify role-specific features are accessible
5. Test blockchain validation functionality

## 🌐 **Application URLs**

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📊 **Role Permissions Matrix**

| Feature               | Admin | Managers | Hospital | Pharmacy | Supplier |
| --------------------- | ----- | -------- | -------- | -------- | -------- |
| User Management       | ✅    | ❌       | ❌       | ❌       | ❌       |
| Order Approval        | ✅    | ✅       | ❌       | ❌       | ❌       |
| Place Orders          | ✅    | ❌       | ✅       | ✅       | ❌       |
| Medicine Management   | ✅    | ❌       | ✅       | ✅       | ✅       |
| Blockchain Validation | ✅    | ✅       | ✅       | ✅       | ✅       |
| Supply Chain          | ✅    | ✅       | ❌       | ❌       | ✅       |

## 🔒 **Security Notes**

- All passwords are hashed using bcrypt
- JWT tokens for authentication
- Role-based access control enforced
- Blockchain integration for audit trails
- API rate limiting enabled

## 🆘 **Troubleshooting**

### **Login Issues**

1. Ensure backend is running on port 3001
2. Check if users are seeded in database
3. Verify API URLs in frontend configuration

### **Blockchain Issues**

1. Check if smart contract is deployed
2. Verify blockchain node is running
3. Check contract address in backend .env

### **Permission Issues**

1. Verify user role in database
2. Check JWT token validity
3. Ensure proper role-based routing

---

**Last Updated:** August 30, 2025
**System Version:** SmartMediChain v1.0
