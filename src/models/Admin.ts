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

export default mongoose.models.Admin || mongoose.model('Admin', AdminSchema);