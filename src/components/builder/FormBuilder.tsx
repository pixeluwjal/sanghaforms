// components/builder/FormBuilder.tsx
"use client";

import { useState, useRef } from "react";
import { Form, Section, Field } from "@/components/builder/shared/types";
import { FormSection } from "@/components/builder/FormSection";
import { FieldToolbox } from "@/components/builder/FieldToolbox";
import { ConditionalLogicPopup } from "@/components/builder/ConditionalLogicPopup";
import { SectionConditionalPopup } from "@/components/builder/SectionConditionalPopup";
import { AISectionGenerator } from "@/components/builder/AISectionGenerator";
import {
  Plus,
  Image as ImageIcon,
  X,
  Upload,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
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
    supportsOptions: false,
  },
  {
    type: "email",
    label: "Email",
    icon: "Mail",
    supportsOptions: false,
  },
  {
    type: "number",
    label: "Number",
    icon: "Hash",
    supportsOptions: false,
  },
  {
    type: "textarea",
    label: "Text Area",
    icon: "FileText",
    supportsOptions: false,
  },
  {
    type: "select",
    label: "Dropdown",
    icon: "List",
    supportsOptions: true,
  },
  {
    type: "radio",
    label: "Radio Group",
    icon: "Circle",
    supportsOptions: true,
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    icon: "Square",
    supportsOptions: true,
  },
  {
    type: "date",
    label: "Date Picker",
    icon: "Calendar",
    supportsOptions: false,
  },
  {
    type: "file",
    label: "File Upload",
    icon: "Upload",
    supportsOptions: false,
  },
  {
    type: "sangha",
    label: "Sangha Hierarchy",
    icon: "Users",
    supportsOptions: false,
  },
  {
    type: "whatsapp_optin",
    label: "WhatsApp Opt-in",
    icon: "MessageCircle",
    supportsOptions: false,
  },
  {
    type: "arratai_optin",
    label: "Arratai Opt-in",
    icon: "Users",
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

// Improved Image Upload Component
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

      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.success && result.url) {
        console.log('✅ Image uploaded successfully:', result.url);
        onImageUpload(result.url);
      } else {
        throw new Error('Upload failed: No URL returned');
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
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

  const getDimensions = () => {
    if (type === "logo") {
      return "w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32";
    }
    return "w-full h-32 sm:h-36 md:h-40 lg:h-48";
  };

  const label = type === "logo" ? "Logo" : "Banner";

  return (
    <div className={`${className}`}>
      <label className="block text-sm font-medium text-black mb-2">
        {label}
      </label>

      {currentImage ? (
        <div className="relative group">
          <div
            className={`${getDimensions()} border-2 border-dashed border-purple-300 rounded-lg overflow-hidden mx-auto`}
          >
            <img
              src={currentImage}
              alt={label}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onImageRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          <div className="mt-2 text-center">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Change {label}
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`${getDimensions()} border-2 border-dashed ${
            dragOver ? "border-purple-500 bg-purple-50" : "border-purple-300"
          } rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors mx-auto ${
            uploading ? "opacity-50" : "hover:border-purple-400 hover:bg-purple-50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">Uploading...</p>
            </div>
          ) : (
            <>
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-1 sm:mb-2" />
              <p className="text-xs sm:text-sm text-black text-center px-2">
                Drag & drop or click to upload
              </p>
              <p className="text-xs text-gray-600 mt-1 px-2 text-center">
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

// Preview Component for Default Values
const DefaultValuePreview: React.FC<{
  section: Section;
  onUpdate: (sectionId: string, updates: Partial<Section>) => void;
}> = ({ section, onUpdate }) => {
  return (
    <div className="mt-4 p-3 sm:p-4 bg-purple-50 rounded-xl border-2 border-purple-300">
      <h4 className="text-base sm:text-lg font-semibold text-black mb-3 flex items-center gap-2">
        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
        Default Value Preview
      </h4>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-black mb-1">
            Section Default Value
          </label>
          <input
            type="text"
            value={section.defaultValue || ''}
            onChange={(e) => onUpdate(section.id, { defaultValue: e.target.value })}
            className="w-full border-2 border-purple-300 rounded-lg px-3 py-2 text-black focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm sm:text-base"
            placeholder="Enter section default value"
          />
        </div>

        {section.fields.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-black mb-2">
              Field Default Values
            </label>
            <div className="space-y-2">
              {section.fields.map((field) => (
                <div key={field.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2 bg-white rounded-lg border border-purple-200">
                  <span className="text-sm font-medium text-black flex-1 min-w-0 break-words">
                    {field.label}
                  </span>
                  <input
                    type="text"
                    value={field.defaultValue || ''}
                    onChange={(e) => {
                      console.log(`Update field ${field.id} default value:`, e.target.value);
                    }}
                    className="flex-1 border border-purple-300 rounded px-2 py-1 text-sm text-black min-w-0"
                    placeholder={`Default ${field.type} value`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const FormBuilder = ({ form, updateForm }: FormBuilderProps) => {
  const [editingField, setEditingField] = useState<Field | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showImageSettings, setShowImageSettings] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Helper functions
  const createNewField = (type: string, label?: string): Field => {
    const fieldConfig = FIELD_TYPES.find((f) => f.type === type);
    const defaultLabel = label || (fieldConfig ? fieldConfig.label : "Field");

    const baseField = {
      id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      label: defaultLabel,
      placeholder: `Enter ${defaultLabel.toLowerCase()}`,
      required: false,
      order: 0,
      conditionalRules: [],
      nestedFields: [],
    };

    if (type === 'readonly_text') {
      return {
        ...baseField,
        defaultValue: 'Default Value',
      };
    }

    if (type === 'source') {
      return {
        ...baseField,
        options: ["Mane Mane Samparka", "Street Samparka"],
      };
    }

    if (fieldConfig && fieldConfig.supportsOptions) {
      return {
        ...baseField,
        options: ["Option 1", "Option 2"],
      };
    }

    return baseField;
  };

  const createNewSection = (title?: string): Section => {
    return {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title || "New Section",
      description: "Section description",
      order: form.sections.length,
      fields: [],
      conditionalRules: [],
      defaultValue: "",
    };
  };

  // Add this new function for AI-generated sections
  const handleAISectionGenerate = (generatedSection: Section) => {
    const updatedSections = [...form.sections, generatedSection];
    updateForm({ sections: updatedSections });
    setCurrentSectionIndex(updatedSections.length - 1);
  };

  // Image handlers
  const handleLogoUpload = async (url: string) => {
    try {
      console.log('🔄 Saving logo to database:', url);
      
      const updatedForm = {
        ...form,
        images: {
          ...form.images,
          logo: url,
        },
      };
      
      updateForm(updatedForm);
      
      const response = await fetch('/api/forms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form._id,
          images: {
            ...form.images,
            logo: url,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save logo to database');
      }

      console.log('✅ Logo saved to database successfully');
    } catch (error) {
      console.error('❌ Error saving logo to database:', error);
      alert('Logo uploaded but failed to save. Please try again.');
    }
  };

  const handleLogoRemove = async () => {
    try {
      console.log('🔄 Removing logo from database');
      
      const updatedForm = {
        ...form,
        images: {
          ...form.images,
          logo: "",
        },
      };
      
      updateForm(updatedForm);
      
      const response = await fetch('/api/forms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form._id,
          images: {
            ...form.images,
            logo: "",
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove logo from database');
      }

      console.log('✅ Logo removed from database successfully');
    } catch (error) {
      console.error('❌ Error removing logo from database:', error);
      alert('Failed to remove logo. Please try again.');
    }
  };

  const handleBannerUpload = async (url: string) => {
    try {
      console.log('🔄 Saving banner to database:', url);
      
      const updatedForm = {
        ...form,
        images: {
          ...form.images,
          banner: url,
        },
      };
      
      updateForm(updatedForm);
      
      const response = await fetch('/api/forms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form._id,
          images: {
            ...form.images,
            banner: url,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save banner to database');
      }

      console.log('✅ Banner saved to database successfully');
    } catch (error) {
      console.error('❌ Error saving banner to database:', error);
      alert('Banner uploaded but failed to save. Please try again.');
    }
  };

  const handleBannerRemove = async () => {
    try {
      console.log('🔄 Removing banner from database');
      
      const updatedForm = {
        ...form,
        images: {
          ...form.images,
          banner: "",
        },
      };
      
      updateForm(updatedForm);
      
      const response = await fetch('/api/forms', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formId: form._id,
          images: {
            ...form.images,
            banner: "",
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove banner from database');
      }

      console.log('✅ Banner removed from database successfully');
    } catch (error) {
      console.error('❌ Error removing banner from database:', error);
      alert('Failed to remove banner. Please try again.');
    }
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
    setCurrentSectionIndex(updatedSections.length - 1);
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
    
    if (currentSectionIndex >= updatedSections.length) {
      setCurrentSectionIndex(updatedSections.length - 1);
    }
  };

  // Section reordering functions
  const moveSectionUp = (sectionId: string) => {
    const currentIndex = form.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex > 0) {
      const newSections = [...form.sections];
      const [section] = newSections.splice(currentIndex, 1);
      newSections.splice(currentIndex - 1, 0, section);
      
      const sectionsWithUpdatedOrder = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      updateForm({ sections: sectionsWithUpdatedOrder });
      
      if (currentSectionIndex === currentIndex) {
        setCurrentSectionIndex(currentIndex - 1);
      } else if (currentSectionIndex === currentIndex - 1) {
        setCurrentSectionIndex(currentIndex);
      }
    }
  };

  const moveSectionDown = (sectionId: string) => {
    const currentIndex = form.sections.findIndex((s) => s.id === sectionId);
    if (currentIndex < form.sections.length - 1) {
      const newSections = [...form.sections];
      const [section] = newSections.splice(currentIndex, 1);
      newSections.splice(currentIndex + 1, 0, section);
      
      const sectionsWithUpdatedOrder = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      updateForm({ sections: sectionsWithUpdatedOrder });
      
      if (currentSectionIndex === currentIndex) {
        setCurrentSectionIndex(currentIndex + 1);
      } else if (currentSectionIndex === currentIndex + 1) {
        setCurrentSectionIndex(currentIndex);
      }
    }
  };

  const moveSectionToPosition = (sectionId: string, newPosition: number) => {
    const currentIndex = form.sections.findIndex((s) => s.id === sectionId);
    const newIndex = newPosition - 1;
    
    if (currentIndex !== newIndex && newIndex >= 0 && newIndex < form.sections.length) {
      const newSections = [...form.sections];
      const [section] = newSections.splice(currentIndex, 1);
      newSections.splice(newIndex, 0, section);
      
      const sectionsWithUpdatedOrder = newSections.map((section, index) => ({
        ...section,
        order: index
      }));
      
      updateForm({ sections: sectionsWithUpdatedOrder });
      
      if (currentSectionIndex === currentIndex) {
        setCurrentSectionIndex(newIndex);
      } else if (currentIndex < newIndex && currentSectionIndex <= newIndex && currentSectionIndex > currentIndex) {
        setCurrentSectionIndex(currentSectionIndex - 1);
      } else if (currentIndex > newIndex && currentSectionIndex >= newIndex && currentSectionIndex < currentIndex) {
        setCurrentSectionIndex(currentSectionIndex + 1);
      }
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
      setCurrentSectionIndex(0);
    } else {
      const currentSection = form.sections[currentSectionIndex];
      addFieldToSection(currentSection.id, fieldType);
    }
    setMobileSidebarOpen(false);
  };

  // Navigation functions
  const goToPreviousSection = () => {
    if (currentSectionIndex > 0) {
      setCurrentSectionIndex(currentSectionIndex - 1);
    }
  };

  const goToNextSection = () => {
    if (currentSectionIndex < form.sections.length - 1) {
      setCurrentSectionIndex(currentSectionIndex + 1);
    }
  };

  const goToSection = (index: number) => {
    if (index >= 0 && index < form.sections.length) {
      setCurrentSectionIndex(index);
    }
  };

  const currentSection = form.sections[currentSectionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden">
      <div className="h-screen flex flex-col">
        {/* Header with Image Settings */}
        <div className="flex-shrink-0 bg-white border-b-2 border-purple-300 px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className="p-2 bg-white border-2 border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors"
              >
                <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="flex-1 text-center min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent truncate">
                Form Builder
              </h1>
              <p className="text-black mt-1 text-xs sm:text-sm lg:text-base truncate">
                Build your form by adding fields and sections
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-white border-2 border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors text-xs sm:text-sm"
              >
                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Preview</span>
              </button>
              <button
                onClick={() => setShowImageSettings(!showImageSettings)}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-white border-2 border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 transition-colors text-xs sm:text-sm"
              >
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden xs:inline">Images</span>
              </button>
            </div>
          </div>

          {/* Banner Preview */}
          {form.images?.banner && (
            <div className="mt-3 rounded-xl overflow-hidden shadow-lg border-2 border-purple-300">
              <img
                src={form.images.banner}
                alt="Form Banner"
                className="w-full h-16 sm:h-20 lg:h-24 xl:h-28 object-cover"
              />
            </div>
          )}

          {/* Image Settings Panel */}
          {showImageSettings && (
            <div className="fixed inset-4 sm:absolute sm:top-full sm:left-auto sm:right-0 sm:mt-2 w-auto max-w-[calc(100vw-2rem)] sm:w-80 bg-white border-2 border-purple-300 rounded-xl shadow-xl z-50 p-3 sm:p-4 transform sm:translate-x-0">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="font-semibold text-black text-sm sm:text-base">Form Images</h3>
                <button
                  onClick={() => setShowImageSettings(false)}
                  className="text-purple-400 hover:text-purple-600"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <ImageUpload
                  type="logo"
                  currentImage={form.images?.logo}
                  onImageUpload={handleLogoUpload}
                  onImageRemove={handleLogoRemove}
                  className="text-center"
                />

                <ImageUpload
                  type="banner"
                  currentImage={form.images?.banner}
                  onImageUpload={handleBannerUpload}
                  onImageRemove={handleBannerRemove}
                  className="text-center"
                />
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Toolbox Sidebar - Left */}
          <div className={`flex-shrink-0 ${
            mobileSidebarOpen 
              ? 'fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform translate-x-0 transition-transform duration-300' 
              : 'fixed -translate-x-full lg:relative lg:translate-x-0 lg:w-80'
          }`}>
            <div className="h-full overflow-y-auto border-r-2 border-purple-300 bg-white">
              <FieldToolbox onFieldAdd={handleToolboxFieldAdd} />
            </div>
          </div>

          {/* Main Builder Area - Right */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Section Navigation Header */}
            <div className="flex-shrink-0 bg-white border-b-2 border-purple-300 p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-black truncate">
                    {currentSection ? currentSection.title : "No Sections"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {currentSection ? `${currentSection.fields.length} field(s)` : "Add a section to get started"}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {/* AI Generate Button */}
                  <button
                    onClick={() => setShowAIGenerator(true)}
                    className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-semibold text-xs sm:text-sm"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">AI Generate</span>
                  </button>

                  {/* Section Counter */}
                  <div className="text-xs sm:text-sm text-black font-medium whitespace-nowrap">
                    {currentSectionIndex + 1}/{form.sections.length}
                  </div>
                  
                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={goToPreviousSection}
                      disabled={currentSectionIndex === 0}
                      className="p-1 sm:p-2 bg-purple-100 hover:bg-purple-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-purple-600"
                    >
                      <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    
                    <button
                      onClick={goToNextSection}
                      disabled={currentSectionIndex === form.sections.length - 1}
                      className="p-1 sm:p-2 bg-purple-100 hover:bg-purple-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-purple-600"
                    >
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Section Quick Navigation */}
              {form.sections.length > 1 && (
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1 overflow-x-auto pb-1">
                    {form.sections.map((section, index) => (
                      <button
                        key={section.id}
                        onClick={() => goToSection(index)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 whitespace-nowrap min-w-[2rem] text-center ${
                          index === currentSectionIndex
                            ? 'bg-purple-600 text-white shadow border border-purple-600'
                            : 'bg-purple-100 text-black border border-purple-300 hover:bg-purple-200'
                        }`}
                      >
                        {section.title ? (section.title.length > 10 ? `${section.title.substring(0, 8)}...` : section.title) : `S${index + 1}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <div className="p-3 sm:p-4 space-y-4">
                  {/* Default Value Preview */}
                  {showPreview && currentSection && (
                    <DefaultValuePreview
                      section={currentSection}
                      onUpdate={updateSection}
                    />
                  )}

                  {/* Current Active Section */}
                  {currentSection ? (
                    <div className="bg-white rounded-xl border-2 border-purple-300 shadow-lg">
                      <FormSection
                        key={currentSection.id}
                        section={currentSection}
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
                        sectionIndex={currentSection.order}
                        totalSections={form.sections.length}
                      />
                    </div>
                  ) : (
                    /* Empty State */
                    <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-purple-300 shadow-lg text-center">
                      <div className="max-w-md mx-auto">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 border-2 border-purple-300">
                          <Plus className="w-5 h-5 sm:w-8 sm:h-8 text-purple-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold text-black mb-2">
                          No Sections Yet
                        </h3>
                        <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                          Start building your form by adding your first section.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                          <button
                            onClick={addSection}
                            className="bg-purple-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium border-2 border-purple-600 text-sm sm:text-base"
                          >
                            Create First Section
                          </button>
                          <button
                            onClick={() => setShowAIGenerator(true)}
                            className="flex items-center justify-center gap-1 sm:gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:shadow-lg transition-all duration-300 font-medium border-2 border-purple-600 text-sm sm:text-base"
                          >
                            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                            AI Generate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Add Section Button */}
                  <button
                    onClick={addSection}
                    className="w-full flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 bg-white border-2 border-dashed border-purple-300 rounded-xl text-purple-600 hover:bg-purple-50 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-100 to-purple-200 rounded-full flex items-center justify-center group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300 shadow-inner border-2 border-purple-300">
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-sm sm:text-base text-black">
                        Add New Section
                      </div>
                      <div className="text-purple-600 text-xs sm:text-sm">
                        Organize your form into multiple sections
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
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

      {/* AI Section Generator Popup */}
      {showAIGenerator && (
        <AISectionGenerator
          onSectionGenerate={handleAISectionGenerate}
          currentSections={form.sections}
          onClose={() => setShowAIGenerator(false)}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
    </div>
  );
};