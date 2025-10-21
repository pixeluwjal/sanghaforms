export interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'sangha' | 'file' | 'whatsapp_optin' | 'arratai_optin';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
  conditionalRules?: any[];
  nestedFields?: FormField[];
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
  conditionalRules?: any[];
}

export interface FormData {
  _id: string;
  title: string;
  description?: string;
  images?: {
    logo?: string;
    banner?: string;
    background?: string;
  };
  sections: FormSection[];
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  settings: {
    customSlug?: string;
    allowMultipleResponses: boolean;
    enableProgressSave: boolean;
    showGroupLinks: boolean;
    whatsappGroupLink?: string;
    arrataiGroupLink?: string;
  };
}

export interface LiveFormPageProps {
  slug: string;
}

export interface FieldRendererProps {
  field: FormField;
  register: any;
  errors: any;
  getValues: any;
  setValue: any;
  handleFieldChange: (fieldId: string, value: any) => void;
  visibleFields: Set<string>;
  formData?: FormData | null;
  level?: number;
}

export interface FormSectionProps {
  section: FormSection;
  register: any;
  errors: any;
  getValues: any;
  setValue: any;
  handleFieldChange: (fieldId: string, value: any) => void;
  visibleFields: Set<string>;
  formData?: FormData | null;
}