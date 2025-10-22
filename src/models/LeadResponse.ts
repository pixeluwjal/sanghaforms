import mongoose from 'mongoose';

export interface ILeadResponseValue {
  fieldId: string;
  fieldType: string;
  fieldLabel: string;
  value: string | string[] | number;
}

export interface ILeadResponse extends mongoose.Document {
  formId: mongoose.Types.ObjectId;
  formTitle: string;
  formSlug: string;
  responses: ILeadResponseValue[];
  submittedAt: Date;
  // Lead-specific fields
  leadScore: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source: string;
  // Contact information extracted from form
  name?: string;
  email?: string;
  phone?: string;
  // Additional metadata
  ipAddress: string;
  userAgent: string;
}

const leadResponseValueSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  fieldType: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed
});

const leadResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  formTitle: { type: String, required: true },
  formSlug: { type: String, required: true },
  responses: [leadResponseValueSchema],
  // Lead management fields
  leadScore: { type: Number, default: 0, min: 0, max: 100 },
  status: { 
    type: String, 
    enum: ['new', 'contacted', 'qualified', 'converted', 'rejected'],
    default: 'new'
  },
  source: { type: String, default: 'form_submission' },
  // Extracted contact info for easy access
  name: String,
  email: String,
  phone: String,
  // Metadata
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' }
});

// Indexes for better query performance
leadResponseSchema.index({ formId: 1, submittedAt: -1 });
leadResponseSchema.index({ status: 1 });
leadResponseSchema.index({ email: 1 });
leadResponseSchema.index({ leadScore: -1 });

export default mongoose.models.LeadResponse || mongoose.model<ILeadResponse>('LeadResponse', leadResponseSchema);