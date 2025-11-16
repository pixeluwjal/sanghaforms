'use client';

import { useState, useEffect } from 'react';
import { Filter, X, Trash2, Search, MoreVertical, Plus } from 'lucide-react';

interface FormResponse {
  _id: string;
  formId: string;
  formTitle: string;
  formName: string;
  formType: string;
  collection: string;
  submittedAt: string;
  responses: {
    [key: string]: {
      label: string;
      value: string;
      type: string;
      details?: any;
    };
  };
}

interface Form {
  _id: string;
  title: string;
  form_name12: string;
  userType: string;
}

interface FieldFilter {
  id: string;
  field: string;
  value: string;
}

interface FiltersCardProps {
  forms: Form[];
  selectedForm: string;
  selectedCollection: string;
  dateRange: string;
  searchTerm: string;
  selectedResponses: Set<string>;
  onFormChange: (formId: string) => void;
  onCollectionChange: (collection: string) => void;
  onDateRangeChange: (range: string) => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  onBulkDelete: () => void;
  deleting: boolean;
  responses: FormResponse[];
}

export default function FiltersCard({
  forms,
  selectedForm,
  selectedCollection,
  dateRange,
  searchTerm,
  selectedResponses,
  onFormChange,
  onCollectionChange,
  onDateRangeChange,
  onSearchChange,
  onClearFilters,
  onBulkDelete,
  deleting,
  responses
}: FiltersCardProps) {
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [fieldFilters, setFieldFilters] = useState<FieldFilter[]>([
    { id: '1', field: '', value: '' }
  ]);
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Extract all unique field labels from responses for filtering
  useEffect(() => {
    const fields = new Set<string>();
    responses.forEach(response => {
      Object.values(response.responses).forEach(field => {
        if (field.label && field.label.trim() !== '') {
          fields.add(field.label);
        }
      });
    });
    setAvailableFields(Array.from(fields).sort());
  }, [responses]);

  // FIXED: Remove the problematic useEffect that was causing infinite loops
  // This useEffect was calling onSearchChange which was causing re-renders

  const addFieldFilter = () => {
    setFieldFilters(prev => [
      ...prev,
      { id: Date.now().toString(), field: '', value: '' }
    ]);
  };

  // FIXED: Use useCallback to prevent infinite re-renders
  const updateFieldFilter = (id: string, updates: Partial<FieldFilter>) => {
    setFieldFilters(prev =>
      prev.map(filter =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    );
  };

  const removeFieldFilter = (id: string) => {
    setFieldFilters(prev => {
      const newFilters = prev.filter(filter => filter.id !== id);
      // Ensure at least one filter row remains
      return newFilters.length === 0 ? [{ id: '1', field: '', value: '' }] : newFilters;
    });
  };

  const clearAllFieldFilters = () => {
    setFieldFilters([{ id: '1', field: '', value: '' }]);
    onSearchChange('');
  };

  const clearSpecificFilter = (type: 'form' | 'collection' | 'date' | 'search') => {
    switch (type) {
      case 'form':
        onFormChange('all');
        break;
      case 'collection':
        onCollectionChange('all');
        break;
      case 'date':
        onDateRangeChange('all');
        break;
      case 'search':
        clearAllFieldFilters();
        break;
    }
  };

  // FIXED: Handle search generation separately without causing re-renders
  const handleFieldFilterChange = () => {
    const activeFilters = fieldFilters.filter(filter => 
      filter.field.trim() && filter.value.trim()
    );
    
    if (activeFilters.length === 0) {
      onSearchChange('');
      return;
    }

    // Create search query with multiple field filters
    const searchQuery = activeFilters
      .map(filter => `${filter.field}:${filter.value}`)
      .join(' AND ');
    
    onSearchChange(searchQuery);
  };

  // Call handleFieldFilterChange when fieldFilters change, but debounce it
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleFieldFilterChange();
    }, 300); // Debounce for 300ms
    
    return () => clearTimeout(timeoutId);
  }, [fieldFilters]); // Only depend on fieldFilters

  // Parse current search term to populate field filters - only on initial load
  useEffect(() => {
    if (searchTerm.includes(' AND ')) {
      const filterParts = searchTerm.split(' AND ');
      const parsedFilters: FieldFilter[] = [];
      
      filterParts.forEach((part, index) => {
        if (part.includes(':')) {
          const [field, value] = part.split(':');
          parsedFilters.push({
            id: (index + 1).toString(),
            field: field.trim(),
            value: value.trim()
          });
        }
      });
      
      if (parsedFilters.length > 0) {
        setFieldFilters(parsedFilters);
      }
    } else if (searchTerm.includes(':') && !searchTerm.includes(' AND ')) {
      const [field, value] = searchTerm.split(':');
      setFieldFilters([{
        id: '1',
        field: field.trim(),
        value: value.trim()
      }]);
    }
  }, []); // Empty dependency array - only run once on mount

  const activeFieldFilters = fieldFilters.filter(filter => 
    filter.field.trim() && filter.value.trim()
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-4 sm:p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Header Section - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 whitespace-nowrap">
            Filters & Search
          </h3>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
          {selectedResponses.size > 0 && (
            <button
              onClick={onBulkDelete}
              disabled={deleting}
              className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center gap-2 font-medium disabled:opacity-50 text-sm sm:text-base whitespace-nowrap"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
              Delete ({selectedResponses.size})
            </button>
          )}
          <button
            onClick={onClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all duration-200 whitespace-nowrap"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        </div>

        {/* Mobile Actions */}
        <div className="sm:hidden flex items-center justify-between w-full">
          {selectedResponses.size > 0 && (
            <button
              onClick={onBulkDelete}
              disabled={deleting}
              className="px-3 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-300 flex items-center gap-2 font-medium disabled:opacity-50 text-sm flex-1 mr-2 justify-center"
            >
              <Trash2 className="w-3 h-3" />
              Delete ({selectedResponses.size})
            </button>
          )}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMobileActions(!showMobileActions)}
              className="p-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMobileActions && (
              <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={() => {
                    onClearFilters();
                    setShowMobileActions(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
                <button
                  onClick={() => setShowMobileActions(false)}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Basic Filters Grid - Responsive */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6">
        {/* Form Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Form
          </label>
          <select
            value={selectedForm}
            onChange={(e) => onFormChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium text-sm sm:text-base"
          >
            <option value="all">All Forms</option>
            {forms.map(form => (
              <option key={form._id} value={form._id}>
                {form.form_name12 || form.title}
              </option>
            ))}
          </select>
        </div>

        {/* Collection Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Collection
          </label>
          <select
            value={selectedCollection}
            onChange={(e) => onCollectionChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium text-sm sm:text-base"
          >
            <option value="all">All Collections</option>
            <option value="leads">Leads</option>
            <option value="swayamsevak">Swayamsevak</option>
            <option value="form_responses">Form Responses</option>
          </select>
        </div>

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Date Range
          </label>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium text-sm sm:text-base"
          >
            <option value="all">All Time</option>
            <option value="1">Last 24 Hours</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Field-based Filters */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Field Filters
          </label>
          <button
            onClick={addFieldFilter}
            className="flex items-center gap-1 px-3 py-1 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            Add Filter
          </button>
        </div>
        
        <div className="space-y-3">
          {fieldFilters.map((filter, index) => (
            <div key={filter.id} className="flex gap-2 items-start">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Field Select */}
                <select
                  value={filter.field}
                  onChange={(e) => updateFieldFilter(filter.id, { field: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium text-sm"
                >
                  <option value="">Select Field</option>
                  {availableFields.map(field => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
                
                {/* Field Value */}
                <input
                  type="text"
                  value={filter.value}
                  onChange={(e) => updateFieldFilter(filter.id, { value: e.target.value })}
                  placeholder="Enter value..."
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm"
                />
              </div>
              
              {/* Remove Button */}
              {fieldFilters.length > 1 && (
                <button
                  onClick={() => removeFieldFilter(filter.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 flex-shrink-0 mt-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          Tip: Add multiple field filters to narrow down results (e.g., Gender:Male AND Location:Bangalore)
        </p>
      </div>

      {/* Global Search - Responsive */}
      <div className="mt-4 sm:mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Global Search
        </label>
        <div className="relative">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search across all fields and responses..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Active Filters - Responsive */}
      {(selectedForm !== 'all' || selectedCollection !== 'all' || dateRange !== 'all' || activeFieldFilters.length > 0) && (
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2">
          {selectedForm !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm max-w-full">
              <span className="truncate max-w-[120px] sm:max-w-none">
                Form: {forms.find(f => f._id === selectedForm)?.form_name12 || forms.find(f => f._id === selectedForm)?.title}
              </span>
              <button 
                onClick={() => clearSpecificFilter('form')} 
                className="ml-1 sm:ml-2 hover:text-blue-600 text-base flex-shrink-0"
              >
                ×
              </button>
            </span>
          )}
          {selectedCollection !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm">
              Collection: {selectedCollection}
              <button 
                onClick={() => clearSpecificFilter('collection')} 
                className="ml-1 sm:ml-2 hover:text-green-600 text-base"
              >
                ×
              </button>
            </span>
          )}
          {dateRange !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs sm:text-sm">
              Date: {dateRange}d
              <button 
                onClick={() => clearSpecificFilter('date')} 
                className="ml-1 sm:ml-2 hover:text-orange-600 text-base"
              >
                ×
              </button>
            </span>
          )}
          {activeFieldFilters.map((filter, index) => (
            <span key={filter.id} className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm max-w-full">
              <span className="truncate max-w-[100px] sm:max-w-[150px]">
                {filter.field}: {filter.value}
              </span>
              <button 
                onClick={() => removeFieldFilter(filter.id)} 
                className="ml-1 sm:ml-2 hover:text-purple-600 text-base flex-shrink-0"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}