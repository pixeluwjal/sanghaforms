import mongoose, { Document, Schema } from 'mongoose';

export interface IResponseValue {
  fieldId: string;
  fieldType: string;
  fieldLabel: string;
  value: string | string[] | number;
}

export interface IFormResponse extends Document {
  formId: mongoose.Types.ObjectId;
  formTitle: string;
  formSlug: string;
  formType: string;
  collectionName: string;
  responses: IResponseValue[];
  submittedAt: Date;
  ipAddress: string;
  userAgent: string;
  paymentRequired: boolean;
  paymentAmount: number;
  paymentStatus: 'not_required' | 'pending' | 'success' | 'failed';
  paymentId?: string;
  paymentOrderId?: string;
  paymentError?: string;
  paymentCompletedAt?: Date;
}

const responseValueSchema = new Schema({
  fieldId: { type: String, required: true },
  fieldType: { type: String, required: true },
  fieldLabel: { type: String, required: true },
  value: Schema.Types.Mixed
});

const formResponseSchema = new Schema<IFormResponse>({
  formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
  formTitle: { type: String, required: true },
  formSlug: { type: String, required: true },
  formType: { type: String, required: true },
  collectionName: { type: String, required: true },
  responses: [responseValueSchema],
  ipAddress: { type: String, required: true },
  userAgent: { type: String, required: true },
  paymentRequired: { type: Boolean, default: false },
  paymentAmount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['not_required', 'pending', 'success', 'failed'], 
    default: 'not_required' 
  },
  paymentId: { type: String },
  paymentOrderId: { type: String },
  paymentError: { type: String },
  paymentCompletedAt: { type: Date }
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: false }
});

export default mongoose.models.FormResponse || mongoose.model<IFormResponse>('FormResponse', formResponseSchema);