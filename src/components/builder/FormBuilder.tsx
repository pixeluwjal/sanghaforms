// components/builder/FormBuilder.tsx
"use client";

import { useState, useRef } from "react";
import { Form, Section, Field } from "./shared/types";
import { FormSection } from "./FormSection";
import { FieldToolbox } from "./FieldToolbox";
import { ConditionalLogicPopup } from "./ConditionalLogicPopup";
import {
  Plus,
  GripVertical,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";

// DND Kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FormBuilderProps {
  form: Form;
  updateForm: (updates: Partial<Form>) => void;
}

// Helper functions
const createNewField = (type: string, label?: string): Field => {
  const fieldConfig = FIELD_TYPES.find((f) => f.type === type);
  const defaultLabel = label || (fieldConfig ? fieldConfig.label : "Field");

  return {
    id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: type as any,
    label: defaultLabel,
    placeholder: `Enter ${defaultLabel.toLowerCase()}`,
    required: false,
    order: 0,
    conditionalRules: [],
    nestedFields: [],
    ...(fieldConfig &&
      fieldConfig.supportsOptions && { options: ["Option 1", "Option 2"] }),
  };
};

const createNewSection = (title?: string): Section => {
  return {
    id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: title || "New Section",
    description: "Section description",
    order: 0,
    fields: [],
    conditionalRules: [],
  };
};

// Field type configurations
const FIELD_TYPES = [
  {
    type: "text",
    label: "Text Input",
    icon: "Type",
    color: "blue",
    supportsOptions: false,
  },
  {
    type: "email",
    label: "Email",
    icon: "Mail",
    color: "green",
    supportsOptions: false,
  },
  {
    type: "number",
    label: "Number",
    icon: "Hash",
    color: "purple",
    supportsOptions: false,
  },
  {
    type: "textarea",
    label: "Text Area",
    icon: "FileText",
    color: "indigo",
    supportsOptions: false,
  },
  {
    type: "select",
    label: "Dropdown",
    icon: "List",
    color: "orange",
    supportsOptions: true,
  },
  {
    type: "radio",
    label: "Radio Group",
    icon: "Circle",
    color: "pink",
    supportsOptions: true,
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    icon: "Square",
    color: "red",
    supportsOptions: true,
  },
  {
    type: "date",
    label: "Date Picker",
    icon: "Calendar",
    color: "teal",
    supportsOptions: false,
  },
  {
    type: "file",
    label: "File Upload",
    icon: "Upload",
    color: "amber",
    supportsOptions: false,
  },
  {
    type: "sangha",
    label: "Sangha Hierarchy",
    icon: "Users",
    color: "purple",
    supportsOptions: false,
  },
  {
    type: "whatsapp_optin",
    label: "WhatsApp Opt-in",
    icon: "MessageCircle",
    color: "emerald",
    supportsOptions: false,
  },
  {
    type: "arratai_optin",
    label: "Arratai Opt-in",
    icon: "Users",
    color: "sky",
    supportsOptions: false,
  },
];

// Recursive functions
const deleteFieldRecursively = (fields: Field[], fieldId: string): Field[] => {
  return fields.filter((field) => {
    if (field.id === fieldId) return false;
    if (field.nestedFields) {
      field.nestedFields = deleteFieldRecursively(field.nestedFields, fieldId);
    }
    return true;
  });
};

const updateFieldRecursively = (
  fields: Field[],
  fieldId: string,
  updates: Partial<Field>
): Field[] => {
  return fields.map((field) => {
    if (field.id === fieldId) return { ...field, ...updates };
    if (field.nestedFields) {
      return {
        ...field,
        nestedFields: updateFieldRecursively(
          field.nestedFields,
          fieldId,
          updates
        ),
      };
    }
    return field;
  });
};

const addNestedFieldRecursively = (
  fields: Field[],
  parentFieldId: string,
  newField: Field
): Field[] => {
  return fields.map((field) => {
    if (field.id === parentFieldId) {
      return {
        ...field,
        nestedFields: [...(field.nestedFields || []), newField],
      };
    }
    if (field.nestedFields) {
      return {
        ...field,
        nestedFields: addNestedFieldRecursively(
          field.nestedFields,
          parentFieldId,
          newField
        ),
      };
    }
    return field;
  });
};

