// components/builder/SectionConditionalPopup.tsx
import { useState } from 'react';
import { Trash2, Plus, Eye, X } from 'lucide-react';
import { Section, Field } from './shared/types';

interface SectionConditionalPopupProps {
  section: Section;
  sections: Section[];
  onSave: (rules: any[]) => void;
  onClose: () => void;
}

export const SectionConditionalPopup = ({
  section,
  sections,
  onSave,
  onClose
}: SectionConditionalPopupProps) => {
  const [rules, setRules] = useState<any[]>(section.conditionalRules || []);

  const generateRuleId = () => `section-rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

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

  const updateRule = (ruleId: string, updates: Partial<any>) => {
    setRules(rules.map(rule => 
      rule.id === ruleId ? { ...rule, ...updates } : rule
    ));
  };

  // Get all fields from all previous sections (only fields that come before current section)
  const getAllFieldsFromPreviousSections = (currentSectionId: string): Field[] => {
    const fields: Field[] = [];
    const currentIndex = sections.findIndex(s => s.id === currentSectionId);
    
    if (currentIndex === -1 || currentIndex === 0) return fields; // No previous sections

    const extractFields = (fieldList: Field[]) => {
      fieldList.forEach(field => {
        fields.push(field);
        if (field.nestedFields && field.nestedFields.length > 0) {
          extractFields(field.nestedFields);
        }
      });
    };
    
    // Only include fields from sections before the current one
    for (let i = 0; i < currentIndex; i++) {
      extractFields(sections[i].fields);
    }
    
    return fields;
  };

  const availableFields = getAllFieldsFromPreviousSections(section.id);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-white/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Section Conditional Logic</h2>
              <p className="text-orange-100 mt-1">
                Control when this section appears based on previous field values
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-orange-100 hover:text-white hover:bg-orange-500/30 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Rules List */}
          <div className="space-y-4">
            {rules.map((rule, index) => (
              <div 
                key={`${rule.id}-${index}`}
                className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border-2 border-orange-200/50 shadow-sm"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">Rule {index + 1}</h3>
                  </div>
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                    title="Remove rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Rule Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Target Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      When this field
                    </label>
                    <select
                      value={rule.targetField}
                      onChange={(e) => updateRule(rule.id, { targetField: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    >
                      <option value="">Select a field...</option>
                      {availableFields.length > 0 ? (
                        availableFields.map(field => (
                          <option key={field.id} value={field.id}>
                            {field.label} ({field.type})
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No previous fields available
                        </option>
                      )}
                    </select>
                    {availableFields.length === 0 && (
                      <p className="text-xs text-orange-600 mt-1">
                        Add fields to previous sections to create conditions
                      </p>
                    )}
                  </div>
                  
                  {/* Operator */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Condition
                    </label>
                    <select
                      value={rule.operator}
                      onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="contains">Contains</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                    </select>
                  </div>
                  
                  {/* Value */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Value
                    </label>
                    <input
                      type="text"
                      value={rule.value}
                      onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                      placeholder="Enter comparison value"
                      className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    />
                  </div>
                  
                  {/* Action */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Then
                    </label>
                    <select
                      value={rule.action}
                      onChange={(e) => updateRule(rule.id, { action: e.target.value })}
                      className="w-full border-2 border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
                    >
                      <option value="show">Show This Section</option>
                      <option value="hide">Hide This Section</option>
                    </select>
                  </div>
                </div>

                {/* Rule Description */}
                <div className="mt-3 p-3 bg-white/50 rounded-lg border border-orange-200">
                  <p className="text-xs text-orange-700">
                    <strong>Rule:</strong> {rule.targetField ? `When "${rule.targetField}" ${rule.operator} "${rule.value}", ${rule.action} this section` : 'Configure the rule above'}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Empty State */}
            {rules.length === 0 && (
              <div className="text-center py-12 text-gray-500 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border-2 border-dashed border-orange-300">
                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="w-10 h-10 text-orange-500" />
                </div>
                <p className="text-lg font-semibold mb-2 text-gray-700">No conditional rules set</p>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  Add rules to control when this section appears based on user input in previous sections
                </p>
              </div>
            )}
          </div>
          
          {/* Add Rule Button */}
          <button
            onClick={addRule}
            disabled={availableFields.length === 0}
            className="w-full mt-6 flex items-center justify-center gap-3 py-4 border-2 border-dashed border-orange-400 rounded-xl text-orange-600 hover:border-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Rule
          </button>

          {/* Information Panel */}
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <span>💡</span> How Section Conditions Work
              </h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Rules are evaluated when the form loads and as users fill fields</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>You can only reference fields from <strong>previous sections</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Multiple rules are combined with <strong>AND logic</strong> (all must be true)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1">•</span>
                  <span>Section will be shown/hidden based on rule evaluation</span>
                </li>
              </ul>
            </div>

            {/* Available Fields Preview */}
            {availableFields.length > 0 && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">
                  Available Fields from Previous Sections
                </h4>
                <div className="text-sm text-green-700">
                  <p className="mb-2">You can reference these fields in your conditions:</p>
                  <div className="flex flex-wrap gap-2">
                    {availableFields.slice(0, 8).map(field => (
                      <span 
                        key={field.id}
                        className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs border border-green-200"
                      >
                        {field.label}
                      </span>
                    ))}
                    {availableFields.length > 8 && (
                      <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-xs">
                        +{availableFields.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {availableFields.length === 0 && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h4 className="font-semibold text-amber-800 mb-2">
                  No Previous Fields Available
                </h4>
                <p className="text-sm text-amber-700">
                  To create section conditions, you need to add fields to sections that come before this one.
                  Sections are evaluated in the order they appear in the form.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-300 font-semibold hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(rules)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={rules.some(rule => !rule.targetField || !rule.value)}
          >
            Save Section Rules
          </button>
        </div>
      </div>
    </div>
  );
};