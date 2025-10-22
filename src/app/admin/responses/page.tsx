// app/admin/responses/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  FileSpreadsheet,
  Users,
  Calendar
} from 'lucide-react';

interface FormResponse {
  _id: string;
  formId: string;
  formTitle: string;
  formName: string;
  formType: string;
  collection: string;
  submittedAt: string;
  ipAddress: string;
  userAgent: string;
  responses: {
    [key: string]: {
      label: string;
      value: string;
      type: string;
      details?: any;
    };
  };
  rawResponses?: any[];
}

interface Form {
  _id: string;
  title: string;
  form_name12: string;
  sections: Array<{
    fields: Array<{
      id: string;
      label: string;
      type: string;
    }>;
  }>;
}

interface Organization {
  _id: string;
  name: string;
  khandas: Array<{
    _id: string;
    name: string;
    code: string;
    valays: Array<{
      _id: string;
      name: string;
      milans: Array<{
        _id: string;
        name: string;
        ghatas: Array<{
          _id: string;
          name: string;
        }>;
      }>;
    }>;
  }>;
}

interface SanghaMapping {
  vibhaags: Map<string, string>;
  khandas: Map<string, { name: string; vibhaagId: string }>;
  valayas: Map<string, { name: string; khandaId: string }>;
  milans: Map<string, { name: string; valayaId: string }>;
  ghatas: Map<string, { name: string; milanId: string }>;
}

