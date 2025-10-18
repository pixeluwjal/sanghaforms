'use client';

import { X } from 'lucide-react';
import { QUICK_SECTIONS, FIELD_TYPES } from '../shared/constants';

interface MobileToolboxProps {
  onAddSection: (template: any) => void;
  onAddField: (fieldType: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileToolbox({ 
  onAddSection, 
  onAddField, 
  isOpen, 
  onClose 
}: MobileToolboxProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden animate-fade-in">
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto animate-slide-up">
        <div className="p-3 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900">Add Elements</h3>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-3 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Quick Sections</h4>
          <div className="space-y-2">
            {QUICK_SECTIONS.map((template, index) => (
              <button
                key={index}
                onClick={() => { onAddSection(template); onClose(); }}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 bg-white"
              >
                <div className="font-semibold text-gray-900 text-sm">{template.title}</div>
                <div className="text-xs text-gray-600 mt-1">{template.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Field Types</h4>
          <div className="grid grid-cols-3 gap-2">
            {FIELD_TYPES.map((field) => {
              const IconComponent = field.icon;
              return (
                <button
                  key={field.type}
                  onClick={() => { onAddField(field.type); onClose(); }}
                  className="flex flex-col items-center p-2 text-xs border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 bg-white"
                >
                  <IconComponent className="w-4 h-4 text-purple-600 mb-1" />
                  <span className="text-center font-medium">{field.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}