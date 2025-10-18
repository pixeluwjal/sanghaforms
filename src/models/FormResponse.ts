// models/FormResponse.ts
import mongoose from 'mongoose';

const ResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Form' },
  formSlug: { type: String, required: true },
  formType: { type: String, required: true, enum: ['ss', 'leads'], default: 'ss' },
  collection: { type: String, required: true, enum: ['ss', 'leads'], default: 'ss' },
  responses: mongoose.Schema.Types.Mixed,
  submittedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String
});

// Add indexes for better query performance
ResponseSchema.index({ formId: 1, submittedAt: -1 });
ResponseSchema.index({ formSlug: 1 });
ResponseSchema.index({ formType: 1 });
ResponseSchema.index({ collection: 1 });

export default mongoose.models.FormResponse || mongoose.model('FormResponse', ResponseSchema);