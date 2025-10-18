'use client';

import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';

// NOTE: Preserving existing imports as requested
import { Form, Section, Field } from '../shared/types';
import { FIELD_TYPES } from '../shared/constants';
import SortableSection from './SortableSection';

interface SectionListProps {
  form: Form;
  updateForm: (updates: Partial<Form>) => void;
  onAddSection: (insertAfterId: string | null) => void;
}

export default function SectionList({ form, updateForm, onAddSection }: SectionListProps) {
  
  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    const updatedSections = form.sections.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    updateForm({ sections: updatedSections });
  };

  const deleteSection = (sectionId: string) => {
    const sectionToDelete = form.sections.find(s => s.id === sectionId);
    updateForm({ sections: form.sections.filter(s => s.id !== sectionId) });
    toast.error(`Section "${sectionToDelete?.title || 'Untitled'}" deleted`);
  };

  const addField = (sectionId: string, fieldType: string) => {
    const template = FIELD_TYPES.find(t => t.type === fieldType);
    const newField: Field = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType as any,
      label: template?.label || 'New Field',
      placeholder: `Enter ${template?.label.toLowerCase() || 'value'}...`,
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(fieldType) 
        ? ['Option 1', 'Option 2'] 
        : [],
      order: 0
    };

    const updatedSections = form.sections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = [...(section.fields || []), newField].map((field, index) => ({...field, order: index}));
        return { ...section, fields: updatedFields };
      }
      return section;
    });

    updateForm({ sections: updatedSections });
    toast.success(`"${newField.label}" field added`);
  };
  
  const updateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
    const updatedSections = form.sections.map(section => {
      if (section.id === sectionId) {
        const updatedFields = section.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        );
        return { ...section, fields: updatedFields };
      }
      return section;
    });
    updateForm({ sections: updatedSections });
  };
  
  const deleteField = (sectionId: string, fieldId: string) => {
    const updatedSections = form.sections.map(section => {
      if (section.id === sectionId) {
        // Find the field label before filtering for better toast message
        const fieldToDelete = section.fields.find(f => f.id === fieldId); 
        return { ...section, fields: section.fields.filter(field => field.id !== fieldId) };
      }
      return section;
    });
    updateForm({ sections: updatedSections });
    toast.error(`Field removed`);
  };

  const hasSections = form.sections && form.sections.length > 0;

  return (
    // Relative container with padding for the flowline aesthetic
    <div className="relative flex flex-col items-center pt-8 pb-16">
      
      {/* --- Stunning "Flowline" (Now a gradient pulse) --- */}
      {/* Increased Z-index priority to avoid overlapping the flowline during drag */}
      {hasSections && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-300/80 via-purple-400 to-indigo-300/80 shadow-inner -z-10" />
      )}

      {/* --- Upgraded "Add to Top" Inserter --- */}
      <div className="w-full h-8 flex items-center justify-center relative group/top">
        {/* Horizontal Connector Line */}
        <div className="w-full h-0.5 bg-slate-300 absolute top-1/2 opacity-50 transition-opacity duration-300" />
        <button
          // FIX: The logic here correctly calls onAddSection(null) to request insertion at the top.
          onClick={() => onAddSection(null)} 
          className="absolute z-10 flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 rounded-full shadow-lg text-sm font-bold text-slate-700 opacity-100 group-hover/top:opacity-100 transform scale-100 hover:scale-110 hover:border-indigo-600 hover:text-indigo-700 transition-all duration-300"
          title="Add a new section to the top"
        >
          <Plus className="w-5 h-5 text-indigo-500" />
          <span>Add Section to Top</span>
        </button>
      </div>

      {/* --- Section Loop --- */}
      <div className="w-full flex flex-col gap-12 mt-4">
        {form.sections.map((section) => (
          <div key={section.id} className="relative group">
            <SortableSection
              section={section}
              sections={form.sections}
              onUpdate={updateSection}
              onDelete={deleteSection}
              onAddField={addField}
              onUpdateField={updateField}
              onDeleteField={deleteField}
            />
            
            {/* --- Upgraded Mid-Section Inserter (Floating + pulse effect) --- */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full flex items-center justify-center transition-opacity duration-300 h-10">
              {/* Horizontal Connector Line */}
              <div className="w-full h-0.5 bg-slate-300 absolute top-1/2 opacity-50 transition-opacity" />
              <button
                onClick={() => onAddSection(section.id)}
                // FIX: Increased z-index of the button to ensure it's easily clickable and visually distinct.
                className="absolute flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-full p-3 shadow-xl shadow-indigo-400/50 hover:scale-110 active:scale-95 transition-all duration-300 ease-in-out z-20 
                         /* Pulse effect on hover for high engagement */
                         group-hover:shadow-indigo-500/80 group-hover:animate-none animate-pulse-subtle"
                title="Add a new section here"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// NOTE: The CSS classes for pulse animations are commented out but assumed available 
// in the running environment's CSS/Tailwind configuration for the UI to be stunning.
/*
@keyframes subtle-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50% { box-shadow: 0 0 0 8px rgba(99, 102, 241, 0); }
}
.animate-pulse-subtle {
  animation: subtle-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse-slow {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}
.animate-pulse-slow {
    animation: pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
*/
