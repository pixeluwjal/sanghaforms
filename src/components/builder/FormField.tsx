// components/builder/FormField.tsx
import { useState } from "react";
import {
  Trash2,
  Plus,
  Eye,
  ChevronDown,
  Type,
  Mail,
  Hash,
  FileText,
  List,
  Circle,
  Square,
  Calendar,
  Upload,
  MessageCircle,
  Users,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Field } from "./shared/types";

interface FormFieldProps {
  field: Field;
  sectionId: string;
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
  onDelete: (fieldId: string) => void;
  onAddNestedField: (fieldId: string, fieldType: string) => void;
  onEditConditional: (field: Field) => void;
  onFieldMoveUp?: (sectionId: string, fieldId: string) => void;
  onFieldMoveDown?: (sectionId: string, fieldId: string) => void;
  onFieldDragStart?: (sectionId: string, fieldId: string) => void;
  onFieldDragOver?: (e: React.DragEvent, sectionId: string, fieldId: string) => void;
  onFieldDrop?: (e: React.DragEvent, sectionId: string, fieldId: string) => void;
  draggedField?: { sectionId: string; fieldId: string } | null;
  isDraggable?: boolean;
  fieldIndex?: number;
  totalFields?: number;
}

const FIELD_TYPES = [
  { type: "text", label: "Text Input", icon: Type, color: "blue" },
  { type: "email", label: "Email", icon: Mail, color: "green" },
  { type: "number", label: "Number", icon: Hash, color: "purple" },
  { type: "textarea", label: "Text Area", icon: FileText, color: "indigo" },
  { type: "select", label: "Dropdown", icon: List, color: "orange" },
  { type: "radio", label: "Radio Group", icon: Circle, color: "pink" },
  { type: "checkbox", label: "Checkboxes", icon: Square, color: "red" },
  { type: "date", label: "Date Picker", icon: Calendar, color: "teal" },
  { type: "file", label: "File Upload", icon: Upload, color: "amber" },
  {
    type: "whatsapp_optin",
    label: "WhatsApp Opt-in",
    icon: MessageCircle,
    color: "emerald",
  },
  { 
    type: 'readonly_text', 
    label: 'Read-only Text', 
    icon: Type, 
    color: 'gray', 
  },
  { 
    type: 'source',
    label: 'Source',
    icon: Users, 
    color: 'indigo', 
  },
  { type: "arratai_optin", label: "Arratai Opt-in", icon: Users, color: "sky" },
];

const colorConfig = {
  blue: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-600",
    badge: "bg-blue-500",
  },
  green: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-600",
    badge: "bg-green-500",
  },
  purple: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    text: "text-purple-600",
    badge: "bg-purple-500",
  },
  indigo: {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-600",
    badge: "bg-indigo-500",
  },
  orange: {
    bg: "bg-orange-50",
    border: "border-orange-200",
    text: "text-orange-600",
    badge: "bg-orange-500",
  },
  pink: {
    bg: "bg-pink-50",
    border: "border-pink-200",
    text: "text-pink-600",
    badge: "bg-pink-500",
  },
  red: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-600",
    badge: "bg-red-500",
  },
  teal: {
    bg: "bg-teal-50",
    border: "border-teal-200",
    text: "text-teal-600",
    badge: "bg-teal-500",
  },
  amber: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    text: "text-amber-600",
    badge: "bg-amber-500",
  },
  emerald: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    text: "text-emerald-600",
    badge: "bg-emerald-500",
  },
  sky: {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-600",
    badge: "bg-sky-500",
  },
  gray: {
    bg: "bg-gray-50",
    border: "border-gray-200",
    text: "text-gray-600",
    badge: "bg-gray-500",
  },
};

