export interface FormResponse {
  _id: string;
  formId: string;
  formTitle: string;
  formName: string;
  formType: string;
  collection: string;
  submittedAt: string;
  ipAddress: string;
  userAgent: string;
  responses: {
    [key: string]: {
      label: string;
      value: string;
      type: string;
      details?: any;
    };
  };
  rawResponses?: any[];
  leadScore?: number;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source?: string;
  name?: string;
  email?: string;
  phone?: string;
  swayamsevakId?: string;
  sangha?: string;
  area?: string;
  district?: string;
  state?: string;
  dateOfBirth?: string;
}

export interface Form {
  _id: string;
  title: string;
  form_name12: string;
  sections: Array<{
    fields: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  }>;
  userType: string;
}

export interface Organization {
  _id: string;
  name: string;
  khandas: Array<{
    _id: string;
    name: string;
    code: string;
    valays: Array<{
      _id: string;
      name: string;
      milans: Array<{
        _id: string;
        name: string;
        ghatas: Array<{
          _id: string;
          name: string;
        }>;
      }>;
    }>;
  }>;
}

export interface SanghaMapping {
  vibhaags: Map<string, string>;
  khandas: Map<string, { name: string; vibhaagId: string }>;
  valayas: Map<string, { name: string; khandaId: string }>;
  milans: Map<string, { name: string; valayaId: string }>;
  ghatas: Map<string, { name: string; milanId: string }>;
}

export interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
  aiUsed?: boolean;
  collectionType?: string;
}