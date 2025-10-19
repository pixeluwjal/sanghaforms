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
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  FileSpreadsheet
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
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [showSubmissionDetails, setShowSubmissionDetails] = useState(false);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchData();
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

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching responses and forms...');
      setRefreshing(true);
      
      const [responsesRes, formsRes] = await Promise.all([
        fetch('/api/admin/responses'),
        fetch('/api/admin/forms')
      ]);

      if (responsesRes.ok) {
        const responsesData = await responsesRes.json();
        setResponses(responsesData.responses || []);
      } else {
        console.error('❌ Failed to fetch responses');
        showToast('Failed to load responses', 'error');
      }

      if (formsRes.ok) {
        const formsData = await formsRes.json();
        setForms(formsData.forms || []);
      } else {
        console.error('❌ Failed to fetch forms');
        showToast('Failed to load forms', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Filter responses based on selections
  const filteredResponses = responses.filter(response => {
    if (selectedForm !== 'all' && response.formId !== selectedForm) {
      return false;
    }

    if (dateRange !== 'all') {
      const responseDate = new Date(response.submittedAt);
      const now = new Date();
      const daysAgo = new Date(now.setDate(now.getDate() - parseInt(dateRange)));
      if (responseDate < daysAgo) {
        return false;
      }
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const hasMatchingResponse = response.responses.some(r => 
        String(r.value).toLowerCase().includes(searchLower) ||
        r.fieldLabel.toLowerCase().includes(searchLower)
      );
      const matchesFormTitle = response.formTitle.toLowerCase().includes(searchLower);
      const matchesIP = response.ipAddress.toLowerCase().includes(searchLower);
      
      if (!hasMatchingResponse && !matchesFormTitle && !matchesIP) {
        return false;
      }
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  // Enhanced CSV Export
  const exportToCSV = () => {
    try {
      const dataToExport = selectedResponses.size > 0 
        ? filteredResponses.filter(r => selectedResponses.has(r._id))
        : filteredResponses;

      const allFieldLabels = new Set<string>();
      dataToExport.forEach(response => {
        response.responses.forEach(r => allFieldLabels.add(r.fieldLabel));
      });
      const fieldLabels = Array.from(allFieldLabels);

      const headers = [
        'Response ID',
        'Submitted At', 
        'IP Address',
        ...fieldLabels
      ];

      const csvData = dataToExport.map(response => {
        const baseData = [
          response._id,
          new Date(response.submittedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }), 
          response.ipAddress
        ];
        
        const responseData = fieldLabels.map(fieldLabel => {
          const fieldResponse = response.responses.find(r => r.fieldLabel === fieldLabel);
          if (!fieldResponse) return '';
          
          let value = fieldResponse.value;
          if (Array.isArray(value)) {
            value = value.join('; ');
          }
          return String(value).replace(/"/g, '""').replace(/\n/g, ' ');
        });

        return [...baseData, ...responseData];
      });

      const csvContent = [
        headers.map(header => `"${header}"`).join(','),
        ...csvData.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `form-responses-${timestamp}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast(`CSV exported with ${dataToExport.length} responses!`);
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export CSV', 'error');
    }
  };

  // Enhanced Excel Export
  const exportToExcel = () => {
    try {
      const dataToExport = selectedResponses.size > 0 
        ? filteredResponses.filter(r => selectedResponses.has(r._id))
        : filteredResponses;

      const allFieldLabels = new Set<string>();
      dataToExport.forEach(response => {
        response.responses.forEach(r => allFieldLabels.add(r.fieldLabel));
      });
      const fieldLabels = Array.from(allFieldLabels);

      const headers = [
        'Response ID',
        'Submitted At', 
        'IP Address',
        ...fieldLabels
      ];

      const excelData = dataToExport.map(response => {
        const baseData = [
          response._id,
          new Date(response.submittedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          }), 
          response.ipAddress
        ];
        
        const responseData = fieldLabels.map(fieldLabel => {
          const fieldResponse = response.responses.find(r => r.fieldLabel === fieldLabel);
          if (!fieldResponse) return '';
          
          let value = fieldResponse.value;
          if (Array.isArray(value)) {
            value = value.join(', ');
          }
          return String(value);
        });

        return [...baseData, ...responseData];
      });

      const excelContent = [
        headers.join('\t'),
        ...excelData.map(row => row.join('\t'))
      ].join('\n');

      const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `form-responses-${timestamp}.xls`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast(`Excel file exported with ${dataToExport.length} responses!`);
    } catch (error) {
      console.error('Excel export error:', error);
      showToast('Failed to export Excel file', 'error');
    }
  };

  // Select/deselect all responses
  const toggleSelectAll = () => {
    if (selectedResponses.size === paginatedResponses.length) {
      setSelectedResponses(new Set());
    } else {
      const allIds = new Set(paginatedResponses.map(r => r._id));
      setSelectedResponses(allIds);
    }
  };

  // Toggle single response selection
  const toggleResponseSelection = (responseId: string) => {
    const newSelected = new Set(selectedResponses);
    if (newSelected.has(responseId)) {
      newSelected.delete(responseId);
    } else {
      newSelected.add(responseId);
    }
    setSelectedResponses(newSelected);
  };

  const clearFilters = () => {
    setSelectedForm('all');
    setDateRange('all');
    setSearchTerm('');
    setCurrentPage(1);
    setSelectedResponses(new Set());
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    setSelectedResponses(new Set());
    fetchData();
  };

  // Get unique field labels for table columns
  const getTableColumns = () => {
    const columns = new Set<string>();
    filteredResponses.forEach(response => {
      response.responses.forEach(r => columns.add(r.fieldLabel));
    });
    return Array.from(columns);
  };

  const tableColumns = getTableColumns();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-700 font-medium">Loading responses...</p>
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
              Form Responses
            </h1>
            <p className="text-gray-700 text-lg">
              {filteredResponses.length} total submissions • {selectedResponses.size > 0 && `${selectedResponses.size} selected`}
              {selectedForm !== 'all' && ` • Filtered by: ${forms.find(f => f._id === selectedForm)?.title}`}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Hide Details Toggle */}
            <button
              onClick={() => setShowSubmissionDetails(!showSubmissionDetails)}
              className={`px-6 py-3 border rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md ${
                showSubmissionDetails 
                  ? 'bg-purple-600 text-white border-purple-600' 
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Eye className="w-4 h-4" />
              {showSubmissionDetails ? 'Hide Details' : 'Show Details'}
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            {/* Download Dropdown */}
            <div className="relative group">
              <button
                disabled={filteredResponses.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {/* Download Options */}
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl border border-gray-200 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-10">
                <button
                  onClick={exportToCSV}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-t-2xl flex items-center gap-3 text-gray-700"
                >
                  <FileText className="w-4 h-4 text-green-600" />
                  <div>
                    <div className="font-medium">Download CSV</div>
                    <div className="text-xs text-gray-500">Compatible with all apps</div>
                  </div>
                </button>
                <button
                  onClick={exportToExcel}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-b-2xl flex items-center gap-3 text-gray-700 border-t border-gray-200"
                >
                  <FileSpreadsheet className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Download Excel</div>
                    <div className="text-xs text-gray-500">Optimized for Excel</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              Filters & Search
            </h3>
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Filter by Form
              </label>
              <select
                value={selectedForm}
                onChange={(e) => {
                  setSelectedForm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium shadow-sm hover:shadow-md"
              >
                <option value="all">All Forms ({forms.length})</option>
                {forms.map(form => (
                  <option key={form._id} value={form._id}>
                    {form.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium shadow-sm hover:shadow-md"
              >
                <option value="all">All Time</option>
                <option value="1">Last 24 Hours</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
            </div>

            {/* Search */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Search Responses
              </label>
              <div className="relative group">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 transition-colors group-focus-within:text-purple-600" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search in responses, form titles, IP..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 text-gray-900 font-medium shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Responses Table */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          <div className="p-6 border-b border-gray-200/60">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">
                Responses ({filteredResponses.length})
                {tableColumns.length > 0 && ` • ${tableColumns.length} fields`}
              </h3>
              <div className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          </div>

          <div className="p-6">
            {paginatedResponses.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50 rounded-l-2xl">
                        <input
                          type="checkbox"
                          checked={selectedResponses.size === paginatedResponses.length && paginatedResponses.length > 0}
                          onChange={toggleSelectAll}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">
                        Submitted
                      </th>
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">
                        IP Address
                      </th>
                      {tableColumns.map(column => (
                        <th key={column} className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50 truncate max-w-xs">
                          {column}
                        </th>
                      ))}
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50 rounded-r-2xl">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paginatedResponses.map((response) => (
                      <>
                        <tr 
                          key={response._id} 
                          className="hover:bg-purple-50/30 transition-colors group cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === response._id ? null : response._id)}
                        >
                          <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selectedResponses.has(response._id)}
                              onChange={() => toggleResponseSelection(response._id)}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 font-medium">
                              {new Date(response.submittedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(response.submittedAt).toLocaleTimeString()}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded-lg inline-block">
                              {response.ipAddress}
                            </div>
                          </td>
                          {tableColumns.map(column => {
                            const field = response.responses.find(r => r.fieldLabel === column);
                            return (
                              <td key={column} className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                                <div className="truncate" title={field ? (Array.isArray(field.value) ? field.value.join(', ') : String(field.value)) : '-'}>
                                  {field ? (
                                    Array.isArray(field.value) 
                                      ? field.value.join(', ')
                                      : String(field.value)
                                  ) : '-'}
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRow(expandedRow === response._id ? null : response._id);
                                }}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                              >
                                {expandedRow === response._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Row Details */}
                        {expandedRow === response._id && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={tableColumns.length + 4} className="px-4 py-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Response Data */}
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                    </div>
                                    All Responses ({response.responses.length})
                                  </h5>
                                  <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {response.responses.map((field, index) => (
                                      <div key={index} className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="font-medium text-gray-900 text-sm">
                                            {field.fieldLabel}
                                          </div>
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
                                            {field.fieldType}
                                          </span>
                                        </div>
                                        <div className="text-gray-700 text-sm mt-2">
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
                                {showSubmissionDetails && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-4 flex items-center gap-3 text-lg">
                                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Eye className="w-4 h-4 text-purple-600" />
                                      </div>
                                      Submission Details
                                    </h5>
                                    <div className="space-y-3">
                                      <div className="bg-white rounded-xl p-4 shadow-sm">
                                        <div className="space-y-3 text-sm">
                                          <div>
                                            <span className="font-medium text-gray-700">Response ID:</span>
                                            <div className="text-gray-900 font-mono text-xs mt-1 bg-gray-100 p-2 rounded-lg">
                                              {response._id}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Form ID:</span>
                                            <div className="text-gray-900 font-mono text-xs mt-1 bg-gray-100 p-2 rounded-lg">
                                              {response.formId}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Form Slug:</span>
                                            <div className="text-gray-900 mt-1 font-mono text-sm">{response.formSlug}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Collection:</span>
                                            <div className="text-gray-900 mt-1">{response.collection}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">User Agent:</span>
                                            <div className="text-gray-900 text-xs mt-1 bg-gray-100 p-2 rounded-lg">
                                              {response.userAgent}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <FileText className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No responses found
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  {searchTerm || selectedForm !== 'all' || dateRange !== 'all'
                    ? 'Try adjusting your filters to see more results'
                    : 'No form responses have been submitted yet'
                  }
                </p>
                {searchTerm || selectedForm !== 'all' || dateRange !== 'all' ? (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Clear Filters
                  </button>
                ) : (
                  <Link
                    href="/admin/forms"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <FileText className="w-4 h-4" />
                    Create a Form
                  </Link>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-8 pt-6 border-t border-gray-200/60">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                  Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredResponses.length)} of {filteredResponses.length} responses
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700"
                  >
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => (
                        <div key={page} className="flex items-center">
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-xl font-medium transition-all duration-200 ${
                              currentPage === page
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))
                    }
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium text-gray-700"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}