// Sortable Section Component
const SortableSectionItem = ({ 
  section, 
  index, 
  isActive, 
  onSectionClick, 
  onMoveUp, 
  onMoveDown, 
  onDelete,
  totalSections 
}: {
  section: Section;
  index: number;
  isActive: boolean;
  onSectionClick: (sectionId: string) => void;
  onMoveUp: (sectionId: string) => void;
  onMoveDown: (sectionId: string) => void;
  onDelete: (sectionId: string) => void;
  totalSections: number;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 cursor-move group ${
        isActive
          ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 border-purple-500"
          : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow-md"
      } ${isDragging ? "opacity-50" : ""}`}
      onClick={() => onSectionClick(section.id)}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 text-gray-400 group-hover:text-gray-600 transition-colors cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Section Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold truncate">
            {section.title || `Section ${index + 1}`}
          </h4>
          {isActive && (
            <span className="px-2 py-1 bg-white/20 text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <p className="text-sm opacity-80 truncate">
          {section.fields.length} field(s)
        </p>
      </div>

      {/* Section Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Move Up Button */}
        {index > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(section.id);
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Move up"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
          </button>
        )}

        {/* Move Down Button */}
        {index < totalSections - 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(section.id);
            }}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            title="Move down"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}

        {/* Delete Button */}
        {totalSections > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (
                confirm(
                  "Are you sure you want to delete this section? All fields in this section will be lost."
                )
              ) {
                onDelete(section.id);
              }
            }}
            className="p-2 hover:bg-red-500 rounded-lg transition-colors text-red-300 hover:text-white"
            title="Delete section"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Image Upload Component (Integrated directly)
const ImageUpload: React.FC<{
  type: "logo" | "banner";
  currentImage?: string;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
  className?: string;
}> = ({ type, currentImage, onImageUpload, onImageRemove, className = "" }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        onImageUpload(result.url);
      } else {
        alert("Upload failed: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const dimensions = type === "logo" ? "w-32 h-32" : "w-full h-48";
  const label = type === "logo" ? "Logo" : "Banner";

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {currentImage ? (
        <div className="relative group">
          <div
            className={`${dimensions} border-2 border-dashed border-gray-300 rounded-lg overflow-hidden`}
          >
            <img
              src={currentImage}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="mt-2 text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Change {label}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${dimensions} border-2 border-dashed ${
            dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
          } rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
            uploading ? "opacity-50" : "hover:border-gray-400"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 text-center">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export const FormBuilder = ({ form, updateForm }: FormBuilderProps) => {
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [activeSection, setActiveSection] = useState<string>(
    form.sections[0] ? form.sections[0].id : ""
  );
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // DND Kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Image handlers
  const handleLogoUpload = (url: string) => {
    updateForm({
      images: {
        ...form.images,
        logo: url,
      },
    });
  };

  const handleLogoRemove = () => {
    updateForm({
      images: {
        ...form.images,
        logo: "",
      },
    });
  };

  const handleBannerUpload = (url: string) => {
    updateForm({
      images: {
        ...form.images,
        banner: url,
      },
    });
  };

  const handleBannerRemove = () => {
    updateForm({
      images: {
        ...form.images,
        banner: "",
      },
    });
  };

  // Field and section handlers
  const addFieldToSection = (sectionId: string, fieldType: string) => {
    const newField = createNewField(fieldType);
    const updatedSections = form.sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          fields: [...section.fields, newField],
        };
      }
      return section;
    });
    updateForm({ sections: updatedSections });
  };

  const addNestedField = (parentFieldId: string, fieldType: string) => {
    const newField = createNewField(fieldType);
    const updatedSections = form.sections.map((section) => ({
      ...section,
      fields: addNestedFieldRecursively(
        section.fields,
        parentFieldId,
        newField
      ),
    }));
    updateForm({ sections: updatedSections });
  };

  const updateField = (fieldId: string, updates: Partial<Field>) => {
    const updatedSections = form.sections.map((section) => ({
      ...section,
      fields: updateFieldRecursively(section.fields, fieldId, updates),
    }));
    updateForm({ sections: updatedSections });
  };

  const deleteField = (fieldId: string) => {
    const updatedSections = form.sections.map((section) => ({
      ...section,
      fields: deleteFieldRecursively(section.fields, fieldId),
    }));
    updateForm({ sections: updatedSections });
  };

  const addSection = () => {
    const newSection = createNewSection();
    const updatedSections = [...form.sections, newSection];
    updateForm({ sections: updatedSections });
    setActiveSection(newSection.id);
  };

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    const updatedSections = form.sections.map((section) =>
      section.id === sectionId ? { ...section, ...updates } : section
    );
    updateForm({ sections: updatedSections });
  };

  const deleteSection = (sectionId: string) => {
    if (form.sections.length <= 1) {
      alert("Cannot delete the only section");
      return;
    }
    const updatedSections = form.sections.filter(
      (section) => section.id !== sectionId
    );
    updateForm({ sections: updatedSections });
    if (activeSection === sectionId) {
      setActiveSection(updatedSections[0] ? updatedSections[0].id : "");
    }
  };

  // Section reordering functions
  const moveSectionUp = (sectionId: string) => {
    const currentIndex = form.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex > 0) {
      const newSections = [...form.sections];
      const [section] = newSections.splice(currentIndex, 1);
      newSections.splice(currentIndex - 1, 0, section);
      updateForm({ sections: newSections });
    }
  };

  const moveSectionDown = (sectionId: string) => {
    const currentIndex = form.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex < form.sections.length - 1) {
      const newSections = [...form.sections];
      const [section] = newSections.splice(currentIndex, 1);
      newSections.splice(currentIndex + 1, 0, section);
      updateForm({ sections: newSections });
    }
  };

  // Field reordering functions
  const moveFieldUp = (sectionId: string, fieldId: string) => {
    const section = form.sections.find(s => s.id === sectionId);
    if (!section) return;

    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex > 0) {
      const newSections = form.sections.map(s => {
        if (s.id === sectionId) {
          const newFields = [...s.fields];
          [newFields[fieldIndex], newFields[fieldIndex - 1]] = [newFields[fieldIndex - 1], newFields[fieldIndex]];
          return { ...s, fields: newFields };
        }
        return s;
      });
      updateForm({ sections: newSections });
    }
  };

  const moveFieldDown = (sectionId: string, fieldId: string) => {
    const section = form.sections.find(s => s.id === sectionId);
    if (!section) return;

    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex < section.fields.length - 1) {
      const newSections = form.sections.map(s => {
        if (s.id === sectionId) {
          const newFields = [...s.fields];
          [newFields[fieldIndex], newFields[fieldIndex + 1]] = [newFields[fieldIndex + 1], newFields[fieldIndex]];
          return { ...s, fields: newFields };
        }
        return s;
      });
      updateForm({ sections: newSections });
    }
  };

  // DND Kit handlers
  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    if (active.id !== over.id) {
      // Handle section reordering
      const oldIndex = form.sections.findIndex((section) => section.id === active.id);
      const newIndex = form.sections.findIndex((section) => section.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newSections = arrayMove(form.sections, oldIndex, newIndex);
        updateForm({ sections: newSections });
      }
    }
  };

  const handleDragCancel = () => {
    setActiveDragId(null);
  };

  const handleToolboxFieldAdd = (fieldType: string) => {
    if (form.sections.length === 0) {
      const newSection = createNewSection();
      const newField = createNewField(fieldType);
      newSection.fields = [newField];
      updateForm({ sections: [newSection] });
      setActiveSection(newSection.id);
    } else {
      addFieldToSection(activeSection, fieldType);
    }
  };

  // Get the active dragged section for overlay
  const activeDraggedSection = activeDragId 
    ? form.sections.find(section => section.id === activeDragId)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Image Settings */}
        <div className="mb-8 text-center relative">
          <div className="flex items-center justify-between mb-4">
            <div className="w-1/4">
              {/* Logo Preview */}
              {form.images?.logo && (
                <div className="flex items-center justify-start">
                  <img
                    src={form.images.logo}
                    alt="Form Logo"
                    className="w-16 h-16 object-contain rounded-lg"
                  />
                </div>
              )}
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Form Builder
              </h1>
              <p className="text-gray-600 mt-3 text-lg">
                Build your form by adding fields and sections
              </p>
            </div>

            <div className="w-1/4 flex justify-end">
              <button
                onClick={() => setShowImageSettings(!showImageSettings)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Images</span>
              </button>
            </div>
          </div>

          {/* Banner Preview */}
          {form.images?.banner && (
            <div className="mt-4 rounded-xl overflow-hidden shadow-lg">
              <img
                src={form.images.banner}
                alt="Form Banner"
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Image Settings Panel */}
          {showImageSettings && (
            <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Form Images</h3>
                <button
                  onClick={() => setShowImageSettings(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <ImageUpload
                  type="logo"
                  currentImage={form.images?.logo}
                  onImageUpload={handleLogoUpload}
                  onImageRemove={handleLogoRemove}
                />

                <ImageUpload
                  type="banner"
                  currentImage={form.images?.banner}
                  onImageUpload={handleBannerUpload}
                  onImageRemove={handleBannerRemove}
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Toolbox Sidebar - Left */}
          <div className="lg:col-span-1">
            <FieldToolbox onFieldAdd={handleToolboxFieldAdd} />
          </div>

          {/* Main Builder Area - Right */}
          <div className="lg:col-span-3 space-y-6">
            {/* Sections Navigation with Drag & Drop */}
            {form.sections.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Form Sections
                  </h3>
                  <span className="text-sm text-gray-500">
                    {form.sections.length} section(s)
                  </span>
                </div>

                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}
                >
                  <SortableContext 
                    items={form.sections.map(s => s.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {form.sections.map((section, index) => (
                        <SortableSectionItem
                          key={section.id}
                          section={section}
                          index={index}
                          isActive={activeSection === section.id}
                          onSectionClick={setActiveSection}
                          onMoveUp={moveSectionUp}
                          onMoveDown={moveSectionDown}
                          onDelete={deleteSection}
                          totalSections={form.sections.length}
                        />
                      ))}
                    </div>
                  </SortableContext>

                  <DragOverlay>
                    {activeDraggedSection ? (
                      <div className="flex items-center gap-3 p-4 rounded-xl border-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25 border-purple-500 opacity-80">
                        <div className="flex-shrink-0 text-white">
                          <GripVertical className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold truncate">
                              {activeDraggedSection.title || `Section`}
                            </h4>
                          </div>
                          <p className="text-sm opacity-80 truncate">
                            {activeDraggedSection.fields.length} field(s)
                          </p>
                        </div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>

                {/* Drag & Drop Hint */}
                <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 text-center">
                    💡 Drag sections to reorder • Click to select • Use arrows to move
                  </p>
                </div>
              </div>
            )}

            {/* Active Section */}
            {form.sections.map((section) =>
              section.id === activeSection ? (
                <FormSection
                  key={section.id}
                  section={section}
                  onUpdate={updateSection}
                  onDelete={deleteSection}
                  onAddField={addFieldToSection}
                  onFieldUpdate={updateField}
                  onFieldDelete={deleteField}
                  onAddNestedField={addNestedField}
                  onEditConditional={setEditingField}
                  onFieldMoveUp={moveFieldUp}
                  onFieldMoveDown={moveFieldDown}
                />
              ) : null
            )}

            {/* Add Section Button */}
            <button
              onClick={addSection}
              className="w-full flex items-center justify-center gap-4 p-8 bg-white/80 backdrop-blur-sm border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 hover:bg-white hover:border-purple-400 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300 shadow-inner">
                <Plus className="w-7 h-7 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-xl text-gray-800">
                  Add New Section
                </div>
                <div className="text-purple-500 text-sm">
                  Organize your form into multiple sections
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Conditional Logic Popup */}
      {editingField && (
        <ConditionalLogicPopup
          field={editingField}
          sections={form.sections}
          onSave={(rules) => {
            updateField(editingField.id, { conditionalRules: rules });
            setEditingField(null);
          }}
          onClose={() => setEditingField(null)}
        />
      )}
    </div>
  );
};