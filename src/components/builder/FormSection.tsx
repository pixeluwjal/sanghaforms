import { useState } from 'react';
import { Trash2, Type, GripVertical, ArrowUp, ArrowDown, Settings } from 'lucide-react';
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
  onEditSectionConditional: (section: Section) => void;
  onSectionMoveUp?: (sectionId: string) => void;
  onSectionMoveDown?: (sectionId: string) => void;
  onFieldMoveUp?: (sectionId: string, fieldId: string) => void;
  onFieldMoveDown?: (sectionId: string, fieldId: string) => void;
  sectionIndex?: number;
  totalSections?: number;
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
  onEditSectionConditional,
  onSectionMoveUp,
  onSectionMoveDown,
  onFieldMoveUp,
  onFieldMoveDown,
  sectionIndex = 0,
  totalSections = 1,
}: FormSectionProps) => {
  const [showPositionControls, setShowPositionControls] = useState(false);

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

  const handlePositionChange = (newPosition: number) => {
    if (newPosition >= 1 && newPosition <= totalSections) {
      // This will be handled by the parent component
      console.log(`Move section to position ${newPosition}`);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 border-b border-purple-200/50">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex-1 space-y-4">
            {/* Section Title and Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Position Indicator and Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-full border border-purple-200 shadow-sm">
                  <span className="text-sm font-bold text-purple-700">#{sectionIndex + 1}</span>
                  
                  {/* Section Move Buttons */}
                  <div className="flex items-center gap-1">
                    {onSectionMoveUp && sectionIndex > 0 && (
                      <button
                        onClick={() => onSectionMoveUp(section.id)}
                        className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded transition-all duration-200"
                        title="Move section up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>
                    )}
                    
                    {onSectionMoveDown && sectionIndex < totalSections - 1 && (
                      <button
                        onClick={() => onSectionMoveDown(section.id)}
                        className="p-1 text-purple-500 hover:text-purple-700 hover:bg-purple-100 rounded transition-all duration-200"
                        title="Move section down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Position Input */}
                <div className="relative">
                  <button
                    onClick={() => setShowPositionControls(!showPositionControls)}
                    className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Position</span>
                  </button>

                  {showPositionControls && (
                    <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-3 min-w-48">
                      <div className="flex items-center gap-2 mb-2">
                        <label className="text-sm font-medium text-gray-700">Set position:</label>
                        <input
                          type="number"
                          min="1"
                          max={totalSections}
                          defaultValue={sectionIndex + 1}
                          onChange={(e) => handlePositionChange(parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Enter position 1-{totalSections}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Title Input */}
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                className="flex-1 bg-transparent border-none text-2xl lg:text-3xl font-bold text-gray-800 focus:outline-none focus:ring-0 placeholder-gray-400 min-w-0"
                placeholder="Section Title"
              />
            </div>

            {/* Section Description */}
            <textarea
              value={section.description}
              onChange={(e) => onUpdate(section.id, { description: e.target.value })}
              className="w-full bg-white/70 border border-gray-300/50 rounded-xl text-gray-600 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500/20 p-4 resize-none text-base lg:text-lg"
              placeholder="Section description (optional)"
              rows={2}
            />

            {/* Section Stats and Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/80 px-3 py-1 rounded-full border border-gray-200">
                <Type className="w-4 h-4" />
                <span>{section.fields.length} field{section.fields.length !== 1 ? 's' : ''}</span>
              </div>

              {section.conditionalRules && section.conditionalRules.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full border border-orange-200">
                  <Settings className="w-3 h-3" />
                  <span>{section.conditionalRules.length} conditional rule{section.conditionalRules.length !== 1 ? 's' : ''}</span>
                </div>
              )}

              {/* Section Conditional Logic Button */}
              <button
                onClick={() => onEditSectionConditional(section)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm"
              >
                <Settings className="w-4 h-4" />
                Section Rules
              </button>
            </div>
          </div>

          {/* Delete Section Button */}
          <button
            onClick={() => onDelete(section.id)}
            className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-500 hover:text-red-700 transition-all duration-300 hover:scale-110 self-start lg:self-center"
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

        {/* Quick Add Fields */}
        {section.fields.length > 0 && (
          <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200/50">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Quick Add Fields
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {['text', 'email', 'number', 'select', 'radio', 'checkbox', 'date', 'file'].map((type) => (
                <button
                  key={type}
                  onClick={() => onAddField(section.id, type)}
                  className="p-3 bg-white border border-gray-200 rounded-xl text-gray-700 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 text-sm font-medium"
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};