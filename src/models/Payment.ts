import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  orderId: string;
  paymentId?: string;
  formId: mongoose.Types.ObjectId;
  submissionId: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  status: 'created' | 'attempted' | 'success' | 'failed';
  customerDetails: {
    name: string;
    email: string;
    contact: string;
  };
  razorpaySignature?: string;
  error?: string;
  paidAt?: Date;
  failedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: String, required: true, unique: true },
    paymentId: { type: String },
    formId: { type: Schema.Types.ObjectId, ref: 'Form', required: true },
    submissionId: { type: Schema.Types.ObjectId, ref: 'FormResponse', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: { 
      type: String, 
      enum: ['created', 'attempted', 'success', 'failed'], 
      default: 'created' 
    },
    customerDetails: {
      name: { type: String, required: true },
      email: { type: String },
      contact: { type: String }
    },
    razorpaySignature: { type: String },
    error: { type: String },
    paidAt: { type: Date },
    failedAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);