'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Palette, 
  Building2, 
  Layout, 
  Sparkles, 
  Plus, 
  Copy, 
  Search, 
  FolderOpen,
  Grid,
  List,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';

// Create button component for navbar
export function CreateFormButton() {
  const [isCreating, setIsCreating] = useState(false);

  const handleQuickCreate = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Form',
          description: '',
          theme: {
            primaryColor: '#7C3AED',
            backgroundColor: '#FFFFFF', 
            textColor: '#1F2937',
            fontFamily: 'Inter'
          },
          status: 'draft'
        })
      });

      if (!response.ok) {
        throw new Error('Form creation failed');
      }

      const data = await response.json();
      const formId = data.formId || data.id;

      if (formId) {
        toast.success('Form created!');
        window.location.href = `/admin/forms/builder/${formId}`;
      } else {
        window.location.href = '/admin/forms';
      }
    } catch (error) {
      toast.error('Failed to create form');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <button
      onClick={handleQuickCreate}
      disabled={isCreating}
      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors text-sm font-medium"
    >
      <Plus className="w-4 h-4" />
      {isCreating ? 'Creating...' : 'New Form'}
    </button>
  );
}

interface Form {
  _id: string;
  title: string;
  description: string;
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  sections: any[];
  settings: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CreateFormPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [existingForms, setExistingForms] = useState<Form[]>([]);
  const [isLoadingForms, setIsLoadingForms] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFormSelector, setShowFormSelector] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const router = useRouter();

  // Fetch existing forms
  useEffect(() => {
    const fetchForms = async () => {
      setIsLoadingForms(true);
      try {
        const response = await fetch('/api/forms/list');
        if (response.ok) {
          const data = await response.json();
          setExistingForms(data.forms || []);
        } else {
          throw new Error('Failed to fetch forms');
        }
      } catch (error) {
        console.error('Failed to fetch forms:', error);
        toast.error('Failed to load existing forms');
      } finally {
        setIsLoadingForms(false);
      }
    };

    fetchForms();
  }, []);

  const filteredForms = existingForms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    form.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create blank form
  const handleCreateBlankForm = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Untitled Form',
          description: '',
          theme: {
            primaryColor: '#7C3AED',
            backgroundColor: '#FFFFFF', 
            textColor: '#1F2937',
            fontFamily: 'Inter'
          },
          status: 'draft'
        })
      });

      if (!response.ok) {
        throw new Error('Form creation failed');
      }

      const data = await response.json();
      const formId = data.formId || data.id;

      if (formId) {
        toast.success('Form created successfully!');
        router.push(`/admin/forms/builder/${formId}`);
      } else {
        window.location.href = '/admin/forms';
      }
    } catch (error) {
      toast.error('Failed to create form');
    } finally {
      setIsCreating(false);
    }
  };

  // Duplicate existing form
 // Duplicate existing form - FIXED VERSION
