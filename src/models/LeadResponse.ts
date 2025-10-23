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
  // Organizational hierarchy fields
  khanda: string;
  valaya: string;
  milanGhat: string;
  // Contact information extracted from form
  name?: string;
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
  // Organizational hierarchy fields
  khanda: { type: String, required: false },
  valaya: { type: String, required: false },
  milanGhat: { type: String, required: false },
  // Extracted contact info for easy access
  name: String,
  // Metadata
  ipAddress: { type: String, required: false },
  userAgent: { type: String, required: false }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' }
});

// Indexes for better query performance
leadResponseSchema.index({ formId: 1, submittedAt: -1 });
leadResponseSchema.index({ status: 1 });
leadResponseSchema.index({ khanda: 1 });
leadResponseSchema.index({ valaya: 1 });
leadResponseSchema.index({ milanGhat: 1 });
leadResponseSchema.index({ leadScore: -1 });

export default mongoose.models.LeadResponse || mongoose.model<ILeadResponse>('LeadResponse', leadResponseSchema);