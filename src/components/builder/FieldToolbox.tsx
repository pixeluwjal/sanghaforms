// components/builder/FieldToolbox.tsx
import { Settings, Plus, Type, Mail, Hash, FileText, List, Circle, Square, Calendar, Upload, MessageCircle, Users } from 'lucide-react';

interface FieldToolboxProps {
  onFieldAdd: (fieldType: string) => void;
}

const FIELD_TYPES = [
  { 
    type: 'text', 
    label: 'Text Input', 
    icon: Type, 
    color: 'blue', 
    description: 'Single line text input' 
  },
  { 
    type: 'email', 
    label: 'Email', 
    icon: Mail, 
    color: 'green', 
    description: 'Email address field' 
  },
  { 
    type: 'number', 
    label: 'Number', 
    icon: Hash, 
    color: 'purple', 
    description: 'Numeric input field' 
  },
  { 
    type: 'textarea', 
    label: 'Text Area', 
    icon: FileText, 
    color: 'indigo', 
    description: 'Multi-line text input' 
  },
  { 
    type: 'select', 
    label: 'Dropdown', 
    icon: List, 
    color: 'orange', 
    description: 'Select from options' 
  },
  { 
    type: 'radio', 
    label: 'Radio Group', 
    icon: Circle, 
    color: 'pink', 
    description: 'Single choice selection' 
  },
  { 
    type: 'checkbox', 
    label: 'Checkboxes', 
    icon: Square, 
    color: 'red', 
    description: 'Multiple choice selection' 
  },
  { 
    type: 'date', 
    label: 'Date Picker', 
    icon: Calendar, 
    color: 'teal', 
    description: 'Date selection' 
  },
  { 
    type: 'file', 
    label: 'File Upload', 
    icon: Upload, 
    color: 'amber', 
    description: 'File upload field' 
  },
  { 
    type: 'sangha', 
    label: 'Sangha Hierarchy', 
    icon: Users, 
    color: 'purple', 
    description: 'Organization hierarchy selection' 
  },
  { 
    type: 'whatsapp_optin', 
    label: 'WhatsApp Opt-in', 
    icon: MessageCircle, 
    color: 'emerald', 
    description: 'WhatsApp notifications' 
  },
  { 
    type: 'arratai_optin', 
    label: 'Arratai Opt-in', 
    icon: Users, 
    color: 'sky', 
    description: 'Arratai platform opt-in' 
  }
];

const colorConfig = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', hover: 'hover:bg-blue-100' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', hover: 'hover:bg-green-100' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', hover: 'hover:bg-purple-100' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-600', hover: 'hover:bg-indigo-100' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600', hover: 'hover:bg-orange-100' },
  pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600', hover: 'hover:bg-pink-100' },
  red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', hover: 'hover:bg-red-100' },
  teal: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-600', hover: 'hover:bg-teal-100' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-600', hover: 'hover:bg-amber-100' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-600', hover: 'hover:bg-emerald-100' },
  sky: { bg: 'bg-sky-50', border: 'border-sky-200', text: 'text-sky-600', hover: 'hover:bg-sky-100' }
};

export const FieldToolbox = ({ onFieldAdd }: FieldToolboxProps) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl p-4 sm:p-6 h-fit lg:sticky lg:top-6 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="text-center mb-4 sm:mb-6">
        <div className="inline-flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white mb-2 sm:mb-3">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          <h3 className="font-bold text-sm sm:text-lg">Form Fields</h3>
        </div>
        <p className="text-gray-600 text-xs sm:text-sm">
          Click to add fields to your form
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-3">
        {FIELD_TYPES.map((fieldType) => {
          const IconComponent = fieldType.icon;
          const color = colorConfig[fieldType.color as keyof typeof colorConfig] || colorConfig.blue;
          
          return (
            <button
              key={fieldType.type}
              onClick={() => onFieldAdd(fieldType.type)}
              className={`w-full flex items-center gap-2 sm:gap-4 p-3 sm:p-4 ${color.bg} ${color.border} border-2 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg group text-left`}
            >
              <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl ${color.bg} border-2 ${color.border} flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner flex-shrink-0`}>
                <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${color.text}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                  {fieldType.label}
                </div>
                <div className="text-gray-500 text-xs truncate hidden sm:block">
                  {fieldType.description}
                </div>
              </div>
              
              <Plus className={`w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 ${color.text} opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:rotate-90 flex-shrink-0`} />
            </button>
          );
        })}
      </div>

      {/* Quick Tips */}
      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
        <h4 className="font-semibold text-purple-800 text-xs sm:text-sm mb-2">💡 Quick Tips</h4>
        <ul className="text-xs text-purple-600 space-y-1">
          <li>• Click any field to add it</li>
          <li>• Use nested fields for conditional logic</li>
          <li>• Set rules with the eye icon</li>
          <li>• Drag sections to reorder</li>
        </ul>
      </div>
    </div>
  );
};