'use client';

import { useState, useEffect } from 'react';
import { Loader2, XCircle, ChevronDown, Users, UploadCloud } from 'lucide-react';
import toast from 'react-hot-toast';

// --- TYPE DEFINITIONS ---
interface Field {
  id: string; 
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'sangha' | 'file';
  label: string; 
  required: boolean; 
  placeholder?: string; 
  options?: string[];
}

interface Section { 
  id: string; 
  title: string; 
  description: string; 
  fields: Field[]; 
}

interface Form { 
  id: string; 
  title: string; 
  description: string; 
  sections: Section[]; 
  images?: { 
    banner?: string; 
    logo?: string; 
  }; 
}

// --- API DATA STRUCTURES ---
interface Valaya { 
  _id: string; 
  name: string; 
  milans: string[]; 
}

interface Khanda { 
  _id: string; 
  name: string; 
  code: string; 
  valays: Valaya[]; 
  milans: string[]; 
}

interface Vibhaaga { 
  _id: string; 
  name: string; 
  khandas: Khanda[]; 
}

// --- API Fetchers ---
const fetchFormData = async (formId: string): Promise<Form> => {
  console.log('Fetching form data for ID:', formId); // Debug log
  
  if (!formId || formId === 'undefined') {
    throw new Error('Form ID is required');
  }

  const response = await fetch(`/api/forms?id=${formId}`);
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch form data: ${error}`);
  }
  
  const data = await response.json();
  
  if (!data.form) {
    throw new Error('Form not found');
  }
  
  return data.form;
};

const fetchOrganizationData = async (): Promise<Vibhaaga[]> => {
  const response = await fetch('/api/organization');
  if (!response.ok) throw new Error('Failed to fetch organization data.');
  const data = await response.json();
  return data.organizations || [];
};

// Component for Sangha Hierarchy (Interactive Dropdowns)
const SanghaHierarchyField = ({ field }: { field: Field }) => {
  const commonInputClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200";

  const [hierarchyData, setHierarchyData] = useState<Vibhaaga[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // State for user selections
  const [vibhaagId, setVibhaagId] = useState('');
  const [khandaId, setKhandaId] = useState('');
  const [valayaId, setValayaId] = useState('');
  const [milanName, setMilanName] = useState('');

  useEffect(() => {
    setIsLoading(true);
    fetchOrganizationData()
      .then(data => setHierarchyData(data))
      .catch(() => toast.error("Failed to load Sangha hierarchy."))
      .finally(() => setIsLoading(false));
  }, []);

  // Derived states
  const selectedVibhaag = hierarchyData.find(v => v._id === vibhaagId);
  const availableKhandas = selectedVibhaag?.khandas || [];

  const selectedKhanda = availableKhandas.find(k => k._id === khandaId);
  const availableValayas = selectedKhanda?.valays || [];
  
  const selectedValaya = availableValayas.find(v => v._id === valayaId);
  
  // Determine the list of available Milans
  const availableMilans = selectedValaya?.milans || (selectedKhanda?.milans && availableValayas.length === 0 ? selectedKhanda.milans : []);
  
  // Handlers
  const handleVibhaagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setVibhaagId(e.target.value);
    setKhandaId('');
    setValayaId('');
    setMilanName('');
  };

  const handleKhandaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setKhandaId(e.target.value);
    setValayaId('');
    setMilanName('');
  };

  const handleValayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValayaId(e.target.value);
    setMilanName('');
  };

  const handleMilanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMilanName(e.target.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 bg-purple-50 rounded-xl border border-purple-200">
        <Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-600"/>
        <p className="text-sm text-purple-700">Loading hierarchy data...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 p-5 bg-purple-50/50 rounded-xl border-2 border-purple-200 shadow-inner">
      <p className="flex items-center gap-2 text-base font-bold text-purple-800">
        <Users className="w-5 h-5"/> Sangha Hierarchy: {field.label}
      </p>

      {/* Vibhaag Selector */}
      <div className="relative">
        <select 
          id={`${field.id}-vibhaag`} 
          name={`${field.id}-vibhaag`} 
          required={field.required} 
          value={vibhaagId} 
          onChange={handleVibhaagChange} 
          className={commonInputClasses}
        >
          <option value="">Select Vibhaag</option>
          {hierarchyData.map(v => (
            <option key={v._id} value={v._id}>{v.name}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
      </div>

      {/* Khanda Selector */}
      <div className="relative">
        <select 
          id={`${field.id}-khanda`} 
          name={`${field.id}-khanda`} 
          required={field.required} 
          value={khandaId} 
          onChange={handleKhandaChange} 
          disabled={!vibhaagId} 
          className={commonInputClasses}
        >
          <option value="">Select Khanda</option>
          {availableKhandas.map(k => (
            <option key={k._id} value={k._id}>{k.name}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
      </div>
      
      {/* Valaya Selector */}
      {selectedKhanda && availableValayas.length > 0 && (
        <div className="relative">
          <select 
            id={`${field.id}-valaya`} 
            name={`${field.id}-valaya`} 
            required={field.required} 
            value={valayaId} 
            onChange={handleValayaChange} 
            disabled={!khandaId} 
            className={commonInputClasses}
          >
            <option value="">Select Valaya</option>
            {availableValayas.map(v => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
        </div>
      )}

      {/* Milan Selector */}
      <div className="relative">
        <select 
          id={`${field.id}-milan`} 
          name={`${field.id}-milan`} 
          required={field.required} 
          value={milanName} 
          onChange={handleMilanChange} 
          disabled={!khandaId || (availableValayas.length > 0 && !valayaId)} 
          className={commonInputClasses}
        >
          <option value="">Select Milan</option>
          {availableMilans.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
      </div>
    </div>
  );
};

// Form Field Renderer Component
const FormField = ({ field }: { field: Field }) => {
  const commonInputClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-base shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all duration-200";
  const inputId = `field-${field.id}`;

  const inputElement = (() => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input 
            id={inputId} 
            name={field.id} 
            type={field.type} 
            required={field.required} 
            placeholder={field.placeholder} 
            className={commonInputClasses} 
          />
        );
      case 'textarea':
        return (
          <textarea 
            id={inputId} 
            name={field.id} 
            required={field.required} 
            placeholder={field.placeholder} 
            rows={4} 
            className={`${commonInputClasses} resize-y`} 
          />
        );
      case 'select':
        return (
          <div className="relative">
            <select 
              id={inputId} 
              name={field.id} 
              required={field.required} 
              className={`${commonInputClasses} appearance-none pr-8 bg-white cursor-pointer`}
            >
              <option value="">{field.placeholder || `Select ${field.label}`}</option>
              {field.options?.map((option, idx) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
          </div>
        );
      case 'radio':
        return (
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 text-slate-700 cursor-pointer">
                <input 
                  type="radio" 
                  name={field.id} 
                  required={field.required} 
                  value={option} 
                  className="text-indigo-600 border-slate-300 w-5 h-5 focus:ring-indigo-500" 
                />
                <span className="text-base">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 text-slate-700 cursor-pointer">
                <input 
                  type="checkbox" 
                  name={`${field.id}[]`} 
                  value={option} 
                  className="rounded text-indigo-600 border-slate-300 w-5 h-5 focus:ring-indigo-500" 
                />
                <span className="text-base">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'date':
        return (
          <input 
            id={inputId} 
            name={field.id} 
            type="date" 
            required={field.required} 
            className={commonInputClasses} 
          />
        );
      case 'sangha':
        return <SanghaHierarchyField field={field} />;
      case 'file':
        return (
          <div className="border-2 border-dashed border-indigo-400 rounded-xl p-8 text-center bg-indigo-50/50 hover:border-indigo-600 transition-all cursor-pointer">
            <UploadCloud className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
            <p className="text-base text-slate-800 font-bold">Click or drag files here</p>
            <p className="text-xs text-slate-500 mt-1">Max 10MB per file. Supports: Images, PDF, Docs</p>
            <input 
              type="file" 
              id={inputId}
              name={field.id}
              required={field.required}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              multiple
              accept="image/*,.pdf,.doc,.docx"
            />
          </div>
        );
      default:
        return (
          <p className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">
            Unsupported field type: {field.type}
          </p>
        );
    }
  })();

  return (
    <div className="mb-8 p-4 bg-white rounded-xl shadow-md border border-slate-100">
      <label htmlFor={inputId} className="block text-base font-bold text-slate-800 mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {inputElement}
    </div>
  );
};

export default function FormPreviewPage({ formId }: { formId: string }) {
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Fetching
  useEffect(() => {
    if (!formId) {
      console.error('No formId provided to FormPreviewPage');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    fetchFormData(formId)
      .then(data => setForm(data))
      .catch((error) => {
        console.error('Error fetching form:', error);
        toast.error(error.message || "Failed to load form.");
        setForm(null);
      })
      .finally(() => setIsLoading(false));
  }, [formId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="ml-3 text-lg font-medium text-slate-700">Loading Form...</p>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-xl text-red-600 font-semibold">Form not found</p>
          <p className="text-slate-600 mt-2">The form you're looking for doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border-t-8 border-indigo-600">
          
          {/* Banner */}
          <div className="relative h-48 bg-slate-100/70 flex items-center justify-center">
            {form.images?.banner && (
              <img 
                src={form.images.banner} 
                alt="Banner" 
                className="w-full h-full object-cover" 
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }} 
              />
            )}
            {/* Logo */}
            <div className="absolute -bottom-16">
              <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 shadow-xl flex items-center justify-center">
                {form.images?.logo ? (
                  <img 
                    src={form.images.logo} 
                    alt="Logo" 
                    className="w-full h-full object-cover rounded-full" 
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }} 
                  />
                ) : (
                  <span className="text-slate-500 font-bold text-sm">LOGO</span>
                )}
              </div>
            </div>
          </div>

          <div className="pt-20 pb-8 px-6 sm:px-10 text-center">
            <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{form.title}</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">{form.description}</p>
          </div>
        </div>

        {/* Form Sections */}
        <div className="space-y-10">
          {form.sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border-t-4 border-purple-500">
              <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{section.title}</h2>
              <p className="text-md text-slate-500 mb-6 border-b pb-4">{section.description}</p>
              
              <div className="space-y-4">
                {section.fields.map((field) => (
                  <FormField key={field.id} field={field} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}