'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Building2, Layout, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateFormPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: {
      primaryColor: '#7C3AED',
      backgroundColor: '#FFFFFF', 
      textColor: '#1F2937',
      fontFamily: 'Inter'
    }
  });
  const [isCreating, setIsCreating] = useState(false);

  const router = useRouter();

  const handleCreateForm = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a form title');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          theme: formData.theme,
          status: 'draft'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Form creation failed');
      }

      const data = await response.json();
      console.log('Form creation response:', data);

      // Try multiple possible ID locations
      let formId: string | undefined;

      // Check common response structures
      if (data.form && data.form.id) {
        formId = data.form.id;
      } else if (data.id) {
        formId = data.id;
      } else if (data.data && data.data.id) {
        formId = data.data.id;
      } else if (data.formId) {
        formId = data.formId;
      } else if (data.newForm && data.newForm.id) {
        formId = data.newForm.id;
      } else if (data.insertedId) {
        formId = data.insertedId; // MongoDB style
      } else if (typeof data === 'string') {
        formId = data; // If response is just the ID string
      }

      if (formId) {
        toast.success('Form created successfully!');
        router.push(`/admin/forms/builder/${formId}`);
      } else {
        // If we can't get the ID, show success but suggest manual navigation
        toast.success('Form created! Redirecting to forms list...');
        router.push('/admin/forms');
      }

    } catch (error) {
      console.error('Form creation error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create form');
    } finally {
      setIsCreating(false);
    }
  };

  if (step === 1) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-lg w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
          <div className="text-center mb-10">
            <div className="relative inline-block">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-5 mx-auto">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-800 to-purple-600 bg-clip-text text-transparent mb-3">
              Create New Form
            </h1>
            <p className="text-gray-500 text-lg">
              Start by giving your form a title and description
            </p>
          </div>

          <div className="space-y-7">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Form Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Customer Feedback Survey"
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this form is for and what information you want to collect..."
                rows={4}
                className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl resize-none focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.title.trim()}
              className="w-full py-4 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              Continue to Design
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="max-w-6xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-5 mx-auto">
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full border-2 border-white"></div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-br from-gray-800 to-purple-600 bg-clip-text text-transparent mb-3">
              Customize Your Form
            </h1>
            <p className="text-gray-500 text-lg">
              Choose colors and fonts that match your brand
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-10">
            {/* Color Customization */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Color Scheme</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Primary Color</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={formData.theme.primaryColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, primaryColor: e.target.value }
                      }))}
                      className="w-16 h-16 rounded-2xl cursor-pointer shadow-lg border-2 border-white"
                    />
                    <input
                      type="text"
                      value={formData.theme.primaryColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, primaryColor: e.target.value }
                      }))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Background Color</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={formData.theme.backgroundColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, backgroundColor: e.target.value }
                      }))}
                      className="w-16 h-16 rounded-2xl cursor-pointer shadow-lg border-2 border-white"
                    />
                    <input
                      type="text"
                      value={formData.theme.backgroundColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, backgroundColor: e.target.value }
                      }))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Font Customization */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Layout className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800">Typography</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Font Family</label>
                  <select
                    value={formData.theme.fontFamily}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      theme: { ...prev.theme, fontFamily: e.target.value }
                    }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 bg-white"
                  >
                    <option value="Inter">Inter - Modern & Clean</option>
                    <option value="Roboto">Roboto - Versatile & Professional</option>
                    <option value="Open Sans">Open Sans - Friendly & Legible</option>
                    <option value="Poppins">Poppins - Geometric & Elegant</option>
                    <option value="Montserrat">Montserrat - Stylish & Bold</option>
                  </select>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Text Color</label>
                  <div className="flex gap-4 items-center">
                    <input
                      type="color"
                      value={formData.theme.textColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, textColor: e.target.value }
                      }))}
                      className="w-16 h-16 rounded-2xl cursor-pointer shadow-lg border-2 border-white"
                    />
                    <input
                      type="text"
                      value={formData.theme.textColor}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        theme: { ...prev.theme, textColor: e.target.value }
                      }))}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center pt-8 border-t border-gray-200/50">
            <button
              onClick={() => setStep(1)}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50/80 hover:border-gray-400 transition-all duration-200 font-semibold"
            >
              ← Back
            </button>
            <button
              onClick={handleCreateForm}
              disabled={isCreating}
              className="px-12 py-4 bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl font-semibold text-lg"
            >
              {isCreating ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Creating Form...
                </div>
              ) : (
                'Create Form & Open Builder'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
}