// app/admin/responses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Calendar,
  FileText,
  User,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';

interface FormResponse {
  _id: string;
  formId: string;
  formTitle: string;
  formSlug: string;
  formType: string;
  collection: string;
  responses: Array<{
    fieldId: string;
    fieldType: string;
    fieldLabel: string;
    value: string | string[];
  }>;
  submittedAt: string;
  ipAddress: string;
  userAgent: string;
}

interface Form {
  _id: string;
  title: string;
  settings: {
    customSlug?: string;
  };
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedResponse, setExpandedResponse] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching responses and forms...');
      
      const [responsesRes, formsRes] = await Promise.all([
        fetch('/api/admin/responses'),
        fetch('/api/admin/forms')
      ]);

      console.log('📡 Responses status:', responsesRes.status);
      console.log('📡 Forms status:', formsRes.status);

      if (responsesRes.ok) {
        const responsesData = await responsesRes.json();
        console.log('📦 Responses data:', responsesData);
        setResponses(responsesData.responses || []);
      } else {
        console.error('❌ Failed to fetch responses');
      }

      if (formsRes.ok) {
        const formsData = await formsRes.json();
        console.log('📦 Forms data:', formsData);
        setForms(formsData.forms || []);
      } else {
        console.error('❌ Failed to fetch forms');
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter responses based on selections
  const filteredResponses = responses.filter(response => {
    // Filter by form
    if (selectedForm !== 'all') {
      const responseFormId = typeof response.formId === 'object' ? response.formId.toString() : response.formId;
      const selectedFormId = typeof selectedForm === 'object' ? selectedForm.toString() : selectedForm;
      
      if (responseFormId !== selectedFormId) {
        return false;
      }
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const responseDate = new Date(response.submittedAt);
      const now = new Date();
      const daysAgo = new Date(now.setDate(now.getDate() - parseInt(dateRange)));
      
      if (responseDate < daysAgo) {
        return false;
      }
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const hasMatchingResponse = response.responses.some(r => 
        String(r.value).toLowerCase().includes(searchLower) ||
        r.fieldLabel.toLowerCase().includes(searchLower)
      );
      if (!hasMatchingResponse) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  const exportToCSV = () => {
    const headers = ['Form Title', 'Submitted At', 'IP Address', ...getUniqueFieldLabels()];
    const csvData = filteredResponses.map(response => {
      const baseData = [response.formTitle, new Date(response.submittedAt).toLocaleString(), response.ipAddress];
      
      const responseData = getUniqueFieldLabels().map(fieldLabel => {
        const fieldResponse = response.responses.find(r => r.fieldLabel === fieldLabel);
        return fieldResponse ? String(fieldResponse.value) : '';
      });

      return [...baseData, ...responseData];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-responses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUniqueFieldLabels = () => {
    const fieldLabels = new Set<string>();
    responses.forEach(response => {
      response.responses.forEach(r => fieldLabels.add(r.fieldLabel));
    });
    return Array.from(fieldLabels);
  };

  const clearFilters = () => {
    setSelectedForm('all');
    setDateRange('all');
    setSearchTerm('');
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="text-slate-600">Loading responses...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Form Responses</h1>
          <p className="text-slate-600 mt-2">
            View and manage all form submissions ({filteredResponses.length} total)
          </p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={filteredResponses.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-slate-100 rounded-lg text-sm">
        <p><strong>Debug Info:</strong> {responses.length} responses, {forms.length} forms loaded</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h3>
          <button
            onClick={clearFilters}
            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Form Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Form
            </label>
            <select
              value={selectedForm}
              onChange={(e) => setSelectedForm(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Forms</option>
              {forms.map(form => (
                <option key={form._id} value={form._id.toString()}>
                  {form.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Time</option>
              <option value="1">Last 24 Hours</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search Responses
            </label>
            <div className="relative">
              <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in responses..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Responses List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">
            Responses ({filteredResponses.length})
          </h3>
        </div>

        <div className="p-6">
          {paginatedResponses.length > 0 ? (
            <div className="space-y-4">
              {paginatedResponses.map((response) => (
                <div key={response._id} className="border border-slate-200 rounded-lg">
                  {/* Response Header */}
                  <div 
                    className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => setExpandedResponse(expandedResponse === response._id ? null : response._id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {response.formTitle}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(response.submittedAt).toLocaleString()}
                            </span>
                            <span>IP: {response.ipAddress}</span>
                            <span className="px-2 py-1 bg-slate-200 rounded-full text-xs">
                              {response.formType}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedResponse === response._id ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Response Details */}
                  {expandedResponse === response._id && (
                    <div className="p-6 border-t border-slate-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Response Data */}
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Form Responses
                          </h5>
                          <div className="space-y-3">
                            {response.responses.map((field, index) => (
                              <div key={index} className="border-l-4 border-indigo-500 pl-4">
                                <div className="text-sm font-medium text-slate-700">
                                  {field.fieldLabel}
                                </div>
                                <div className="text-xs text-slate-500 capitalize">
                                  {field.fieldType} field
                                </div>
                                <div className="text-slate-900 mt-1">
                                  {Array.isArray(field.value) 
                                    ? field.value.join(', ')
                                    : String(field.value)
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Metadata */}
                        <div>
                          <h5 className="font-semibold text-slate-900 mb-4">Submission Details</h5>
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-slate-700">Form ID:</span>
                              <div className="text-slate-900 font-mono text-xs mt-1">
                                {typeof response.formId === 'object' ? response.formId.toString() : response.formId}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Form Slug:</span>
                              <div className="text-slate-900 mt-1">{response.formSlug}</div>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">Collection:</span>
                              <div className="text-slate-900 mt-1">{response.collection}</div>
                            </div>
                            <div>
                              <span className="font-medium text-slate-700">User Agent:</span>
                              <div className="text-slate-900 text-xs mt-1 truncate">
                                {response.userAgent}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No responses found
              </h3>
              <p className="text-slate-600 mb-6">
                {searchTerm || selectedForm !== 'all' || dateRange !== 'all'
                  ? 'Try adjusting your filters to see more results'
                  : 'No form responses have been submitted yet'
                }
              </p>
              {searchTerm || selectedForm !== 'all' || dateRange !== 'all' ? (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <Link
                  href="/admin/forms"
                  className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Create a Form
                </Link>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
              <div className="text-sm text-slate-600">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredResponses.length)} of {filteredResponses.length} responses
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-slate-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}