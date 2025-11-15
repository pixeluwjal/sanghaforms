import { useState, useEffect } from 'react';
import { X, Brain, Upload, AlertCircle, CheckCircle, FileText } from 'lucide-react';

interface BulkUploadResult {
  success: number;
  failed: number;
  errors: string[];
  aiUsed?: boolean;
  collectionType?: string;
}

interface BulkUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File, useAI: boolean, targetCollection: string) => Promise<void>;
  uploading: boolean;
}

export default function BulkUploadModal({ isOpen, onClose, onUpload, uploading }: BulkUploadModalProps) {
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [useAI, setUseAI] = useState(true);
  const [targetCollection, setTargetCollection] = useState('auto');
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<BulkUploadResult | null>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setUploadFile(null);
        setUploadProgress(0);
        setUploadResult(null);
        setShowResult(false);
      }, 300);
    }
  }, [isOpen]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setUploadFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setUploadFile(file);
      }
    }
  };

  const validateFile = (file: File): boolean => {
    const validTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const validExtensions = ['.csv', '.xls', '.xlsx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension || '')) {
      alert('Please select a valid CSV or Excel file');
      return false;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const simulateProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);
    
    return interval;
  };

  const handleUpload = async () => {
    if (!uploadFile) return;

    const progressInterval = simulateProgress();
    
    try {
      await onUpload(uploadFile, useAI, targetCollection);
      setUploadProgress(100);
      
      // Show success result temporarily
      setUploadResult({
        success: 1, // This would come from actual API response
        failed: 0,
        errors: [],
        aiUsed: useAI,
        collectionType: targetCollection
      });
      setShowResult(true);
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      setUploadResult({
        success: 0,
        failed: 1,
        errors: [error instanceof Error ? error.message : 'Upload failed'],
        aiUsed: useAI,
        collectionType: targetCollection
      });
      setShowResult(true);
    } finally {
      clearInterval(progressInterval);
    }
  };

  const handleClose = () => {
    setUploadFile(null);
    setUploadProgress(0);
    setUploadResult(null);
    setShowResult(false);
    onClose();
  };

  const getFileIcon = (file: File) => {
    if (file.name.endsWith('.csv')) {
      return <FileText className="w-8 h-8 text-green-600" />;
    } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return <FileText className="w-8 h-8 text-green-600" />;
    }
    return <FileText className="w-8 h-8 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-900">
            Bulk Upload Responses
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {showResult && uploadResult ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl ${
              uploadResult.failed === 0 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-center gap-3">
                {uploadResult.failed === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600" />
                )}
                <div>
                  <p className={`font-semibold ${
                    uploadResult.failed === 0 ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {uploadResult.failed === 0 ? 'Upload Successful!' : 'Upload Completed with Errors'}
                  </p>
                  <p className={`text-sm ${
                    uploadResult.failed === 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {uploadResult.success} successful, {uploadResult.failed} failed
                  </p>
                </div>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Errors:</p>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {uploadResult.errors.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all duration-300 font-medium"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* File Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload File
              </label>
              
              <div
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all duration-300 cursor-pointer ${
                  dragActive 
                    ? 'border-purple-400 bg-purple-50' 
                    : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                } ${uploadFile ? 'bg-green-50 border-green-300' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {uploadFile ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-3">
                      {getFileIcon(uploadFile)}
                      <div className="text-left">
                        <p className="font-medium text-gray-900 text-sm">{uploadFile.name}</p>
                        <p className="text-gray-500 text-xs">{formatFileSize(uploadFile.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUploadFile(null);
                      }}
                      className="text-red-600 hover:text-red-700 text-sm font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-gray-900 font-medium">
                        Drop your file here or click to browse
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Supports CSV, Excel (.xlsx, .xls) files up to 10MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {uploading && uploadProgress > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Target Collection Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Target Collection
              </label>
              <select
                value={targetCollection}
                onChange={(e) => setTargetCollection(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300"
                disabled={uploading}
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
                  <p className="text-sm text-blue-700">Use AI to automatically map columns</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="sr-only peer"
                  disabled={uploading}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 disabled:opacity-50"></div>
              </label>
            </div>

            {/* Sample File Structure */}
            <div className="bg-gray-50 rounded-2xl p-4">
              <h4 className="font-medium text-gray-900 text-sm mb-2">Expected File Format:</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <p>• CSV or Excel format</p>
                <p>• First row should contain column headers</p>
                <p>• Supported columns: name, email, phone, city, district, etc.</p>
                <p>• Maximum file size: 10MB</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleClose}
                disabled={uploading}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={!uploadFile || uploading}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all duration-300 font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}