const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema({
  relatedEntity: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Order', 'Medicine', 'User'] // Add other entity types as needed
  },
  requestType: {
    type: String,
    required: true,
    enum: ['create', 'update', 'delete', 'purchase', 'transfer', 'restock']
  },
  requestedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestDetails: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  requiredApprovals: [{
    role: {
      type: String,
      enum: ['operations_manager', 'compliance_manager', 'finance_manager', 'senior_manager'],
      required: true
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    comments: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

// Indexes for better query performance
approvalSchema.index({ relatedEntity: 1, entityType: 1 });
approvalSchema.index({ requestedBy: 1 });
approvalSchema.index({ status: 1 });
approvalSchema.index({ createdAt: -1 });
approvalSchema.index({ 'requiredApprovals.role': 1, 'requiredApprovals.isApproved': 1 });

module.exports = mongoose.model('Approval', approvalSchema);
