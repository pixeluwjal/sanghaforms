// components/builder/FormField.tsx
import { useState, useEffect } from "react";
import {
  Trash2,
  Plus,
  Eye,
  EyeOff,
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
  Monitor,
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
  { type: "text", label: "Text Input", icon: Type },
  { type: "email", label: "Email", icon: Mail },
  { type: "number", label: "Number", icon: Hash },
  { type: "textarea", label: "Text Area", icon: FileText },
  { type: "select", label: "Dropdown", icon: List },
  { type: "radio", label: "Radio Group", icon: Circle },
  { type: "checkbox", label: "Checkboxes", icon: Square },
  { type: "date", label: "Date Picker", icon: Calendar },
  { type: "file", label: "File Upload", icon: Upload },
  { type: "whatsapp_optin", label: "WhatsApp Opt-in", icon: MessageCircle },
  { type: 'readonly_text', label: 'Read-only Text', icon: Type },
  { type: 'source', label: 'Source', icon: Users },
  { type: "arratai_optin", label: "Arratai Opt-in", icon: Users },
  { type: "sangha", label: "Sangha Hierarchy", icon: Users },
];

// Helper functions to parse and stringify custom data
const parseCustomData = (defaultValue: string) => {
  try {
    return defaultValue ? JSON.parse(defaultValue) : {};
  } catch {
    return {};
  }
};

const stringifyCustomData = (data: any) => {
  return JSON.stringify(data);
};

// Simple Sangha Hierarchy Selector for Default Values
const SanghaDefaultValueSelector: React.FC<{
  fieldId: string;
  defaultValues: any;
  onDefaultValueChange: (key: string, value: string) => void;
}> = ({ fieldId, defaultValues, onDefaultValueChange }) => {
  const [organization, setOrganization] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadOrganizationData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/organization');
        const data = await response.json();
        if (data.success && data.organizations && data.organizations.length > 0) {
          setOrganization(data.organizations[0]);
        }
      } catch (err) {
        console.error("Error loading organization data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrganizationData();
  }, []);

  // Get available options based on selections
  const availableKhandas = organization?.khandas || [];
  const selectedKhanda = availableKhandas.find(k => k._id === defaultValues.khandaId);
  const availableValayas = selectedKhanda?.valays || [];
  const selectedValaya = availableValayas.find(v => v._id === defaultValues.valayaId);
  const availableMilans = selectedValaya?.milans || [];
  const selectedMilan = availableMilans.find(m => m._id === defaultValues.milanId);
  const availableGhatas = selectedMilan?.ghatas || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Khanda Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Default Khanda
        </label>
        <select
          value={defaultValues.khandaId || ""}
          onChange={(e) => onDefaultValueChange("khandaId", e.target.value)}
          className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
        >
          <option value="">Select Khanda</option>
          {availableKhandas.map((khanda: any) => (
            <option key={khanda._id} value={khanda._id}>
              {khanda.name} ({khanda.code})
            </option>
          ))}
        </select>
      </div>

      {/* Valaya Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Default Valaya
        </label>
        <select
          value={defaultValues.valayaId || ""}
          onChange={(e) => onDefaultValueChange("valayaId", e.target.value)}
          disabled={!defaultValues.khandaId || availableValayas.length === 0}
          className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {availableValayas.length === 0 ? 'Select Khanda first' : 'Select Valaya'}
          </option>
          {availableValayas.map((valaya: any) => (
            <option key={valaya._id} value={valaya._id}>
              {valaya.name}
            </option>
          ))}
        </select>
      </div>

      {/* Milan Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Default Milan
        </label>
        <select
          value={defaultValues.milanId || ""}
          onChange={(e) => onDefaultValueChange("milanId", e.target.value)}
          disabled={!defaultValues.valayaId || availableMilans.length === 0}
          className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {availableMilans.length === 0 ? 'Select Valaya first' : 'Select Milan'}
          </option>
          {availableMilans.map((milan: any) => (
            <option key={milan._id} value={milan._id}>
              {milan.name}
            </option>
          ))}
        </select>
      </div>

      {/* Ghata Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Default Ghata (Optional)
        </label>
        <select
          value={defaultValues.ghataId || ""}
          onChange={(e) => onDefaultValueChange("ghataId", e.target.value)}
          disabled={!defaultValues.milanId || availableGhatas.length === 0}
          className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="">
            {availableGhatas.length === 0 ? 'Select Milan first' : 'Select Ghata'}
          </option>
          {availableGhatas.map((ghata: any) => (
            <option key={ghata._id} value={ghata._id}>
              {ghata.name}
            </option>
          ))}
        </select>
      </div>

      {/* Current Selection Display */}
      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
        <p className="text-xs text-purple-700">
          <strong>Current Default Selections:</strong><br />
          Khanda: {selectedKhanda?.name || 'Not set'}<br />
          Valaya: {selectedValaya?.name || 'Not set'}<br />
          Milan: {selectedMilan?.name || 'Not set'}<br />
          Ghata: {availableGhatas.find((g: any) => g._id === defaultValues.ghataId)?.name || 'Not set'}
        </p>
      </div>
    </div>
  );
};

