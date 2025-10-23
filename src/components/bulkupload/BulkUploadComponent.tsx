// components/BulkUploadComponent.tsx
"use client";

import { useState, useEffect } from 'react';
import { Upload, FileText, Database, Trash2, RefreshCw, Users, Zap, Info, Eye, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { ExtractedDataModal } from '../ExtractedDataModal';
import { toast } from 'react-toastify';

interface BulkUpload {
  _id: string;
  filename: string;
  originalName: string;
  targetCollection: 'SwayamsevakResponse' | 'LeadResponse';
  status: 'processing' | 'completed' | 'failed' | 'partial';
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  source: string;
  sanghaHierarchy?: {
    khandaId?: string;
    valayaId?: string;
    milanId?: string;
    ghataId?: string;
  };
  enableAIParsing?: boolean;
  createdAt: string;
  uploadedBy: {
    email: string;
  };
}

interface Source {
  name: string;
  description?: string;
}

interface Organization {
  _id: string;
  name: string;
  khandas: Khanda[];
}

interface Khanda {
  _id: string;
  name: string;
  code: string;
  valays: Valay[];
}

interface Valay {
  _id: string;
  name: string;
  milans: Milan[];
}

interface Milan {
  _id: string;
  name: string;
  ghatas: Ghata[];
}

interface Ghata {
  _id: string;
  name: string;
}

export const BulkUploadComponent: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploads, setUploads] = useState<BulkUpload[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [sanghaHierarchy, setSanghaHierarchy] = useState({
    khandaId: '',
    valayaId: '',
    milanId: '',
    ghataId: ''
  });
  const [enableAIParsing, setEnableAIParsing] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<BulkUpload | null>(null);
  const [showExtractedData, setShowExtractedData] = useState(false);
  const [expandedUpload, setExpandedUpload] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    targetCollection: 'SwayamsevakResponse' as 'SwayamsevakResponse' | 'LeadResponse',
    uploadType: 'append' as 'append' | 'replace',
    source: ''
  });

  // Fetch existing uploads
  const fetchUploads = async () => {
    try {
      const response = await fetch('/api/admin/bulk-upload');
      if (!response.ok) throw new Error('Failed to fetch uploads');
      
      const data = await response.json();
      setUploads(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching uploads:', error);
      setUploads([]);
    }
  };

  // Fetch sources
  const fetchSources = async () => {
    try {
      const response = await fetch('/api/sources');
      const data = await response.json();
      setSources(Array.isArray(data) ? data.map((source: any) => ({
        name: typeof source === 'string' ? source : source.name,
        description: source.description
      })) : []);
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  // Fetch organizations
  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organization');
      if (response.ok) {
        const data = await response.json();
        setOrganizations(data.organizations || []);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  useEffect(() => {
    fetchUploads();
    fetchSources();
    fetchOrganizations();
    const interval = setInterval(fetchUploads, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSanghaFieldChange = (field: string, value: string) => {
    setSanghaHierarchy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getHierarchyName = (type: string, id: string): string => {
    if (!id) return '';
    
    for (const org of organizations) {
      for (const khanda of org.khandas || []) {
        if (type === 'khanda' && khanda._id === id) return khanda.name;
        
        for (const valay of khanda.valays || []) {
          if (type === 'valay' && valay._id === id) return valay.name;
          
          for (const milan of valay.milans || []) {
            if (type === 'milan' && milan._id === id) return milan.name;
            
            for (const ghata of milan.ghatas || []) {
              if (type === 'ghata' && ghata._id === id) return ghata.name;
            }
          }
        }
      }
    }
    
    return id;
  };

  const getHierarchyDisplay = () => {
    const parts = [];
    
    if (sanghaHierarchy.khandaId) {
      parts.push(`Khanda: ${getHierarchyName('khanda', sanghaHierarchy.khandaId)}`);
    }
    if (sanghaHierarchy.valayaId) {
      parts.push(`Valaya: ${getHierarchyName('valay', sanghaHierarchy.valayaId)}`);
    }
    if (sanghaHierarchy.milanId) {
      parts.push(`Milan: ${getHierarchyName('milan', sanghaHierarchy.milanId)}`);
    }
    if (sanghaHierarchy.ghataId) {
      parts.push(`Ghata: ${getHierarchyName('ghata', sanghaHierarchy.ghataId)}`);
    }
    
    return parts.length > 0 ? parts.join(' → ') : 'No hierarchy selected';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !formData.source) {
      toast.error('Please select a file and source');
      return;
    }

    if (formData.targetCollection === 'SwayamsevakResponse' && !sanghaHierarchy.khandaId) {
      toast.error('Please select at least a Khanda for Swayamsevak responses');
      return;
    }

    setIsUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      uploadFormData.append('targetCollection', formData.targetCollection);
      uploadFormData.append('uploadType', formData.uploadType);
      uploadFormData.append('source', formData.source);
      uploadFormData.append('sanghaHierarchy', JSON.stringify(sanghaHierarchy));
      uploadFormData.append('enableAIParsing', enableAIParsing.toString());

      const response = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Upload successful:', result);
        setSelectedFile(null);
        setSanghaHierarchy({ khandaId: '', valayaId: '', milanId: '', ghataId: '' });
        setEnableAIParsing(false);
        setFormData({
          targetCollection: 'SwayamsevakResponse',
          uploadType: 'append',
          source: ''
        });
        fetchUploads();
        
        toast.success('File uploaded successfully! Processing has started in the background.');
      } else {
        const error = await response.json();
        console.error('Upload failed:', error);
        toast.error(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (uploadId: string) => {
    if (!window.confirm('Are you sure you want to delete this upload and all associated records?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bulk-upload/${uploadId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchUploads();
        toast.success('Upload deleted successfully!');
      } else {
        const error = await response.json();
        console.error('Delete failed:', error);
        toast.error('Delete failed. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Delete failed. Please try again.');
    }
  };

  const handleViewExtractedData = (upload: BulkUpload) => {
    setSelectedUpload(upload);
    setShowExtractedData(true);
  };

  const handleCloseExtractedData = () => {
    setShowExtractedData(false);
    setSelectedUpload(null);
  };

  const toggleExpandUpload = (uploadId: string) => {
    setExpandedUpload(expandedUpload === uploadId ? null : uploadId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'processing': return '🔄';
      case 'failed': return '❌';
      case 'partial': return '⚠️';
      default: return '📄';
    }
  };

  const formatSanghaHierarchy = (hierarchy: any) => {
    if (!hierarchy) return 'N/A';
    const parts = [];
    if (hierarchy.khandaId) parts.push('Khanda');
    if (hierarchy.valayaId) parts.push('Valaya');
    if (hierarchy.milanId) parts.push('Milan');
    if (hierarchy.ghataId) parts.push('Ghata');
    return parts.join(' → ') || 'N/A';
  };

  const getProgressPercentage = (upload: BulkUpload) => {
    return upload.totalRecords > 0 ? (upload.processedRecords / upload.totalRecords) * 100 : 0;
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Upload Form */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
            <Upload className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-blue-600" />
            Bulk Data Upload
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4" />
            <span>Auto-refresh every 5 seconds</span>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* File Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">File *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 lg:p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-6 h-6 lg:w-8 lg:h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600 break-words">
                    {selectedFile ? selectedFile.name : 'Choose file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    CSV, JSON, Excel files supported
                  </p>
                </label>
              </div>
            </div>

            {/* Target Collection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Target Collection *</label>
              <select
                value={formData.targetCollection}
                onChange={(e) => setFormData({...formData, targetCollection: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="SwayamsevakResponse">Swayamsevak Responses</option>
                <option value="LeadResponse">Lead Responses</option>
              </select>
            </div>

            {/* Source Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Source *</label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Source</option>
                {sources.map((source) => (
                  <option key={source.name} value={source.name}>
                    {source.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sangha Hierarchy */}
          <div className="bg-blue-50 p-4 lg:p-6 rounded-xl border border-blue-200">
            <h3 className="text-lg font-semibold mb-4 flex items-center text-blue-900">
              <Users className="w-5 h-5 mr-2" />
              Sangha Hierarchy
              <span className="ml-2 text-sm font-normal text-blue-700">
                {formData.targetCollection === 'SwayamsevakResponse' ? '(Required)' : '(Optional)'}
              </span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
              {/* Khanda Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Khanda</label>
                <select
                  value={sanghaHierarchy.khandaId}
                  onChange={(e) => handleSanghaFieldChange('khandaId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={formData.targetCollection === 'SwayamsevakResponse'}
                >
                  <option value="">Select Khanda</option>
                  {organizations.map(org => 
                    org.khandas?.map(khanda => (
                      <option key={khanda._id} value={khanda._id}>
                        {khanda.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Valaya Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Valaya</label>
                <select
                  value={sanghaHierarchy.valayaId}
                  onChange={(e) => handleSanghaFieldChange('valayaId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!sanghaHierarchy.khandaId}
                >
                  <option value="">Select Valaya</option>
                  {organizations.map(org => 
                    org.khandas
                      ?.find(k => k._id === sanghaHierarchy.khandaId)
                      ?.valays?.map(valay => (
                        <option key={valay._id} value={valay._id}>
                          {valay.name}
                        </option>
                      ))
                  )}
                </select>
              </div>

              {/* Milan Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Milan</label>
                <select
                  value={sanghaHierarchy.milanId}
                  onChange={(e) => handleSanghaFieldChange('milanId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!sanghaHierarchy.valayaId}
                >
                  <option value="">Select Milan</option>
                  {organizations.map(org => 
                    org.khandas
                      ?.find(k => k._id === sanghaHierarchy.khandaId)
                      ?.valays?.find(v => v._id === sanghaHierarchy.valayaId)
                      ?.milans?.map(milan => (
                        <option key={milan._id} value={milan._id}>
                          {milan.name}
                        </option>
                      ))
                  )}
                </select>
              </div>

              {/* Ghata Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Ghata</label>
                <select
                  value={sanghaHierarchy.ghataId}
                  onChange={(e) => handleSanghaFieldChange('ghataId', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={!sanghaHierarchy.milanId}
                >
                  <option value="">Select Ghata</option>
                  {organizations.map(org => 
                    org.khandas
                      ?.find(k => k._id === sanghaHierarchy.khandaId)
                      ?.valays?.find(v => v._id === sanghaHierarchy.valayaId)
                      ?.milans?.find(m => m._id === sanghaHierarchy.milanId)
                      ?.ghatas?.map(ghata => (
                        <option key={ghata._id} value={ghata._id}>
                          {ghata.name}
                        </option>
                      ))
                  )}
                </select>
              </div>
            </div>

            {/* Current Selection Display */}
            <div className="mt-4 p-3 bg-white rounded-lg border border-blue-100">
              <p className="text-sm font-medium text-blue-900 mb-2">Current Selection:</p>
              <p className="text-sm text-blue-700 break-words">{getHierarchyDisplay()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Upload Type */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">Upload Type</label>
              <select
                value={formData.uploadType}
                onChange={(e) => setFormData({...formData, uploadType: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="append">Append to Existing</option>
                <option value="replace">Replace Existing</option>
              </select>
            </div>

            {/* AI Parsing Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center">
                <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                AI Data Enhancement
                <Info className="w-3 h-3 ml-2 text-gray-400" title="Uses Gemini AI to clean and enhance your data" />
              </label>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    checked={enableAIParsing}
                    onChange={(e) => setEnableAIParsing(e.target.checked)}
                    className="sr-only"
                    id="ai-parsing"
                  />
                  <label
                    htmlFor="ai-parsing"
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      enableAIParsing ? 'bg-yellow-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        enableAIParsing ? 'transform translate-x-6' : ''
                      }`}
                    />
                  </label>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {enableAIParsing ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Automatically clean, structure, and enhance your data using AI
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isUploading || !selectedFile}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center font-semibold shadow-lg"
              >
                {isUploading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" />
                    Start Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Upload History */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 gap-4">
          <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 lg:w-6 lg:h-6 mr-3 text-green-600" />
            Upload History
          </h2>
          <button
            onClick={fetchUploads}
            className="flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg transition-colors w-full lg:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>

        {uploads.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No uploads yet</h3>
            <p className="text-gray-500">Upload your first file to get started with bulk data processing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table - Fixed with horizontal scroll */}
            <div className="hidden lg:block overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full min-w-[1000px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">File Details</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Collection & Source</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Sangha Hierarchy</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Progress</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {uploads.map((upload) => (
                    <tr key={upload._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <Database className="w-5 h-5 mr-3 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{upload.originalName}</p>
                            <p className="text-xs text-gray-500">
                              {upload.enableAIParsing && (
                                <span className="inline-flex items-center text-yellow-600">
                                  <Zap className="w-3 h-3 mr-1" />
                                  AI Enhanced
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            upload.targetCollection === 'SwayamsevakResponse' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {upload.targetCollection}
                          </span>
                          <p className="text-sm text-gray-600">{upload.source}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {formatSanghaHierarchy(upload.sanghaHierarchy)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(upload.status)}`}>
                          <span className="mr-1">{getStatusIcon(upload.status)}</span>
                          {upload.status.charAt(0).toUpperCase() + upload.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${getProgressPercentage(upload)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {Math.round(getProgressPercentage(upload))}%
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{upload.processedRecords}/{upload.totalRecords}</span>
                            {(upload.status === 'completed' || upload.status === 'partial') && (
                              <span className="flex items-center space-x-1">
                                <span className="text-green-600">✓ {upload.successfulRecords}</span>
                                <span>•</span>
                                <span className="text-red-600">✗ {upload.failedRecords}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {new Date(upload.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(upload.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          {(upload.status === 'completed' || upload.status === 'partial') && (
                            <button
                              onClick={() => handleViewExtractedData(upload)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View extracted data"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(upload._id)}
                            disabled={upload.status === 'processing'}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete upload and all associated records"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Always visible */}
            <div className="lg:hidden space-y-4">
              {uploads.map((upload) => (
                <div key={upload._id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <Database className="w-5 h-5 mr-2 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 text-sm">{upload.originalName}</h3>
                        <p className="text-xs text-gray-500">
                          {new Date(upload.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpandUpload(upload._id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {expandedUpload === upload._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <span className="font-medium text-gray-700">Collection:</span>
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                        upload.targetCollection === 'SwayamsevakResponse' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {upload.targetCollection}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Source:</span>
                      <span className="ml-1 text-gray-600">{upload.source}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Status:</span>
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${getStatusColor(upload.status)}`}>
                        {upload.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Progress:</span>
                      <span className="ml-1 text-gray-600">{Math.round(getProgressPercentage(upload))}%</span>
                    </div>
                  </div>

                  {/* Actions - Always visible on mobile */}
                  <div className="flex space-x-2 mb-3">
                    {(upload.status === 'completed' || upload.status === 'partial') && (
                      <button
                        onClick={() => handleViewExtractedData(upload)}
                        className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Data</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(upload._id)}
                      disabled={upload.status === 'processing'}
                      className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>

                  {expandedUpload === upload._id && (
                    <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Sangha Hierarchy:</span>
                        <p className="text-sm text-gray-600 mt-1">{formatSanghaHierarchy(upload.sanghaHierarchy)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700 text-sm">Records:</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Processed: {upload.processedRecords}/{upload.totalRecords} 
                          {upload.status === 'completed' || upload.status === 'partial' ? (
                            <span className="ml-2">
                              (✓ {upload.successfulRecords} • ✗ {upload.failedRecords})
                            </span>
                          ) : null}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Extracted Data Modal */}
      <ExtractedDataModal
        isOpen={showExtractedData}
        onClose={handleCloseExtractedData}
        upload={selectedUpload}
      />
    </div>
  );
};