// Duplicate existing form - COMPLETE DEEP CLONE
const handleDuplicateForm = async (formToDuplicate: Form) => {
  setIsCreating(true);
  try {
    console.log('Original form to duplicate:', formToDuplicate);
    
    // Create a complete deep clone of the entire form
    const formData = JSON.parse(JSON.stringify({
      ...formToDuplicate,
      title: `${formToDuplicate.title} Copy`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _id: undefined, // Remove the original ID so MongoDB creates a new one
      __v: undefined // Remove version key
    }));

    console.log('Form data being sent for duplication:', formData);

    const response = await fetch('/api/forms/duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formData })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API error response:', errorData);
      throw new Error(errorData.error || errorData.message || 'Form duplication failed');
    }

    const data = await response.json();
    console.log('API success response:', data);
    
    const formId = data.formId || data.id;

    if (formId) {
      toast.success('Form duplicated successfully!');
      router.push(`/admin/forms/builder/${formId}`);
    } else {
      toast.success('Form duplicated! Redirecting...');
      router.push('/admin/forms');
    }

  } catch (error) {
    console.error('Form duplication error:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to duplicate form');
  } finally {
    setIsCreating(false);
    setShowFormSelector(false);
  }
};

  // Main creation page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-6xl w-full bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 border border-white/20">
        <div className="text-center mb-8 sm:mb-12">
          <div className="relative inline-block">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-5 mx-auto">
              <FolderOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-6 sm:h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-br from-gray-800 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
            Create New Form
          </h1>
          <p className="text-gray-500 text-sm sm:text-base md:text-lg">
            Create a blank form or duplicate an existing one
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 md:gap-12 mb-8 sm:mb-12">
          {/* Create Blank Form */}
          <div 
            onClick={handleCreateBlankForm}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-white/80 cursor-pointer transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-200">
                <Plus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                Create Blank Form
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                Start with a completely empty form and build from scratch
              </p>
              {isCreating && (
                <div className="mt-4 flex items-center justify-center gap-2 text-blue-600 text-sm">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </div>
              )}
            </div>
          </div>

          {/* Duplicate Existing Form */}
          <div 
            onClick={() => setShowFormSelector(true)}
            className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border-2 border-dashed border-gray-300 hover:border-purple-400 hover:bg-white/80 cursor-pointer transition-all duration-200 group"
          >
            <div className="text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-4 sm:mb-6 mx-auto group-hover:scale-110 transition-transform duration-200">
                <Copy className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                Duplicate Form
              </h3>
              <p className="text-gray-500 text-sm sm:text-base">
                Make a copy of an existing form with all its content
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            {existingForms.length} forms available to duplicate
          </p>
        </div>
      </div>

      {/* Form Selector Modal for Duplication */}
      {showFormSelector && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-7xl w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-6 sm:p-8 border border-white/20 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFormSelector(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                    Duplicate Form
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base">
                    Select a form to duplicate
                  </p>
                </div>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mb-6 sm:mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search forms by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 bg-white/50 backdrop-blur-sm"
                />
              </div>
            </div>

            {/* Forms Grid/List */}
            {isLoadingForms ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            ) : filteredForms.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No forms found
                </h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Try adjusting your search terms' : 'Create your first form to get started'}
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                  : 'space-y-4'
              }>
                {filteredForms.map((form) => (
                  <div
                    key={form._id}
                    className={`bg-white rounded-2xl border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all duration-200 group ${
                      viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'p-4 sm:p-6'
                    }`}
                  >
                    {/* Form Preview */}
                    <div className={`${
                      viewMode === 'list' 
                        ? 'w-16 h-16 flex-shrink-0' 
                        : 'w-full aspect-video mb-4'
                    } bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: form.theme.primaryColor }}
                      ></div>
                    </div>

                    {/* Form Info */}
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <h3 className="font-semibold text-gray-800 text-sm sm:text-base mb-1 group-hover:text-purple-600 transition-colors">
                        {form.title}
                      </h3>
                      <p className="text-gray-500 text-xs sm:text-sm mb-2 line-clamp-2">
                        {form.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {form.sections?.length || 0} sections
                        </span>
                        <span>
                          {new Date(form.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Duplicate Button */}
                    {viewMode === 'grid' && (
                      <button 
                        onClick={() => handleDuplicateForm(form)}
                        disabled={isCreating}
                        className="w-full mt-4 py-2 bg-gray-100 hover:bg-purple-600 text-gray-700 hover:text-white rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isCreating ? 'Duplicating...' : 'Duplicate Form'}
                      </button>
                    )}
                    
                    {viewMode === 'list' && (
                      <button 
                        onClick={() => handleDuplicateForm(form)}
                        disabled={isCreating}
                        className="px-4 py-2 bg-gray-100 hover:bg-purple-600 text-gray-700 hover:text-white rounded-lg transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {isCreating ? 'Duplicating...' : 'Duplicate'}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}