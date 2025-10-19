export interface Form {
  _id?: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  sections: Section[];
  images?: {
    logo?: string;
    banner?: string;
  };
  theme?: {
    primaryColor: string;
  };
  settings?: FormSettings;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  fields: Field[];
  conditionalRules?: ConditionalRule[];
}

export interface Field {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[];
  order: number;
}

export type FieldType = 
  | 'text' 
  | 'email' 
  | 'number' 
  | 'textarea' 
  | 'select' 
  | 'radio' 
  | 'checkbox' 
  | 'date' 
  | 'sangha' 
  | 'file' 
  | 'whatsapp_optin'  // ADD THIS
  | 'arratai_optin';  // ADD THIS
  
export interface ConditionalRule {
  id: string;
  targetSection: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string;
  action: 'show' | 'hide';
}

export interface FormSettings {
  userType: 'swayamsevak' | 'lead';
  validityDuration: number;
  maxResponses: number;
  allowMultipleResponses: boolean;
  enableProgressSave: boolean;
  collectEmail: boolean;
  customSlug: string;
  enableCustomSlug: boolean;
  isActive: boolean;
  whatsappGroupLink: string;
  arrataiGroupLink: string;
  showGroupLinks: boolean;
  previousSlugs: string[];
}