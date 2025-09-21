const Joi = require('joi');

// User validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'supplier', 'hospital',
    'operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager',
    'pharmacy_stock_manager', 'pharmacy_order_manager').default('hospital'),
  organization: Joi.object({
    name: Joi.string().max(200),
    type: Joi.string().valid('hospital', 'pharmacy', 'clinic', 'supplier', 'distributor', 'manufacturer'),
    license: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string()
    })
  }),
  profile: Joi.object({
    phone: Joi.string(),
    dateOfBirth: Joi.date(),
    licenseNumber: Joi.string(),
    specialization: Joi.string()
  })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateProfileSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  profile: Joi.object({
    phone: Joi.string(),
    dateOfBirth: Joi.date(),
    licenseNumber: Joi.string(),
    specialization: Joi.string()
  }),
  organization: Joi.object({
    name: Joi.string().max(200),
    type: Joi.string().valid('hospital', 'pharmacy', 'clinic', 'supplier', 'distributor', 'manufacturer'),
    license: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string()
    })
  })
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

const adminCreateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'supplier', 'hospital',
    'operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager',
    'pharmacy_stock_manager', 'pharmacy_order_manager').required(),
  organization: Joi.object({
    name: Joi.string().max(200),
    type: Joi.string().valid('hospital', 'pharmacy', 'clinic', 'supplier', 'distributor', 'manufacturer'),
    license: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string()
    })
  }),
  profile: Joi.object({
    phone: Joi.string(),
    dateOfBirth: Joi.date(),
    licenseNumber: Joi.string(),
    specialization: Joi.string()
  }),
  isActive: Joi.boolean().default(true)
});

const adminUpdateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  role: Joi.string().valid('admin', 'supplier', 'hospital',
    'operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager',
    'pharmacy_stock_manager', 'pharmacy_order_manager'),
  organization: Joi.object({
    name: Joi.string().max(200),
    type: Joi.string().valid('hospital', 'pharmacy', 'clinic', 'supplier', 'distributor', 'manufacturer'),
    license: Joi.string(),
    address: Joi.object({
      street: Joi.string(),
      city: Joi.string(),
      state: Joi.string(),
      zipCode: Joi.string(),
      country: Joi.string()
    })
  }),
  profile: Joi.object({
    phone: Joi.string(),
    dateOfBirth: Joi.date(),
    licenseNumber: Joi.string(),
    specialization: Joi.string()
  }),
  isActive: Joi.boolean()
});

const adminSetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required()
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminSetPasswordSchema
};
