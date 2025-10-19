'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown, ChevronUp, Type, FileText, List, Eye, CheckSquare } from 'lucide-react';
import { Field } from '../shared/types';
import FieldPreview from '../fields/FieldPreview';
import { useState } from 'react';

interface SortableFieldItemProps {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onDelete: () => void;
}

export default function SortableFieldItem({ field, onUpdate, onDelete }: SortableFieldItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || 'transform 200ms ease',
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-2 border-slate-200 rounded-2xl transition-all duration-300 bg-white shadow-lg hover:shadow-xl hover:border-indigo-400/60 transform hover:-translate-y-0.5 group/field"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg text-slate-800 truncate">
              {field.label || 'Untitled Field'}
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full capitalize font-medium">
                {field.type}
              </span>
              {field.required && (
                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                  Required
                </span>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              {...attributes}
              {...listeners}
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors duration-200 hover:bg-indigo-50 rounded-lg cursor-grab active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-500 hover:text-indigo-600 transition-colors duration-200 hover:bg-indigo-50 rounded-lg"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <button
              onClick={onDelete}
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title="Delete Field"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
            {/* Basic Field Configuration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Field Label */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Type className="w-4 h-4 text-indigo-600" />
                  Field Label
                </label>
                <input
                  type="text"
                  value={field.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-sm transition-all duration-200"
                  placeholder="Enter field label"
                />
              </div>

              {/* Placeholder */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={field.placeholder || ''}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-sm transition-all duration-200"
                  placeholder="Enter placeholder text"
                />
              </div>
            </div>

            {/* Options for Select, Radio, Checkbox */}
            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <List className="w-4 h-4 text-indigo-600" />
                  Options (one per line)
                </label>
                <textarea
                  value={field.options?.join('\n') || ''}
                  onChange={(e) => onUpdate({ 
                    options: e.target.value.split('\n')
                      .map(opt => opt.trim())
                      .filter(opt => opt.length > 0)
                  })}
                  rows={4}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 text-sm transition-all duration-200 resize-vertical"
                  placeholder="Option 1&#10;Option 2&#10;Option 3"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Enter each option on a new line. Users will see these as choices.
                </p>
              </div>
            )}

            {/* Required Toggle */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => onUpdate({ required: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                id={`required-${field.id}`}
              />
              <label 
                htmlFor={`required-${field.id}`}
                className="text-sm font-medium text-slate-700 cursor-pointer"
              >
                This field is required
              </label>
            </div>

            {/* Preview */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-indigo-600" />
                Preview
              </label>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                <FieldPreview field={field} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}