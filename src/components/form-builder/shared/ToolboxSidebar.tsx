'use client';

import { 
  Type, Mail, Hash, FileText, Calendar, List, Radio, CheckSquare,
  Building2, File, Users 
} from 'lucide-react';

interface ToolboxSidebarProps {
  onAddField: (fieldType: string) => void;
}

const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: Type },
  { type: 'email', label: 'Email', icon: Mail },
  { type: 'number', label: 'Number', icon: Hash },
  { type: 'textarea', label: 'Paragraph', icon: FileText },
  { type: 'select', label: 'Dropdown', icon: List },
  { type: 'radio', label: 'Multiple Choice', icon: Radio },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare },
  { type: 'date', label: 'Date', icon: Calendar },
  { type: 'sangha', label: 'Sangha Hierarchy', icon: Users },
  { type: 'file', label: 'File Upload', icon: File },
];

export default function ToolboxSidebar({ onAddField }: ToolboxSidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-[calc(100vh-140px)] overflow-y-auto sticky top-[140px] hidden md:block shadow-inner">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-bold text-gray-900">Form Builder</h3>
        <p className="text-xs text-gray-600 mt-1">Drag & drop to build</p>
      </div>

      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-3 text-sm">Field Types</h4>
        <div className="grid grid-cols-2 gap-2">
          {FIELD_TYPES.map((field) => {
            const IconComponent = field.icon;
            return (
              <button
                key={field.type}
                onClick={() => onAddField(field.type)}
                className="p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 bg-white shadow-sm hover:shadow-md text-center group"
              >
                <IconComponent className="w-4 h-4 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-semibold text-gray-900">{field.label}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}