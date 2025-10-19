// models/Admin.ts
import mongoose from 'mongoose';

const AdminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function() {
      return this.status === 'active'; // Only required for active admins
    }
  },
  role: {
    type: String,
    enum: ['super_admin', 'admin'],
    default: 'admin',
  },
  status: {
    type: String,
    enum: ['pending', 'active'],
    default: 'pending',
  },
  invitationToken: {
    type: String,
    unique: true,
    sparse: true,
  },
  invitationExpires: {
    type: Date,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for better performance
AdminSchema.index({ invitationToken: 1 });
AdminSchema.index({ email: 1 });
AdminSchema.index({ createdBy: 1 }); // Add index for createdBy

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);