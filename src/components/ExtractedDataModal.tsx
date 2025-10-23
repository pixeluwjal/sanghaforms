// components/ExtractedDataModal.tsx
import { useState, useEffect } from 'react';
import { X, Download, FileText, User, Mail, Phone, MapPin, Database } from 'lucide-react';

interface ExtractedRecord {
  _id: string;
  name?: string;
  source: string;
  khanda?: string;
  valaya?: string;
  milanGhat?: string;
  leadScore?: number;
  status?: string;
  submittedAt: string;
  createdAt: string;
  responses: Array<{
    fieldId: string;
    fieldType: string;
    fieldLabel: string;
    value: any;
  }>;
  [key: string]: any; // For dynamic fields from responses
}

interface BulkUpload {
  _id: string;
  originalName: string;
  source: string;
  targetCollection: string;
  totalRecords: number;
  successfulRecords: number;
}

interface ExtractedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  upload: BulkUpload | null;
}

export const ExtractedDataModal: React.FC<ExtractedDataModalProps> = ({
  isOpen,
  onClose,
  upload
}) => {
  const [records, setRecords] = useState<ExtractedRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && upload) {
      fetchExtractedData();
    }
  }, [isOpen, upload]);

  const fetchExtractedData = async () => {
    if (!upload) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/bulk-upload/${upload._id}/extracted-data`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
        console.log('📊 Extracted data:', data);
      } else {
        setError('Failed to fetch extracted data');
      }
    } catch (err) {
      setError('Error fetching extracted data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (records.length === 0) return;

    // Get all unique field names from all records and responses
    const allFields = new Set<string>([
      'name', 'source', 'khanda', 'valaya', 'milanGhat', 'leadScore', 'status', 'submittedAt'
    ]);
    
    records.forEach(record => {
      // Add fields from main record
      Object.keys(record).forEach(key => {
        if (key !== '_id' && key !== '__v' && key !== 'responses') {
          allFields.add(key);
        }
      });
      // Add fields from responses
      record.responses?.forEach(response => {
        allFields.add(response.fieldLabel || response.fieldId);
      });
    });

    const fields = Array.from(allFields);
    
    // Create CSV header
    const headers = fields.join(',');
    
    // Create CSV rows
    const rows = records.map(record => {
      const rowData: {[key: string]: string} = {
        name: record.name || '',
        source: record.source || '',
        khanda: record.khanda || '',
        valaya: record.valaya || '',
        milanGhat: record.milanGhat || '',
        leadScore: record.leadScore?.toString() || '',
        status: record.status || '',
        submittedAt: record.submittedAt || ''
      };

      // Add response fields
      record.responses?.forEach(response => {
        const fieldKey = response.fieldLabel || response.fieldId;
        rowData[fieldKey] = formatResponseValue(response.value);
      });

      // Add any additional dynamic fields
      Object.keys(record).forEach(key => {
        if (!rowData[key] && key !== '_id' && key !== '__v' && key !== 'responses') {
          rowData[key] = formatResponseValue(record[key]);
        }
      });

      return fields.map(field => {
        const value = rowData[field] || '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-data-${upload?.originalName || 'upload'}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatResponseValue = (value: any): string => {
    if (value === null || value === undefined) return '';
    if (Array.isArray(value)) return value.join('; ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <Database className="w-6 h-6 mr-3" />
                Extracted Data
              </h2>
              <p className="text-blue-100 mt-2">
                {upload?.originalName} • {upload?.source} • {upload?.targetCollection}
              </p>
              <p className="text-blue-100">
                Total Records: {records.length} | Successful: {upload?.successfulRecords || 0}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={downloadCSV}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                disabled={records.length === 0}
              >
                <Download className="w-4 h-4" />
                <span>Download CSV</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-200 transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading extracted data...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
                <p className="font-semibold">Error</p>
                <p>{error}</p>
                <button
                  onClick={fetchExtractedData}
                  className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Extracted</h3>
              <p className="text-gray-600">No responses were found for this upload.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Records List */}
              <div className="space-y-4">
                {records.map((record, index) => (
                  <div key={record._id} className="border border-gray-200 rounded-lg p-6 bg-white shadow-sm">
                    {/* Record Header */}
                    <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {record.name || 'Unnamed Record'}
                          </h4>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Source: {record.source}</span>
                            <span>•</span>
                            <span>Submitted: {formatDate(record.submittedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {record.leadScore !== undefined && (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            record.leadScore > 70 ? 'bg-green-100 text-green-800' :
                            record.leadScore > 40 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            Score: {record.leadScore}
                          </span>
                        )}
                        {record.status && (
                          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {record.status}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Organizational Structure */}
                    {(record.khanda || record.valaya || record.milanGhat) && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-600" />
                          Organizational Structure
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          {record.khanda && (
                            <div>
                              <span className="font-medium text-gray-700">Khanda:</span>
                              <span className="ml-2 text-gray-600">{record.khanda}</span>
                            </div>
                          )}
                          {record.valaya && (
                            <div>
                              <span className="font-medium text-gray-700">Valaya:</span>
                              <span className="ml-2 text-gray-600">{record.valaya}</span>
                            </div>
                          )}
                          {record.milanGhat && (
                            <div>
                              <span className="font-medium text-gray-700">Milan Ghat:</span>
                              <span className="ml-2 text-gray-600">{record.milanGhat}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Extracted Responses */}
                    <div>
                      <h5 className="font-semibold text-gray-900 mb-3">Form Responses</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {record.responses?.map((response, responseIndex) => (
                          <div key={responseIndex} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-sm text-gray-900 break-words">
                                {response.fieldLabel || response.fieldId}
                              </span>
                              <span className="text-xs text-gray-500 bg-white px-1.5 py-0.5 rounded ml-2 flex-shrink-0">
                                {response.fieldType}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700 break-words">
                              {formatResponseValue(response.value)}
                            </div>
                          </div>
                        ))}
                      </div>
                      {(!record.responses || record.responses.length === 0) && (
                        <div className="text-center py-4 text-gray-500">
                          No form responses found
                        </div>
                      )}
                    </div>

                    {/* Additional Fields */}
                    {Object.keys(record).some(key => 
                      !['_id', 'name', 'source', 'khanda', 'valaya', 'milanGhat', 'leadScore', 'status', 'submittedAt', 'createdAt', 'responses', '__v'].includes(key)
                    ) && (
                      <div className="mt-4">
                        <h5 className="font-semibold text-gray-900 mb-3">Additional Fields</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {Object.entries(record)
                            .filter(([key]) => ![
                              '_id', 'name', 'source', 'khanda', 'valaya', 'milanGhat', 
                              'leadScore', 'status', 'submittedAt', 'createdAt', 'responses', '__v'
                            ].includes(key))
                            .map(([key, value]) => (
                              <div key={key} className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <div className="font-medium text-sm text-gray-900 mb-1">
                                  {key}
                                </div>
                                <div className="text-sm text-gray-700">
                                  {formatResponseValue(value)}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};