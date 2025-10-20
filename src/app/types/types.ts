export interface Theme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface Field {
  id: string; 
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'sangha' | 'file' | 'whatsapp_optin' | 'arratai_optin' | string;
  label: string; 
  required: boolean; 
  placeholder?: string; 
  options?: string[];
}

export interface ConditionalRule {
  id: string;
  targetSection: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide';
}

export interface Section { 
  id: string; 
  title: string; 
  description: string; 
  fields: Field[]; 
  conditionalRules: ConditionalRule[];
}

export interface Form { 
  _id: string; 
  title: string; 
  description: string; 
  sections: Section[]; 
  theme?: Theme;
  images?: { banner?: string; logo?: string; }; 
  settings?: { 
    customSlug?: string, 
    allowMultipleResponses: boolean, 
    enableProgressSave: boolean,
    showGroupLinks?: boolean,
    whatsappGroupLink?: string,
    arrataiGroupLink?: string
  }; 
}

// --- API DATA STRUCTURES for Sangha ---
export interface Valaya { _id: string; name: string; milans: string[]; }
export interface Khanda { _id: string; name: string; code: string; valays: Valaya[]; milans: string[]; }
export interface Vibhaaga { _id: string; name: string; khandas: Khanda[]; }