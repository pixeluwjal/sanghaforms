'use client';

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, ChevronDown, ChevronUp, Trash2, SlidersHorizontal, Plus,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { motion, AnimatePresence } from 'framer-motion';

import { Section, Field } from "../shared/types";
import { FIELD_TYPES } from "../shared/constants";
import ConditionalRules from "../conditional/ConditionalRules";
import SortableFieldItem from "./SortableFieldItem";

interface SortableSectionProps {
  section: Section;
  sections: Section[];
  onUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onDelete: (sectionId: string) => void;
  onAddField: (sectionId: string, fieldType: string) => void;
  onUpdateField: (sectionId: string, fieldId: string, updates: Partial<Field>) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  isDraggingSection: boolean;
}

export default function SortableSection({
  section, sections, onUpdate, onDelete, onAddField,
  onUpdateField, onDeleteField, isDraggingSection
}: SortableSectionProps) {
  const [localIsExpanded, setLocalIsExpanded] = useState(true);
  const [showConditional, setShowConditional] = useState(false);

  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging,
  } = useSortable({ id: section.id });

  const isExpanded = isDraggingSection ? false : localIsExpanded;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 300ms cubic-bezier(0.4, 0, 0.2, 1), opacity 200ms ease",
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 100 : 10,
  };

  const fieldSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleFieldDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = section.fields.findIndex((f) => f.id === active.id);
      const newIndex = section.fields.findIndex((f) => f.id === over.id);
      const reorderedFields = arrayMove(section.fields, oldIndex, newIndex);
      onUpdate(section.id, { fields: reorderedFields });
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white/90 backdrop-blur-sm rounded-2xl md:rounded-3xl border-2 transition-all duration-300 ${
        isDragging
          ? 'border-purple-500 shadow-2xl shadow-purple-500/30 scale-105'
          : 'border-gray-200/60 hover:border-purple-300 hover:shadow-xl shadow-lg'
      }`}
      whileHover={{ scale: isDragging ? 1.05 : 1.02 }}
      layout
    >
      {/* Section Header */}
      <div className="flex items-start sm:items-center gap-3 md:gap-4 p-4 md:p-6 border-b border-gray-200/60">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 mt-1 sm:mt-0 ${
            isDragging
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
              : 'bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600 hover:shadow-md'
          }`}
        >
          <GripVertical className="w-4 h-4 md:w-5 md:h-5" />
        </button>

        {/* Section Title & Info */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            className="font-bold text-xl sm:text-2xl bg-transparent border-none focus:outline-none focus:ring-0 w-full p-1 sm:p-2 text-gray-900 placeholder-gray-400 rounded-lg md:rounded-xl hover:bg-gray-50/50 focus:bg-purple-50/30 transition-colors"
            placeholder="Untitled Section"
          />
          <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-2">
            <span className="text-xs sm:text-sm text-gray-500 font-medium">
              {section.fields?.length || 0} {section.fields?.length === 1 ? 'field' : 'fields'}
            </span>
            {/* Removed "Contains required fields" tag */}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 md:gap-2 flex-shrink-0">
          <button
            onClick={() => setShowConditional(!showConditional)}
            className={`p-2 md:p-3 rounded-xl md:rounded-2xl transition-all duration-300 ${
              showConditional
                ? 'bg-purple-100 text-purple-700 shadow-md'
                : 'text-gray-500 hover:bg-purple-50 hover:text-purple-600 hover:shadow-md'
            }`}
            title="Conditional Logic"
          >
            <SlidersHorizontal className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          
          <button
            onClick={() => setLocalIsExpanded(p => !p)}
            className="p-2 md:p-3 text-gray-500 hover:bg-gray-100 hover:text-gray-700 rounded-xl md:rounded-2xl transition-all duration-300"
            title={localIsExpanded ? "Collapse" : "Expand"}
          >
            {localIsExpanded ? (
              <ChevronUp className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <ChevronDown className="w-4 h-4 md:w-5 md:h-5" />
            )}
          </button>
          
          <button
            onClick={() => onDelete(section.id)}
            className="p-2 md:p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl md:rounded-2xl transition-all duration-300"
            title="Delete Section"
          >
            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { 
                opacity: 1, 
                height: "auto",
                transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
              },
              collapsed: { 
                opacity: 0, 
                height: 0,
                transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
              }
            }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-6 space-y-4 md:space-y-6">
              {/* Fields List */}
              <DndContext 
                sensors={fieldSensors} 
                collisionDetection={closestCenter} 
                onDragEnd={handleFieldDragEnd}
              >
                <SortableContext items={(section.fields || []).map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <motion.div 
                    className="space-y-3 md:space-y-4"
                    layout
                  >
                    <AnimatePresence>
                      {(section.fields || []).map((field, index) => (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          layout
                        >
                          <SortableFieldItem
                            field={field}
                            onUpdate={(updates) => onUpdateField(section.id, field.id, updates)}
                            onDelete={() => onDeleteField(section.id, field.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </SortableContext>
              </DndContext>

              {/* Add Field Panel */}
              <motion.div 
                className="bg-gradient-to-br from-purple-50/80 to-indigo-50/80 rounded-xl md:rounded-2xl border-2 border-dashed border-purple-200/60 p-4 md:p-6"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                    <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base md:text-lg font-bold text-gray-900 truncate">Add New Field</h4>
                    <p className="text-xs md:text-sm text-gray-600 hidden xs:block">
                      Choose a field type to add to this section
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-3">
                  {FIELD_TYPES.map((field) => (
                    <motion.button
                      key={field.type}
                      onClick={() => onAddField(section.id, field.type)}
                      className="flex flex-col items-center gap-2 md:gap-3 p-2 md:p-4 bg-white rounded-xl md:rounded-2xl border-2 border-gray-200/60 shadow-sm hover:border-purple-300 hover:shadow-lg hover:bg-purple-50/30 transition-all duration-300 group min-h-[80px] md:min-h-[100px]"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title={`Add ${field.label}`}
                    >
                      <div className="w-8 h-8 md:w-12 md:h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl md:rounded-2xl flex items-center justify-center group-hover:from-purple-200 group-hover:to-indigo-200 transition-all duration-300 flex-shrink-0">
                        <field.icon className="w-4 h-4 md:w-6 md:h-6 text-purple-600" />
                      </div>
                      <span className="font-semibold text-xs md:text-sm text-gray-700 text-center leading-tight line-clamp-2">
                        {field.label}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Conditional Rules */}
              <AnimatePresence>
                {showConditional && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <ConditionalRules 
                      section={section} 
                      sections={sections} 
                      onUpdate={(updates) => onUpdate(section.id, updates)} 
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Overlay Effect */}
      {isDragging && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 rounded-2xl md:rounded-3xl pointer-events-none" />
      )}
    </motion.div>
  );
}