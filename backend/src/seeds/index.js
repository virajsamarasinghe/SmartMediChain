const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Medicine = require('../models/Medicine');
const Order = require('../models/Order');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️  Existing users cleared');

    const users = [
      {
        name: 'Admin User',
        email: 'admin@smartmedichain.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Admin',
          type: 'hospital',
          address: {
            street: '123 Admin St',
            city: 'Tech City',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          }
        }
      },
      {
        name: 'MediSupply Corp',
        email: 'supplier@medisupply.com',
        password: 'supplier123',
        role: 'admin',
        isVerified: true,
        organization: {
          name: 'MediSupply Corporation',
          type: 'supplier',
          license: 'SUP-2024-001',
          address: {
            street: '456 Supply Ave',
            city: 'Supply City',
            state: 'NY',
            zipCode: '10001',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0123',
          licenseNumber: 'SUP-LIC-001'
        }
      },
      {
        name: 'PharmaTech Manufacturing',
        email: 'manufacturer@pharmatech.com',
        password: 'manufacturer123',
        role: 'admin',
        isVerified: true,
        organization: {
          name: 'PharmaTech Manufacturing Ltd',
          type: 'manufacturer',
          license: 'MFG-2024-001',
          address: {
            street: '789 Manufacturing Blvd',
            city: 'Industrial City',
            state: 'TX',
            zipCode: '75001',
            country: 'USA'
          }
        }
      },
      {
        name: 'City General Hospital',
        email: 'hospital@citygeneral.com',
        password: 'hospital123',
        role: 'operations_manager',
        isVerified: true,
        organization: {
          name: 'City General Hospital',
          type: 'hospital',
          license: 'HOSP-2024-001',
          address: {
            street: '321 Health Street',
            city: 'Medical City',
            state: 'FL',
            zipCode: '33101',
            country: 'USA'
          }
        }
      },
      {
        name: 'Central Pharmacy',
        email: 'pharmacy@centralpharm.com',
        password: 'pharmacy123',
        role: 'pharmacy_stock_manager',
        isVerified: true,
        organization: {
          name: 'Central Pharmacy Chain',
          type: 'pharmacy',
          license: 'PHARM-2024-001',
          address: {
            street: '654 Pharmacy Lane',
            city: 'Retail City',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
          }
        }
      },
      {
        name: 'John Operations Manager',
        email: 'operations@smartmedichain.com',
        password: 'operations123',
        role: 'operations_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Operations',
          type: 'hospital',
          address: {
            street: '123 Operations St',
            city: 'Management City',
            state: 'CA',
            zipCode: '90211',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0001',
          specialization: 'Operations Management'
        }
      },
      {
        name: 'Sarah Compliance Manager',
        email: 'compliance@smartmedichain.com',
        password: 'compliance123',
        role: 'compliance_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Compliance',
          type: 'hospital',
          address: {
            street: '456 Compliance Ave',
            city: 'Regulatory City',
            state: 'NY',
            zipCode: '10002',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0002',
          specialization: 'Regulatory Compliance'
        }
      },
      {
        name: 'Mike Finance Manager',
        email: 'finance@smartmedichain.com',
        password: 'finance123',
        role: 'finance_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Finance',
          type: 'hospital',
          address: {
            street: '789 Finance Blvd',
            city: 'Financial City',
            state: 'TX',
            zipCode: '75002',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0003',
          specialization: 'Financial Management'
        }
      },
      {
        name: 'Lisa Senior Manager',
        email: 'senior@smartmedichain.com',
        password: 'senior123',
        role: 'senior_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Senior Management',
          type: 'hospital',
          address: {
            street: '321 Executive Way',
            city: 'Executive City',
            state: 'FL',
            zipCode: '33102',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0004',
          specialization: 'Senior Management'
        }
      },
      {
        name: 'Tom Pharmacy Order Manager',
        email: 'pharmacy.orders@smartmedichain.com',
        password: 'pharmacy123',
        role: 'pharmacy_order_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Pharmacy Orders',
          type: 'pharmacy',
          address: {
            street: '987 Order Management St',
            city: 'Pharmacy City',
            state: 'WA',
            zipCode: '98103',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0005',
          specialization: 'Pharmacy Order Management'
        }
      },
      {
        name: 'General Hospital User',
        email: 'hospital.user@smartmedichain.com',
        password: 'hospital123',
        role: 'hospital',
        isVerified: true,
        organization: {
          name: 'General Hospital System',
          type: 'hospital',
          license: 'HOSP-2024-002',
          address: {
            street: '555 Hospital Drive',
            city: 'Healthcare City',
            state: 'CA',
            zipCode: '90213',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0006',
          specialization: 'Hospital Operations'
        }
      },
      {
        name: 'Medical Supplier Co',
        email: 'supplier.user@smartmedichain.com',
        password: 'supplier123',
        role: 'supplier',
        isVerified: true,
        organization: {
          name: 'Medical Supplier Co',
          type: 'supplier',
          license: 'SUP-2024-002',
          address: {
            street: '777 Supply Chain Blvd',
            city: 'Supply City',
            state: 'TX',
            zipCode: '75003',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0007',
          licenseNumber: 'SUP-LIC-002',
          specialization: 'Medical Equipment Supply'
        }
      }
    ];

    // Insert users individually to trigger the pre-save hook
    for (const userData of users) {
      await User.create(userData);
    }
    console.log('✅ Users seeded successfully');

    return await User.find({});
  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
};

const seedMedicines = async (users) => {
  try {
    // Clear existing medicines
    await Medicine.deleteMany({});
    console.log('🗑️  Existing medicines cleared');

    const supplier = users.find(u => u.email === 'supplier@medisupply.com');
    const manufacturer = users.find(u => u.email === 'manufacturer@pharmatech.com');

    const medicines = [
      {
        name: 'Amoxicillin 500mg',
        genericName: 'Amoxicillin',
        category: 'Antibiotic',
        description: 'Broad-spectrum antibiotic for bacterial infections',
        manufacturer: {
          name: 'PharmaTech Manufacturing Ltd',
          license: 'MFG-2024-001',
          contact: {
            email: 'contact@pharmatech.com',
            phone: '+1-555-9999'
          }
        },
        composition: [{
          activeIngredient: 'Amoxicillin Trihydrate',
          strength: '500',
          unit: 'mg'
        }],
        dosageForm: 'Capsule',
        strength: { value: 500, unit: 'mg' },
        packaging: {
          type: 'Blister',
          size: '10 capsules per strip',
          unitsPerPackage: 10
        },
        pricing: {
          costPrice: 8.50,
          sellingPrice: 12.99
        },
        batchInfo: {
          batchNumber: 'AMX500-2024-001',
          manufacturingDate: new Date('2024-01-15'),
          expiryDate: new Date('2026-01-15'),
          quantity: 500
        },
        storage: {
          temperature: { min: 15, max: 25, unit: 'Celsius' },
          humidity: 'Below 60%'
        },
        regulatory: {
          approvalNumber: 'FDA-AMX-2024-001',
          approvalDate: new Date('2024-01-01'),
          regulatoryBody: 'FDA',
          prescriptionRequired: true
        },
        createdBy: manufacturer._id
      },
      {
        name: 'Paracetamol 500mg',
        genericName: 'Acetaminophen',
        category: 'Analgesic',
        description: 'Pain reliever and fever reducer',
        manufacturer: {
          name: 'PharmaTech Manufacturing Ltd',
          license: 'MFG-2024-001'
        },
        composition: [{
          activeIngredient: 'Paracetamol',
          strength: '500',
          unit: 'mg'
        }],
        dosageForm: 'Tablet',
        strength: { value: 500, unit: 'mg' },
        packaging: {
          type: 'Strip',
          size: '10 tablets per strip',
          unitsPerPackage: 10
        },
        pricing: {
          costPrice: 3.50,
          sellingPrice: 5.99
        },
        batchInfo: {
          batchNumber: 'PCM500-2024-001',
          manufacturingDate: new Date('2024-02-01'),
          expiryDate: new Date('2027-02-01'),
          quantity: 1000
        },
        storage: {
          temperature: { min: 20, max: 25, unit: 'Celsius' }
        },
        regulatory: {
          approvalNumber: 'FDA-PCM-2024-001',
          prescriptionRequired: false
        },
        createdBy: manufacturer._id
      },
      {
        name: 'Lisinopril 10mg',
        genericName: 'Lisinopril',
        category: 'Cardiovascular',
        description: 'ACE inhibitor for high blood pressure',
        manufacturer: {
          name: 'PharmaTech Manufacturing Ltd',
          license: 'MFG-2024-001'
        },
        composition: [{
          activeIngredient: 'Lisinopril',
          strength: '10',
          unit: 'mg'
        }],
        dosageForm: 'Tablet',
        strength: { value: 10, unit: 'mg' },
        packaging: {
          type: 'Bottle',
          size: '30 tablets',
          unitsPerPackage: 30
        },
        pricing: {
          costPrice: 15.00,
          sellingPrice: 24.99
        },
        batchInfo: {
          batchNumber: 'LIS10-2024-001',
          manufacturingDate: new Date('2024-01-20'),
          expiryDate: new Date('2026-01-20'),
          quantity: 200
        },
        storage: {
          temperature: { min: 15, max: 30, unit: 'Celsius' }
        },
        regulatory: {
          approvalNumber: 'FDA-LIS-2024-001',
          prescriptionRequired: true
        },
        createdBy: manufacturer._id
      },
      {
        name: 'Metformin 850mg',
        genericName: 'Metformin HCl',
        category: 'Diabetes',
        description: 'Diabetes medication to control blood sugar',
        manufacturer: {
          name: 'PharmaTech Manufacturing Ltd',
          license: 'MFG-2024-001'
        },
        composition: [{
          activeIngredient: 'Metformin Hydrochloride',
          strength: '850',
          unit: 'mg'
        }],
        dosageForm: 'Tablet',
        strength: { value: 850, unit: 'mg' },
        packaging: {
          type: 'Blister',
          size: '14 tablets per strip',
          unitsPerPackage: 14
        },
        pricing: {
          costPrice: 12.00,
          sellingPrice: 18.99
        },
        batchInfo: {
          batchNumber: 'MET850-2024-001',
          manufacturingDate: new Date('2024-01-10'),
          expiryDate: new Date('2026-01-10'),
          quantity: 300
        },
        storage: {
          temperature: { min: 15, max: 25, unit: 'Celsius' }
        },
        regulatory: {
          approvalNumber: 'FDA-MET-2024-001',
          prescriptionRequired: true
        },
        createdBy: manufacturer._id
      },
      {
        name: 'Vitamin D3 1000IU',
        genericName: 'Cholecalciferol',
        category: 'Vitamin',
        description: 'Vitamin D supplement for bone health',
        manufacturer: {
          name: 'PharmaTech Manufacturing Ltd',
          license: 'MFG-2024-001'
        },
        composition: [{
          activeIngredient: 'Cholecalciferol',
          strength: '1000',
          unit: 'IU'
        }],
        dosageForm: 'Capsule',
        strength: { value: 1000, unit: 'IU' },
        packaging: {
          type: 'Bottle',
          size: '60 capsules',
          unitsPerPackage: 60
        },
        pricing: {
          costPrice: 8.00,
          sellingPrice: 14.99
        },
        batchInfo: {
          batchNumber: 'VD3-2024-001',
          manufacturingDate: new Date('2024-02-15'),
          expiryDate: new Date('2026-02-15'),
          quantity: 150
        },
        storage: {
          temperature: { min: 15, max: 25, unit: 'Celsius' },
          specialConditions: 'Store in a cool, dry place'
        },
        regulatory: {
          approvalNumber: 'FDA-VD3-2024-001',
          prescriptionRequired: false
        },
        createdBy: supplier._id
      }
    ];

    await Medicine.insertMany(medicines);
    console.log('✅ Medicines seeded successfully');

    return await Medicine.find({});
  } catch (error) {
    console.error('❌ Error seeding medicines:', error);
  }
};

const seedOrders = async (users, medicines) => {
  try {
    // Clear existing orders
    await Order.deleteMany({});
    console.log('🗑️  Existing orders cleared');

    const hospital = users.find(u => u.email === 'hospital@citygeneral.com');
    const pharmacy = users.find(u => u.email === 'pharmacy@centralpharm.com');
    const supplier = users.find(u => u.email === 'supplier@medisupply.com');

    const orders = [
      {
        orderNumber: `ORD-20240101-001`,
        orderType: 'purchase',
        customer: hospital._id,
        supplier: supplier._id,
        items: [
          {
            medicine: medicines[0]._id, // Amoxicillin
            quantity: 50,
            unitPrice: medicines[0].pricing.sellingPrice,
            totalPrice: 50 * medicines[0].pricing.sellingPrice,
            batchNumber: medicines[0].batchInfo.batchNumber,
            expiryDate: medicines[0].batchInfo.expiryDate
          },
          {
            medicine: medicines[1]._id, // Paracetamol
            quantity: 100,
            unitPrice: medicines[1].pricing.sellingPrice,
            totalPrice: 100 * medicines[1].pricing.sellingPrice,
            batchNumber: medicines[1].batchInfo.batchNumber,
            expiryDate: medicines[1].batchInfo.expiryDate
          }
        ],
        pricing: {
          subtotal: (50 * medicines[0].pricing.sellingPrice) + (100 * medicines[1].pricing.sellingPrice),
          tax: 0,
          shipping: 15.00,
          total: 0
        },
        status: 'delivered',
        priority: 'high',
        shipping: {
          address: {
            name: 'City General Hospital',
            street: '321 Health Street',
            city: 'Medical City',
            state: 'FL',
            zipCode: '33101',
            country: 'USA'
          },
          method: 'express',
          trackingNumber: 'TRK123456789'
        },
        payment: {
          method: 'bank_transfer',
          status: 'paid',
          paidAt: new Date()
        },
        createdBy: hospital._id
      },
      {
        orderNumber: `ORD-20240102-002`,
        orderType: 'purchase',
        customer: pharmacy._id,
        supplier: supplier._id,
        items: [
          {
            medicine: medicines[1]._id, // Paracetamol
            quantity: 200,
            unitPrice: medicines[1].pricing.sellingPrice,
            totalPrice: 200 * medicines[1].pricing.sellingPrice,
            batchNumber: medicines[1].batchInfo.batchNumber,
            expiryDate: medicines[1].batchInfo.expiryDate
          },
          {
            medicine: medicines[4]._id, // Vitamin D3
            quantity: 50,
            unitPrice: medicines[4].pricing.sellingPrice,
            totalPrice: 50 * medicines[4].pricing.sellingPrice,
            batchNumber: medicines[4].batchInfo.batchNumber,
            expiryDate: medicines[4].batchInfo.expiryDate
          }
        ],
        pricing: {
          subtotal: (200 * medicines[1].pricing.sellingPrice) + (50 * medicines[4].pricing.sellingPrice),
          tax: 0,
          shipping: 10.00,
          total: 0
        },
        status: 'shipped',
        priority: 'medium',
        shipping: {
          address: {
            name: 'Central Pharmacy Chain',
            street: '654 Pharmacy Lane',
            city: 'Retail City',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
          },
          method: 'standard',
          trackingNumber: 'TRK987654321'
        },
        payment: {
          method: 'credit',
          status: 'paid'
        },
        createdBy: pharmacy._id
      }
    ];

    // Calculate totals
    orders.forEach(order => {
      order.pricing.total = order.pricing.subtotal + order.pricing.tax + order.pricing.shipping;
    });

    await Order.insertMany(orders);
    console.log('✅ Orders seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding orders:', error);
  }
};

// Auto-seed function that checks and creates missing users for all roles
const autoSeedUsers = async () => {
  try {
    const requiredRoles = [
      'admin',
      'supplier',
      'hospital',
      'operations_manager',
      'compliance_manager',
      'finance_manager',
      'senior_manager',
      'pharmacy_stock_manager',
      'pharmacy_order_manager'
    ];

    const defaultUsers = [
      {
        name: 'Admin User',
        email: 'admin@smartmedichain.com',
        password: 'admin123',
        role: 'admin',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Admin',
          type: 'hospital',
          address: {
            street: '123 Admin St',
            city: 'Tech City',
            state: 'CA',
            zipCode: '90210',
            country: 'USA'
          }
        }
      },
      {
        name: 'Medical Supplier Co',
        email: 'supplier@smartmedichain.com',
        password: 'supplier123',
        role: 'supplier',
        isVerified: true,
        organization: {
          name: 'Medical Supplier Co',
          type: 'supplier',
          license: 'SUP-2024-001',
          address: {
            street: '777 Supply Chain Blvd',
            city: 'Supply City',
            state: 'TX',
            zipCode: '75003',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0007',
          licenseNumber: 'SUP-LIC-002'
        }
      },
      {
        name: 'General Hospital User',
        email: 'hospital@smartmedichain.com',
        password: 'hospital123',
        role: 'hospital',
        isVerified: true,
        organization: {
          name: 'General Hospital System',
          type: 'hospital',
          license: 'HOSP-2024-001',
          address: {
            street: '555 Hospital Drive',
            city: 'Healthcare City',
            state: 'CA',
            zipCode: '90213',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0006'
        }
      },
      {
        name: 'John Operations Manager',
        email: 'operations@smartmedichain.com',
        password: 'operations123',
        role: 'operations_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Operations',
          type: 'hospital',
          address: {
            street: '123 Operations St',
            city: 'Management City',
            state: 'CA',
            zipCode: '90211',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0001',
          specialization: 'Operations Management'
        }
      },
      {
        name: 'Sarah Compliance Manager',
        email: 'compliance@smartmedichain.com',
        password: 'compliance123',
        role: 'compliance_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Compliance',
          type: 'hospital',
          address: {
            street: '456 Compliance Ave',
            city: 'Regulatory City',
            state: 'NY',
            zipCode: '10002',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0002',
          specialization: 'Regulatory Compliance'
        }
      },
      {
        name: 'Mike Finance Manager',
        email: 'finance@smartmedichain.com',
        password: 'finance123',
        role: 'finance_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Finance',
          type: 'hospital',
          address: {
            street: '789 Finance Blvd',
            city: 'Financial City',
            state: 'TX',
            zipCode: '75002',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0003',
          specialization: 'Financial Management'
        }
      },
      {
        name: 'Lisa Senior Manager',
        email: 'senior@smartmedichain.com',
        password: 'senior123',
        role: 'senior_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Senior Management',
          type: 'hospital',
          address: {
            street: '321 Executive Way',
            city: 'Executive City',
            state: 'FL',
            zipCode: '33102',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0004',
          specialization: 'Senior Management'
        }
      },
      {
        name: 'Central Pharmacy Stock Manager',
        email: 'pharmacy.stock@smartmedichain.com',
        password: 'pharmacy123',
        role: 'pharmacy_stock_manager',
        isVerified: true,
        organization: {
          name: 'Central Pharmacy Chain',
          type: 'pharmacy',
          license: 'PHARM-2024-001',
          address: {
            street: '654 Pharmacy Lane',
            city: 'Retail City',
            state: 'WA',
            zipCode: '98101',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0005',
          specialization: 'Pharmacy Stock Management'
        }
      },
      {
        name: 'Tom Pharmacy Order Manager',
        email: 'pharmacy.orders@smartmedichain.com',
        password: 'pharmacy123',
        role: 'pharmacy_order_manager',
        isVerified: true,
        organization: {
          name: 'SmartMediChain Pharmacy Orders',
          type: 'pharmacy',
          address: {
            street: '987 Order Management St',
            city: 'Pharmacy City',
            state: 'WA',
            zipCode: '98103',
            country: 'USA'
          }
        },
        profile: {
          phone: '+1-555-0008',
          specialization: 'Pharmacy Order Management'
        }
      }
    ];

    let createdUsers = [];
    let existingCount = 0;

    for (const role of requiredRoles) {
      const existingUser = await User.findOne({ role });

      if (!existingUser) {
        const defaultUser = defaultUsers.find(u => u.role === role);
        if (defaultUser) {
          const newUser = await User.create(defaultUser);
          createdUsers.push(newUser);
          console.log(`✅ Created default ${role} user: ${defaultUser.email}`);
        }
      } else {
        existingCount++;
      }
    }

    if (createdUsers.length > 0) {
      console.log(`🌱 Auto-seeded ${createdUsers.length} missing users`);
      console.log('📧 Default login credentials:');
      defaultUsers.forEach(user => {
        console.log(`   ${user.role}: ${user.email} / ${user.password}`);
      });
    } else if (existingCount > 0) {
      console.log(`✅ All required user roles already exist (${existingCount} users found)`);
    }

    return createdUsers;
  } catch (error) {
    console.error('❌ Error in auto-seeding users:', error);
    return [];
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting database seeding...');

    const users = await seedUsers();
    const medicines = await seedMedicines(users);
    await seedOrders(users, medicines);

    console.log('✅ Database seeding completed successfully!');
    console.log('📧 Login credentials for all roles:');
    console.log('   🔑 Admin: admin@smartmedichain.com / admin123');
    console.log('   🏭 Supplier: supplier@medisupply.com / supplier123');
    console.log('   🏭 Supplier User: supplier.user@smartmedichain.com / supplier123');
    console.log('   🏥 Hospital: hospital@citygeneral.com / hospital123');
    console.log('   🏥 Hospital User: hospital.user@smartmedichain.com / hospital123');
    console.log('   💊 Pharmacy Stock: pharmacy@centralpharm.com / pharmacy123');
    console.log('   📦 Pharmacy Orders: pharmacy.orders@smartmedichain.com / pharmacy123');
    console.log('   ⚙️  Operations Manager: operations@smartmedichain.com / operations123');
    console.log('   📋 Compliance Manager: compliance@smartmedichain.com / compliance123');
    console.log('   💰 Finance Manager: finance@smartmedichain.com / finance123');
    console.log('   👔 Senior Manager: senior@smartmedichain.com / senior123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, autoSeedUsers };
