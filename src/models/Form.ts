// models/Form.ts
import mongoose from 'mongoose';

const ConditionalRuleSchema = new mongoose.Schema({
  id: String,
  targetSection: String,
  field: String,
  operator: {
    type: String,
    enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than']
  },
  value: mongoose.Schema.Types.Mixed,
  action: {
    type: String,
    enum: ['show', 'hide'],
    default: 'show'
  }
});

const FieldConditionalRuleSchema = new mongoose.Schema({
  id: String,
  targetField: String,
  operator: {
    type: String,
    enum: ['equals', 'not_equals', 'contains', 'greater_than', 'less_than']
  },
  value: mongoose.Schema.Types.Mixed,
  action: {
    type: String,
    enum: ['show', 'hide', 'enable', 'disable'],
    default: 'show'
  }
});

const FieldSchema = new mongoose.Schema({
  id: String,
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
    type: mongoose.Schema.Types.Mixed,
    default: []
  }]
});

const SectionSchema = new mongoose.Schema({
  id: String,
  title: String,
  description: String,
  order: Number,
  fields: [FieldSchema],
  conditionalRules: [ConditionalRuleSchema]
});

const ThemeSchema = new mongoose.Schema({
  primaryColor: { type: String, default: '#7C3AED' },
  backgroundColor: { type: String, default: '#FFFFFF' },
  textColor: { type: String, default: '#1F2937' },
  fontFamily: { type: String, default: 'Inter' }
});

const SettingsSchema = new mongoose.Schema({
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
  showGroupLinks: { type: Boolean, default: false },
  whatsappGroupLink: { type: String, default: '' },
  arrataiGroupLink: { type: String, default: '' }
});

// FIXED: Added suppressReservedKeysWarning to remove the warning
const FormSchema = new mongoose.Schema({
  title: { type: String, required: true },
  form_name12: { type: String, required: true },
  description: String,
  sections: [SectionSchema],
  theme: ThemeSchema,
  images: {
    logo: String,
    banner: String,
    background: String
  },
  settings: SettingsSchema,
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  createdBy: mongoose.Schema.Types.ObjectId,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  suppressReservedKeysWarning: true // This removes the warning
});

export default mongoose.models.Form || mongoose.model('Form', FormSchema);