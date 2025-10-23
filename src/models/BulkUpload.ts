// models/BulkUpload.ts
import mongoose from 'mongoose';

export interface IBulkUpload extends mongoose.Document {
  filename: string;
  originalName: string;
  filePath: string;
  mimeType: string;
  size: number;
  targetCollection: 'SwayamsevakResponse' | 'LeadResponse';
  uploadType: 'append' | 'replace';
  source: string;
  sanghaHierarchy?: {
    khandaId?: string;
    valayaId?: string;
    milanId?: string;
    ghataId?: string;
  };
  enableAIParsing?: boolean;
  status: 'processing' | 'completed' | 'failed' | 'partial';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  errors?: string[];
  uploadedBy: mongoose.Types.ObjectId; // This should reference Admin
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const BulkUploadSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  originalName: { type: String, required: true },
  filePath: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  targetCollection: { 
    type: String, 
    enum: ['SwayamsevakResponse', 'LeadResponse'],
    required: true 
  },
  uploadType: { 
    type: String, 
    enum: ['append', 'replace'],
    default: 'append' 
  },
  source: { type: String, required: true },
  sanghaHierarchy: {
    khandaId: String,
    valayaId: String,
    milanId: String,
    ghataId: String
  },
  enableAIParsing: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['processing', 'completed', 'failed', 'partial'],
    default: 'processing' 
  },
  totalRecords: { type: Number, default: 0 },
  processedRecords: { type: Number, default: 0 },
  successfulRecords: { type: Number, default: 0 },
  failedRecords: { type: Number, default: 0 },
  errors: [String],
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', // Changed from 'User' to 'Admin'
    required: true 
  },
  metadata: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

// Add indexes for better performance
BulkUploadSchema.index({ createdAt: -1 });
BulkUploadSchema.index({ status: 1 });
BulkUploadSchema.index({ targetCollection: 1 });

export default mongoose.models.BulkUpload || mongoose.model<IBulkUpload>('BulkUpload', BulkUploadSchema);