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
  FileText  // Add this import
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
  createdBy: {
    _id: string;
    email: string;
    name?: string;
  };
}

export default function FormsPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await fetch('/api/admin/forms');
      if (response.ok) {
        const data = await response.json();
        setForms(data.forms);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteForm = async (formId: string) => {
    if (!confirm('Are you sure you want to delete this form?')) return;

    try {
      const response = await fetch(`/api/admin/forms/${formId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setForms(forms.filter(form => form._id !== formId));
      } else {
        alert('Failed to delete form');
      }
    } catch (error) {
      console.error('Error deleting form:', error);
    }
  };

  const copyFormLink = (form: Form) => {
    const link = `${window.location.origin}/forms/${form.settings.customSlug || form._id}`;
    navigator.clipboard.writeText(link);
    alert('Form link copied to clipboard!');
  };

  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(search.toLowerCase()) ||
    form.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Forms</h1>
          <p className="text-slate-600 mt-2">Manage all your forms in one place</p>
        </div>
        <Link
          href="/admin/forms/builder/new"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
        >
          Create New Form
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search forms..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <button className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
          <Filter className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredForms.map((form) => (
          <div key={form._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 text-lg mb-1">{form.title}</h3>
                <p className="text-slate-600 text-sm line-clamp-2">{form.description}</p>
              </div>
              <div className="relative">
                <button className="p-1 hover:bg-slate-100 rounded">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm text-slate-500">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                form.status === 'published' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {form.status}
              </span>
              <span>{form.responsesCount} responses</span>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={() => copyFormLink(form)}
                className="flex-1 px-3 py-2 text-sm bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </button>
              <Link
                href={`/forms/${form.settings.customSlug || form._id}`}
                target="_blank"
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                title="Preview"
              >
                <Eye className="w-4 h-4" />
              </Link>
              <Link
                href={`/admin/forms/builder/${form._id}`}
                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                title="Edit"
              >
                <Edit className="w-4 h-4" />
              </Link>
              <button
                onClick={() => deleteForm(form._id)}
                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredForms.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">No forms found</h3>
          <p className="text-slate-600 mb-6">
            {search ? 'Try adjusting your search terms' : 'Get started by creating your first form'}
          </p>
          <Link
            href="/admin/forms/builder/new"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
          >
            Create New Form
          </Link>
        </div>
      )}
    </div>
  );
}