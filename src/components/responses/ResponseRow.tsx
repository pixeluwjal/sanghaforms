import { ChevronDown, ChevronUp, Trash2, UserCheck, User, FileSpreadsheet, MoreVertical } from 'lucide-react';
import { FormResponse } from './types';
import { useState } from 'react';

interface ResponseRowProps {
  response: FormResponse;
  isExpanded: boolean;
  isSelected: boolean;
  tableColumns: string[];
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onDelete: () => void;
}

export default function ResponseRow({
  response,
  isExpanded,
  isSelected,
  tableColumns,
  onToggleExpand,
  onToggleSelect,
  onDelete
}: ResponseRowProps) {
  const [showMobileActions, setShowMobileActions] = useState(false);

  const getFieldValue = (column: string) => {
    const field = Object.values(response.responses).find(f => f.label === column);
    const value = field ? String(field.value) : '-';
    
    // Truncate long values for mobile
    if (typeof window !== 'undefined' && window.innerWidth < 640 && value.length > 20) {
      return value.substring(0, 20) + '...';
    }
    
    return value;
  };

  const getCollectionBadge = () => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize";
    
    switch (response.collection) {
      case 'leads':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <UserCheck className="w-3 h-3 mr-1 hidden xs:inline" />
            <span className="hidden sm:inline">Lead</span>
            <span className="sm:hidden">L</span>
          </span>
        );
      case 'swayamsevak':
        return (
          <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
            <User className="w-3 h-3 mr-1 hidden xs:inline" />
            <span className="hidden sm:inline">Swayamsevak</span>
            <span className="sm:hidden">S</span>
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            <FileSpreadsheet className="w-3 h-3 mr-1 hidden xs:inline" />
            <span className="hidden sm:inline">Response</span>
            <span className="sm:hidden">R</span>
          </span>
        );
    }
  };

  return (
    <tr 
      className="hover:bg-purple-50/30 transition-colors group cursor-pointer"
      onClick={onToggleExpand}
    >
      {/* Checkbox */}
      <td className="px-3 py-3 sm:px-4 sm:py-4" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onToggleSelect}
          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
        />
      </td>

      {/* Dynamic Columns - Responsive */}
      {tableColumns.slice(0, 2).map(column => (
        <td key={column} className="px-3 py-3 sm:px-4 sm:py-4 text-xs sm:text-sm text-gray-700 max-w-[120px] sm:max-w-xs">
          <div className="truncate" title={getFieldValue(column)}>
            {getFieldValue(column)}
          </div>
        </td>
      ))}

      {/* Additional columns for larger screens */}
      {tableColumns.length > 2 && (
        <>
          {tableColumns.slice(2, 3).map(column => (
            <td key={column} className="hidden sm:table-cell px-4 py-4 text-sm text-gray-700 max-w-xs">
              <div className="truncate" title={getFieldValue(column)}>
                {getFieldValue(column)}
              </div>
            </td>
          ))}
          
          {tableColumns.length > 3 && (
            <td className="hidden lg:table-cell px-4 py-4 text-sm text-gray-700 max-w-xs">
              <div className="truncate" title={getFieldValue(tableColumns[3])}>
                {getFieldValue(tableColumns[3])}
              </div>
            </td>
          )}
        </>
      )}

      {/* Collection Badge */}
      <td className="px-3 py-3 sm:px-4 sm:py-4">
        {getCollectionBadge()}
      </td>

      {/* Date - Hidden on mobile */}
      <td className="hidden sm:table-cell px-4 py-4">
        <div className="text-sm text-gray-900 font-medium">
          {new Date(response.submittedAt).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">
          {new Date(response.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </td>

      {/* Actions */}
      <td className="px-3 py-3 sm:px-4 sm:py-4">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpand();
              }}
              className="p-1.5 sm:p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg sm:rounded-xl transition-all duration-200"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg sm:rounded-xl transition-all duration-200"
              title="Delete"
            >
              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          {/* Mobile Actions Menu */}
          <div className="sm:hidden relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMobileActions(!showMobileActions);
              }}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
            
            {showMobileActions && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand();
                    setShowMobileActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 border-b border-gray-100"
                >
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  {isExpanded ? "Collapse" : "Expand"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setShowMobileActions(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}