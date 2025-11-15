import { useState } from 'react';
import { FormResponse } from './types';
import ResponseRow from './ResponseRow';
import ExpandedRow from './ExpandedRow';
import Pagination from './Pagination';

interface ResponsesTableProps {
  responses: FormResponse[];
  tableColumns: string[];
  selectedResponses: Set<string>;
  expandedRow: string | null;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalResponses: number;
  onToggleSelectAll: () => void;
  onToggleResponseSelection: (responseId: string) => void;
  onToggleExpand: (responseId: string) => void;
  onDeleteResponse: (responseId: string) => void;
  onPageChange: (page: number) => void;
}

export default function ResponsesTable({
  responses,
  tableColumns,
  selectedResponses,
  expandedRow,
  currentPage,
  totalPages,
  itemsPerPage,
  totalResponses,
  onToggleSelectAll,
  onToggleResponseSelection,
  onToggleExpand,
  onDeleteResponse,
  onPageChange
}: ResponsesTableProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  if (responses.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg">
          <span className="text-xl sm:text-2xl">📝</span>
        </div>
        <h3 className="text-lg sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">
          No responses found
        </h3>
        <p className="text-gray-600 text-sm sm:text-lg mb-6 sm:mb-8 max-w-md mx-auto leading-relaxed px-4">
          No responses match your current filters
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
              Responses ({totalResponses.toLocaleString()})
              {tableColumns.length > 0 && (
                <span className="text-sm text-gray-600 ml-2">
                  • {tableColumns.length} fields
                </span>
              )}
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Showing {responses.length} on this page
            </p>
          </div>
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Page {currentPage} of {totalPages}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <div className="min-w-full inline-block align-middle">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 bg-gray-50/50 rounded-l-lg sm:rounded-l-2xl">
                    <input
                      type="checkbox"
                      checked={selectedResponses.size === responses.length && responses.length > 0}
                      onChange={onToggleSelectAll}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                    />
                  </th>
                  
                  {/* Dynamic Columns - Responsive */}
                  {tableColumns.slice(0, 2).map(column => (
                    <th 
                      key={column} 
                      className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 bg-gray-50/50 truncate max-w-[120px] sm:max-w-xs"
                      title={column}
                    >
                      <span className="truncate block">{column}</span>
                    </th>
                  ))}
                  
                  {/* Show more columns on larger screens */}
                  {tableColumns.length > 2 && (
                    <>
                      {tableColumns.slice(2, 3).map(column => (
                        <th 
                          key={column} 
                          className="hidden sm:table-cell px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50 truncate max-w-xs"
                          title={column}
                        >
                          <span className="truncate block">{column}</span>
                        </th>
                      ))}
                      
                      {tableColumns.length > 3 && (
                        <th className="hidden lg:table-cell px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50 truncate max-w-xs">
                          <span className="truncate block">
                            {tableColumns.length > 4 ? tableColumns[3] : '+ More'}
                          </span>
                        </th>
                      )}
                    </>
                  )}

                  {/* Collection - Always visible */}
                  <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 bg-gray-50/50">
                    <span className="hidden xs:inline">Collection</span>
                    <span className="xs:hidden">Col</span>
                  </th>

                  {/* Date - Responsive */}
                  <th className="hidden sm:table-cell px-4 py-4 text-left text-sm font-semibold text-gray-900 bg-gray-50/50">
                    Submitted
                  </th>

                  {/* Actions */}
                  <th className="px-3 py-3 sm:px-4 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-900 bg-gray-50/50 rounded-r-lg sm:rounded-r-2xl">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.map((response) => (
                  <>
                    <ResponseRow
                      key={response._id}
                      response={response}
                      isExpanded={expandedRow === response._id}
                      isSelected={selectedResponses.has(response._id)}
                      tableColumns={tableColumns}
                      onToggleExpand={() => onToggleExpand(response._id)}
                      onToggleSelect={() => onToggleResponseSelection(response._id)}
                      onDelete={() => setDeleteConfirmId(response._id)}
                    />
                    
                    {/* Expanded Row */}
                    {expandedRow === response._id && (
                      <tr key={`expanded-${response._id}`} className="bg-gray-50/50">
                        <td colSpan={100} className="px-4 py-6">
                          <ExpandedRow
                            response={response}
                          />
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full mx-2">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <span className="text-red-600 text-lg sm:text-xl">🗑️</span>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">Delete Response</h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Are you sure you want to delete this response? This action cannot be undone.
                </p>
                <div className="flex gap-2 sm:gap-3">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-gray-700 border border-gray-300 rounded-xl sm:rounded-2xl hover:bg-gray-50 transition-all duration-300 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      onDeleteResponse(deleteConfirmId);
                      setDeleteConfirmId(null);
                    }}
                    className="flex-1 px-3 py-2 sm:px-4 sm:py-3 bg-red-600 text-white rounded-xl sm:rounded-2xl hover:bg-red-700 transition-all duration-300 text-sm sm:text-base"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalResponses}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}