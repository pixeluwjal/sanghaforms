// app/admin/forms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  FileText,
  AlertCircle,
  RefreshCw,
  Plus
} from 'lucide-react';

interface Form {
  _id: string;
  title: string;
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
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
    console.log('🔄 STARTING TO FETCH FORMS...');
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/forms');
      console.log('📡 API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('📦 API Data received:', data);
      
      if (data.success) {
        console.log(`✅ Found ${data.forms?.length || 0} forms`);
        setForms(data.forms || []);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
      
    } catch (error: any) {
      console.error('❌ Error fetching forms:', error);
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
        setActiveMenu(null);
      } else {
        showToast('Failed to delete form', 'error');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      showToast('Error deleting form', 'error');
    }
  };

  const copyFormLink = (form: Form) => {
    const link = `${window.location.origin}/forms/${form.settings.customSlug || form._id}`;
    navigator.clipboard.writeText(link);
    showToast('Form link copied to clipboard!');
    setActiveMenu(null);
  };

  const toggleMenu = (formId: string) => {
    setActiveMenu(activeMenu === formId ? null : formId);
  };

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(search.toLowerCase()) ||
    form.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-700 font-medium">Loading your forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Toast Notification */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg border transform animate-slide-in ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <p className="font-medium">{toast.message}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Your Forms
            </h1>
            <p className="text-gray-700 text-lg max-w-2xl">
              Create, manage, and analyze all your forms in one beautiful workspace
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
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
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 animate-fade-in">
            <div className="flex-shrink-0 w-6 h-6 mt-0.5">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-lg">Unable to load forms</p>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={fetchForms}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition-colors"
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
                placeholder="Search forms by title or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 text-gray-900 font-medium shadow-sm hover:shadow-md"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <div className="text-gray-700">
              <span className="font-semibold">{filteredForms.length}</span> forms
            </div>
            <button className="p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Forms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 auto-rows-fr">
          {filteredForms.map((form, index) => (
            <div 
              key={form._id}
              className="group bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-6 space-y-5 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:bg-white animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Header */}
              <div className="flex items-start justify-between space-x-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-xl mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {form.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
                    {form.description || 'No description provided'}
                  </p>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={() => toggleMenu(form._id)}
                    className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenu === form._id && (
                    <div className="absolute right-0 top-10 z-10 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-dropdown">
                      <button
                        onClick={() => copyFormLink(form)}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                        Copy Form Link
                      </button>
                      <Link
                        href={`/forms/${form.settings.customSlug || form._id}`}
                        target="_blank"
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        onClick={() => setActiveMenu(null)}
                      >
                        <Eye className="w-4 h-4" />
                        Preview Form
                      </Link>
                      <Link
                        href={`/admin/forms/builder/${form._id}`}
                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                        onClick={() => setActiveMenu(null)}
                      >
                        <Edit className="w-4 h-4" />
                        Edit Form
                      </Link>
                      <button
                        onClick={() => deleteForm(form._id)}
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Form
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Status and Metrics */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                  form.status === 'published' 
                    ? 'bg-green-100 text-green-700 shadow-sm' 
                    : 'bg-amber-100 text-amber-700 shadow-sm'
                }`}>
                  {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </span>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="font-medium">{form.responsesCount || 0} responses</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100/60">
                <button
                  onClick={() => copyFormLink(form)}
                  className="flex-1 px-4 py-2.5 text-sm bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                >
                  <Copy className="w-4 h-4" />
                  Copy Link
                </button>
                
                <div className="flex items-center gap-1">
                  <Link
                    href={`/forms/${form.settings.customSlug || form._id}`}
                    target="_blank"
                    className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all duration-300"
                    title="Preview Form"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  
                  <Link
                    href={`/admin/forms/builder/${form._id}`}
                    className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300"
                    title="Edit Form"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  
                  <button
                    onClick={() => deleteForm(form._id)}
                    className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300"
                    title="Delete Form"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredForms.length === 0 && !error && (
          <div className="text-center py-16 lg:py-24 animate-fade-in">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg">
              <FileText className="w-12 h-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {search ? 'No matching forms found' : 'Ready to create your first form?'}
            </h3>
            <p className="text-gray-600 text-lg max-w-md mx-auto mb-8 leading-relaxed">
              {search ? 'Try adjusting your search terms or create a new form' : 'Start collecting responses with a beautifully crafted form'}
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

      {/* Close dropdown when clicking outside */}
      <div 
        className={`fixed inset-0 z-0 ${activeMenu ? 'block' : 'hidden'}`}
        onClick={() => setActiveMenu(null)}
      />

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .animate-dropdown {
          animation: dropdown 0.2s ease-out forwards;
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
        
        .auto-rows-fr {
          grid-auto-rows: 1fr;
        }
      `}</style>
    </div>
  );
}