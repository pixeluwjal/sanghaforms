import mongoose, { Document, Schema } from 'mongoose';

export interface IFormSettings {
  userType: 'swayamsevak' | 'lead';
  validityDuration: number;
  maxResponses: number;
  allowMultipleResponses: boolean;
  enableProgressSave: boolean;
  collectEmail: boolean;
  customSlug: string;
  enableCustomSlug: boolean;
  isActive: boolean;
  previousSlugs: string[];
  whatsappGroupLink: string;
  arrataiGroupLink: string;
  showGroupLinks: boolean;
  defaultSource: string;
  pageTitle: string;
  acceptPayments: boolean;
  paymentAmount: number;
  paymentCurrency: string;
  paymentDescription: string;
  enableConditionalLinks: boolean;
  conditionalGroupLinks: Array<{
    fieldId: string;
    fieldValue: string;
    platform: 'whatsapp' | 'arratai';
    groupLink: string;
  }>;
}

export interface ITheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface IFormImage {
  logo: string;
  banner: string;
  background: string;
  favicon: string;
}

export interface IFormField {
  id: string;
  type: string;
  label: string;
  placeholder: string;
  required: boolean;
  options: string[];
  defaultValue: string;
  order: number;
  conditionalRules: Array<{
    targetField: string;
    operator: string;
    value: string;
  }>;
  nestedFields: IFormField[];
  customData: Record<string, any>;
}

export interface IFormSection {
  id: string;
  title: string;
  description: string;
  order: number;
  conditionalRules: Array<{
    targetField: string;
    operator: string;
    value: string;
  }>;
  fields: IFormField[];
}

export interface IForm extends Document {
  title: string;
  form_name12: string;
  description: string;
  sections: IFormSection[];
  theme: ITheme;
  images: IFormImage;
  settings: IFormSettings;
  status: 'draft' | 'published';
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ConditionalRuleSchema = new Schema({
  targetField: String,
  operator: {
    type: String,
    enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than']
  },
  value: Schema.Types.Mixed,
  action: {
    type: String,
    enum: ['show', 'hide'],
    default: 'show'
  }
});

const FieldConditionalRuleSchema = new Schema({
  targetField: String,
  operator: {
    type: String,
    enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than']
  },
  value: Schema.Types.Mixed,
  action: {
    type: String,
    enum: ['show', 'hide', 'enable', 'disable'],
    default: 'show'
  }
});

const FieldSchema = new Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'text', 'email', 'number', 'textarea', 'select', 'radio', 
      'checkbox', 'date', 'sangha', 'file', 'whatsapp_optin', 
      'arratai_optin', 'readonly_text', 'source'
    ]
  },
  label: String,
  placeholder: String,
  required: Boolean,
  options: [String],
  defaultValue: String,
  order: Number,
  conditionalRules: [FieldConditionalRuleSchema],
  nestedFields: [{
    type: Schema.Types.Mixed,
    default: []
  }],
  customData: {
    type: Schema.Types.Mixed,
    default: {}
  }
});

const SectionSchema = new Schema({
  id: String,
  title: String,
  description: String,
  order: Number,
  fields: [FieldSchema],
  conditionalRules: [ConditionalRuleSchema]
});

const ThemeSchema = new Schema({
  primaryColor: { type: String, default: '#7C3AED' },
  backgroundColor: { type: String, default: '#FFFFFF' },
  textColor: { type: String, default: '#1F2937' },
  fontFamily: { type: String, default: 'Inter' }
});

const ConditionalGroupLinkSchema = new Schema({
  fieldId: String,
  fieldValue: String,
  platform: {
    type: String,
    enum: ['whatsapp', 'arratai'],
    default: 'whatsapp'
  },
  groupLink: String
});

const SettingsSchema = new Schema({
  userType: {
    type: String,
    enum: ['swayamsevak', 'lead'],
    default: 'swayamsevak'
  },
  validityDuration: { type: Number, default: 1440 },
  maxResponses: { type: Number, default: 1000 },
  allowMultipleResponses: { type: Boolean, default: false },
  enableProgressSave: { type: Boolean, default: true },
  collectEmail: { type: Boolean, default: true },
  customSlug: String,
  enableCustomSlug: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  previousSlugs: [{ type: String }],
  showGroupLinks: { type: Boolean, default: false },
  whatsappGroupLink: { type: String, default: '' },
  arrataiGroupLink: { type: String, default: '' },
  enableConditionalLinks: { type: Boolean, default: false },
  conditionalGroupLinks: [ConditionalGroupLinkSchema],
  defaultSource: { type: String, default: '' },
  pageTitle: { type: String, default: '' },
  acceptPayments: { type: Boolean, default: false },
  paymentAmount: { type: Number, default: 0 },
  paymentCurrency: { type: String, default: 'INR' },
  paymentDescription: { type: String, default: '' }
});

const ImagesSchema = new Schema({
  logo: { type: String, default: '' },
  banner: { type: String, default: '' },
  background: { type: String, default: '' },
  favicon: { type: String, default: '' }
});

const FormSchema = new Schema<IForm>({
  title: { type: String, required: true },
  form_name12: { type: String, required: true },
  description: String,
  sections: [SectionSchema],
  theme: ThemeSchema,
  images: ImagesSchema,
  settings: SettingsSchema,
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

export default mongoose.models.Form || mongoose.model<IForm>('Form', FormSchema);