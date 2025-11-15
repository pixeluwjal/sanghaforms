import { FormResponse } from './types';

interface ExpandedRowProps {
  response: FormResponse;
  onEdit: (response: FormResponse) => void;
}

export default function ExpandedRow({ response, onEdit }: ExpandedRowProps) {
  return (
    <tr className="bg-gray-50/50">
      <td colSpan={100} className="px-4 py-6">
        <div className="space-y-6">
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

          <div className="flex justify-end">
            <button
              onClick={() => onEdit(response)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Edit Response
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}