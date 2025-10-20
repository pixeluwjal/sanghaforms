// Conditional Rule Types
export interface ConditionalRule {
  id: string;
  targetField: string; // The field that triggers the condition
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide';
}

export interface SectionConditionalRule {
  id: string;
  targetSection: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide';
}

// Field Types
export interface Field {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'sangha' | 'file' | 'whatsapp_optin' | 'arratai_optin';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  order: number;
  conditionalRules: ConditionalRule[];
  // Additional properties for specific field types
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

// Section Types
export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  fields: Field[];
  conditionalRules: SectionConditionalRule[];
}

// Theme Types
export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius?: string;
  buttonStyle?: 'filled' | 'outlined' | 'ghost';
}

// Images Types
export interface FormImages {
  logo?: string;
  banner?: string;
  background?: string;
  favicon?: string;
}

// Settings Types
export interface FormSettings {
  userType: 'swayamsevak' | 'lead';
  validityDuration: number; // minutes
  maxResponses: number;
  allowMultipleResponses: boolean;
  enableProgressSave: boolean;
  collectEmail: boolean;
  customSlug?: string;
  enableCustomSlug: boolean;
  isActive: boolean;
  
  // Group Links
  showGroupLinks: boolean;
  whatsappGroupLink: string;
  arrataiGroupLink: string;
  
  // Submission Settings
  submitButtonText?: string;
  successMessage?: string;
  redirectUrl?: string;
  
  // Notification Settings
  sendEmailNotifications?: boolean;
  notificationEmails?: string[];
}

// Form Status
export type FormStatus = 'draft' | 'published' | 'archived';

// Main Form Type
export interface Form {
  _id?: string; // MongoDB ID
  id: string; // Application ID
  title: string;
  description?: string;
  sections: Section[];
  theme: Theme;
  images: FormImages;
  settings: FormSettings;
  status: FormStatus;
  createdBy?: string; // User ID
  createdAt: Date;
  updatedAt: Date;
  
  // Analytics
  responseCount?: number;
  lastResponseAt?: Date;
}

// Form Response Types
export interface FormResponse {
  _id?: string;
  formId: string;
  responses: {
    fieldId: string;
    value: any;
  }[];
  submittedBy?: string;
  submittedAt: Date;
  deviceInfo?: {
    userAgent: string;
    ipAddress: string;
    platform: string;
  };
}

// AI Generation Types
export interface AIGenerationRequest {
  prompt: string;
  formType?: string;
  fieldsCount?: number;
  theme?: Partial<Theme>;
  includeSections?: boolean;
}

export interface AIGenerationResponse {
  form: Partial<Form>;
  suggestions: string[];
  estimatedTime: number;
}

// Drag and Drop Types
export interface DragItem {
  type: 'field' | 'section';
  fieldType?: string;
  sectionId?: string;
  fieldId?: string;
}

// Builder State Types
export interface BuilderState {
  activeTab: 'build' | 'preview' | 'ai' | 'settings';
  selectedField: string | null;
  selectedSection: string | null;
  isDragging: boolean;
  saveStatus: 'saved' | 'saving' | 'error';
  previewMode: boolean;
}

// Validation Types
export interface FieldValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FormValidation {
  isValid: boolean;
  sections: {
    [sectionId: string]: {
      isValid: boolean;
      fields: {
        [fieldId: string]: FieldValidation;
      };
    };
  };
}

// Export Types
export type FieldType = Field['type'];
export type OperatorType = ConditionalRule['operator'];
export type ActionType = ConditionalRule['action'];

// Helper Types for Form Building
export interface FieldTemplate {
  type: FieldType;
  label: string;
  icon: string;
  description: string;
  category: 'basic' | 'advanced' | 'special';
  defaultOptions?: string[];
}

// Conditional Logic Helper Types
export interface ConditionGroup {
  id: string;
  conditions: ConditionalRule[];
  logicalOperator: 'AND' | 'OR';
}

// File Upload Types
export interface FileUpload {
  id: string;
  fieldId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadUrl: string;
  status: 'uploading' | 'completed' | 'error';
}

// Sangha Hierarchy Types
export interface SanghaHierarchy {
  vibhaagId: string;
  khandaId: string;
  valayaId?: string;
  milanName: string;
}

// Organization Data Types
export interface Organization {
  _id: string;
  name: string;
  khandas: Khanda[];
}

export interface Khanda {
  _id: string;
  name: string;
  valays: Valaya[];
  milans: string[];
}

export interface Valaya {
  _id: string;
  name: string;
  milans: string[];
}

// Export all types
export default {
  Form,
  Section,
  Field,
  ConditionalRule,
  SectionConditionalRule,
  Theme,
  FormSettings,
  FormStatus,
  FormResponse,
  FieldType,
  OperatorType,
  ActionType
};