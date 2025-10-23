import mongoose from 'mongoose';

export interface ISwayamsevakResponseValue {
  fieldId: string;
  fieldType: string;
  fieldLabel: string;
  value: string | string[] | number;
}

export interface ISwayamsevakResponse extends mongoose.Document {
  formId: mongoose.Types.ObjectId;
  formTitle: string;
  formSlug: string;
  responses: ISwayamsevakResponseValue[];
  submittedAt: Date;
  // Source field
  source: string;
  // Khanda, Valaya, Milan Ghat fields
  khanda: string;
  valaya: string;
  milanGhat: string;
  // Personal information
  name: string;
  // Additional metadata
  ipAddress: string;
  userAgent: string;
}

const swayamsevakResponseValueSchema = new mongoose.Schema({
  fieldId: { type: String, required: false },
  fieldType: { type: String, required: false },
  fieldLabel: { type: String, required: false },
  value: mongoose.Schema.Types.Mixed
});

const swayamsevakResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  formTitle: { type: String, required: true },
  formSlug: { type: String, required: true },
  responses: [swayamsevakResponseValueSchema],
  // Source field
  source: { type: String, required: false },
  // Khanda, Valaya, Milan Ghat fields
  khanda: { type: String, required: false },
  valaya: { type: String, required: false },
  milanGhat: { type: String, required: false },
  // Personal information
  name: { type: String, required: false },
  // Metadata
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' }
});

// Indexes for better query performance
swayamsevakResponseSchema.index({ formId: 1, submittedAt: -1 });
swayamsevakResponseSchema.index({ source: 1 });
swayamsevakResponseSchema.index({ khanda: 1 });
swayamsevakResponseSchema.index({ valaya: 1 });
swayamsevakResponseSchema.index({ milanGhat: 1 });

export default mongoose.models.SwayamsevakResponse || mongoose.model<ISwayamsevakResponse>('SwayamsevakResponse', swayamsevakResponseSchema);