'use client';

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical, ChevronDown, ChevronUp, Trash2, SlidersHorizontal,
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

  // ✨ THE FIX: If any section is dragging, this card is NOT expanded.
  const isExpanded = isDraggingSection ? false : localIsExpanded;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || "transform 200ms ease, box-shadow 300ms ease",
    opacity: isDragging ? 0.95 : 1,
    boxShadow: isDragging
      ? "0 25px 50px -12px rgba(0, 0, 0, 0.3)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    zIndex: isDragging ? 100 : 10,
  };

  const fieldSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
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
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl border border-slate-200/80 transition-shadow">
      <div className="flex items-center gap-2 p-3 border-b border-slate-200">
        <button {...attributes} {...listeners} className="p-2 text-slate-400 cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition-colors touch-none">
          <GripVertical className="w-6 h-6" />
        </button>
        <div className="flex-1 min-w-0">
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            className="font-bold text-xl bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-indigo-300 rounded w-full p-1 text-slate-800"
            placeholder="Untitled Section"
          />
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setShowConditional(!showConditional)} className={`p-2 rounded-lg transition-all ${showConditional ? 'bg-purple-100 text-purple-700' : 'text-slate-500 hover:bg-slate-100'}`} title="Conditional Logic">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <button onClick={() => setLocalIsExpanded(p => !p)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg" title={localIsExpanded ? "Collapse" : "Expand"}>
            {localIsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
          <button onClick={() => onDelete(section.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg" title="Delete Section">
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <DndContext sensors={fieldSensors} collisionDetection={closestCenter} onDragEnd={handleFieldDragEnd}>
                <SortableContext items={(section.fields || []).map(f => f.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-3">
                    {(section.fields || []).map((field) => (
                      <SortableFieldItem
                        key={field.id}
                        field={field}
                        onUpdate={(updates) => onUpdateField(section.id, field.id, updates)}
                        onDelete={() => onDeleteField(section.id, field.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-200">
                <h4 className="text-sm font-bold text-slate-600 mb-2">ADD FIELD</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {FIELD_TYPES.map((field) => (
                    <button
                      key={field.type}
                      onClick={() => onAddField(section.id, field.type)}
                      className="flex items-center gap-2 p-2 border border-slate-200 rounded-md bg-white shadow-sm hover:bg-indigo-50 hover:border-indigo-300 transition-all text-left"
                      title={`Add ${field.label}`}
                    >
                      <field.icon className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      <span className="font-semibold text-sm text-slate-700">{field.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence>
                {showConditional && (
                   <motion.div initial={{ opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                     <ConditionalRules section={section} sections={sections} onUpdate={(updates) => onUpdate(section.id, updates)} />
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}