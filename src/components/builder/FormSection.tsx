import { useState } from 'react';
import { Trash2, Type, GripVertical, ArrowUp, ArrowDown, Settings, ChevronDown, Eye } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);
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
    <div className="bg-white rounded-2xl border-2 border-purple-200 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      {/* Section Header */}
      <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 sm:p-6 border-b border-purple-200">
        <div className="flex flex-col gap-4">
          {/* Top Row: Position, Controls, and Title */}
          <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-3">
            {/* Left Side: Position and Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Position Indicator */}
              <div className="flex items-center gap-1 bg-white px-2 sm:px-3 py-1 rounded-full border-2 border-purple-300 shadow-sm">
                <span className="text-xs sm:text-sm font-bold text-purple-700">#{sectionIndex + 1}</span>
                
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

              {/* Expand/Collapse Button */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 bg-white border-2 border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
                title={isExpanded ? "Collapse settings" : "Expand settings"}
              >
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Position Input */}
              <div className="relative">
                <button
                  onClick={() => setShowPositionControls(!showPositionControls)}
                  className="flex items-center gap-1 px-2 sm:px-3 py-1 bg-white border-2 border-purple-300 rounded-lg text-xs sm:text-sm text-purple-600 hover:bg-purple-50 transition-colors"
                >
                  <Settings className="w-3 h-3" />
                  <span className="hidden xs:inline">Position</span>
                </button>

                {showPositionControls && (
                  <div className="absolute top-full left-0 mt-2 bg-white border-2 border-purple-300 rounded-lg shadow-lg z-10 p-3 min-w-48">
                    <div className="flex items-center gap-2 mb-2">
                      <label className="text-sm font-medium text-black">Set position:</label>
                      <input
                        type="number"
                        min="1"
                        max={totalSections}
                        defaultValue={sectionIndex + 1}
                        onChange={(e) => handlePositionChange(parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border-2 border-purple-300 rounded text-sm text-black"
                      />
                    </div>
                    <p className="text-xs text-gray-600">Enter position 1-{totalSections}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Delete Section Button */}
            <button
              onClick={() => onDelete(section.id)}
              className="p-2 sm:p-3 bg-red-100 hover:bg-red-200 rounded-xl text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110 border-2 border-red-300 self-start"
              title="Delete Section"
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          {/* Section Title Input */}
          <input
            type="text"
            value={section.title}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            className="w-full bg-transparent border-none text-xl sm:text-2xl lg:text-3xl font-bold text-black focus:outline-none focus:ring-0 placeholder-gray-500 min-w-0"
            placeholder="Section Title"
          />

          {/* Section Description */}
          <textarea
            value={section.description}
            onChange={(e) => onUpdate(section.id, { description: e.target.value })}
            className="w-full bg-white border-2 border-purple-300 rounded-xl text-black focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 p-3 sm:p-4 resize-none text-sm sm:text-base lg:text-lg"
            placeholder="Section description (optional)"
            rows={2}
          />

          {/* Section Stats and Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-black bg-white px-2 sm:px-3 py-1 rounded-full border-2 border-purple-300">
              <Type className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              <span>{section.fields.length} field{section.fields.length !== 1 ? 's' : ''}</span>
            </div>

            {section.conditionalRules && section.conditionalRules.length > 0 && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 text-xs sm:text-sm rounded-full border-2 border-purple-300">
                <Settings className="w-3 h-3" />
                <span>{section.conditionalRules.length} rule{section.conditionalRules.length !== 1 ? 's' : ''}</span>
              </div>
            )}

            {/* Section Default Value Badge */}
            {section.defaultValue && (
              <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-green-100 text-green-700 text-xs sm:text-sm rounded-full border-2 border-green-300">
                <span className="hidden sm:inline">Default: {section.defaultValue}</span>
                <span className="sm:hidden">Def: {section.defaultValue}</span>
              </div>
            )}

            {/* Section Conditional Logic Button */}
            <button
              onClick={() => onEditSectionConditional(section)}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-xs sm:text-sm"
            >
              <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Section Rules</span>
              <span className="xs:hidden">Rules</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section Configuration Panel */}
      {isExpanded && (
        <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-white border-b border-purple-200">
          <h3 className="text-lg font-semibold text-black mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Section Configuration
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Section Title */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Section Title
              </label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => onUpdate(section.id, { title: e.target.value })}
                className="w-full border-2 border-purple-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-base sm:text-lg font-bold text-black"
                placeholder="Section title"
              />
            </div>

            {/* Section Default Value */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Section Default Value
              </label>
              <input
                type="text"
                value={section.defaultValue || ''}
                onChange={(e) => onUpdate(section.id, { defaultValue: e.target.value })}
                className="w-full border-2 border-purple-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                placeholder="Default value for this section"
              />
              <p className="text-xs text-gray-600 mt-2">
                This value can be used for conditional logic or pre-filling section data
              </p>
            </div>

            {/* Section Description */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-semibold text-black mb-2">
                Section Description
              </label>
              <textarea
                value={section.description}
                onChange={(e) => onUpdate(section.id, { description: e.target.value })}
                className="w-full border-2 border-purple-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none text-black"
                placeholder="Section description (optional)"
                rows={3}
              />
            </div>
          </div>

          {/* Quick Default Value Options */}
          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-purple-50 rounded-xl border-2 border-purple-300">
            <label className="block text-sm font-semibold text-purple-700 mb-3">
              Quick Default Values
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {[
                "personal_info",
                "contact_details", 
                "sangha_info",
                "preferences",
                "additional_info",
                "basic_info",
                "education",
                "employment",
                "family_info",
                "medical_info",
                "emergency_contact",
                "custom_section"
              ].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onUpdate(section.id, { defaultValue: option })}
                  className={`px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg border-2 transition-all duration-200 ${
                    section.defaultValue === option
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-black border-purple-300 hover:bg-purple-50 hover:border-purple-400'
                  }`}
                >
                  <span className="hidden sm:inline">{option.replace(/_/g, ' ')}</span>
                  <span className="sm:hidden">{option.split('_')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional Logic Button */}
          <div className="mt-4 sm:mt-6 flex justify-center">
            <button
              onClick={() => onEditSectionConditional(section)}
              className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold text-sm sm:text-base"
            >
              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
              Configure Section Conditional Logic
            </button>
          </div>
        </div>
      )}

      {/* Fields Container */}
      <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-white">
        <div className="space-y-3 sm:space-y-4">
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
            <div className="text-center py-8 sm:py-16 border-3 border-dashed border-purple-300 rounded-2xl bg-gradient-to-br from-white to-purple-50">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-inner">
                <Type className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">
                No fields yet
              </h3>
              <p className="text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto text-sm sm:text-base">
                Start building your form by adding fields from the toolbox
              </p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={() => onAddField(section.id, 'text')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                >
                  Add Text Field
                </button>
                <button
                  onClick={() => onAddField(section.id, 'select')}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-white border-2 border-purple-300 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all duration-300 text-sm sm:text-base"
                >
                  Add Dropdown
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Fields */}
        {section.fields.length > 0 && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-purple-50 to-purple-100 rounded-2xl border-2 border-purple-300">
            <h4 className="text-base sm:text-lg font-semibold text-black mb-3 sm:mb-4 text-center">
              Quick Add Fields
            </h4>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
              {['text', 'email', 'number', 'select', 'radio', 'checkbox', 'date', 'file'].map((type) => (
                <button
                  key={type}
                  onClick={() => onAddField(section.id, type)}
                  className="p-2 sm:p-3 bg-white border-2 border-purple-300 rounded-xl text-black hover:border-purple-400 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300 text-xs sm:text-sm font-medium"
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