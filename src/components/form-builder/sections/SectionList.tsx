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
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers';

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
  const [isDragging, setIsDragging] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const dropAnimation = {
    ...defaultDropAnimation,
    dragSourceOpacity: 0.5,
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveSectionId(event.active.id as string);
    setIsDragging(true);
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSectionId(null);
    setIsDragging(false);

    if (over && active.id !== over.id) {
      const oldIndex = form.sections.findIndex((s) => s.id === active.id);
      const newIndex = form.sections.findIndex((s) => s.id === over.id);
      
      const updatedSections = arrayMove(form.sections, oldIndex, newIndex);
      updateForm({ sections: updatedSections });
      toast.success('Section reordered');
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

  const activeSection = activeSectionId ? form.sections.find(s => s.id === activeSectionId) : null;

  return (
    <div className="relative flex flex-col items-center pt-8 pb-16">
      {/* Animated Connection Line */}
      {form.sections.length > 0 && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-purple-300/60 via-purple-400/80 to-purple-300/60 -z-10" />
      )}

      {/* Top Add Section Button */}
      <div className="w-full h-8 flex items-center justify-center relative group/top mb-4">
        <button
          onClick={() => onAddSection(null)}
          className="absolute z-10 flex items-center gap-3 px-6 py-3 bg-white/90 backdrop-blur-sm border-2 border-purple-200 rounded-2xl shadow-lg shadow-purple-500/20 text-base font-semibold text-gray-700 transform hover:scale-105 hover:border-purple-500 hover:text-purple-700 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300"
          title="Add a new section to the top"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <Plus className="w-4 h-4 text-white" />
          </div>
          <span>Add First Section</span>
        </button>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
      >
        <SortableContext items={form.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
          <div className={`w-full flex flex-col gap-8 mt-4 transition-all duration-300 ${isDragging ? 'opacity-80' : 'opacity-100'}`}>
            {form.sections.map((section, index) => (
              <div key={section.id} className="relative group">
                {/* Section Connection Dots */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center justify-center">
                  <div className="w-4 h-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/40 border-2 border-white" />
                </div>
                
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
                
                {/* Bottom Add Section Button */}
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-full flex items-center justify-center h-8">
                  <button
                    onClick={() => onAddSection(section.id)}
                    className="absolute opacity-0 group-hover:opacity-100 flex-shrink-0 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-2xl p-4 shadow-2xl shadow-purple-500/50 hover:scale-110 active:scale-95 transition-all duration-300 z-20 transform hover:rotate-90"
                    title="Add a new section here"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SortableContext>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeSection ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl border-2 border-purple-500 shadow-2xl shadow-purple-500/30 p-6 transform rotate-3 opacity-90">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg truncate">
                    {activeSection.title || 'Untitled Section'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {activeSection.fields?.length || 0} fields
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {activeSection.fields?.slice(0, 3).map((field, index) => (
                  <div key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    {field.type}
                  </div>
                ))}
                {activeSection.fields && activeSection.fields.length > 3 && (
                  <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                    +{activeSection.fields.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Empty State */}
      {form.sections.length === 0 && (
        <div className="text-center py-16 animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Plus className="w-10 h-10 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Sections Yet</h3>
          <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Start building your form by adding your first section. Each section can contain multiple fields.
          </p>
          <button
            onClick={() => onAddSection(null)}
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create First Section
          </button>
        </div>
      )}

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        /* Smooth drag and drop transitions */
        .dnd-kit-drag-overlay {
          z-index: 999;
        }
        
        .dnd-kit-sortable-item {
          transition: transform 250ms ease;
        }
        
        .dnd-kit-dragging {
          opacity: 0.6;
          transform: scale(1.02);
        }
      `}</style>
    </div>
  );
}