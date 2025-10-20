import { useState } from 'react';
import { Trash2, Type, GripVertical } from 'lucide-react';
import { Section, Field } from './shared/types';
import { FormField } from './FormField';

interface FormSectionProps {
  section: Section;
  onUpdate: (sectionId: string, updates: Partial<Section>) => void;
  onDelete: (sectionId: string) => void;
  onAddField: (sectionId: string, fieldType: string) => void;
  onFieldUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onFieldDelete: (fieldId: string) => void;
  onAddNestedField: (fieldId: string, fieldType: string) => void;
  onEditConditional: (field: Field) => void;
  onFieldMoveUp?: (sectionId: string, fieldId: string) => void;
  onFieldMoveDown?: (sectionId: string, fieldId: string) => void;
  onFieldDragStart?: (sectionId: string, fieldId: string) => void;
  onFieldDragOver?: (e: React.DragEvent, sectionId: string, fieldId: string) => void;
  onFieldDrop?: (e: React.DragEvent, sectionId: string, fieldId: string) => void;
  draggedField?: { sectionId: string; fieldId: string } | null;
}

export const FormSection = ({
  section,
  onUpdate,
  onDelete,
  onAddField,
  onFieldUpdate,
  onFieldDelete,
  onAddNestedField,
  onEditConditional,
  onFieldMoveUp,
  onFieldMoveDown,
  onFieldDragStart,
  onFieldDragOver,
  onFieldDrop,
  draggedField
}: FormSectionProps) => {
  const [dragOverSection, setDragOverSection] = useState(false);

  // Field reordering functions
  const handleFieldMoveUp = (sectionId: string, fieldId: string) => {
    if (onFieldMoveUp) {
      onFieldMoveUp(sectionId, fieldId);
    } else {
      // Fallback implementation
      const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
      if (fieldIndex > 0) {
        const newFields = [...section.fields];
        [newFields[fieldIndex], newFields[fieldIndex - 1]] = [newFields[fieldIndex - 1], newFields[fieldIndex]];
        onUpdate(sectionId, { fields: newFields });
      }
    }
  };

  const handleFieldMoveDown = (sectionId: string, fieldId: string) => {
    if (onFieldMoveDown) {
      onFieldMoveDown(sectionId, fieldId);
    } else {
      // Fallback implementation
      const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
      if (fieldIndex < section.fields.length - 1) {
        const newFields = [...section.fields];
        [newFields[fieldIndex], newFields[fieldIndex + 1]] = [newFields[fieldIndex + 1], newFields[fieldIndex]];
        onUpdate(sectionId, { fields: newFields });
      }
    }
  };

  // Drag and drop handlers for fields
  const handleFieldDragStart = (sectionId: string, fieldId: string) => {
    if (onFieldDragStart) {
      onFieldDragStart(sectionId, fieldId);
    }
  };

  const handleFieldDragOver = (e: React.DragEvent, sectionId: string, fieldId: string) => {
    e.preventDefault();
    if (onFieldDragOver) {
      onFieldDragOver(e, sectionId, fieldId);
    }
  };

  const handleFieldDrop = (e: React.DragEvent, targetSectionId: string, targetFieldId: string) => {
    e.preventDefault();
    
    if (onFieldDrop) {
      onFieldDrop(e, targetSectionId, targetFieldId);
    } else if (draggedField) {
      // Fallback implementation for reordering within the same section
      const { sectionId: sourceSectionId, fieldId: sourceFieldId } = draggedField;
      
      if (sourceSectionId === targetSectionId) {
        const sourceIndex = section.fields.findIndex(f => f.id === sourceFieldId);
        const targetIndex = section.fields.findIndex(f => f.id === targetFieldId);
        
        if (sourceIndex !== -1 && targetIndex !== -1 && sourceIndex !== targetIndex) {
          const newFields = [...section.fields];
          const [movedField] = newFields.splice(sourceIndex, 1);
          newFields.splice(targetIndex, 0, movedField);
          onUpdate(targetSectionId, { fields: newFields });
        }
      }
    }
  };

  // Drag and drop handlers for the entire section (for dropping fields from other sections)
  const handleSectionDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSection(true);
  };

  const handleSectionDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSection(false);
  };

  const handleSectionDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSection(false);
    
    if (draggedField && draggedField.sectionId !== section.id) {
      // Move field from another section to this section (at the end)
      const sourceSectionId = draggedField.sectionId;
      const fieldId = draggedField.fieldId;
      
      // This would need to be handled by the parent component
      // since it involves multiple sections
      console.log(`Move field ${fieldId} from section ${sourceSectionId} to section ${section.id}`);
    }
  };

  return (
    <div 
      className={`bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-300 ${
        dragOverSection ? 'ring-2 ring-purple-400 bg-purple-50/50' : ''
      }`}
      onDragOver={handleSectionDragOver}
      onDragLeave={handleSectionDragLeave}
      onDrop={handleSectionDrop}
    >
      {/* Section Header */}
      <div className="bg-gradient-to-r from-gray-50 to-white p-6 border-b border-gray-200/50">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <GripVertical className="w-4 h-4" />
                {section.fields.length} field{section.fields.length !== 1 ? 's' : ''}
              </div>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                className="flex-1 bg-transparent border-none text-3xl font-bold text-gray-800 focus:outline-none focus:ring-0 placeholder-gray-400"
                placeholder="Section Title"
              />
            </div>
            <textarea
              value={section.description}
              onChange={(e) => onUpdate(section.id, { description: e.target.value })}
              className="w-full bg-white/50 border border-gray-300/50 rounded-xl text-gray-600 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 p-4 resize-none text-lg"
              placeholder="Section description (optional)"
              rows={2}
            />
          </div>
          <button
            onClick={() => onDelete(section.id)}
            className="ml-4 p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-700 transition-all duration-300 hover:scale-110"
            title="Delete Section"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Fields Container */}
      <div className="p-6 bg-gradient-to-br from-gray-50/50 to-white/30">
        <div className="space-y-4">
          {section.fields.map((field, index) => (
            <FormField
              key={field.id}
              field={field}
              sectionId={section.id}
              onUpdate={onFieldUpdate}
              onDelete={onFieldDelete}
              onAddNestedField={onAddNestedField}
              onEditConditional={onEditConditional}
              onFieldMoveUp={handleFieldMoveUp}
              onFieldMoveDown={handleFieldMoveDown}
              onFieldDragStart={handleFieldDragStart}
              onFieldDragOver={handleFieldDragOver}
              onFieldDrop={handleFieldDrop}
              draggedField={draggedField}
              isDraggable={true}
              fieldIndex={index}
              totalFields={section.fields.length}
            />
          ))}
          
          {section.fields.length === 0 && (
            <div className="text-center py-16 border-3 border-dashed border-gray-300/50 rounded-2xl bg-gradient-to-br from-white to-gray-50/50">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <Type className="w-10 h-10 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No fields yet
              </h3>
              <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                Start building your form by adding fields from the toolbox
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => onAddField(section.id, 'text')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Add Text Field
                </button>
                <button
                  onClick={() => onAddField(section.id, 'select')}
                  className="px-6 py-3 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300"
                >
                  Add Dropdown
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drag and Drop Hint */}
        {section.fields.length > 0 && (
          <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl">
            <p className="text-sm text-blue-700 text-center">
              💡 Drag fields to reorder • Use arrow buttons for precise control
            </p>
          </div>
        )}
      </div>
    </div>
  );
};