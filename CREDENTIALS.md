# SmartMediChain - System Login Credentials

**Important**: These credentials are for development and testing purposes only. Never commit sensitive credentials to version control in production environments.

---

## 🔐 Login Credentials

### 1. System Admin
- **Email**: `admin@smartmedichain.com`
- **Password**: `admin123`
- **Role**: Admin
- **Organization**: SmartMediChain Admin
- **Access**: Full system administration

---

### 2. Supplier Admin (MediSupply Corp)
- **Email**: `supplier@medisupply.com`
- **Password**: `supplier123`
- **Role**: Admin
- **Organization**: MediSupply Corporation
- **License**: SUP-2024-001
- **Access**: Supplier management and operations

---

### 3. Manufacturer Admin (PharmaTech)
- **Email**: `manufacturer@pharmatech.com`
- **Password**: `manufacturer123`
- **Role**: Admin
- **Organization**: PharmaTech Manufacturing Ltd
- **License**: MFG-2024-001
- **Access**: Manufacturing and product management

---

### 4. Operations Manager
- **Email**: `operations@smartmedichain.com`
- **Password**: `operations123`
- **Role**: Operations Manager
- **Organization**: SmartMediChain Operations
- **Access**: Day-to-day operations management

---

### 5. Compliance Manager
- **Email**: `compliance@smartmedichain.com`
- **Password**: `compliance123`
- **Role**: Compliance Manager
- **Organization**: SmartMediChain Compliance
- **Access**: Regulatory compliance and approval management

---

### 6. Finance Manager
- **Email**: `finance@smartmedichain.com`
- **Password**: `finance123`
- **Role**: Finance Manager
- **Organization**: SmartMediChain Finance
- **Access**: Financial management and reporting

---

### 7. Senior Manager
- **Email**: `senior@smartmedichain.com`
- **Password**: `senior123`
- **Role**: Senior Manager
- **Organization**: SmartMediChain Senior Management
- **Access**: High-level management operations

---

### 8. Hospital Operations Manager
- **Email**: `hospital@citygeneral.com`
- **Password**: `hospital123`
- **Role**: Operations Manager
- **Organization**: City General Hospital
- **License**: HOSP-2024-001
- **Access**: Hospital operations and ordering

---

### 9. Hospital User
- **Email**: `hospital.user@smartmedichain.com`
- **Password**: `hospital123`
- **Role**: Hospital
- **Organization**: General Hospital System
- **License**: HOSP-2024-002
- **Access**: Hospital basic operations

---

### 10. Pharmacy Stock Manager
- **Email**: `pharmacy@centralpharm.com`
- **Password**: `pharmacy123`
- **Role**: Pharmacy Stock Manager
- **Organization**: Central Pharmacy Chain
- **License**: PHARM-2024-001
- **Access**: Pharmacy inventory and stock management

---

### 11. Pharmacy Order Manager
- **Email**: `pharmacy.orders@smartmedichain.com`
- **Password**: `pharmacy123`
- **Role**: Pharmacy Order Manager
- **Organization**: SmartMediChain Pharmacy Orders
- **Access**: Pharmacy order processing

---

### 12. Supplier User
- **Email**: `supplier.user@smartmedichain.com`
- **Password**: `supplier123`
- **Role**: Supplier
- **Organization**: Medical Supplier Co
- **License**: SUP-2024-002
- **Access**: Supplier operations

---

## 📋 Quick Reference Table

| User Type | Email | Password | Role |
|-----------|-------|----------|------|
| System Admin | admin@smartmedichain.com | admin123 | Admin |
| Supplier Admin | supplier@medisupply.com | supplier123 | Admin |
| Manufacturer | manufacturer@pharmatech.com | manufacturer123 | Admin |
| Operations | operations@smartmedichain.com | operations123 | Operations Manager |
| Compliance | compliance@smartmedichain.com | compliance123 | Compliance Manager |
| Finance | finance@smartmedichain.com | finance123 | Finance Manager |
| Senior Manager | senior@smartmedichain.com | senior123 | Senior Manager |
| Hospital Ops | hospital@citygeneral.com | hospital123 | Operations Manager |
| Hospital User | hospital.user@smartmedichain.com | hospital123 | Hospital |
| Pharmacy Stock | pharmacy@centralpharm.com | pharmacy123 | Pharmacy Stock Manager |
| Pharmacy Orders | pharmacy.orders@smartmedichain.com | pharmacy123 | Pharmacy Order Manager |
| Supplier User | supplier.user@smartmedichain.com | supplier123 | Supplier |

---

## 🚀 Setup Instructions

### 1. Ensure MongoDB is Running
```bash
# Start MongoDB
mongod --dbpath ./backend/data/db
```

### 2. Seed the Database
```bash
cd backend
npm run seed
```

### 3. Start the Backend Server
```bash
cd backend
npm run dev
```

### 4. Start the Frontend Application
```bash
cd frontend
npm start
```

### 5. Login
- Navigate to `http://localhost:3000/login`
- Use any of the credentials above
- Default port: Frontend (3000), Backend (5000)

---

## 🔒 Security Notes

1. **Development Only**: These credentials are for development and testing purposes
2. **Change Passwords**: Always change default passwords in production
3. **Environment Variables**: Store sensitive data in `.env` files (not committed)
4. **Git Ignore**: Ensure `.env` files are in `.gitignore`
5. **Production**: Implement proper authentication and secrets management

---

## 🧪 Testing Different Roles

You can test different role-based access by logging in with different accounts:

- **Admin Access**: Use `admin@smartmedichain.com`
- **Supplier Functions**: Use `supplier@medisupply.com` or `supplier.user@smartmedichain.com`
- **Hospital Operations**: Use `hospital@citygeneral.com`
- **Pharmacy Management**: Use `pharmacy@centralpharm.com`
- **Compliance Testing**: Use `compliance@smartmedichain.com`

---

## 📞 Support

For issues or questions, refer to the main [README.md](./README.md) file or contact the development team.

---

**Last Updated**: January 11, 2026
**Version**: 1.0.0