export default function ResponsesPage() {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [forms, setForms] = useState<Form[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [sanghaMapping, setSanghaMapping] = useState<SanghaMapping>({
    vibhaags: new Map(),
    khandas: new Map(),
    valayas: new Map(),
    milans: new Map(),
    ghatas: new Map()
  });
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<string>('');
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

  // Fetch organization data and create mapping
  const fetchOrganizationData = async (): Promise<SanghaMapping> => {
    try {
      const response = await fetch('/api/organization');
      if (!response.ok) throw new Error('Failed to fetch organization data');
      
      const data = await response.json();
      const orgs: Organization[] = data.organizations || data;
      
      const mapping: SanghaMapping = {
        vibhaags: new Map(),
        khandas: new Map(),
        valayas: new Map(),
        milans: new Map(),
        ghatas: new Map()
      };

      orgs.forEach(org => {
        // Map vibhaags
        mapping.vibhaags.set(org._id, org.name);
        
        // Map khandas
        org.khandas?.forEach(khanda => {
          mapping.khandas.set(khanda._id, {
            name: khanda.name,
            vibhaagId: org._id
          });
          
          // Map valayas
          khanda.valays?.forEach(valaya => {
            mapping.valayas.set(valaya._id, {
              name: valaya.name,
              khandaId: khanda._id
            });
            
            // Map milans
            valaya.milans?.forEach(milan => {
              mapping.milans.set(milan._id, {
                name: milan.name,
                valayaId: valaya._id
              });
              
              // Map ghatas
              milan.ghatas?.forEach(ghata => {
                mapping.ghatas.set(ghata._id, {
                  name: ghata.name,
                  milanId: milan._id
                });
              });
            });
          });
        });
      });

      return mapping;
    } catch (error) {
      console.error('Error fetching organization data:', error);
      return {
        vibhaags: new Map(),
        khandas: new Map(),
        valayas: new Map(),
        milans: new Map(),
        ghatas: new Map()
      };
    }
  };

  const fetchData = async () => {
    try {
      console.log('🔄 Fetching responses, forms, and organization data...');
      setRefreshing(true);
      
      // Fetch organization data first
      const orgMapping = await fetchOrganizationData();
      setSanghaMapping(orgMapping);
      
      // Then fetch responses
      const responsesRes = await fetch('/api/admin/responses');
      
      if (responsesRes.ok) {
        const data = await responsesRes.json();
        console.log('📦 Responses data:', data);
        setResponses(data.responses || []);
        setForms(data.forms || []);
        
        // Auto-select the first form if available
        if (data.forms && data.forms.length > 0 && !selectedForm) {
          setSelectedForm(data.forms[0]._id);
        }
      } else {
        console.error('❌ Failed to fetch responses');
        showToast('Failed to load responses', 'error');
      }
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      showToast('Error loading data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Helper function to get Sangha hierarchy names
  const getSanghaName = (id: string, type: 'vibhaag' | 'khanda' | 'valaya' | 'milan' | 'ghata'): string => {
    switch (type) {
      case 'vibhaag':
        return sanghaMapping.vibhaags.get(id) || id;
      case 'khanda':
        return sanghaMapping.khandas.get(id)?.name || id;
      case 'valaya':
        return sanghaMapping.valayas.get(id)?.name || id;
      case 'milan':
        return sanghaMapping.milans.get(id)?.name || id;
      case 'ghata':
        return sanghaMapping.ghatas.get(id)?.name || id;
      default:
        return id;
    }
  };

  // Enhanced response formatter to include Sangha names
  const formatResponseWithSanghaNames = (response: FormResponse): FormResponse => {
    const formattedResponses = { ...response.responses };
    
    Object.entries(formattedResponses).forEach(([key, field]) => {
      if (field.type === 'sangha_hierarchy' && field.details) {
        const details = { ...field.details };
        
        // Replace IDs with names for all hierarchy levels
        if (details.vibhaag) {
          details.vibhaagName = getSanghaName(details.vibhaag, 'vibhaag');
        }
        if (details.khanda) {
          details.khandaName = getSanghaName(details.khanda, 'khanda');
        }
        if (details.valaya) {
          details.valayaName = getSanghaName(details.valaya, 'valaya');
        }
        if (details.milan) {
          details.milanName = getSanghaName(details.milan, 'milan');
        }
        if (details.ghata) {
          details.ghataName = getSanghaName(details.ghata, 'ghata');
        }
        
        // Update the value to show names instead of IDs
        const hierarchyPath = [
          details.vibhaagName || details.vibhaag,
          details.khandaName || details.khanda,
          details.valayaName || details.valaya,
          details.milanName || details.milan,
          details.ghataName || details.ghata
        ].filter(Boolean).join(' > ');
        
        field.value = hierarchyPath || 'Not specified';
        field.details = details;
      }
    });
    
    return {
      ...response,
      responses: formattedResponses
    };
  };

  // Filter responses based on selections
  const filteredResponses = responses
    .map(response => formatResponseWithSanghaNames(response))
    .filter(response => {
      // Filter by selected form
      if (selectedForm && response.formId !== selectedForm) {
        return false;
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
        const hasMatchingResponse = Object.values(response.responses).some(field => 
          String(field.value).toLowerCase().includes(searchLower) ||
          field.label.toLowerCase().includes(searchLower)
        );
        const matchesFormTitle = response.formTitle.toLowerCase().includes(searchLower);
        const matchesFormName = response.formName?.toLowerCase().includes(searchLower);
        
        if (!hasMatchingResponse && !matchesFormTitle && !matchesFormName) {
          return false;
        }
      }

      return true;
    });

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  // Enhanced CSV Export with Sangha names and form name
  const exportToCSV = () => {
    try {
      const dataToExport = selectedResponses.size > 0 
        ? filteredResponses.filter(r => selectedResponses.has(r._id))
        : filteredResponses;

      if (dataToExport.length === 0) {
        showToast('No data to export', 'error');
        return;
      }

      const allFieldLabels = new Set<string>();
      dataToExport.forEach(response => {
        Object.values(response.responses).forEach(field => allFieldLabels.add(field.label));
      });
      const fieldLabels = Array.from(allFieldLabels);

      const headers = [
        'Response ID',
        'Form Title',
        'Form Name',
        'Submitted At',
        ...fieldLabels
      ];

      const csvData = dataToExport.map(response => {
        const baseData = [
          response._id,
          response.formTitle,
          response.formName || 'Not specified',
          new Date(response.submittedAt).toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
          })
        ];
        
        const responseData = fieldLabels.map(fieldLabel => {
          const field = Object.values(response.responses).find(f => f.label === fieldLabel);
          if (!field) return '';
          
          return String(field.value).replace(/"/g, '""').replace(/\n/g, ' ');
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
      Object.values(response.responses).forEach(field => columns.add(field.label));
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
              {filteredResponses.length} submissions • {selectedResponses.size > 0 && `${selectedResponses.size} selected`}
              {selectedForm && forms.find(f => f._id === selectedForm) && (
                <>
                  <span className="mx-2">•</span>
                  <span className="font-semibold text-purple-600">
                    {forms.find(f => f._id === selectedForm)?.form_name12 || forms.find(f => f._id === selectedForm)?.title}
                  </span>
                </>
              )}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
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
            
            <button
              onClick={exportToCSV}
              disabled={filteredResponses.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
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
              Clear Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Form Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Form
              </label>
              <select
                value={selectedForm}
                onChange={(e) => {
                  setSelectedForm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium shadow-sm hover:shadow-md"
              >
                {forms.map(form => (
                  <option key={form._id} value={form._id}>
                    {form.form_name12 || form.title}
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
                  placeholder="Search in responses, form titles, or form names..."
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
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Responses ({filteredResponses.length})
                  {tableColumns.length > 0 && ` • ${tableColumns.length} fields`}
                </h3>
                {selectedForm && forms.find(f => f._id === selectedForm) && (
                  <p className="text-sm text-gray-600 mt-1">
                    Form: <span className="font-medium text-purple-600">
                      {forms.find(f => f._id === selectedForm)?.form_name12 || forms.find(f => f._id === selectedForm)?.title}
                    </span>
                  </p>
                )}
              </div>
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
                      {tableColumns.slice(0, 4).map(column => (
                        <th key={column} className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50 truncate max-w-xs">
                          {column}
                        </th>
                      ))}
                      {tableColumns.length > 4 && (
                        <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">
                          +{tableColumns.length - 4} more
                        </th>
                      )}
                      <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">
                        Submitted
                      </th>
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
                          {tableColumns.slice(0, 4).map(column => {
                            const field = Object.values(response.responses).find(f => f.label === column);
                            return (
                              <td key={column} className="px-4 py-4 text-sm text-gray-700 max-w-xs">
                                <div className="truncate" title={field ? String(field.value) : '-'}>
                                  {field ? String(field.value) : '-'}
                                </div>
                              </td>
                            );
                          })}
                          {tableColumns.length > 4 && (
                            <td className="px-4 py-4 text-sm text-gray-500">
                              View details →
                            </td>
                          )}
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 font-medium">
                              {new Date(response.submittedAt).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(response.submittedAt).toLocaleTimeString()}
                            </div>
                          </td>
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
                            <td colSpan={tableColumns.length + 3} className="px-4 py-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Response Data */}
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-4 text-lg">
                                    All Responses ({Object.keys(response.responses).length})
                                  </h5>
                                  <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {Object.entries(response.responses).map(([fieldId, field]) => (
                                      <div key={fieldId} className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm">
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="font-medium text-gray-900 text-sm">
                                            {field.label}
                                          </div>
                                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full capitalize">
                                            {field.type.replace('_', ' ')}
                                          </span>
                                        </div>
                                        <div className="text-gray-700 text-sm mt-2">
                                          {field.type === 'sangha_hierarchy' && field.details ? (
                                            <div className="space-y-3">
                                              <div className="grid grid-cols-2 gap-4 text-sm">
                                                {field.details.vibhaagName && (
                                                  <div>
                                                    <span className="font-medium text-gray-600">Vibhaag:</span>
                                                    <div className="text-gray-900 mt-1">{field.details.vibhaagName}</div>
                                                  </div>
                                                )}
                                                {field.details.khandaName && (
                                                  <div>
                                                    <span className="font-medium text-gray-600">Khanda:</span>
                                                    <div className="text-gray-900 mt-1">{field.details.khandaName}</div>
                                                  </div>
                                                )}
                                              </div>
                                              <div className="grid grid-cols-2 gap-4 text-sm">
                                                {field.details.valayaName && (
                                                  <div>
                                                    <span className="font-medium text-gray-600">Valaya:</span>
                                                    <div className="text-gray-900 mt-1">{field.details.valayaName}</div>
                                                  </div>
                                                )}
                                                {field.details.milanName && (
                                                  <div>
                                                    <span className="font-medium text-gray-600">Milan:</span>
                                                    <div className="text-gray-900 mt-1">{field.details.milanName}</div>
                                                  </div>
                                                )}
                                              </div>
                                              {field.details.ghataName && (
                                                <div className="grid grid-cols-2 gap-4 text-sm">
                                                  <div>
                                                    <span className="font-medium text-gray-600">Ghata:</span>
                                                    <div className="text-gray-900 mt-1">{field.details.ghataName}</div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div className="whitespace-pre-wrap break-words">
                                              {String(field.value)}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Metadata */}
                                {showSubmissionDetails && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-4 text-lg">
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
                                            <span className="font-medium text-gray-700">Form Title:</span>
                                            <div className="text-gray-900 mt-1">{response.formTitle}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Form Name:</span>
                                            <div className="text-gray-900 mt-1 font-medium">
                                              {response.formName || 'Not specified'}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Form Type:</span>
                                            <div className="text-gray-900 mt-1 capitalize">{response.formType}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Collection:</span>
                                            <div className="text-gray-900 mt-1">{response.collection}</div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">Submitted At:</span>
                                            <div className="text-gray-900 mt-1">
                                              {new Date(response.submittedAt).toLocaleString()}
                                            </div>
                                          </div>
                                          <div>
                                            <span className="font-medium text-gray-700">IP Address:</span>
                                            <div className="text-gray-900 mt-1">{response.ipAddress}</div>
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
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No responses found
                </h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  {selectedForm && forms.find(f => f._id === selectedForm) ? (
                    <>
                      No responses yet for <span className="font-semibold text-purple-600">
                        {forms.find(f => f._id === selectedForm)?.form_name12 || forms.find(f => f._id === selectedForm)?.title}
                      </span>
                    </>
                  ) : searchTerm || dateRange !== 'all' ? (
                    'Try adjusting your filters to see more results'
                  ) : (
                    'No form responses have been submitted yet'
                  )}
                </p>
                {searchTerm || dateRange !== 'all' ? (
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
                    <Calendar className="w-4 h-4" />
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