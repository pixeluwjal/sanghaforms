'use client';

import { File, Users, Calendar, Mail, Hash, AlignLeft, List, CheckSquare, Radio, UploadCloud } from 'lucide-react';
import { Field } from '../shared/types';

interface FieldPreviewProps {
  field: Field;
}

// Helper to get the Lucide icon based on type (for the default case, if not a standard input)
const getIcon = (type: string) => {
    switch(type) {
        case 'email': return Mail;
        case 'number': return Hash;
        case 'textarea': return AlignLeft;
        case 'select': return List;
        case 'radio': return Radio;
        case 'checkbox': return CheckSquare;
        case 'date': return Calendar;
        case 'file': return UploadCloud;
        case 'sangha': return Users;
        default: return File; // Default fallback icon
    }
};

export default function FieldPreview({ field }: FieldPreviewProps) {
  const Icon = getIcon(field.type);
  const commonInputClasses = "w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-base text-slate-700 shadow-lg shadow-slate-50/50 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-100 placeholder:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed";
  
  // Wrapper for consistency and required label display
  const FieldWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="mb-6">
      <label className="block text-sm font-bold text-slate-700 mb-2">
        {field.label || 'Untitled Field'} 
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      <p className="text-xs text-slate-400 mt-1 italic opacity-80">{field.placeholder || `Preview of ${field.type} field.`}</p>
    </div>
  );

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <FieldWrapper>
          <input
            type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'}
            placeholder={field.placeholder}
            className={commonInputClasses}
            disabled
          />
        </FieldWrapper>
      );
    
    case 'textarea':
      return (
        <FieldWrapper>
          <textarea
            placeholder={field.placeholder}
            rows={4}
            className={`${commonInputClasses} resize-y`}
            disabled
          />
        </FieldWrapper>
      );
    
    case 'select':
      return (
        <FieldWrapper>
          <select className={`${commonInputClasses} appearance-none cursor-pointer`} disabled>
            <option className="text-slate-500">{field.placeholder || 'Select an option'}</option>
            {field.options?.map((option, idx) => (
              <option key={idx} className="text-slate-800">{option}</option>
            ))}
          </select>
        </FieldWrapper>
      );
    
    case 'radio':
      return (
        <FieldWrapper>
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-not-allowed">
                <input 
                  type="radio" 
                  name={`radio-${field.id}`} 
                  disabled 
                  className="text-indigo-600 border-slate-300 w-5 h-5 focus:ring-indigo-500 disabled:opacity-70" 
                />
                <span className="text-slate-700 text-base font-medium">{option}</span>
              </label>
            ))}
          </div>
        </FieldWrapper>
      );
    
    case 'checkbox':
      return (
        <FieldWrapper>
          <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
            {field.options?.map((option, idx) => (
              <label key={idx} className="flex items-center gap-3 cursor-not-allowed">
                <input 
                  type="checkbox" 
                  disabled 
                  className="text-indigo-600 rounded border-slate-300 w-5 h-5 focus:ring-indigo-500 disabled:opacity-70" 
                />
                <span className="text-slate-700 text-base font-medium">{option}</span>
              </label>
            ))}
          </div>
        </FieldWrapper>
      );
    
    case 'date':
      return (
        <FieldWrapper>
          <input
            type="date"
            className={commonInputClasses}
            disabled
          />
        </FieldWrapper>
      );
    
    case 'sangha':
      return (
        <FieldWrapper>
          <div className="space-y-4 bg-purple-50 rounded-xl p-5 border-2 border-purple-200 shadow-md">
            <div className="flex items-center gap-3 text-purple-700">
              <Users className="w-6 h-6" />
              <span className="text-base font-extrabold tracking-wide">Sangha Hierarchy Selector</span>
            </div>
            <p className="text-sm text-purple-600 mb-3">This field links to the organizational structure.</p>
            <div className="space-y-3">
              {['Vibhaag', 'Khanda', 'Valaya', 'Milan'].map(level => (
                <select key={level} className={`${commonInputClasses} appearance-none`} disabled>
                  <option className="text-slate-500">{`Select ${level}`}</option>
                </select>
              ))}
            </div>
          </div>
        </FieldWrapper>
      );
    
    case 'file':
      return (
        <FieldWrapper>
          <div className="border-4 border-dashed border-indigo-300 rounded-2xl p-8 text-center bg-white hover:border-indigo-500 transition-all duration-300 shadow-xl cursor-not-allowed">
            <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
            <p className="text-base text-slate-700 font-bold">Click to Upload Files</p>
            <p className="text-sm text-slate-500 mt-1">Maximum file size: 10MB (Preview Mode)</p>
          </div>
        </FieldWrapper>
      );
    
    default:
      return (
        <FieldWrapper>
          <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 text-red-700 text-sm">
            <Icon className="w-4 h-4"/>
            <span>Preview not available for field type: **{field.type}**</span>
          </div>
        </FieldWrapper>
      );
  }
}
