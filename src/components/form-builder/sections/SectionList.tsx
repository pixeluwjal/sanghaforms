'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';

import { Form, Section, Field } from '../shared/types';
import { FIELD_TYPES } from '../shared/constants';
import SortableSection from './SortableSection';

interface SectionListProps {
  form: Form;
  updateForm: (updates: Partial<Form>) => void;
  onAddSection: (insertAfterId: string | null) => void;
}

export default function SectionList({ form, updateForm, onAddSection }: SectionListProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10, // User must drag 10px before a drag starts
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveSectionId(event.active.id as string);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveSectionId(null); // Reset on drag end
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = form.sections.findIndex((s) => s.id === active.id);
      const newIndex = form.sections.findIndex((s) => s.id === over.id);
      
      const updatedSections = arrayMove(form.sections, oldIndex, newIndex);
      updateForm({ sections: updatedSections });
    }
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    const updatedSections = form.sections.map((section) =>
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
    const template = FIELD_TYPES.find((t) => t.type === fieldType);
    const newField: Field = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: fieldType as any,
      label: template?.label || 'New Field',
      placeholder: `Enter ${template?.label.toLowerCase() || 'value'}...`,
      required: false,
      options: ['select', 'radio', 'checkbox'].includes(fieldType) ? ['Option 1', 'Option 2'] : [],
      order: 0,
    };
    const updatedSections = form.sections.map((s) => {
      if (s.id === sectionId) {
        return { ...s, fields: [...(s.fields || []), newField] };
      }
      return s;
    });
    updateForm({ sections: updatedSections });
    toast.success(`"${newField.label}" field added`);
  };

  const updateField = (sectionId: string, fieldId: string, updates: Partial<Field>) => {
    const updatedSections = form.sections.map(s => {
      if (s.id === sectionId) {
        const updatedFields = s.fields.map(f => f.id === fieldId ? { ...f, ...updates } : f);
        return { ...s, fields: updatedFields };
      }
      return s;
    });
    updateForm({ sections: updatedSections });
  };
  
  const deleteField = (sectionId: string, fieldId: string) => {
    const updatedSections = form.sections.map(s => {
      if (s.id === sectionId) {
        return { ...s, fields: s.fields.filter(f => f.id !== fieldId) };
      }
      return s;
    });
    updateForm({ sections: updatedSections });
    toast.error(`Field removed`);
  };

  return (
    <div className="relative flex flex-col items-center pt-8 pb-16">
      {form.sections.length > 0 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-indigo-300/80 via-purple-400 to-indigo-300/80 -z-10" />
      )}

      <div className="w-full h-8 flex items-center justify-center relative group/top mb-4">
        <button
          onClick={() => onAddSection(null)}
          className="absolute z-10 flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-300 rounded-full shadow-lg text-sm font-bold text-slate-700 transform hover:scale-110 hover:border-indigo-600 hover:text-indigo-700 transition-all duration-300"
          title="Add a new section to the top"
        >
          <Plus className="w-5 h-5 text-indigo-500" />
          <span>Add Section</span>
        </button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={form.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
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
                  isDraggingSection={!!activeSectionId}
                />
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full flex items-center justify-center h-10">
                  <button
                    onClick={() => onAddSection(section.id)}
                    className="absolute opacity-0 group-hover:opacity-100 flex-shrink-0 bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-full p-3 shadow-xl shadow-indigo-400/50 hover:scale-110 active:scale-95 transition-all duration-300 z-20"
                    title="Add a new section here"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}