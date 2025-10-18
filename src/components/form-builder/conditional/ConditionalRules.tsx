'use client';

import { useState } from 'react';
import { Wand2, ChevronDown, Plus, Trash2 } from 'lucide-react';
import { Section } from '../shared/types';
import { CONDITIONAL_OPERATORS } from '../shared/constants';

interface ConditionalRulesProps {
  section: Section;
  sections: Section[];
  onUpdate: (updates: Partial<Section>) => void;
}

export default function ConditionalRules({ section, sections, onUpdate }: ConditionalRulesProps) {
  const [showRules, setShowRules] = useState(false);

  const addRule = () => {
    const newRules = [
      ...(section.conditionalRules || []),
      {
        id: `rule-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        targetSection: '',
        field: '',
        operator: 'equals',
        value: '',
        action: 'show'
      }
    ];
    onUpdate({ conditionalRules: newRules });
  };

  const updateRule = (ruleId: string, updates: Partial<any>) => {
    const updatedRules = section.conditionalRules.map(rule =>
      rule.id === ruleId ? { ...rule, ...updates } : rule
    );
    onUpdate({ conditionalRules: updatedRules });
  };

  const deleteRule = (ruleId: string) => {
    const filteredRules = section.conditionalRules.filter(rule => rule.id !== ruleId);
    onUpdate({ conditionalRules: filteredRules });
  };

  const getTargetFields = (targetSectionId: string) => {
    const targetSection = sections.find(s => s.id === targetSectionId);
    return targetSection?.fields || [];
  };

  return (
    <div className="mt-4 border-t border-gray-200 pt-4">
      <button
        onClick={() => setShowRules(!showRules)}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-600 transition-colors"
      >
        <Wand2 className="w-4 h-4" />
        Conditional Display Rules
        <ChevronDown className={`w-4 h-4 transition-transform ${showRules ? 'rotate-180' : ''}`} />
      </button>

      {showRules && (
        <div className="mt-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-600">
              Show/hide this section based on other field values
            </p>
            <button
              onClick={addRule}
              className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white text-xs rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add Rule
            </button>
          </div>

          {section.conditionalRules?.map((rule, index) => {
            const targetSection = sections.find(s => s.id === rule.targetSection);
            const targetField = targetSection?.fields?.find(f => f.id === rule.field);
            
            return (
              <div key={`${rule.id}-${index}`} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <select
                    value={rule.targetSection}
                    onChange={(e) => updateRule(rule.id, { 
                      targetSection: e.target.value,
                      field: ''
                    })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    <option value="">Select Section</option>
                    {sections
                      .filter(s => s.id !== section.id)
                      .map(s => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))
                    }
                  </select>

                  <select
                    value={rule.field}
                    onChange={(e) => updateRule(rule.id, { field: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                    disabled={!rule.targetSection}
                  >
                    <option value="">Select Field</option>
                    {getTargetFields(rule.targetSection).map(field => (
                      <option key={field.id} value={field.id}>
                        {field.label} ({field.type})
                      </option>
                    ))}
                  </select>

                  <select
                    value={rule.operator}
                    onChange={(e) => updateRule(rule.id, { operator: e.target.value })}
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {CONDITIONAL_OPERATORS.map(op => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, { value: e.target.value })}
                    placeholder="Value"
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  />

                  <div className="flex items-center gap-2">
                    <select
                      value={rule.action}
                      onChange={(e) => updateRule(rule.id, { action: e.target.value })}
                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="show">Show</option>
                      <option value="hide">Hide</option>
                    </select>
                    
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                
                {/* Rule Description */}
                {rule.targetSection && rule.field && targetSection && targetField && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span>
                      {rule.action === 'show' ? 'Show' : 'Hide'} this section when "
                      {targetSection.title} - {targetField.label}" {rule.operator} "{rule.value}"
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {(!section.conditionalRules || section.conditionalRules.length === 0) && (
            <div className="text-center py-4 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-white">
              <Wand2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm">No conditional rules yet</p>
              <p className="text-xs mt-1">Add rules to show/hide this section dynamically</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}