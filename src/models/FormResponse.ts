// models/FormResponse.ts
import mongoose from 'mongoose';

export interface IResponseValue {
  fieldId: string;
  fieldType: string;
  fieldLabel: string;
  value: string | string[] | number;
}

export interface IFormResponse extends mongoose.Document {
  formId: mongoose.Types.ObjectId;
  formTitle: string;
  formSlug: string;
  formType: string;
  collection: string;
  responses: IResponseValue[];
  submittedAt: Date;
  ipAddress: string;
  userAgent: string;
}

const responseValueSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  fieldType: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed
});

const formResponseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  formTitle: { type: String, required: true },
  formSlug: { type: String, required: true },
  formType: { type: String, required: true },
  collection: { type: String, required: true },
  responses: [responseValueSchema],
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: false }
});

export default mongoose.models.FormResponse || mongoose.model<IFormResponse>('FormResponse', formResponseSchema);