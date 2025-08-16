const Medicine = require('../models/Medicine');
const { createMedicineSchema, updateMedicineSchema } = require('../validation/medicineValidation');

// @desc    Get all medicines
// @route   GET /api/medicines
// @access  Private
const getMedicines = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'active',
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      minPrice,
      maxPrice,
      expiryStatus
    } = req.query;

    // Build query
    const query = { status };

    // Add filters
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { 'manufacturer.name': { $regex: search, $options: 'i' } }
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['pricing.sellingPrice'] = {};
      if (minPrice) query['pricing.sellingPrice'].$gte = parseFloat(minPrice);
      if (maxPrice) query['pricing.sellingPrice'].$lte = parseFloat(maxPrice);
    }

    // Expiry status filter
    if (expiryStatus === 'expired') {
      query['batchInfo.expiryDate'] = { $lt: new Date() };
    } else if (expiryStatus === 'expiring_soon') {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      query['batchInfo.expiryDate'] = { 
        $gte: new Date(),
        $lte: thirtyDaysFromNow
      };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const medicines = await Medicine.find(query)
      .populate('createdBy', 'name email organization')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalCount = await Medicine.countDocuments(query);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      success: true,
      data: {
        medicines,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNext: parseInt(page) < totalPages,
          hasPrev: parseInt(page) > 1
        }
      }
    });
  } catch (error) {
    console.error('Get medicines error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single medicine
// @route   GET /api/medicines/:id
// @access  Private
const getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id)
      .populate('createdBy', 'name email organization');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    res.json({
      success: true,
      data: { medicine }
    });
  } catch (error) {
    console.error('Get medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create new medicine
// @route   POST /api/medicines
// @access  Private (Supplier, Admin)
const createMedicine = async (req, res) => {
  try {
    // Validate request body
    const { error } = createMedicineSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if user can create medicines
    if (!['admin', 'supplier', 'manufacturer'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create medicines'
      });
    }

    // Check if batch number already exists
    const existingBatch = await Medicine.findOne({
      'batchInfo.batchNumber': req.body.batchInfo.batchNumber
    });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'Medicine with this batch number already exists'
      });
    }

    // Create medicine
    const medicine = await Medicine.create({
      ...req.body,
      createdBy: req.user.id
    });

    // Populate created medicine
    await medicine.populate('createdBy', 'name email organization');

    res.status(201).json({
      success: true,
      message: 'Medicine created successfully',
      data: { medicine }
    });
  } catch (error) {
    console.error('Create medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update medicine
// @route   PUT /api/medicines/:id
// @access  Private (Creator, Admin)
const updateMedicine = async (req, res) => {
  try {
    // Validate request body
    const { error } = updateMedicineSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Check authorization
    if (medicine.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this medicine'
      });
    }

    // Update medicine
    const updatedMedicine = await Medicine.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email organization');

    res.json({
      success: true,
      message: 'Medicine updated successfully',
      data: { medicine: updatedMedicine }
    });
  } catch (error) {
    console.error('Update medicine error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Creator, Admin)
const deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid medicine ID format'
      });
    }
    
    const medicine = await Medicine.findById(id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine not found'
      });
    }

    // Check authorization
    if (medicine.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this medicine'
      });
    }

    await Medicine.findByIdAndDelete(id);

    // Return a 200 status with success message
    res.status(200).json({
      success: true,
      message: 'Medicine deleted successfully'
    });
  } catch (error) {
    console.error('Delete medicine error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid medicine ID format'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get medicine categories
// @route   GET /api/medicines/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    const categories = [
      'Antibiotic', 'Analgesic', 'Antiviral', 'Cardiovascular', 'Diabetes',
      'Respiratory', 'Neurological', 'Oncology', 'Dermatology', 'Gastrointestinal',
      'Immunosuppressant', 'Hormone', 'Vitamin', 'Vaccine', 'Other'
    ];

    // Get category counts
    const categoryCounts = await Medicine.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const categoriesWithCounts = categories.map(category => {
      const found = categoryCounts.find(item => item._id === category);
      return {
        name: category,
        count: found ? found.count : 0
      };
    });

    res.json({
      success: true,
      data: { categories: categoriesWithCounts }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Search medicines by batch number
// @route   GET /api/medicines/batch/:batchNumber
// @access  Private
const getMedicineByBatch = async (req, res) => {
  try {
    const { batchNumber } = req.params;

    const medicine = await Medicine.findOne({
      'batchInfo.batchNumber': batchNumber
    }).populate('createdBy', 'name email organization');

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: 'Medicine with this batch number not found'
      });
    }

    res.json({
      success: true,
      data: { medicine }
    });
  } catch (error) {
    console.error('Get medicine by batch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getMedicines,
  getMedicine,
  createMedicine,
  updateMedicine,
  deleteMedicine,
  getCategories,
  getMedicineByBatch
};
