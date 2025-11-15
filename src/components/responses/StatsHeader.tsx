import { Upload, RefreshCw, Download, FileSpreadsheet } from 'lucide-react';

interface StatsHeaderProps {
  collectionStats: {
    total: number;
    leads: number;
    swayamsevak: number;
  };
  selectedResponses: Set<string>;
  onBulkUpload: () => void;
  onRefresh: () => void;
  onExportCSV: () => void;
  onExportExcel: () => void;
  refreshing: boolean;
  filteredResponsesCount: number;
}

export default function StatsHeader({
  collectionStats,
  selectedResponses,
  onBulkUpload,
  onRefresh,
  onExportCSV,
  onExportExcel,
  refreshing,
  filteredResponsesCount
}: StatsHeaderProps) {
  return (
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
              <span className="text-sm font-medium">{collectionStats.leads} leads</span>
            </div>
            <div className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-lg">
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
          onClick={onBulkUpload}
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl"
        >
          <Upload className="w-4 h-4" />
          Bulk Upload
        </button>

        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
        
        <div className="flex gap-2">
          <button
            onClick={onExportCSV}
            disabled={filteredResponsesCount === 0}
            className="px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={onExportExcel}
            disabled={filteredResponsesCount === 0}
            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>
    </div>
  );
}