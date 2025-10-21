// components/builder/FormBuilder.tsx
"use client";

import { useState, useRef } from "react";
import { Form, Section, Field } from "@/components/builder/shared/types";
import { FormSection } from "@/components/builder/FormSection";
import { FieldToolbox } from "@/components/builder/FieldToolbox";
import { ConditionalLogicPopup } from "@/components/builder/ConditionalLogicPopup";
import { SectionConditionalPopup } from "@/components/builder/SectionConditionalPopup";
import {
  Plus,
  Image as ImageIcon,
  X,
  Upload,
} from "lucide-react";

interface FormBuilderProps {
  form: Form;
  updateForm: (updates: Partial<Form>) => void;
}

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

// Image Upload Component
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
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showImageSettings, setShowImageSettings] = useState(false);

  // Helper functions - MOVED INSIDE COMPONENT
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
      order: form.sections.length, // Set order to the next available number
      fields: [],
      conditionalRules: [],
    };
  };

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
  };

  // Section reordering functions - UPDATED to update order property
  const moveSectionUp = (sectionId: string) => {
    const currentIndex = form.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex > 0) {
      const newSections = [...form.sections];
      const [section] = newSections.splice(currentIndex, 1);
      newSections.splice(currentIndex - 1, 0, section);
      
      // Update order property for all sections
      const sectionsWithUpdatedOrder = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      updateForm({ sections: sectionsWithUpdatedOrder });
    }
  };

  const moveSectionDown = (sectionId: string) => {
    const currentIndex = form.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex < form.sections.length - 1) {
      const newSections = [...form.sections];
      const [section] = newSections.splice(currentIndex, 1);
      newSections.splice(currentIndex + 1, 0, section);
      
      // Update order property for all sections
      const sectionsWithUpdatedOrder = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      updateForm({ sections: sectionsWithUpdatedOrder });
    }
  };

  const moveSectionToPosition = (sectionId: string, newPosition: number) => {
    const currentIndex = form.sections.findIndex((s) => s.id === sectionId);
    const newIndex = newPosition - 1;
    
    if (currentIndex !== newIndex && newIndex >= 0 && newIndex < form.sections.length) {
      const newSections = [...form.sections];
      const [section] = newSections.splice(currentIndex, 1);
      newSections.splice(newIndex, 0, section);
      
      // Update order property for all sections
      const sectionsWithUpdatedOrder = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      updateForm({ sections: sectionsWithUpdatedOrder });
    }
  };

  // Field reordering functions - UPDATED to update order property
  const moveFieldUp = (sectionId: string, fieldId: string) => {
    const section = form.sections.find(s => s.id === sectionId);
    if (!section) return;

    const fieldIndex = section.fields.findIndex(f => f.id === fieldId);
    if (fieldIndex > 0) {
      const newSections = form.sections.map(s => {
        if (s.id === sectionId) {
          const newFields = [...s.fields];
          [newFields[fieldIndex], newFields[fieldIndex - 1]] = [newFields[fieldIndex - 1], newFields[fieldIndex]];
          
          // Update order property for all fields
          const fieldsWithUpdatedOrder = newFields.map((field, index) => ({
            ...field,
            order: index
          }));
          
          return { ...s, fields: fieldsWithUpdatedOrder };
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
          
          // Update order property for all fields
          const fieldsWithUpdatedOrder = newFields.map((field, index) => ({
            ...field,
            order: index
          }));
          
          return { ...s, fields: fieldsWithUpdatedOrder };
        }
        return s;
      });
      updateForm({ sections: newSections });
    }
  };

  // Section conditional rules
  const updateSectionConditionalRules = (sectionId: string, rules: any[]) => {
    const updatedSections = form.sections.map((section) =>
      section.id === sectionId ? { ...section, conditionalRules: rules } : section
    );
    updateForm({ sections: updatedSections });
  };

  const handleToolboxFieldAdd = (fieldType: string) => {
    if (form.sections.length === 0) {
      const newSection = createNewSection();
      const newField = createNewField(fieldType);
      newSection.fields = [newField];
      updateForm({ sections: [newSection] });
    } else {
      // Add to the last section
      const lastSection = form.sections[form.sections.length - 1];
      addFieldToSection(lastSection.id, fieldType);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="container mx-auto px-4 py-6">
        {/* Header with Image Settings */}
        <div className="mb-8 text-center relative">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-4 gap-4">
            <div className="sm:w-1/4 flex justify-center sm:justify-start">
              {form.images?.logo && (
                <img
                  src={form.images.logo}
                  alt="Form Logo"
                  className="w-16 h-16 object-contain rounded-lg"
                />
              )}
            </div>

            <div className="flex-1 text-center">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Form Builder
              </h1>
              <p className="text-gray-600 mt-2 text-base lg:text-lg">
                Build your form by adding fields and sections
              </p>
            </div>

            <div className="sm:w-1/4 flex justify-center sm:justify-end">
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
                className="w-full h-32 lg:h-48 object-cover"
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
            {/* Sections Navigation */}
            {form.sections.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Form Sections
                  </h3>
                  <span className="text-sm text-gray-500">
                    {form.sections.length} section(s)
                  </span>
                </div>

                <div className="space-y-3">
                  {form.sections.map((section, index) => (
                    <div
                      key={section.id}
                      className="flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:shadow-md"
                    >
                      {/* Section Position - UPDATED to show actual order */}
                      <div className="flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-bold">
                        #{section.order + 1}
                      </div>

                      {/* Section Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold truncate">
                            {section.title || `Section ${section.order + 1}`}
                          </h4>
                          {section.conditionalRules && section.conditionalRules.length > 0 && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                              {section.conditionalRules.length} rule(s)
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {section.fields.length} field(s)
                        </p>
                      </div>

                      {/* Section Actions */}
                      <div className="flex items-center gap-2">
                        {/* Move Buttons */}
                        <div className="flex gap-1">
                          {section.order > 0 && (
                            <button
                              onClick={() => moveSectionUp(section.id)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Move up"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            </button>
                          )}

                          {section.order < form.sections.length - 1 && (
                            <button
                              onClick={() => moveSectionDown(section.id)}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Move down"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                          )}
                        </div>

                        {/* Position Input - UPDATED to show actual order */}
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="1"
                            max={form.sections.length}
                            value={section.order + 1}
                            onChange={(e) => moveSectionToPosition(section.id, parseInt(e.target.value))}
                            className="w-12 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reordering Hint */}
                <div className="mt-4 p-3 bg-blue-50/50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 text-center">
                    💡 Use arrows and position numbers to reorder sections
                  </p>
                </div>
              </div>
            )}

            {/* Active Sections */}
            {form.sections.map((section) => (
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
                onEditSectionConditional={setEditingSection}
                onSectionMoveUp={moveSectionUp}
                onSectionMoveDown={moveSectionDown}
                onFieldMoveUp={moveFieldUp}
                onFieldMoveDown={moveFieldDown}
                sectionIndex={section.order}
                totalSections={form.sections.length}
              />
            ))}

            {/* Add Section Button */}
            <button
              onClick={addSection}
              className="w-full flex items-center justify-center gap-4 p-6 lg:p-8 bg-white/80 backdrop-blur-sm border-2 border-dashed border-purple-300 rounded-2xl text-purple-600 hover:bg-white hover:border-purple-400 hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-blue-200 transition-all duration-300 shadow-inner">
                <Plus className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />
              </div>
              <div className="text-left">
                <div className="font-bold text-lg lg:text-xl text-gray-800">
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

      {/* Field Conditional Logic Popup */}
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

      {/* Section Conditional Logic Popup */}
      {editingSection && (
        <SectionConditionalPopup
          section={editingSection}
          sections={form.sections}
          onSave={(rules) => {
            updateSectionConditionalRules(editingSection.id, rules);
            setEditingSection(null);
          }}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  );
};