export const FormField = ({
  field,
  sectionId,
  onUpdate,
  onDelete,
  onAddNestedField,
  onEditConditional,
  onFieldMoveUp,
  onFieldMoveDown,
  onFieldDragStart,
  onFieldDragOver,
  onFieldDrop,
  draggedField,
  isDraggable = true,
  fieldIndex = 0,
  totalFields = 1,
}: FormFieldProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const fieldConfig = FIELD_TYPES.find((f) => f.type === field.type);
  const color = fieldConfig
    ? colorConfig[fieldConfig.color as keyof typeof colorConfig]
    : colorConfig.blue;
  const IconComponent = fieldConfig ? fieldConfig.icon : Type;

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent) => {
    if (onFieldDragStart && isDraggable) {
      onFieldDragStart(sectionId, field.id);
      e.dataTransfer.setData("text/plain", `${sectionId}:${field.id}`);
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (onFieldDragOver && isDraggable) {
      onFieldDragOver(e, sectionId, field.id);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (onFieldDrop && isDraggable) {
      onFieldDrop(e, sectionId, field.id);
    }
  };

  const isBeingDragged = draggedField?.sectionId === sectionId && draggedField?.fieldId === field.id;

  return (
    <div 
      className={`bg-white rounded-xl border-2 transition-all duration-300 overflow-hidden ${
        isBeingDragged 
          ? 'opacity-50 scale-95 border-purple-400 shadow-lg' 
          : 'border-gray-200/50 shadow-sm hover:shadow-md'
      } ${
        draggedField && !isBeingDragged ? 'hover:border-purple-300' : ''
      }`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Field Header */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Drag Handle */}
            {isDraggable && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all duration-200 cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={handleDragStart}
                  title="Drag to reorder"
                >
                  <GripVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
                
                {/* Move Up/Down Buttons */}
                <div className="flex flex-col gap-1">
                  {onFieldMoveUp && fieldIndex > 0 && (
                    <button
                      onClick={() => onFieldMoveUp(sectionId, field.id)}
                      className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                      title="Move up"
                    >
                      <ArrowUp className="w-2 h-2 sm:w-3 sm:h-3" />
                    </button>
                  )}
                  
                  {onFieldMoveDown && fieldIndex < totalFields - 1 && (
                    <button
                      onClick={() => onFieldMoveDown(sectionId, field.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                      title="Move down"
                    >
                      <ArrowDown className="w-2 h-2 sm:w-3 sm:h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Field Type Badge */}
            <div
              className={`flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl ${color.bg} ${color.border} border-2 flex-shrink-0`}
            >
              <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${color.text}`} />
              <span className="font-semibold text-gray-700 capitalize text-xs sm:text-sm hidden xs:inline">
                {field.type}
              </span>
            </div>

            {/* Field Label Input */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                className="w-full bg-transparent border-none text-base sm:text-xl font-bold text-gray-800 focus:outline-none focus:ring-0 placeholder-gray-400 truncate"
                placeholder="Field label"
              />
            </div>

            {/* Field Position Indicator */}
            {isDraggable && (
              <div className="flex items-center gap-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium flex-shrink-0">
                <span>#{fieldIndex + 1}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 sm:p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-300 hover:scale-110"
            >
              <ChevronDown
                className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-600 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              onClick={() => onEditConditional(field)}
              className="p-2 sm:p-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 hover:text-blue-700 transition-all duration-300 hover:scale-110"
              title="Conditional Logic"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={() => onDelete(field.id)}
              className="p-2 sm:p-3 bg-red-50 hover:bg-red-100 rounded-xl text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110"
              title="Delete Field"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Required Toggle and Status */}
        <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 flex-wrap">
          <label className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                onUpdate(field.id, { required: e.target.checked })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 scale-110 sm:scale-125"
            />
            Required
          </label>

          {field.conditionalRules && field.conditionalRules.length > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
              <Eye className="w-2 h-2 sm:w-3 sm:h-3" />
              {field.conditionalRules.length} rule
              {field.conditionalRules.length !== 1 ? "s" : ""}
            </div>
          )}

          {/* Drag Hint */}
          {isDraggable && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              <GripVertical className="w-2 h-2 sm:w-3 sm:h-3" />
              Drag to reorder
            </div>
          )}
        </div>
      </div>

      {/* Field Configuration */}
      {isExpanded && (
        <div className="p-4 sm:p-5 bg-gradient-to-br from-gray-50/50 to-white/30 border-b border-gray-200/50">
          {/* Read-only Text Field Configuration */}
          {field.type === "readonly_text" && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Default Value
              </label>
              <input
                type="text"
                value={field.defaultValue || ""}
                onChange={(e) =>
                  onUpdate(field.id, { defaultValue: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-lg"
                placeholder="Enter default value"
              />
              <p className="text-xs text-gray-500 mt-2">
                This value will be fixed and users cannot change it
              </p>
            </div>
          )}

          {/* Source Dropdown Configuration */}
          {field.type === "source" && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Source Options
              </label>
              <div className="space-y-2 sm:space-y-3">
                {field.options &&
                  field.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-indigo-500 flex-shrink-0"></div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(field.options || [])];
                          newOptions[index] = e.target.value;
                          onUpdate(field.id, { options: newOptions });
                        }}
                        className="flex-1 border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = field.options
                            ? field.options.filter((_, i) => i !== index)
                            : [];
                          onUpdate(field.id, { options: newOptions });
                        }}
                        className="p-1 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                
                {/* Predefined Source Options */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <label className="block text-sm font-semibold text-blue-700 mb-2">
                    Predefined Sources
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Mane Mane Samparka",
                      "Street Samparka", 
                      "BJP Karyakartha",
                      "Bala Bharathi Parent",
                      "Kishora Bharathi Parent",
                      "Maithreyi Parent",
                      "Mithra Parent",
                      "Sevika Samithi Spouse",
                      "Relocation from another Milan",
                      "Sangha Utsav",
                      "Join RSS Website", 
                      "Join RSS Campaign",
                      "Friend Circle",
                      "Relation Circle",
                      "Yuva Conclave",
                      "Yuva Samavesha",
                      "Existing Pattlist SS"
                    ].map((source) => (
                      <button
                        key={source}
                        type="button"
                        onClick={() => {
                          const newOptions = [...(field.options || []), source];
                          onUpdate(field.id, { options: newOptions });
                        }}
                        className="text-left p-2 text-xs bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                      >
                        {source}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    const newOptions = [
                      ...(field.options || []),
                      `Option ${(field.options ? field.options.length : 0) + 1}`,
                    ];
                    onUpdate(field.id, { options: newOptions });
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-semibold mt-3"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add Custom Option
                </button>
              </div>
            </div>
          )}

          {/* Placeholder for other input fields */}
          {(field.type === "text" ||
            field.type === "email" ||
            field.type === "number" ||
            field.type === "textarea" ||
            field.type === "select") && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Placeholder Text
              </label>
              <input
                type="text"
                value={field.placeholder}
                onChange={(e) =>
                  onUpdate(field.id, { placeholder: e.target.value })
                }
                className="w-full border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-lg"
                placeholder="Enter placeholder text"
              />
            </div>
          )}

          {/* Options for radio, checkbox, select */}
          {(field.type === "radio" ||
            field.type === "checkbox" ||
            field.type === "select") && (
            <div className="mb-4 sm:mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                Options
              </label>
              <div className="space-y-2 sm:space-y-3">
                {field.options &&
                  field.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2 sm:gap-3">
                      <div
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${color.badge} flex-shrink-0`}
                      ></div>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...(field.options || [])];
                          newOptions[index] = e.target.value;
                          onUpdate(field.id, { options: newOptions });
                        }}
                        className="flex-1 border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        placeholder={`Option ${index + 1}`}
                      />
                      <button
                        onClick={() => {
                          const newOptions = field.options
                            ? field.options.filter((_, i) => i !== index)
                            : [];
                          onUpdate(field.id, { options: newOptions });
                        }}
                        className="p-1 sm:p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                <button
                  onClick={() => {
                    const newOptions = [
                      ...(field.options || []),
                      `Option ${
                        (field.options ? field.options.length : 0) + 1
                      }`,
                    ];
                    onUpdate(field.id, { options: newOptions });
                  }}
                  className="flex items-center gap-2 text-xs sm:text-sm text-purple-600 hover:text-purple-700 font-semibold"
                >
                  <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          {/* Add Nested Field */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-300/50">
            <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
              Add Nested Field (Conditional)
            </label>
            <div className="flex gap-2 sm:gap-3">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onAddNestedField(field.id, e.target.value);
                    e.target.value = "";
                  }
                }}
                className="flex-1 border-2 border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">
                  Select field type...
                </option>
                {FIELD_TYPES.map((fieldType) => (
                  <option key={fieldType.type} value={fieldType.type}>
                    {fieldType.label}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Nested fields will only appear when specific conditions are met
            </p>
          </div>
        </div>
      )}

      {/* Nested Fields */}
      {field.nestedFields && field.nestedFields.length > 0 && (
        <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50/30 to-blue-50/30 border-t border-purple-200/50">
          <h4 className="text-xs sm:text-sm font-semibold text-purple-800 mb-3 sm:mb-4 flex items-center gap-2">
            <div className="w-1 h-1 sm:w-2 sm:h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
            Nested Fields (Conditional) - {field.nestedFields.length} field(s)
          </h4>
          <div className="space-y-3 sm:space-y-4 ml-4 sm:ml-6 border-l-2 border-purple-300/50 pl-4 sm:pl-6">
            {field.nestedFields.map((nestedField, nestedIndex) => (
              <FormField
                key={nestedField.id}
                field={nestedField}
                sectionId={sectionId}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddNestedField={onAddNestedField}
                onEditConditional={onEditConditional}
                // Nested fields are not draggable to keep things simple
                isDraggable={false}
                fieldIndex={nestedIndex}
                totalFields={field.nestedFields?.length || 0}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};