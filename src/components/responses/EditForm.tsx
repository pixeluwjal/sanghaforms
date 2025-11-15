import { useState } from 'react';
import { FormResponse } from './types';

interface EditFormProps {
  response: FormResponse;
  onSave: (responseId: string, updates: Partial<FormResponse>) => void;
  onCancel: () => void;
}

export default function EditForm({ response, onSave, onCancel }: EditFormProps) {
  const [editedResponses, setEditedResponses] = useState(response.responses);

  const handleSave = () => {
    onSave(response._id, { responses: editedResponses });
  };

  return (
    <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
      <h5 className="font-semibold text-gray-900 mb-4 text-lg">
        Edit Response
      </h5>
      <div className="space-y-3">
        {Object.entries(response.responses).map(([fieldId, field]) => (
          <div key={fieldId} className="bg-white rounded-lg p-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {field.label}
            </label>
            <input
              type="text"
              value={editedResponses[fieldId]?.value as string || ''}
              onChange={(e) => {
                setEditedResponses(prev => ({
                  ...prev,
                  [fieldId]: {
                    ...field,
                    value: e.target.value
                  }
                }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Save Changes
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}