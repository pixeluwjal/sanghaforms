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
  Calendar,
  UserCheck,
  User,
  Edit,
  Trash2,
  Upload,
  Brain
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
  // Lead specific fields
  leadScore?: number;
  status?: 'new' | 'contacted' | 'qualified' | 'converted' | 'rejected';
  source?: string;
  name?: string;
  email?: string;
  phone?: string;
  // Swayamsevak specific fields
  swayamsevakId?: string;
  sangha?: string;
  area?: string;
  district?: string;
  state?: string;
  dateOfBirth?: string;
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
  userType: string;
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

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
  aiUsed?: boolean;
  collectionType?: string;
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
  const [selectedForm, setSelectedForm] = useState<string>('all');
  const [selectedCollection, setSelectedCollection] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedResponses, setSelectedResponses] = useState<Set<string>>(new Set());
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [editingResponse, setEditingResponse] = useState<FormResponse | null>(null);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [useAI, setUseAI] = useState(true);
  const [targetCollection, setTargetCollection] = useState('auto');
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
        mapping.vibhaags.set(org._id, org.name);
        
        org.khandas?.forEach(khanda => {
          mapping.khandas.set(khanda._id, {
            name: khanda.name,
            vibhaagId: org._id
          });
          
          khanda.valays?.forEach(valaya => {
            mapping.valayas.set(valaya._id, {
              name: valaya.name,
              khandaId: khanda._id
            });
            
            valaya.milans?.forEach(milan => {
              mapping.milans.set(milan._id, {
                name: milan.name,
                valayaId: valaya._id
              });
              
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
      setLoading(true);
      setRefreshing(true);
      
      const orgMapping = await fetchOrganizationData();
      setSanghaMapping(orgMapping);
      
      const responsesRes = await fetch('/api/admin/responses');
      
      if (responsesRes.ok) {
        const data = await responsesRes.json();
        console.log('📦 Responses data received:', {
          totalResponses: data.responses?.length,
          totalForms: data.forms?.length,
          collections: [...new Set(data.responses?.map((r: FormResponse) => r.collection))]
        });
        
        setResponses(data.responses || []);
        setForms(data.forms || []);
        
        showToast(`Loaded ${data.responses?.length || 0} responses from ${data.forms?.length || 0} forms`);
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

  const formatResponseWithSanghaNames = (response: FormResponse): FormResponse => {
    const formattedResponses = { ...response.responses };
    
    Object.entries(formattedResponses).forEach(([key, field]) => {
      if (field.type === 'sangha_hierarchy' && field.details) {
        const details = { ...field.details };
        
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

  // CRUD Operations
  const updateResponse = async (responseId: string, updates: Partial<FormResponse>) => {
    try {
      const response = await fetch(`/api/admin/responses/${responseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const result = await response.json();
        setResponses(prev => prev.map(r => r._id === responseId ? result.response : r));
        setEditingResponse(null);
        showToast('Response updated successfully');
        fetchData(); // Refresh to get updated data
      } else {
        throw new Error('Failed to update response');
      }
    } catch (error) {
      console.error('Error updating response:', error);
      showToast('Failed to update response', 'error');
    }
  };

  const deleteResponse = async (responseId: string) => {
    try {
      setDeleting(true);
      const response = await fetch(`/api/admin/responses/${responseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setResponses(prev => prev.filter(r => r._id !== responseId));
        setShowDeleteConfirm(null);
        showToast('Response deleted successfully');
      } else {
        throw new Error('Failed to delete response');
      }
    } catch (error) {
      console.error('Error deleting response:', error);
      showToast('Failed to delete response', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const bulkDeleteResponses = async () => {
    if (selectedResponses.size === 0) return;

    try {
      setDeleting(true);
      const response = await fetch('/api/admin/responses/bulk', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responseIds: Array.from(selectedResponses) }),
      });

      if (response.ok) {
        setResponses(prev => prev.filter(r => !selectedResponses.has(r._id)));
        setSelectedResponses(new Set());
        showToast(`${selectedResponses.size} responses deleted successfully`);
      } else {
        throw new Error('Failed to delete responses');
      }
    } catch (error) {
      console.error('Error deleting responses:', error);
      showToast('Failed to delete responses', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Bulk Upload
  const handleBulkUpload = async () => {
    if (!uploadFile) {
      showToast('Please select a file to upload', 'error');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('useAI', useAI.toString());
      if (targetCollection !== 'auto') {
        formData.append('collection', targetCollection);
      }

      const response = await fetch('/api/admin/responses/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result: BulkUploadResult = await response.json();

      if (response.ok) {
        showToast(`Bulk upload completed: ${result.success} successful, ${result.failed} failed`);
        if (result.success > 0) {
          fetchData(); // Refresh data
        }
        setShowBulkUpload(false);
        setUploadFile(null);
      } else {
        throw new Error(result.errors?.join(', ') || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      showToast(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setUploading(false);
    }
  };

  // Export Functions
  const exportToCSV = () => {
    exportData('csv');
  };

  const exportToExcel = () => {
    exportData('excel');
  };

  const exportData = async (format: 'csv' | 'excel') => {
    try {
      const dataToExport = selectedResponses.size > 0 
        ? filteredResponses.filter(r => selectedResponses.has(r._id))
        : filteredResponses;

      if (dataToExport.length === 0) {
        showToast('No data to export', 'error');
        return;
      }

      const response = await fetch('/api/admin/responses/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responseIds: selectedResponses.size > 0 ? Array.from(selectedResponses) : undefined,
          format: format,
          filters: {
            form: selectedForm,
            collection: selectedCollection,
            dateRange: dateRange,
            searchTerm: searchTerm
          }
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().split('T')[0];
        const extension = format === 'csv' ? 'csv' : 'xlsx';
        a.href = url;
        a.download = `form-responses-${timestamp}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast(`${format.toUpperCase()} exported with ${dataToExport.length} responses!`);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast('Failed to export data', 'error');
    }
  };

  // Filter responses based on selections
  const filteredResponses = responses
    .map(response => formatResponseWithSanghaNames(response))
    .filter(response => {
      if (selectedForm !== 'all' && response.formId !== selectedForm) {
        return false;
      }
      if (selectedCollection !== 'all' && response.collection !== selectedCollection) {
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
        const hasMatchingResponse = Object.values(response.responses).some(field => 
          String(field.value).toLowerCase().includes(searchLower) ||
          field.label.toLowerCase().includes(searchLower)
        );
        const matchesFormTitle = response.formTitle.toLowerCase().includes(searchLower);
        const matchesFormName = response.formName?.toLowerCase().includes(searchLower);
        const matchesCollection = response.collection.toLowerCase().includes(searchLower);
        
        if (!hasMatchingResponse && !matchesFormTitle && !matchesFormName && !matchesCollection) {
          return false;
        }
      }
      return true;
    });

  // Get collection statistics
  const collectionStats = {
    total: responses.length,
    leads: responses.filter(r => r.collection === 'leads').length,
    swayamsevak: responses.filter(r => r.collection === 'swayamsevak').length
  };

  // Pagination
  const totalPages = Math.ceil(filteredResponses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResponses = filteredResponses.slice(startIndex, startIndex + itemsPerPage);

  // Select/deselect all responses
  const toggleSelectAll = () => {
    if (selectedResponses.size === paginatedResponses.length) {
      setSelectedResponses(new Set());
    } else {
      const allIds = new Set(paginatedResponses.map(r => r._id));
      setSelectedResponses(allIds);
    }
  };

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
    setSelectedCollection('all');
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
            <div className="flex flex-wrap items-center gap-4 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{collectionStats.total}</span>
                <span>total submissions</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-lg">
                  <UserCheck className="w-3 h-3" />
                  <span className="text-sm font-medium">{collectionStats.leads} leads</span>
                </div>
                <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-lg">
                  <User className="w-3 h-3" />
                  <span className="text-sm font-medium">{collectionStats.swayamsevak} swayamsevak</span>
                </div>
              </div>
              {selectedResponses.size > 0 && (
                <div className="bg-orange-100 text-orange-800 px-2 py-1 rounded-lg text-sm font-medium">
                  {selectedResponses.size} selected
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowBulkUpload(true)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload
            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            
            <div className="flex gap-2">
              <button
                onClick={exportToCSV}
                disabled={filteredResponses.length === 0}
                className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                CSV
              </button>
              <button
                onClick={exportToExcel}
                disabled={filteredResponses.length === 0}
                className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
            </div>
          </div>
        </div>

        {/* Bulk Upload Modal */}
        {showBulkUpload && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">Bulk Upload Responses</h3>
                <button
                  onClick={() => setShowBulkUpload(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload File (CSV, Excel)
                  </label>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full p-3 border border-gray-300 rounded-2xl"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>

                {/* Target Collection Selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Target Collection
                  </label>
                  <select
                    value={targetCollection}
                    onChange={(e) => setTargetCollection(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                  >
                    <option value="auto">Auto-detect (Recommended)</option>
                    <option value="leads">Leads Collection</option>
                    <option value="swayamsevak">Swayamsevak Collection</option>
                    <option value="form_responses">Form Responses Collection</option>
                  </select>
                  <p className="text-sm text-gray-500">
                    {targetCollection === 'auto' 
                      ? 'AI will automatically detect the best collection based on your data'
                      : `Data will be saved to ${targetCollection} collection`}
                  </p>
                </div>

                {/* AI Toggle */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">AI-Powered Mapping</p>
                      <p className="text-sm text-blue-700">Use Gemini AI to automatically map columns</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useAI}
                      onChange={(e) => setUseAI(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {uploading && (
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: '100%' }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      Processing upload...
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBulkUpload(false)}
                    className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBulkUpload}
                    disabled={!uploadFile || uploading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full">
              <div className="text-center">
                <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Delete Response</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this response? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deleteResponse(showDeleteConfirm)}
                    disabled={deleting}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Filter className="w-5 h-5 text-purple-600" />
              </div>
              Filters & Search
            </h3>
            <div className="flex items-center gap-3">
              {selectedResponses.size > 0 && (
                <button
                  onClick={bulkDeleteResponses}
                  disabled={deleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center gap-2 font-medium disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedResponses.size})
                </button>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all duration-200"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <option value="all">All Forms</option>
                {forms.map(form => (
                  <option key={form._id} value={form._id}>
                    {form.form_name12 || form.title} ({form.userType})
                  </option>
                ))}
              </select>
            </div>

            {/* Collection Filter */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Collection
              </label>
              <select
                value={selectedCollection}
                onChange={(e) => {
                  setSelectedCollection(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium shadow-sm hover:shadow-md"
              >
                <option value="all">All Collections</option>
                <option value="leads">Leads</option>
                <option value="swayamsevak">Swayamsevak</option>
                <option value="form_responses">Form Responses</option>
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
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  {selectedForm !== 'all' && forms.find(f => f._id === selectedForm) && (
                    <span>
                      Form: <span className="font-medium text-purple-600">
                        {forms.find(f => f._id === selectedForm)?.form_name12 || forms.find(f => f._id === selectedForm)?.title}
                      </span>
                    </span>
                  )}
                  {selectedCollection !== 'all' && (
                    <span>
                      Collection: <span className="font-medium text-purple-600 capitalize">{selectedCollection}</span>
                    </span>
                  )}
                </div>
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
                        Collection
                      </th>
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
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize ${
                              response.collection === 'leads' 
                                ? 'bg-blue-100 text-blue-800' 
                                : response.collection === 'swayamsevak'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {response.collection === 'leads' ? (
                                <>
                                  <UserCheck className="w-3 h-3 mr-1" />
                                  Lead
                                </>
                              ) : response.collection === 'swayamsevak' ? (
                                <>
                                  <User className="w-3 h-3 mr-1" />
                                  Swayamsevak
                                </>
                              ) : (
                                <>
                                  <FileSpreadsheet className="w-3 h-3 mr-1" />
                                  Form Response
                                </>
                              )}
                            </span>
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
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingResponse(editingResponse?._id === response._id ? null : response);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRow(expandedRow === response._id ? null : response._id);
                                }}
                                className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                              >
                                {expandedRow === response._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowDeleteConfirm(response._id);
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                        
                        {/* Expanded Row Details */}
                        {expandedRow === response._id && (
                          <tr className="bg-gray-50/50">
                            <td colSpan={tableColumns.length + 4} className="px-4 py-6">
                              <div className="space-y-6">
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

                                {/* Edit Form */}
                                {editingResponse?._id === response._id && (
                                  <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                    <h5 className="font-semibold text-gray-900 mb-4 text-lg">
                                      Edit Response
                                    </h5>
                                    <div className="space-y-3">
                                      {Object.entries(response.responses).map(([fieldId, field]) => (
                                        <div key={fieldId} className="bg-white rounded-lg p-3">
                                          <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.label}
                                          </label>
                                          <input
                                            type="text"
                                            value={field.value as string}
                                            onChange={(e) => {
                                              const updatedResponses = { ...response.responses };
                                              updatedResponses[fieldId] = {
                                                ...field,
                                                value: e.target.value
                                              };
                                              setEditingResponse({
                                                ...response,
                                                responses: updatedResponses
                                              });
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                          />
                                        </div>
                                      ))}
                                      <div className="flex gap-3">
                                        <button
                                          onClick={() => updateResponse(response._id, { responses: editingResponse.responses })}
                                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                          Save Changes
                                        </button>
                                        <button
                                          onClick={() => setEditingResponse(null)}
                                          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                        >
                                          Cancel
                                        </button>
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
                  {selectedForm !== 'all' || selectedCollection !== 'all' || searchTerm || dateRange !== 'all' ? (
                    'Try adjusting your filters to see more results'
                  ) : (
                    'No form responses have been submitted yet'
                  )}
                </p>
                {selectedForm !== 'all' || selectedCollection !== 'all' || searchTerm || dateRange !== 'all' ? (
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