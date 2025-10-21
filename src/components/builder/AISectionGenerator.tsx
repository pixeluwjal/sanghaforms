// components/builder/AISectionGenerator.tsx
"use client";

import { useState } from 'react';
import { Sparkles, Loader, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Section, Field } from './shared/types';

interface AISectionGeneratorProps {
  onSectionGenerate: (section: Section) => void;
  currentSections: Section[];
  onClose: () => void;
}

export const AISectionGenerator = ({ 
  onSectionGenerate, 
  currentSections, 
  onClose 
}: AISectionGeneratorProps) => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewSection, setPreviewSection] = useState<Section | null>(null);

  const generateSection = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for the section');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setPreviewSection(null);

    try {
      const response = await fetch('/api/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          currentSections: currentSections.map(s => ({ 
            title: s.title, 
            fields: s.fields.map(f => ({ type: f.type, label: f.label }))
          }))
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate section');
      }

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      // Convert the AI-generated data to our Section format
      const generatedSection: Section = {
        id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: data.data.title,
        description: data.data.description,
        order: currentSections.length,
        fields: data.data.fields.map((fieldData: any, index: number) => {
          const field: Field = {
            id: `field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: fieldData.type,
            label: fieldData.label,
            placeholder: fieldData.placeholder || `Enter ${fieldData.label.toLowerCase()}`,
            required: fieldData.required || false,
            order: index,
            conditionalRules: [],
            nestedFields: [],
          };

          // Add options for field types that support them
          if (fieldData.options && Array.isArray(fieldData.options)) {
            field.options = fieldData.options;
          }

          return field;
        }),
        conditionalRules: [],
      };

      setPreviewSection(generatedSection);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseSection = () => {
    if (previewSection) {
      onSectionGenerate(previewSection);
      onClose();
    }
  };

  const handleRegenerate = () => {
    setPreviewSection(null);
    generateSection();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">AI Section Generator</h2>
                <p className="text-purple-100 text-sm">
                  Describe the section you want to create
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Prompt Input */}
          {!previewSection && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Describe your section
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Example: A contact information section with name, email, phone number, and preferred contact method..."
                  className="w-full h-32 border-2 border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  disabled={isGenerating}
                />
                <p className="text-sm text-gray-500 mt-2">
                  Be specific about what information you want to collect in this section.
                </p>
              </div>

              {/* Examples */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                <h4 className="font-semibold text-purple-800 text-sm mb-2">
                  💡 Example Prompts:
                </h4>
                <ul className="text-sm text-purple-600 space-y-1">
                  <li>• "Personal information section with name, date of birth, and gender"</li>
                  <li>• "Event registration with meal preferences and dietary restrictions"</li>
                  <li>• "Feedback form with rating, comments, and contact permission"</li>
                </ul>
              </div>
            </div>
          )}

          {/* Preview Section */}
          {previewSection && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-xl p-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Section generated successfully!</span>
              </div>

              <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-5 border-2 border-gray-200/50">
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {previewSection.title}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  {previewSection.description}
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-700 text-sm">
                    Fields to be created:
                  </h4>
                  {previewSection.fields.map((field, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-purple-600">
                          {field.type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm">
                          {field.label}
                        </div>
                        <div className="text-xs text-gray-500 capitalize">
                          {field.type} • {field.required ? 'Required' : 'Optional'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-4">
          {!previewSection ? (
            <>
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-300 font-semibold"
                disabled={isGenerating}
              >
                Cancel
              </button>
              <button
                onClick={generateSection}
                disabled={isGenerating || !prompt.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Generate Section
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setPreviewSection(null)}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-300 font-semibold"
              >
                Back
              </button>
              <button
                onClick={handleRegenerate}
                className="flex-1 px-6 py-3 border-2 border-purple-300 rounded-xl text-purple-600 hover:bg-purple-50 transition-all duration-300 font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Regenerate
              </button>
              <button
                onClick={handleUseSection}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
              >
                Use This Section
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};