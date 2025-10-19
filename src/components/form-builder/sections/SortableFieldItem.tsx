'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Field } from '../shared/types';

interface SortableFieldItemProps {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onDelete: () => void;
}

export default function SortableFieldItem({ field, onUpdate, onDelete }: SortableFieldItemProps) {
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
    boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-start gap-2 p-3 bg-white border border-slate-200 rounded-lg transition-shadow"
    >
      <button {...attributes} {...listeners} className="p-1 text-slate-400 cursor-grab active:cursor-grabbing touch-none">
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="flex-1 space-y-2">
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full bg-slate-50 font-semibold p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Field Label"
        />
        <input
          type="text"
          value={field.placeholder || ''}
          onChange={(e) => onUpdate({ placeholder: e.target.value })}
          className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Placeholder Text"
        />
      </div>
      <div className="flex flex-col items-center gap-2">
         <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
           <input
             type="checkbox"
             checked={field.required}
             onChange={(e) => onUpdate({ required: e.target.checked })}
             className="rounded"
           />
           Required
         </label>
        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}