const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medicine name is required'],
    trim: true,
    maxlength: [200, 'Medicine name cannot exceed 200 characters']
  },
  genericName: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Antibiotic',
      'Analgesic',
      'Antiviral',
      'Cardiovascular',
      'Diabetes',
      'Respiratory',
      'Neurological',
      'Oncology',
      'Dermatology',
      'Gastrointestinal',
      'Immunosuppressant',
      'Hormone',
      'Vitamin',
      'Vaccine',
      'Other'
    ]
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  manufacturer: {
    name: {
      type: String,
      required: [true, 'Manufacturer name is required']
    },
    license: String,
    contact: {
      email: String,
      phone: String,
      address: String
    }
  },
  composition: [{
    activeIngredient: String,
    strength: String,
    unit: String
  }],
  dosageForm: {
    type: String,
    enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Ointment', 'Drops', 'Inhaler', 'Patch', 'Other'],
    required: true
  },
  strength: {
    value: Number,
    unit: String
  },
  packaging: {
    type: {
      type: String,
      enum: ['Bottle', 'Blister', 'Vial', 'Tube', 'Box', 'Strip', 'Other']
    },
    size: String,
    unitsPerPackage: Number
  },
  pricing: {
    costPrice: {
      type: Number,
      required: true,
      min: 0
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  batchInfo: {
    batchNumber: {
      type: String,
      required: true,
      unique: true
    },
    manufacturingDate: {
      type: Date,
      required: true
    },
    expiryDate: {
      type: Date,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    }
  },
  storage: {
    temperature: {
      min: Number,
      max: Number,
      unit: {
        type: String,
        default: 'Celsius'
      }
    },
    humidity: String,
    specialConditions: String
  },
  regulatory: {
    approvalNumber: String,
    approvalDate: Date,
    regulatoryBody: String,
    prescriptionRequired: {
      type: Boolean,
      default: false
    }
  },
  blockchain: {
    transactionHash: String,
    blockNumber: Number,
    contractAddress: String,
    tokenId: String
  },
  qrCode: String,
  barcode: String,
  images: [String],
  status: {
    type: String,
    enum: ['active', 'inactive', 'recalled', 'expired'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
medicineSchema.index({ name: 1 });
medicineSchema.index({ category: 1 });
medicineSchema.index({ 'batchInfo.batchNumber': 1 });
medicineSchema.index({ 'batchInfo.expiryDate': 1 });
medicineSchema.index({ status: 1 });
medicineSchema.index({ createdBy: 1 });

// Pre-save middleware to check expiry date
medicineSchema.pre('save', function(next) {
  if (this.batchInfo.expiryDate < Date.now()) {
    this.status = 'expired';
  }
  next();
});

// Virtual for checking if medicine is expired
medicineSchema.virtual('isExpired').get(function() {
  return this.batchInfo.expiryDate < Date.now();
});

// Virtual for days until expiry
medicineSchema.virtual('daysUntilExpiry').get(function() {
  const today = new Date();
  const expiryDate = new Date(this.batchInfo.expiryDate);
  const diffTime = expiryDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Ensure virtual fields are serialized
medicineSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Medicine', medicineSchema);
