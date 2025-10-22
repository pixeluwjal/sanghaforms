// app/admin/forms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  FileText,
  AlertCircle,
  RefreshCw,
  Plus,
  Check,
  X
} from 'lucide-react';

interface Form {
  _id: string;
  title: string;
  form_name: string;
  description: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  responsesCount: number;
  settings: {
    isActive: boolean;
    customSlug?: string;
  };
  createdBy: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [editingFormName, setEditingFormName] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const fetchForms = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/forms');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setForms(data.forms || []);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
      
    } catch (error: any) {
      setError(error.message || 'Failed to load forms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchForms();
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setForms(forms.filter(form => form._id !== formId));
        showToast('Form deleted successfully');
      } else {
        showToast('Failed to delete form', 'error');
      }
    } catch (error) {
      showToast('Error deleting form', 'error');
    }
  };

  const copyFormLink = (form: Form) => {
    const link = `${window.location.origin}/forms/${form.settings.customSlug || form._id}`;
    navigator.clipboard.writeText(link);
    showToast('Form link copied to clipboard!');
  };

  const startEditing = (form: Form) => {
    setEditingFormId(form._id);
    setEditingFormName(form.form_name || form.title);
  };

  const cancelEditing = () => {
    setEditingFormId(null);
    setEditingFormName('');
  };

// In your forms page
const saveFormName = async (formId: string) => {
  if (!editingFormName.trim()) {
    showToast('Form name cannot be empty', 'error');
    return;
  }

  try {
    const response = await fetch(`/api/admin/forms/${formId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        form_name: editingFormName.trim() // This will be mapped to form_name12
      }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      setForms(forms.map(form => 
        form._id === formId 
          ? { ...form, form_name: editingFormName.trim() }
          : form
      ));
      showToast('Form name updated successfully');
      setEditingFormId(null);
      setEditingFormName('');
    } else {
      showToast(data.error || 'Failed to update form name', 'error');
    }
  } catch (error) {
    showToast('Error updating form name', 'error');
  }
};

  // Safe status formatter
  const formatStatus = (status: string | undefined) => {
    if (!status) return 'Draft';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Safe status color
  const getStatusColor = (status: string | undefined) => {
    if (status === 'published') {
      return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg';
    }
    return 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg';
  };

  const getStatusIcon = (status: string | undefined) => {
    if (status === 'published') {
      return '🟢';
    }
    return '🟡';
  };

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(search.toLowerCase()) ||
    form.form_name?.toLowerCase().includes(search.toLowerCase()) ||
    form.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 border-4 border-purple-600 rounded-full animate-ping"></div>
          </div>
          <div className="space-y-2">
            <p className="text-gray-700 font-semibold text-lg">Loading your forms</p>
            <p className="text-gray-500 text-sm">Getting everything ready for you...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-2xl border transform animate-slide-in ${
            toast.type === 'success' 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
              : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                toast.type === 'success' ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'
              }`} />
              <p className="font-semibold">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Form Management
            </h1>
            <p className="text-gray-700 text-lg max-w-2xl leading-relaxed">
              Create, manage, and analyze all your forms in one beautiful workspace
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-white/80 backdrop-blur-sm text-gray-700 border border-gray-200 rounded-2xl hover:bg-white transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <Link
              href="/admin/forms/create"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create New Form
            </Link>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-6 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl flex items-start gap-4 animate-fade-in shadow-lg">
            <div className="flex-shrink-0 w-6 h-6 mt-0.5">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-bold text-lg">Unable to load forms</p>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchForms}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors shadow-md hover:shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Search and Stats Bar */}
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div className="flex-1 w-full max-w-2xl">
            <div className="relative group">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-purple-600" />
              <input
                type="text"
                placeholder="Search forms by title, name, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 text-gray-900 font-semibold shadow-lg hover:shadow-xl"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-gray-700 font-semibold bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
              <span className="text-purple-600">{filteredForms.length}</span> forms found
            </div>
            <button className="p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white transition-all duration-300 shadow-lg hover:shadow-xl">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
          {filteredForms.map((form, index) => (
            <div 
              key={form._id}
              className="group bg-white/90 backdrop-blur-sm rounded-3xl border border-gray-200/70 p-6 space-y-6 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-white animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="space-y-4">
                {/* Form Title */}
                <h3 className="font-bold text-gray-900 text-xl leading-tight line-clamp-2 group-hover:text-gray-800 transition-colors">
                  {form.title || 'Untitled Form'}
                </h3>

                {/* Editable Form Name */}
                <div className="space-y-2">
                  {editingFormId === form._id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={editingFormName}
                        onChange={(e) => setEditingFormName(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                        placeholder="Enter form name..."
                        autoFocus
                      />
                      <button
                        onClick={() => saveFormName(form._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="flex items-center gap-2 cursor-pointer group/name p-2 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => startEditing(form)}
                      title="Click to edit form name"
                    >
                      <span className="text-gray-700 font-semibold text-sm line-clamp-1 flex-1">
                        {form.form_name || 'Click to add form name'}
                      </span>
                      <Edit className="w-3 h-3 text-gray-400 opacity-0 group-hover/name:opacity-100 transition-opacity" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                  {form.description || 'No description provided'}
                </p>
              </div>

              {/* Status and Metrics */}
              <div className="flex items-center justify-between">
                <span className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${getStatusColor(form.status)}`}>
                  <span className="text-xs">{getStatusIcon(form.status)}</span>
                  {formatStatus(form.status)}
                </span>
                
                <div className="flex items-center gap-4 text-sm">
                  <span className="font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg">
                    {form.responsesCount || 0} responses
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => copyFormLink(form)}
                  className="flex-1 px-4 py-3 text-sm bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                
                <div className="flex items-center gap-1">
                  <Link
                    href={`/forms/${form.settings?.customSlug || form._id}`}
                    target="_blank"
                    className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Preview Form"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  
                  <Link
                    href={`/admin/forms/builder/${form._id}`}
                    className="p-3 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Edit Form"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => deleteForm(form._id)}
                    className="p-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                    title="Delete Form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Footer with Dates */}
              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                <span>Created: {new Date(form.createdAt).toLocaleDateString()}</span>
                <span>Updated: {new Date(form.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredForms.length === 0 && !error && (
          <div className="text-center py-16 lg:py-24 animate-fade-in">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl">
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {search ? 'No matching forms found' : 'Ready to create your first form?'}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-8 leading-relaxed">
              {search ? 'Try adjusting your search terms or create a new form' : 'Start collecting responses with beautifully crafted forms that convert'}
            </p>
            <Link
              href="/admin/forms/create"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Create Your First Form
            </Link>
          </div>
        )}
      </div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { 
            opacity: 0; 
            transform: translateY(30px) scale(0.95); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0) scale(1); 
          }
        }
        
        @keyframes slide-in {
          from { 
            opacity: 0; 
            transform: translateX(100px) scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0) scale(1); 
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .auto-rows-fr {
          grid-auto-rows: 1fr;
        }
      `}</style>
    </div>
  );
}