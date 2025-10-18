'use client';

import { useState, useEffect, useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronUp, Trash2, Plus, Type, SlidersHorizontal, CheckSquare, FileText, List } from 'lucide-react'; // Added necessary icons

// NOTE: Imports preserved. Assuming FIELD_TYPES is now correctly color-coded
import { Section, Field } from '../shared/types';
import { FIELD_TYPES } from '../shared/constants';
import ConditionalRules from '../conditional/ConditionalRules';
import FieldItem from '../fields/FieldItem';

interface SortableSectionProps {
  section: Section;
  sections: Section[];
  onUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onDelete: (sectionId: string) => void;
  onAddField: (sectionId: string, fieldType: string) => void;
  onUpdateField: (sectionId: string, fieldId: string, updates: Partial<Field>) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  
  // NEW PROP: Global flag indicating if any section is being dragged
  isDraggingSection: boolean; 
}

export default function SortableSection({
  section,
  sections,
  onUpdate,
  onDelete,
  onAddField,
  onUpdateField,
  onDeleteField,
  isDraggingSection, // Receive new prop
}: SortableSectionProps) {
  // Local state to track expansion, allowing the user to override global minimization when necessary
  const hasContent = (section.fields?.length > 0 || section.conditionalRules?.length > 0);
  const [localIsExpanded, setLocalIsExpanded] = useState(hasContent);
  const [showConditional, setShowConditional] = useState(section.conditionalRules?.length > 0);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  // Determine the effective expanded state:
  // If we are globally dragging, the section is only expanded if it's the one being dragged.
  // Otherwise, use the local state.
  const isExpanded = isDraggingSection ? isDragging : localIsExpanded;


  const style = {
    transform: CSS.Transform.toString(transform),
    // Optimized transition for drag smoothness
    transition: transition ? `${transition}, box-shadow 200ms ease, opacity 200ms ease` : 'transform 200ms ease, box-shadow 200ms ease, opacity 200ms ease',
    opacity: isDragging ? 0.95 : 1,
    boxShadow: isDragging 
      ? '0 25px 50px rgba(78, 59, 150, 0.4), 0 5px 15px rgba(0, 0, 0, 0.15)' 
      : '0 8px 12px -5px rgb(0 0 0 / 0.1)',
    zIndex: isDragging ? 200 : 10,
  };

  const updateSection = (updates: Partial<Section>) => {
    onUpdate(section.id, updates);
  };
  
  // Custom click handler for expansion, since DND consumes the default onClick
  const handleToggleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setLocalIsExpanded(prev => !prev);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="bg-white/95 backdrop-blur-xl rounded-2xl border-2 border-slate-200/80 transition-all duration-300 group/section hover:shadow-xl hover:border-indigo-500/80"
    >
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 opacity-0 group-hover/section:opacity-10 transition-opacity duration-500 -z-10" />

        {/* --- Header: Primary Control Bar --- */}
        <div className="flex items-start gap-2 p-3 sm:p-4 border-b border-slate-100/80 group-hover/section:border-indigo-200 transition-colors">
          
          {/* Drag Handle (Optimized for DND) */}
          <button 
            {...attributes}
            {...listeners} // DND kit handles pointer/click events for drag start here
            className={`p-3 text-slate-400 ${isDragging ? 'text-indigo-800' : 'hover:text-indigo-600'} cursor-grab active:cursor-grabbing transition-all rounded-xl hover:bg-indigo-50/70 flex-shrink-0 transform active:scale-95`}
            title="Drag to reorder section"
          >
            <GripVertical className="w-6 h-6" />
          </button>
          
          <div className="flex-1 min-w-0 pt-1">
            <input
              type="text"
              value={section.title}
              onChange={(e) => updateSection({ title: e.target.value })}
              className="font-extrabold text-2xl bg-transparent border-none focus:outline-none focus:ring-4 focus:ring-indigo-200 focus:bg-white/90 rounded-lg w-full p-2 -ml-2 text-slate-900 placeholder-slate-400 transition-all"
              placeholder="Untitled Section"
            />
             <textarea
                value={section.description} 
                onChange={(e) => updateSection({ description: e.target.value })}
                placeholder="Add a section description (optional)..."
                rows={1}
                className="text-base text-slate-600 w-full bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:bg-white/90 rounded-lg p-2 -ml-2 resize-none transition-all" 
              />
          </div>

          {/* Action Buttons Group */}
          <div className="flex items-center gap-1 flex-shrink-0 ml-2 pt-2">
            
            <button
              onClick={() => setShowConditional(!showConditional)}
              disabled={isDraggingSection} // Disable interaction while dragging
              className={`p-3 rounded-xl transition-all duration-300 transform hover:scale-110 ${showConditional ? 'bg-purple-600 text-white shadow-lg shadow-purple-300/50' : 'text-slate-500 hover:text-purple-600 hover:bg-purple-50'} disabled:opacity-50`}
              title="Conditional Logic"
            >
              <SlidersHorizontal className="w-5 h-5" />
            </button>
            
            {/* Expand/Collapse Button (Uses local state) */}
            <button
              onClick={handleToggleExpand} 
              disabled={isDraggingSection && !isDragging} // Disable interaction while dragging other sections
              className={`p-3 text-slate-500 hover:text-indigo-600 transition-colors duration-200 hover:bg-indigo-50 rounded-xl transform hover:scale-110 disabled:opacity-50`}
              title={isExpanded ? 'Collapse Section' : 'Expand Section'}
            >
              {localIsExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
            
            <button
              onClick={() => onDelete(section.id)}
              disabled={isDraggingSection} // Disable interaction while dragging
              className="p-3 text-white rounded-xl bg-red-500 hover:bg-red-600 transition-colors duration-200 shadow-md shadow-red-300/50 transform hover:scale-110 disabled:opacity-50"
              title="Delete Section"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* --- Section Body (Conditional Display) --- */}
      <div 
        className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="p-5 space-y-8">
            
            {/* Fields List */}
            <div className="space-y-4">
              {!section.fields || section.fields.length === 0 ? (
                <div className="text-center py-12 px-4 border-4 border-dashed border-indigo-100 rounded-2xl bg-indigo-50/50 shadow-inner">
                  <div className="inline-flex items-center justify-center p-4 bg-white rounded-full border-4 border-white shadow-xl">
                    <div className="w-4 h-4 bg-indigo-500 rounded-full shadow-md animate-bounce" />
                  </div>
                  <h4 className="mt-6 text-xl font-bold text-slate-700">Section is Empty</h4>
                  <p className="text-sm text-slate-500">Add a new field using the palette below.</p>
                </div>
              ) : (
                section.fields.map((field) => (
                  <FieldItem
                    key={field.id}
                    field={field}
                    onUpdate={(updates) => onUpdateField(section.id, field.id, updates)}
                    onDelete={() => onDeleteField(section.id, field.id)}
                  />
                ))
              )}
            </div>

            {/* Stunning "Add Field" Palette (Rendered only if expanded) */}
            {isExpanded && (
                <div className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/80 shadow-lg">
                  <h4 className="text-base font-extrabold text-indigo-800 mb-4 tracking-wider">ADD A NEW FIELD</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {FIELD_TYPES.map((field) => {
                      const IconComponent = field.icon;
                      const iconColor = field.color || 'slate'; // Fallback color
                      return (
                        <button
                          key={field.type}
                          onClick={() => onAddField(section.id, field.type)}
                          className="text-center p-4 border-2 border-slate-200 rounded-xl bg-white hover:border-indigo-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group shadow-md"
                          title={`Add a ${field.label} field`}
                        >
                          <div className={`w-12 h-12 mx-auto bg-gradient-to-br from-${iconColor}-100 to-${iconColor}-200 rounded-lg flex items-center justify-center mb-3 group-hover:from-${iconColor}-500 group-hover:to-${iconColor}-600 group-hover:scale-105 transition-all duration-300 shadow-lg`}>
                            <IconComponent className={`w-6 h-6 text-${iconColor}-600 group-hover:text-white transition-colors duration-300`} />
                          </div>
                          <span className="font-bold text-sm text-slate-800 group-hover:text-indigo-800">
                            {field.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
            )}

            {/* Collapsible Conditional Logic Section (Themed) */}
            <div className="pt-4 border-t border-slate-200/80">
              <button 
                onClick={() => setShowConditional(!showConditional)} 
                disabled={isDraggingSection} // Disable interaction while dragging
                className="flex items-center justify-between w-full text-left font-bold text-lg text-slate-700 hover:text-indigo-700 transition-colors p-3 rounded-lg hover:bg-indigo-50/50 disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-purple-600" />
                  Conditional Logic
                </span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${showConditional ? 'rotate-180 text-purple-600' : ''}`} />
              </button>
              
              <div className={`transition-all duration-500 ease-in-out grid ${showConditional ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                  <ConditionalRules
                    section={section}
                    sections={sections}
                    onUpdate={updateSection}
                  />
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}
