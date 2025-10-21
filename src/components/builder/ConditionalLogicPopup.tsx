import { useState } from 'react';
import { Trash2, Plus, Eye } from 'lucide-react';
import { Field, Section, ConditionalRule } from './shared/types';

interface ConditionalLogicPopupProps {
  field: Field;
  sections: Section[];
  onSave: (rules: ConditionalRule[]) => void;
  onClose: () => void;
}

export const ConditionalLogicPopup = ({
  field,
  sections,
  onSave,
  onClose
}: ConditionalLogicPopupProps) => {
  const [rules, setRules] = useState<ConditionalRule[]>(
    field.conditionalRules?.map(rule => ({
      ...rule,
      id: rule.id || `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })) || []
  );

  const generateRuleId = () => `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addRule = () => {
    setRules([...rules, {
      id: generateRuleId(),
      targetField: '',
      operator: 'equals',
      value: '',
      action: 'show'
    }]);
  };

  const removeRule = (ruleId: string) => {
    setRules(rules.filter(rule => rule.id !== ruleId));
  };

  const updateRule = (ruleId: string, updates: Partial<ConditionalRule>) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  // Get all fields from all sections (including nested fields)
  const getAllFields = (sections: Section[]): Field[] => {
    const fields: Field[] = [];
    
    const extractFields = (fieldList: Field[]) => {
      fieldList.forEach(field => {
        fields.push(field);
        if (field.nestedFields && field.nestedFields.length > 0) {
          extractFields(field.nestedFields);
        }
      });
    };
    
    sections.forEach(section => {
      extractFields(section.fields);
    });
    
    return fields;
  };

  const allFields = getAllFields(sections);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <h2 className="text-2xl font-bold text-white">Conditional Logic</h2>
          <p className="text-purple-100 mt-1">Set rules to show/hide fields based on user input</p>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div 
                key={`${rule.id}-${index}`} // Added index as fallback
                className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-gray-200/50 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800 text-lg">Rule {index + 1}</h3>
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      When this field
                    </label>
                    <select
                      value={rule.targetField}
                      onChange={(e) => updateRule(rule.id, { targetField: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">Select Field</option>
                      {allFields
                        .filter(f => f.id !== field.id)
                        .map(f => (
                          <option key={f.id} value={f.id}>
                            {f.label} ({f.type})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(rule.id, { operator: e.target.value as any })}
                      className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Value
                    </label>
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                      placeholder="Enter value"
                      className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Then
                    </label>
                    <select
                      value={rule.action}
                      onChange={(e) => updateRule(rule.id, { action: e.target.value as any })}
                      className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="show">Show This Field</option>
                      <option value="hide">Hide This Field</option>
                      <option value="enable">Enable This Field</option>
                      <option value="disable">Disable This Field</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
            
            {rules.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
                <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-semibold mb-2">No conditional rules set</p>
                <p className="text-sm">Add rules to control when this field appears</p>
              </div>
            )}
          </div>
          
          <button
            onClick={addRule}
            className="w-full mt-6 flex items-center justify-center gap-3 py-4 border-2 border-dashed border-purple-400 rounded-xl text-purple-600 hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Rule
          </button>
        </div>
        
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(rules)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105"
          >
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
};