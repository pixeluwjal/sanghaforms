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
  // Swayamsevak-specific fields
  swayamsevakId: string;
  sangha: string;
  area: string;
  district: string;
  state: string;
  // Personal information
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  // Additional metadata
  ipAddress: string;
  userAgent: string;
}

const swayamsevakResponseValueSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  fieldType: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed
});

const swayamsevakResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  formTitle: { type: String, required: true },
  formSlug: { type: String, required: true },
  responses: [swayamsevakResponseValueSchema],
  // Swayamsevak-specific fields
  swayamsevakId: { type: String, required: true },
  sangha: { type: String, required: true },
  area: { type: String, required: true },
  district: String,
  state: String,
  // Personal information
  name: { type: String, required: true },
  email: String,
  phone: String,
  dateOfBirth: Date,
  // Metadata
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: 'updatedAt' }
});

// Indexes for better query performance
swayamsevakResponseSchema.index({ formId: 1, submittedAt: -1 });
swayamsevakResponseSchema.index({ swayamsevakId: 1 });
swayamsevakResponseSchema.index({ sangha: 1 });
swayamsevakResponseSchema.index({ area: 1 });
swayamsevakResponseSchema.index({ district: 1 });

export default mongoose.models.SwayamsevakResponse || mongoose.model<ISwayamsevakResponse>('SwayamsevakResponse', swayamsevakResponseSchema);