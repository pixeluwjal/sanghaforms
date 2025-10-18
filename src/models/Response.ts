import mongoose from 'mongoose';

export interface IResponseValue {
  fieldId: string;
  value: string | string[] | number;
}

export interface IResponse extends mongoose.Document {
  formId: mongoose.Types.ObjectId;
  responses: IResponseValue[];
  submittedAt: Date;
}

const responseValueSchema = new mongoose.Schema({
  fieldId: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed
});

const responseSchema = new mongoose.Schema({
  formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form', required: true },
  responses: [responseValueSchema]
}, {
  timestamps: { createdAt: 'submittedAt', updatedAt: false }
});

export default mongoose.models.Response || mongoose.model<IResponse>('Response', responseSchema);