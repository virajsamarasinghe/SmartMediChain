const Joi = require('joi');

const createMedicineSchema = Joi.object({
  name: Joi.string().max(200).required(),
  genericName: Joi.string().max(200),
  category: Joi.string().valid(
    'Antibiotic', 'Analgesic', 'Antiviral', 'Cardiovascular', 'Diabetes',
    'Respiratory', 'Neurological', 'Oncology', 'Dermatology', 'Gastrointestinal',
    'Immunosuppressant', 'Hormone', 'Vitamin', 'Vaccine', 'Other'
  ).required(),
  description: Joi.string().max(1000),
  manufacturer: Joi.object({
    name: Joi.string().required(),
    license: Joi.string(),
    contact: Joi.object({
      email: Joi.string().email(),
      phone: Joi.string(),
      address: Joi.string()
    })
  }).required(),
  composition: Joi.array().items(Joi.object({
    activeIngredient: Joi.string().required(),
    strength: Joi.string().required(),
    unit: Joi.string().required()
  })),
  dosageForm: Joi.string().valid(
    'Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment',
    'Drops', 'Inhaler', 'Patch', 'Other'
  ).required(),
  strength: Joi.object({
    value: Joi.number().min(0),
    unit: Joi.string()
  }),
  packaging: Joi.object({
    type: Joi.string().valid('Bottle', 'Blister', 'Vial', 'Tube', 'Box', 'Strip', 'Other'),
    size: Joi.string(),
    unitsPerPackage: Joi.number().min(1)
  }),
  pricing: Joi.object({
    costPrice: Joi.number().min(0).required(),
    sellingPrice: Joi.number().min(0).required(),
    currency: Joi.string().default('USD')
  }).required(),
  batchInfo: Joi.object({
    batchNumber: Joi.string().required(),
    manufacturingDate: Joi.date().required(),
    expiryDate: Joi.date().greater(Joi.ref('manufacturingDate')).required(),
    quantity: Joi.number().min(0).required()
  }).required(),
  storage: Joi.object({
    temperature: Joi.object({
      min: Joi.number(),
      max: Joi.number(),
      unit: Joi.string().default('Celsius')
    }),
    humidity: Joi.string(),
    specialConditions: Joi.string()
  }),
  regulatory: Joi.object({
    approvalNumber: Joi.string(),
    approvalDate: Joi.date(),
    regulatoryBody: Joi.string(),
    prescriptionRequired: Joi.boolean().default(false)
  })
});

const updateMedicineSchema = Joi.object({
  name: Joi.string().max(200),
  genericName: Joi.string().max(200),
  category: Joi.string().valid(
    'Antibiotic', 'Analgesic', 'Antiviral', 'Cardiovascular', 'Diabetes',
    'Respiratory', 'Neurological', 'Oncology', 'Dermatology', 'Gastrointestinal',
    'Immunosuppressant', 'Hormone', 'Vitamin', 'Vaccine', 'Other'
  ),
  description: Joi.string().max(1000),
  pricing: Joi.object({
    costPrice: Joi.number().min(0),
    sellingPrice: Joi.number().min(0),
    currency: Joi.string()
  }),
  batchInfo: Joi.object({
    quantity: Joi.number().min(0)
  }),
  status: Joi.string().valid('active', 'inactive', 'recalled', 'expired')
});

module.exports = {
  createMedicineSchema,
  updateMedicineSchema
};
