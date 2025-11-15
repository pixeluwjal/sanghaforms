import { useState, useEffect } from 'react';
import { Filter, X, Trash2, Search, MoreVertical } from 'lucide-react';

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
  const [selectedField, setSelectedField] = useState<string>('');
  const [fieldValue, setFieldValue] = useState<string>('');
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

  const handleFieldFilter = () => {
    if (selectedField && fieldValue.trim()) {
      const searchQuery = `${selectedField}:${fieldValue.trim()}`;
      onSearchChange(searchQuery);
      setSelectedField('');
      setFieldValue('');
    }
  };

  const clearFieldFilter = () => {
    setSelectedField('');
    setFieldValue('');
    if (searchTerm.includes(':')) {
      onSearchChange('');
    }
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
        onSearchChange('');
        setSelectedField('');
        setFieldValue('');
        break;
    }
  };

  // Check if current search is a field-based search
  const isFieldSearch = searchTerm.includes(':');
  const currentFieldSearch = isFieldSearch ? searchTerm.split(':')[0] : '';
  const currentFieldValue = isFieldSearch ? searchTerm.split(':')[1] : '';

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

      {/* Filters Grid - Responsive */}
      <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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

        {/* Field-based Filter */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Filter by Field
          </label>
          <select
            value={isFieldSearch ? currentFieldSearch : selectedField}
            onChange={(e) => setSelectedField(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium text-sm sm:text-base"
          >
            <option value="">Select Field</option>
            {availableFields.map(field => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>

        {/* Field Value with Apply Button */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Field Value
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={isFieldSearch ? currentFieldValue : fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              placeholder="Enter value..."
              className="flex-1 min-w-0 px-3 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm sm:text-base"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleFieldFilter();
                }
              }}
            />
            <button
              onClick={handleFieldFilter}
              disabled={!selectedField || !fieldValue.trim()}
              className="px-3 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-all duration-200 flex-shrink-0 text-sm sm:text-base whitespace-nowrap"
            >
              Apply
            </button>
          </div>
        </div>
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
            placeholder="Search across all fields and responses... or use field:value format"
            className="w-full pl-9 sm:pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-sm sm:text-base"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 sm:mt-2">
          Tip: Use <code className="bg-gray-100 px-1 rounded">fieldname:value</code> format for precise filtering
        </p>
      </div>

      {/* Active Filters - Responsive */}
      {(selectedForm !== 'all' || selectedCollection !== 'all' || dateRange !== 'all' || searchTerm) && (
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
          {searchTerm && (
            <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs sm:text-sm max-w-full">
              <span className="truncate max-w-[100px] sm:max-w-[200px]">
                {isFieldSearch ? 'Field' : 'Search'}: {searchTerm}
              </span>
              <button 
                onClick={() => clearSpecificFilter('search')} 
                className="ml-1 sm:ml-2 hover:text-purple-600 text-base flex-shrink-0"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}