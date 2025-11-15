'use client';

import { useState, useEffect } from 'react';
import { 
  FormResponse, 
  Form, 
  Organization, 
  SanghaMapping, 
  BulkUploadResult 
} from '@/components/responses/types';
import Toast from '@/components/responses/Toast';
import StatsHeader from '@/components/responses/StatsHeader';
import FiltersCard from '@/components/responses/FiltersCard';
import BulkUploadModal from '@/components/responses/BulkUploadModal';
import ResponsesTable from '@/components/responses/ResponsesTable';

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
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const itemsPerPage = 25;

  useEffect(() => {
    fetchData();
  }, []);

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
      setLoading(true);
      setRefreshing(true);
      
      const orgMapping = await fetchOrganizationData();
      setSanghaMapping(orgMapping);
      
      const responsesRes = await fetch('/api/admin/responses');
      
      if (responsesRes.ok) {
        const data = await responsesRes.json();
        setResponses(data.responses || []);
        setForms(data.forms || []);
        showToast(`Loaded ${data.responses?.length || 0} responses from ${data.forms?.length || 0} forms`);
      } else {
        showToast('Failed to load responses', 'error');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
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
        fetchData();
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
  const handleBulkUpload = async (file: File, useAI: boolean, targetCollection: string) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('file', file);
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
          fetchData();
        }
        setShowBulkUpload(false);
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

  // FIXED: Enhanced filtering logic
  const filteredResponses = responses
    .map(response => formatResponseWithSanghaNames(response))
    .filter(response => {
      // Form filter
      if (selectedForm !== 'all' && response.formId !== selectedForm) {
        return false;
      }
      
      // Collection filter
      if (selectedCollection !== 'all' && response.collection !== selectedCollection) {
        return false;
      }
      
      // Date range filter
      if (dateRange !== 'all') {
        const responseDate = new Date(response.submittedAt);
        const now = new Date();
        const daysAgo = new Date(now.setDate(now.getDate() - parseInt(dateRange)));
        if (responseDate < daysAgo) {
          return false;
        }
      }
      
      // Enhanced search with field-based filtering
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Check if it's a field-based search (field:value)
        if (searchLower.includes(':')) {
          const [fieldName, fieldValue] = searchLower.split(':').map(s => s.trim());
          
          // Find if any field matches the field name and contains the value
          const hasMatchingField = Object.values(response.responses).some(field => {
            const fieldLabelMatches = field.label.toLowerCase().includes(fieldName);
            const fieldValueMatches = String(field.value).toLowerCase().includes(fieldValue);
            return fieldLabelMatches && fieldValueMatches;
          });
          
          if (!hasMatchingField) {
            return false;
          }
        } else {
          // Global search across all fields and metadata
          const hasMatchingResponse = Object.values(response.responses).some(field => 
            String(field.value).toLowerCase().includes(searchLower) ||
            field.label.toLowerCase().includes(searchLower)
          );
          
          const matchesFormTitle = response.formTitle?.toLowerCase().includes(searchLower);
          const matchesFormName = response.formName?.toLowerCase().includes(searchLower);
          const matchesCollection = response.collection?.toLowerCase().includes(searchLower);
          const matchesStatus = response.status?.toLowerCase().includes(searchLower);
          const matchesSource = response.source?.toLowerCase().includes(searchLower);
          const matchesName = response.name?.toLowerCase().includes(searchLower);
          const matchesEmail = response.email?.toLowerCase().includes(searchLower);
          const matchesPhone = response.phone?.toLowerCase().includes(searchLower);
          const matchesSwayamsevakId = response.swayamsevakId?.toLowerCase().includes(searchLower);
          const matchesSangha = response.sangha?.toLowerCase().includes(searchLower);
          const matchesArea = response.area?.toLowerCase().includes(searchLower);
          const matchesDistrict = response.district?.toLowerCase().includes(searchLower);
          const matchesState = response.state?.toLowerCase().includes(searchLower);
          
          if (!hasMatchingResponse && 
              !matchesFormTitle && 
              !matchesFormName && 
              !matchesCollection &&
              !matchesStatus &&
              !matchesSource &&
              !matchesName &&
              !matchesEmail &&
              !matchesPhone &&
              !matchesSwayamsevakId &&
              !matchesSangha &&
              !matchesArea &&
              !matchesDistrict &&
              !matchesState) {
            return false;
          }
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

  // Get table columns for display
  const getTableColumns = () => {
    const columns = new Set<string>();
    filteredResponses.forEach(response => {
      Object.values(response.responses).forEach(field => columns.add(field.label));
    });
    return Array.from(columns);
  };

  const tableColumns = getTableColumns();

  // Selection handlers
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

  const toggleExpand = (responseId: string) => {
    setExpandedRow(expandedRow === responseId ? null : responseId);
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
        <Toast toast={toast} onClose={() => setToast(null)} />

        {/* Header */}
        <StatsHeader
          collectionStats={collectionStats}
          selectedResponses={selectedResponses}
          onBulkUpload={() => setShowBulkUpload(true)}
          onRefresh={handleRefresh}
          onExportCSV={exportToCSV}
          onExportExcel={exportToExcel}
          refreshing={refreshing}
          filteredResponsesCount={filteredResponses.length}
        />

        {/* Bulk Upload Modal */}
        <BulkUploadModal
          isOpen={showBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          onUpload={handleBulkUpload}
          uploading={uploading}
        />

        {/* Filters Card */}
        <FiltersCard
          forms={forms}
          selectedForm={selectedForm}
          selectedCollection={selectedCollection}
          dateRange={dateRange}
          searchTerm={searchTerm}
          selectedResponses={selectedResponses}
          onFormChange={(formId) => {
            setSelectedForm(formId);
            setCurrentPage(1);
          }}
          onCollectionChange={(collection) => {
            setSelectedCollection(collection);
            setCurrentPage(1);
          }}
          onDateRangeChange={(range) => {
            setDateRange(range);
            setCurrentPage(1);
          }}
          onSearchChange={(term) => {
            setSearchTerm(term);
            setCurrentPage(1);
          }}
          onClearFilters={clearFilters}
          onBulkDelete={bulkDeleteResponses}
          deleting={deleting}
          responses={responses}
        />

        {/* Responses Table */}
        <ResponsesTable
          responses={paginatedResponses}
          tableColumns={tableColumns}
          selectedResponses={selectedResponses}
          expandedRow={expandedRow}
          editingResponse={editingResponse}
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onToggleSelectAll={toggleSelectAll}
          onToggleResponseSelection={toggleResponseSelection}
          onToggleExpand={toggleExpand}
          onEditResponse={setEditingResponse}
          onUpdateResponse={updateResponse}
          onDeleteResponse={deleteResponse}
          onPageChange={setCurrentPage}
          totalResponses={filteredResponses.length} 
        />
      </div>
    </div>
  );
}