// Custom Field Preview Component
const CustomFieldPreview: React.FC<{
  field: Field;
  onUpdate: (fieldId: string, updates: Partial<Field>) => void;
}> = ({ field, onUpdate }) => {
  const [showPreview, setShowPreview] = useState(false);
  
  // Parse custom data from defaultValue field or use empty object
  const customData = parseCustomData(field.defaultValue || '{}');
  const defaultValues = customData.defaultValues || {};

  // Handle default value changes for custom components
  const handleDefaultValueChange = (key: string, value: string) => {
    const newData = {
      ...customData,
      defaultValues: {
        ...customData.defaultValues,
        [key]: value
      }
    };
    
    console.log('Saving default values:', newData);
    
    onUpdate(field.id, { 
      defaultValue: stringifyCustomData(newData)
    });
  };

  return (
    <div className="space-y-4">
      {/* Preview Toggle */}
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-black">Sangha Hierarchy Configuration</h4>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors border-2 border-purple-300"
        >
          <Monitor className="w-4 h-4" />
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>

      {/* Default Values Configuration */}
      <div className="p-4 bg-purple-50 rounded-xl border-2 border-purple-300">
        <h5 className="font-semibold text-black mb-3">Default Values</h5>
        
        <SanghaDefaultValueSelector
          fieldId={field.id}
          defaultValues={defaultValues}
          onDefaultValueChange={handleDefaultValueChange}
        />

        <p className="text-xs text-gray-600 mt-3">
          These values will pre-select the hierarchy levels when the form loads
        </p>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="p-4 bg-white rounded-xl border-2 border-purple-400 shadow-lg">
          <h5 className="font-semibold text-black mb-4 border-b border-purple-200 pb-2">
            Live Preview
          </h5>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              Preview will appear here when the form is rendered
            </p>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Default values are set and will be used when the form loads
            </p>
          </div>
          <div className="mt-3 p-2 bg-purple-50 rounded-lg border border-purple-200">
            <p className="text-xs text-purple-700">
              <strong>Default Values Set:</strong><br />
              Khanda: {defaultValues.khandaId || 'Not set'}<br />
              Valaya: {defaultValues.valayaId || 'Not set'}<br />
              Milan: {defaultValues.milanId || 'Not set'}<br />
              Ghata: {defaultValues.ghataId || 'Not set'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
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
  const IconComponent = fieldConfig ? fieldConfig.icon : Type;

  // Get visibility from customData (default to false if not set)
  const isHidden = field.customData?.hidden || false;

  // Toggle visibility
  const toggleVisibility = () => {
    const updatedCustomData = {
      ...field.customData,
      hidden: !isHidden
    };
    
    onUpdate(field.id, { 
      customData: updatedCustomData 
    });
  };

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
          : isHidden 
            ? 'border-gray-300 bg-gray-100 opacity-70' 
            : 'border-purple-200 shadow-sm hover:shadow-md hover:border-purple-300'
      }`}
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {/* Field Header */}
      <div className={`p-4 sm:p-5 border-b ${
        isHidden 
          ? 'bg-gradient-to-r from-gray-100 to-gray-50 border-gray-300' 
          : 'bg-gradient-to-r from-purple-50 to-white border-purple-200'
      }`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Drag Handle */}
            {isDraggable && (
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <button
                  className={`p-1 rounded transition-all duration-200 cursor-grab active:cursor-grabbing ${
                    isHidden 
                      ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200' 
                      : 'text-purple-400 hover:text-purple-600 hover:bg-purple-100'
                  }`}
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
                      className={`p-1 rounded transition-all duration-200 ${
                        isHidden 
                          ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200' 
                          : 'text-purple-400 hover:text-purple-600 hover:bg-purple-100'
                      }`}
                      title="Move up"
                    >
                      <ArrowUp className="w-2 h-2 sm:w-3 sm:h-3" />
                    </button>
                  )}
                  
                  {onFieldMoveDown && fieldIndex < totalFields - 1 && (
                    <button
                      onClick={() => onFieldMoveDown(sectionId, field.id)}
                      className={`p-1 rounded transition-all duration-200 ${
                        isHidden 
                          ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-200' 
                          : 'text-purple-400 hover:text-purple-600 hover:bg-purple-100'
                      }`}
                      title="Move down"
                    >
                      <ArrowDown className="w-2 h-2 sm:w-3 sm:h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Field Type Badge */}
            <div className={`flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl border-2 flex-shrink-0 ${
              isHidden 
                ? 'bg-gray-200 border-gray-400' 
                : 'bg-purple-100 border-purple-300'
            }`}>
              <IconComponent className={`w-4 h-4 sm:w-5 sm:h-5 ${
                isHidden ? 'text-gray-600' : 'text-purple-600'
              }`} />
              <span className={`font-semibold capitalize text-xs sm:text-sm hidden xs:inline ${
                isHidden ? 'text-gray-700' : 'text-purple-700'
              }`}>
                {field.type}
              </span>
            </div>

            {/* Field Label Input */}
            <div className="flex-1 min-w-0">
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate(field.id, { label: e.target.value })}
                className={`w-full bg-transparent border-none text-base sm:text-xl font-bold focus:outline-none focus:ring-0 placeholder-gray-500 truncate ${
                  isHidden ? 'text-gray-600' : 'text-black'
                }`}
                placeholder="Field label"
              />
            </div>

            {/* Field Position Indicator */}
            {isDraggable && (
              <div className={`flex items-center gap-2 px-2 py-1 text-xs rounded-full font-medium flex-shrink-0 ${
                isHidden 
                  ? 'bg-gray-200 text-gray-700' 
                  : 'bg-purple-100 text-purple-700'
              }`}>
                <span>#{fieldIndex + 1}</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Visibility Toggle */}
            <button
              onClick={toggleVisibility}
              className={`p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isHidden 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-600 hover:text-purple-700'
              }`}
              title={isHidden ? "Show Field" : "Hide Field"}
            >
              {isHidden ? (
                <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isHidden 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-600 hover:text-purple-700'
              }`}
            >
              <ChevronDown
                className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            <button
              onClick={() => onEditConditional(field)}
              className={`p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-110 ${
                isHidden 
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-600 hover:text-gray-800' 
                  : 'bg-purple-100 hover:bg-purple-200 text-purple-600 hover:text-purple-700'
              }`}
              title="Conditional Logic"
            >
              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={() => onDelete(field.id)}
              className="p-2 sm:p-3 bg-red-100 hover:bg-red-200 rounded-xl text-red-600 hover:text-red-700 transition-all duration-300 hover:scale-110"
              title="Delete Field"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Required Toggle and Status */}
        <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 flex-wrap">
          <label className={`flex items-center gap-2 text-xs sm:text-sm font-medium ${
            isHidden ? 'text-gray-600' : 'text-black'
          }`}>
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) =>
                onUpdate(field.id, { required: e.target.checked })
              }
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 scale-110 sm:scale-125"
              disabled={isHidden}
            />
            Required
          </label>

          {field.conditionalRules && field.conditionalRules.length > 0 && (
            <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
              isHidden 
                ? 'bg-gray-200 text-gray-700' 
                : 'bg-purple-100 text-purple-700'
            }`}>
              <Eye className="w-2 h-2 sm:w-3 sm:h-3" />
              {field.conditionalRules.length} rule
              {field.conditionalRules.length !== 1 ? "s" : ""}
            </div>
          )}

          {/* Hidden Field Badge */}
          {isHidden && (
            <div className="flex items-center gap-1 px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded-full font-medium">
              <EyeOff className="w-2 h-2 sm:w-3 sm:h-3" />
              Hidden
            </div>
          )}

          {/* Custom Component Badge */}
          {(field.type === "sangha") && (
            <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
              isHidden 
                ? 'bg-gray-200 text-gray-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              <Monitor className="w-2 h-2 sm:w-3 sm:h-3" />
              Custom Component
            </div>
          )}

          {/* Drag Hint */}
          {isDraggable && (
            <div className={`flex items-center gap-1 px-2 py-1 text-xs rounded-full font-medium ${
              isHidden 
                ? 'bg-gray-200 text-gray-700' 
                : 'bg-blue-100 text-blue-700'
            }`}>
              <GripVertical className="w-2 h-2 sm:w-3 sm:h-3" />
              Drag to reorder
            </div>
          )}
        </div>
      </div>

      {/* Field Configuration */}
      {isExpanded && (
        <div className={`p-4 sm:p-5 border-b ${
          isHidden 
            ? 'bg-gradient-to-br from-gray-100/30 to-gray-50/50 border-gray-300' 
            : 'bg-gradient-to-br from-purple-50/30 to-white/50 border-purple-200'
        }`}>
          {/* Custom Component Preview and Configuration */}
          {(field.type === "sangha") && (
            <CustomFieldPreview field={field} onUpdate={onUpdate} />
          )}

          {/* Placeholder Configuration for Standard Field Types */}
          {field.type !== "sangha" && (
            <div className="mb-4 sm:mb-6">
              <label className={`block text-sm font-semibold mb-2 sm:mb-3 ${
                isHidden ? 'text-gray-600' : 'text-black'
              }`}>
                Placeholder Text
              </label>
              <input
                type="text"
                value={field.placeholder || ''}
                onChange={(e) => onUpdate(field.id, { placeholder: e.target.value })}
                className="w-full border-2 border-purple-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                placeholder={`Enter placeholder text for ${field.type} field`}
                disabled={isHidden}
              />
              <p className={`text-xs mt-2 ${
                isHidden ? 'text-gray-500' : 'text-gray-600'
              }`}>
                This text will appear as a hint inside the field
              </p>
            </div>
          )}

          {/* Default Value Configuration for Standard Field Types */}
          {field.type !== "sangha" && (
            <div className="mb-4 sm:mb-6">
              <label className={`block text-sm font-semibold mb-2 sm:mb-3 ${
                isHidden ? 'text-gray-600' : 'text-black'
              }`}>
                Default Value
              </label>
              {field.type === 'select' || field.type === 'radio' || field.type === 'checkbox' || field.type === 'source' ? (
                <select
                  value={field.defaultValue || ''}
                  onChange={(e) => onUpdate(field.id, { defaultValue: e.target.value })}
                  className="w-full border-2 border-purple-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  disabled={isHidden}
                >
                  <option value="">Select default value...</option>
                  {field.options?.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type === 'number' ? 'number' : 'text'}
                  value={field.defaultValue || ''}
                  onChange={(e) => onUpdate(field.id, { defaultValue: e.target.value })}
                  className="w-full border-2 border-purple-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                  placeholder={`Enter default ${field.type} value`}
                  disabled={isHidden}
                />
              )}
              <p className={`text-xs mt-2 ${
                isHidden ? 'text-gray-500' : 'text-gray-600'
              }`}>
                This value will be pre-filled when the form loads
              </p>
            </div>
          )}

          {/* Options Configuration for Select, Radio, Checkbox */}
          {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox' || field.type === 'source') && (
            <div className="mb-4 sm:mb-6">
              <label className={`block text-sm font-semibold mb-2 sm:mb-3 ${
                isHidden ? 'text-gray-600' : 'text-black'
              }`}>
                Options
              </label>
              <div className="space-y-2">
                {field.options?.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...(field.options || [])];
                        newOptions[index] = e.target.value;
                        onUpdate(field.id, { options: newOptions });
                      }}
                      className="flex-1 border-2 border-purple-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                      placeholder={`Option ${index + 1}`}
                      disabled={isHidden}
                    />
                    <button
                      onClick={() => {
                        const newOptions = field.options?.filter((_, i) => i !== index) || [];
                        onUpdate(field.id, { options: newOptions });
                      }}
                      className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                      disabled={isHidden}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
                    onUpdate(field.id, { options: newOptions });
                  }}
                  className="flex items-center gap-2 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors border-2 border-purple-300"
                  disabled={isHidden}
                >
                  <Plus className="w-4 h-4" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          {/* Add Nested Field */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-purple-300">
            <label className={`block text-sm font-semibold mb-2 sm:mb-3 ${
              isHidden ? 'text-gray-600' : 'text-black'
            }`}>
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
                className="flex-1 border-2 border-purple-300 rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                disabled={isHidden}
              >
                <option value="">Select field type...</option>
                {FIELD_TYPES.map((fieldType) => (
                  <option key={fieldType.type} value={fieldType.type}>
                    {fieldType.label}
                  </option>
                ))}
              </select>
            </div>
            <p className={`text-xs mt-2 ${
              isHidden ? 'text-gray-500' : 'text-gray-600'
            }`}>
              Nested fields will only appear when specific conditions are met
            </p>
          </div>
        </div>
      )}

      {/* Nested Fields */}
      {field.nestedFields && field.nestedFields.length > 0 && (
        <div className={`p-4 sm:p-5 border-t ${
          isHidden 
            ? 'bg-gradient-to-br from-gray-100/50 to-gray-50/30 border-gray-300' 
            : 'bg-gradient-to-br from-purple-50/50 to-blue-50/30 border-purple-300'
        }`}>
          <h4 className={`text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2 ${
            isHidden ? 'text-gray-700' : 'text-purple-800'
          }`}>
            <div className={`w-1 h-1 sm:w-2 sm:h-2 rounded-full flex-shrink-0 ${
              isHidden ? 'bg-gray-500' : 'bg-purple-500'
            }`}></div>
            Nested Fields (Conditional) - {field.nestedFields.length} field(s)
          </h4>
          <div className={`space-y-3 sm:space-y-4 ml-4 sm:ml-6 border-l-2 pl-4 sm:pl-6 ${
            isHidden ? 'border-gray-400' : 'border-purple-400'
          }`}>
            {field.nestedFields.map((nestedField, nestedIndex) => (
              <FormField
                key={nestedField.id}
                field={nestedField}
                sectionId={sectionId}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAddNestedField={onAddNestedField}
                onEditConditional={onEditConditional}
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