import { Form, Section } from './types';
import ImageUploadSection from '../image-upload/ImageUploadSection';
import { X } from 'lucide-react';

interface PropertiesPanelProps {
  form: Form;
  updateForm: (updates: Partial<Form>) => void;
  selectedSection: Section | null;
  setSelectedSectionId: (id: string | null) => void;
}

export default function PropertiesPanel({ form, updateForm, selectedSection, setSelectedSectionId }: PropertiesPanelProps) {

  const handleSectionUpdate = (updates: Partial<Section>) => {
    if (!selectedSection) return;
    const updatedSections = form.sections.map(s => 
      s.id === selectedSection.id ? { ...s, ...updates } : s
    );
    updateForm({ sections: updatedSections });
  };
  
  const handleImageUpload = (type: 'logo' | 'banner', url: string) => {
    updateForm({ images: { ...form.images, [type]: url } });
  };

  const handleImageRemove = (type: 'logo' | 'banner') => {
    const updatedImages = { ...form.images };
    delete updatedImages[type];
    updateForm({ images: updatedImages });
  };

  return (
    <div className="sticky top-6">
      {selectedSection ? (
        // --- Show Section-Specific Settings ---
        <div>
          <div className="flex justify-between items-center border-b pb-3 mb-6">
            <h2 className="text-lg font-bold text-gray-800">Section Properties</h2>
            <button 
              onClick={() => setSelectedSectionId(null)} 
              className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Deselect Section"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 mb-1.5">
                Section Title
              </label>
              <input
                type="text"
                id="section-title"
                value={selectedSection.title}
                onChange={(e) => handleSectionUpdate({ title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm shadow-sm"
              />
            </div>
            <div>
              <label htmlFor="section-description" className="block text-sm font-medium text-gray-700 mb-1.5">
                Section Description (Optional)
              </label>
              <textarea
                id="section-description"
                rows={4}
                value={selectedSection.description}
                onChange={(e) => handleSectionUpdate({ description: e.target.value })}
                placeholder="Add a description to guide users..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm shadow-sm"
              />
            </div>
          </div>
        </div>
      ) : (
        // --- Show Global Form Settings ---
        <div>
          <h2 className="text-lg font-bold text-gray-800 border-b pb-3 mb-6">Form Settings</h2>
          <ImageUploadSection
            form={form}
            onImageUpload={handleImageUpload}
            onImageRemove={handleImageRemove}
            onThemeUpdate={(theme) => updateForm({ theme })}
          />
        </div>
      )}
    </div>
  );
}