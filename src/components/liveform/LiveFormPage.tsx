// components/liveform/LiveFormPage.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { SanghaHierarchyField } from '@/components/SanghaHierarchyField';
import Image from 'next/image';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'sangha' | 'file' | 'whatsapp_optin' | 'arratai_optin';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  order: number;
  conditionalRules?: any[];
  nestedFields?: FormField[];
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  fields: FormField[];
  conditionalRules?: any[];
}

interface FormData {
  _id: string;
  title: string;
  description?: string;
  images?: {
    logo?: string;
    banner?: string;
    background?: string;
  };
  sections: FormSection[];
  theme: {
    primaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
  settings: {
    customSlug?: string;
    allowMultipleResponses: boolean;
    enableProgressSave: boolean;
    showGroupLinks: boolean;
    whatsappGroupLink?: string;
    arrataiGroupLink?: string;
  };
}

interface LiveFormPageProps {
  slug: string;
}

export default function LiveFormPage({ slug }: LiveFormPageProps) {
  const [formData, setFormData] = useState<FormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [visibleFields, setVisibleFields] = useState<Set<string>>(new Set());

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    getValues,
    setValue,
    trigger
  } = useForm();

  // Fetch form data
  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/forms/${slug}/details`);
        if (!response.ok) throw new Error('Form not found');
        const data = await response.json();
        console.log('Fetched form data:', data);
        setFormData(data);
        
        // Initialize all sections and fields as visible
        const initialSections = new Set(data.sections?.map((section: FormSection) => section.id) || []);
        const initialFields = new Set();
        data.sections?.forEach((section: FormSection) => {
          section.fields?.forEach((field: FormField) => {
            initialFields.add(field.id);
            if (field.nestedFields) {
              field.nestedFields.forEach((nestedField: FormField) => {
                initialFields.add(nestedField.id);
              });
            }
          });
        });
        setVisibleSections(initialSections);
        setVisibleFields(initialFields);
      } catch (error) {
        console.error('Error fetching form:', error);
        setSubmitStatus('error');
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [slug]);

  // Evaluate conditional logic - FIXED VERSION
  const evaluateConditionalLogic = useCallback(() => {
    if (!formData || !formData.sections) return;

    const evaluateCondition = (rule: any, currentValues: any) => {
      const targetValue = currentValues[rule.targetField];
      console.log(`Evaluating condition: ${rule.targetField} = ${targetValue}, operator: ${rule.operator}, value: ${rule.value}`);
      
      if (targetValue === undefined || targetValue === null) return false;

      // Handle checkbox array values
      if (Array.isArray(targetValue)) {
        const checkboxValue = targetValue.find(val => val === rule.value);
        switch (rule.operator) {
          case 'equals':
            return checkboxValue !== undefined;
          case 'not_equals':
            return checkboxValue === undefined;
          default:
            return false;
        }
      }

      // Handle string comparison
      switch (rule.operator) {
        case 'equals':
          return String(targetValue) === String(rule.value);
        case 'not_equals':
          return String(targetValue) !== String(rule.value);
        case 'contains':
          return String(targetValue).includes(String(rule.value));
        case 'greater_than':
          return Number(targetValue) > Number(rule.value);
        case 'less_than':
          return Number(targetValue) < Number(rule.value);
        default:
          return false;
      }
    };

    const currentValues = getValues();
    console.log('Current form values:', currentValues);
    
    const newVisibleSections = new Set();
    const newVisibleFields = new Set();

    // Evaluate sections
    formData.sections.forEach((section: FormSection) => {
      let shouldShowSection = true;
      
      if (section.conditionalRules && section.conditionalRules.length > 0) {
        shouldShowSection = section.conditionalRules.every(rule => 
          evaluateCondition(rule, currentValues)
        );
        console.log(`Section ${section.id} should show:`, shouldShowSection);
      }

      if (shouldShowSection) {
        newVisibleSections.add(section.id);
        
        // Evaluate fields in this section
        section.fields?.forEach((field: FormField) => {
          let shouldShowField = true;
          
          if (field.conditionalRules && field.conditionalRules.length > 0) {
            shouldShowField = field.conditionalRules.every(rule => 
              evaluateCondition(rule, currentValues)
            );
            console.log(`Field ${field.id} should show:`, shouldShowField, 'rules:', field.conditionalRules);
          }

          if (shouldShowField) {
            newVisibleFields.add(field.id);
            
            // Evaluate nested fields - FIXED: Always evaluate nested fields independently
            if (field.nestedFields) {
              field.nestedFields.forEach((nestedField: FormField) => {
                let shouldShowNested = true;
                
                if (nestedField.conditionalRules && nestedField.conditionalRules.length > 0) {
                  shouldShowNested = nestedField.conditionalRules.every(rule => 
                    evaluateCondition(rule, currentValues)
                  );
                  console.log(`Nested field ${nestedField.id} should show:`, shouldShowNested, 'rules:', nestedField.conditionalRules);
                }
                
                if (shouldShowNested) {
                  newVisibleFields.add(nestedField.id);
                } else {
                  console.log(`Hiding nested field ${nestedField.id} due to conditions`);
                }
              });
            }
          }
        });
      }
    });

    console.log('Final visible fields:', Array.from(newVisibleFields));
    console.log('Final visible sections:', Array.from(newVisibleSections));

    setVisibleSections(newVisibleSections);
    setVisibleFields(newVisibleFields);
  }, [formData, getValues]);

  // Watch form changes and evaluate conditions
  useEffect(() => {
    const subscription = watch(() => {
      evaluateConditionalLogic();
    });
    return () => subscription.unsubscribe();
  }, [watch, evaluateConditionalLogic]);

  // Initial evaluation
  useEffect(() => {
    if (formData) {
      evaluateConditionalLogic();
    }
  }, [formData, evaluateConditionalLogic]);

  const handleFieldChange = (fieldId: string, value: any) => {
    setValue(fieldId, value, { shouldValidate: true });
    // Trigger re-evaluation after a small delay to ensure state is updated
    setTimeout(() => {
      evaluateConditionalLogic();
    }, 50);
  };

  const onSubmit = async (data: any) => {
    try {
      setSubmitting(true);
      
      const responses = Object.entries(data)
        .filter(([key]) => key !== 'responses')
        .map(([fieldId, value]) => ({
          fieldId,
          value: value === undefined ? '' : value
        }));

      console.log('Submitting responses:', responses);

      const submissionData = {
        responses,
        submittedAt: new Date().toISOString()
      };

      const response = await fetch(`/api/forms/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const result = await response.json();
      console.log('Submission result:', result);
      setSubmitStatus('success');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField, sectionId: string, level: number = 0) => {
    const fieldId = field.id;
    const isVisible = visibleFields.has(fieldId);
    
    if (!isVisible) {
      console.log(`Field ${fieldId} is hidden - not rendering`);
      return null;
    }

    const isNested = level > 0;
    const fieldWrapperClass = `mb-6 ${isNested ? 'ml-6' : ''}`;
    const labelClass = `block text-sm font-semibold text-gray-700 mb-2 ${
      errors[fieldId] ? 'text-red-600' : 'text-gray-700'
    }`;
    const inputBaseClass = `w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 bg-white text-gray-900 shadow-sm placeholder-gray-400 ${
      errors[fieldId] ? 'border-red-500' : ''
    }`;

    const renderNestedFields = (nestedFields?: FormField[]) => {
      if (!nestedFields || nestedFields.length === 0) return null;
      
      // Only render nested fields that are visible
      const visibleNestedFields = nestedFields.filter(nestedField => 
        visibleFields.has(nestedField.id)
      );

      if (visibleNestedFields.length === 0) return null;
      
      return (
        <div className={`mt-4 space-y-4 ${level > 0 ? 'ml-4' : ''}`}>
          {visibleNestedFields.map(nestedField => (
            <div key={nestedField.id}>
              {renderField(nestedField, sectionId, level + 1)}
            </div>
          ))}
        </div>
      );
    };

    // Special handling for Sangha field type
    if (field.type === 'sangha') {
      return (
        <div key={fieldId} className={fieldWrapperClass}>
          <SanghaHierarchyField 
            field={field}
            onFieldChange={handleFieldChange}
            theme={formData?.theme}
          />
          {renderNestedFields(field.nestedFields)}
        </div>
      );
    }

    // Special handling for WhatsApp Opt-in
    if (field.type === 'whatsapp_optin') {
      return (
        <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register(fieldId, {
                required: field.required && `${field.label} is required`
              })}
              className="peer hidden"
              onChange={(e) => {
                handleFieldChange(fieldId, e.target.checked.toString());
              }}
            />
            <div className="w-6 h-6 flex items-center justify-center border-2 border-green-400 rounded-md transition-all duration-200 peer-checked:bg-green-500 peer-checked:border-green-500 mt-0.5 group-hover:border-green-500 shadow-sm">
              <span className="text-white text-xs hidden peer-checked:block">✓</span>
            </div>
            <div className="flex-1">
              <span className={`block text-sm font-semibold ${errors[fieldId] ? 'text-red-600' : 'text-green-800'} group-hover:text-green-900 transition-colors`}>
                WhatsApp Communication Consent {field.required && <span className="text-orange-600 ml-1">*</span>}
              </span>
              <p className="text-green-700 text-sm mt-1">
                I opt-in to receive communication about the initiatives via WhatsApp group.
              </p>
            </div>
          </label>
          {errors[fieldId] && (
            <p className="mt-2 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
          )}
          {renderNestedFields(field.nestedFields)}
        </div>
      );
    }

    // Special handling for ArratAI Opt-in
    if (field.type === 'arratai_optin') {
      return (
        <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
          <label className="flex items-start space-x-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register(fieldId, {
                required: field.required && `${field.label} is required`
              })}
              className="peer hidden"
              onChange={(e) => {
                handleFieldChange(fieldId, e.target.checked.toString());
              }}
            />
            <div className="w-6 h-6 flex items-center justify-center border-2 border-orange-400 rounded-md transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500 mt-0.5 group-hover:border-orange-500 shadow-sm">
              <span className="text-white text-xs hidden peer-checked:block">✓</span>
            </div>
            <div className="flex-1">
              <span className={`block text-sm font-semibold ${errors[fieldId] ? 'text-red-600' : 'text-orange-800'} group-hover:text-orange-900 transition-colors`}>
                ArratAI Community Consent {field.required && <span className="text-orange-600 ml-1">*</span>}
              </span>
              <p className="text-orange-700 text-sm mt-1">
                I opt-in to receive communication about the initiatives via ArratAI community.
              </p>
            </div>
          </label>
          {errors[fieldId] && (
            <p className="mt-2 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
          )}
          {renderNestedFields(field.nestedFields)}
        </div>
      );
    }

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={fieldId} className={fieldWrapperClass}>
            <label htmlFor={fieldId} className={labelClass}>
              {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
            </label>
            <input
              type={field.type}
              id={fieldId}
              {...register(fieldId, { 
                required: field.required && `${field.label} is required`,
                ...(field.type === 'email' && {
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })
              })}
              className={inputBaseClass}
              placeholder={field.placeholder}
              onChange={(e) => {
                handleFieldChange(fieldId, e.target.value);
              }}
            />
            {errors[fieldId] && (
              <p className="mt-1 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
            )}
            {renderNestedFields(field.nestedFields)}
          </div>
        );

      case 'number':
        return (
          <div key={fieldId} className={fieldWrapperClass}>
            <label htmlFor={fieldId} className={labelClass}>
              {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              id={fieldId}
              {...register(fieldId, { 
                required: field.required && `${field.label} is required`,
                valueAsNumber: true,
                min: 0,
                validate: (value) => !isNaN(value) || 'Please enter a valid number'
              })}
              className={inputBaseClass}
              placeholder={field.placeholder}
              onChange={(e) => {
                // Only allow numbers
                const value = e.target.value.replace(/[^0-9]/g, '');
                handleFieldChange(fieldId, value);
              }}
              onKeyDown={(e) => {
                // Prevent arrow keys from changing the value
                if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                  e.preventDefault();
                }
              }}
            />
            {errors[fieldId] && (
              <p className="mt-1 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
            )}
            {renderNestedFields(field.nestedFields)}
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldId} className={fieldWrapperClass}>
            <label htmlFor={fieldId} className={labelClass}>
              {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
            </label>
            <textarea
              id={fieldId}
              {...register(fieldId, { 
                required: field.required && `${field.label} is required` 
              })}
              rows={4}
              className={inputBaseClass}
              placeholder={field.placeholder}
              onChange={(e) => {
                handleFieldChange(fieldId, e.target.value);
              }}
            />
            {errors[fieldId] && (
              <p className="mt-1 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
            )}
            {renderNestedFields(field.nestedFields)}
          </div>
        );

      case 'select':
        return (
          <div key={fieldId} className={fieldWrapperClass}>
            <label htmlFor={fieldId} className={labelClass}>
              {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
            </label>
            <div className="relative">
              <select
                id={fieldId}
                {...register(fieldId, { 
                  required: field.required && `${field.label} is required` 
                })}
                className={`${inputBaseClass} appearance-none bg-white pr-10 cursor-pointer hover:border-orange-400 transition-colors`}
                onChange={(e) => {
                  handleFieldChange(fieldId, e.target.value);
                }}
              >
                <option value="">Select an option</option>
                {field.options?.map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                </svg>
              </div>
            </div>
            {errors[fieldId] && (
              <p className="mt-1 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
            )}
            {renderNestedFields(field.nestedFields)}
          </div>
        );

      case 'radio':
        return (
          <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300 group`}>
            <label className={`block text-sm font-semibold mb-4 ${errors[fieldId] ? 'text-red-600' : 'text-gray-700'} group-hover:text-orange-600 transition-colors`}>
              {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
            </label>
            <div className="space-y-3">
              {field.options?.map((option, index) => (
                <label key={index} className="flex items-start cursor-pointer text-gray-700 hover:text-gray-900 group/option">
                  <input
                    type="radio"
                    value={option}
                    {...register(fieldId, { 
                      required: field.required && `${field.label} is required` 
                    })}
                    className="peer hidden"
                    onChange={(e) => {
                      handleFieldChange(fieldId, e.target.value);
                    }}
                  />
                  <div className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded-md transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500 mt-0.5 group-hover/option:border-orange-300">
                    <span className="text-white text-xs hidden peer-checked:block">✓</span>
                  </div>
                  <span className="ml-3 text-sm font-medium leading-relaxed">{option}</span>
                </label>
              ))}
            </div>
            {errors[fieldId] && (
              <p className="mt-2 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
            )}
            {renderNestedFields(field.nestedFields)}
          </div>
        );

      case 'checkbox':
        // For checkboxes with options (multiple selection)
        if (field.options && field.options.length > 0) {
          return (
            <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300 group`}>
              <label className={`block text-sm font-semibold mb-4 ${errors[fieldId] ? 'text-red-600' : 'text-gray-700'} group-hover:text-orange-600 transition-colors`}>
                {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
              </label>
              <div className="space-y-3">
                {field.options.map((option, index) => (
                  <label key={index} className="flex items-start cursor-pointer text-gray-700 hover:text-gray-900 group/option">
                    <input
                      type="checkbox"
                      value={option}
                      {...register(fieldId)}
                      className="peer hidden"
                      onChange={(e) => {
                        const currentValues = getValues(fieldId) || [];
                        let newValues;
                        
                        if (e.target.checked) {
                          newValues = [...currentValues, option];
                        } else {
                          newValues = currentValues.filter((val: string) => val !== option);
                        }
                        
                        console.log(`Checkbox changed: ${fieldId}`, newValues);
                        handleFieldChange(fieldId, newValues);
                      }}
                    />
                    <div className="w-5 h-5 flex items-center justify-center border-2 border-gray-300 rounded-md transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500 mt-0.5 group-hover/option:border-orange-300">
                      <span className="text-white text-xs hidden peer-checked:block">✓</span>
                    </div>
                    <span className="ml-3 text-sm font-medium leading-relaxed">{option}</span>
                  </label>
                ))}
              </div>
              {errors[fieldId] && (
                <p className="mt-2 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
              )}
              {renderNestedFields(field.nestedFields)}
            </div>
          );
        } else {
          // Single checkbox (boolean)
          return (
            <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-orange-300 transition-all duration-300 group`}>
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register(fieldId, {
                    required: field.required && `${field.label} is required`
                  })}
                  className="peer hidden"
                  onChange={(e) => {
                    handleFieldChange(fieldId, e.target.checked.toString());
                  }}
                />
                <div className="w-6 h-6 flex items-center justify-center border-2 border-gray-300 rounded-md transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500 mt-0.5 group-hover:border-orange-300 shadow-sm">
                  <span className="text-white text-xs hidden peer-checked:block">✓</span>
                </div>
                <div className="flex-1">
                  <span className={`block text-sm font-semibold ${errors[fieldId] ? 'text-red-600' : 'text-gray-700'} group-hover:text-gray-900 transition-colors`}>
                    {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
                  </span>
                  {field.placeholder && (
                    <p className="text-gray-500 text-sm mt-1">{field.placeholder}</p>
                  )}
                </div>
              </label>
              {errors[fieldId] && (
                <p className="mt-2 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
              )}
              {renderNestedFields(field.nestedFields)}
            </div>
          );
        }

      case 'date':
        return (
          <div key={fieldId} className={fieldWrapperClass}>
            <label htmlFor={fieldId} className={labelClass}>
              {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
            </label>
            <input
              type="date"
              id={fieldId}
              {...register(fieldId, { 
                required: field.required && `${field.label} is required` 
              })}
              className={inputBaseClass}
              onChange={(e) => {
                handleFieldChange(fieldId, e.target.value);
              }}
            />
            {errors[fieldId] && (
              <p className="mt-1 text-sm text-red-600">{errors[fieldId]?.message as string}</p>
            )}
            {renderNestedFields(field.nestedFields)}
          </div>
        );

      default:
        return (
          <div key={fieldId} className={fieldWrapperClass}>
            <label className={labelClass}>
              {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
            </label>
            <input
              type="text"
              {...register(fieldId)}
              className={inputBaseClass}
              placeholder={field.placeholder}
              onChange={(e) => {
                handleFieldChange(fieldId, e.target.value);
              }}
            />
            {renderNestedFields(field.nestedFields)}
          </div>
        );
    }
  };

  // Field Grouping with proper width handling
  const renderSectionFields = (fields: FormField[]) => {
    const sortedFields = [...fields].sort((a, b) => a.order - b.order);
    const visibleSortedFields = sortedFields.filter(field => visibleFields.has(field.id));
    
    const fieldGroups = [];
    let i = 0;
    
    while (i < visibleSortedFields.length) {
      const currentField = visibleSortedFields[i];
      
      // Special handling for different field types
      if (currentField.type === 'textarea' || 
          currentField.type === 'whatsapp_optin' || 
          currentField.type === 'arratai_optin' ||
          (currentField.type === 'checkbox' && currentField.options && currentField.options.length > 0) ||
          currentField.type === 'radio') {
        // These fields take full width
        fieldGroups.push(
          <div key={currentField.id} className="mb-6">
            {renderField(currentField, 'section', 0)}
          </div>
        );
        i++;
      } else {
        // Try to pair with next field if available and suitable
        const nextField = visibleSortedFields[i + 1];
        
        if (nextField && 
            nextField.type !== 'textarea' && 
            nextField.type !== 'whatsapp_optin' && 
            nextField.type !== 'arratai_optin' &&
            !(nextField.type === 'checkbox' && nextField.options && nextField.options.length > 0) &&
            nextField.type !== 'radio') {
          // Render two fields side by side
          fieldGroups.push(
            <div key={`group-${i}`} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="relative">
                {renderField(currentField, 'section', 0)}
              </div>
              <div className="relative">
                {renderField(nextField, 'section', 0)}
              </div>
            </div>
          );
          i += 2;
        } else {
          // Single field - but don't expand to full width, keep it natural
          fieldGroups.push(
            <div key={currentField.id} className="mb-6">
              {renderField(currentField, 'section', 0)}
            </div>
          );
          i++;
        }
      }
    }
    
    return fieldGroups;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading form...</p>
        </div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📝</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Form Not Found</h1>
          <p className="text-gray-600">The form you're looking for doesn't exist or is no longer available.</p>
        </div>
      </div>
    );
  }

  if (submitStatus === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up border border-emerald-200">
            <div className="bg-gradient-to-r from-emerald-500 to-green-600 py-16 px-6 text-center">
              <div className="flex justify-center mb-6">
                <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center animate-bounce-in">
                  <span className="text-4xl text-white">✓</span>
                </div>
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">Submission Successful!</h2>
              <p className="text-green-100 text-lg mb-6">Thank you for your submission. We'll be in touch soon!</p>
              <div className="flex items-center justify-center text-green-200">
                <span className="mr-2">★</span>
                <span>Your response has been recorded</span>
                <span className="ml-2">★</span>
              </div>
            </div>
            {formData.settings.showGroupLinks && (
              <div className="p-8 bg-white">
                <div className="space-y-4 max-w-md mx-auto">
                  {formData.settings.whatsappGroupLink && (
                    <a
                      href={formData.settings.whatsappGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 font-semibold text-lg"
                    >
                      Join WhatsApp Group
                    </a>
                  )}
                  {formData.settings.arrataiGroupLink && (
                    <a
                      href={formData.settings.arrataiGroupLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/30 font-semibold text-lg"
                    >
                      Join ArratAI Community
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-6 space-y-4 sm:space-y-0 sm:space-x-6">
            {formData.images?.logo && (
              <div className="relative w-32 h-32 flex items-center justify-center rounded-full shadow-2xl bg-white border-4 border-orange-100">
                <Image
                  src={formData.images.logo}
                  width={120}
                  height={120}
                  alt="Form logo"
                  className="rounded-full object-cover p-2"
                />
              </div>
            )}
            <div className="text-center sm:text-left">
              <h1 className="text-5xl sm:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-600">
                {formData.title}
              </h1>
              {formData.description && (
                <p className="text-lg text-gray-600 mt-3 max-w-2xl mx-auto sm:mx-0">
                  {formData.description}
                </p>
              )}
            </div>
          </div>
          {formData.images?.banner && (
            <div className="mt-6 rounded-2xl overflow-hidden shadow-2xl max-w-6xl mx-auto">
              <Image
                src={formData.images.banner}
                width={1000}
                height={400}
                alt="Form banner"
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 sm:p-10 shadow-2xl rounded-2xl border border-gray-100">
          {/* Form Sections */}
          {formData.sections
            ?.filter((section: FormSection) => visibleSections.has(section.id))
            .sort((a: FormSection, b: FormSection) => a.order - b.order)
            .map((section: FormSection) => (
              <div 
                key={section.id} 
                className="mb-10 last:mb-0 border-b border-gray-100 last:border-b-0 pb-8 last:pb-0"
              >
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {section.title}
                  </h2>
                  {section.description && (
                    <p className="text-gray-600">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="space-y-6">
                  {renderSectionFields(section.fields || [])}
                </div>
              </div>
            ))}

          {submitStatus === 'error' && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start animate-shake">
              <span className="mr-3 flex-shrink-0 mt-0.5">⚠</span>
              <div>
                <p className="font-medium">There was an error submitting the form.</p>
                <p className="text-sm mt-1">Please try again or contact support if the problem persists.</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={submitting}
              className="w-full text-lg py-4 px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all duration-300 hover:from-orange-600 hover:to-amber-600 focus:outline-none focus:ring-4 focus:ring-orange-500/50 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] group"
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin mr-3">⟳</span>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center group-hover:scale-105 transition-transform">
                  <span className="mr-3">✓</span>
                  Submit Form
                </span>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            ★ Powered by ArratAI Forms ★
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
        @keyframes bounce-in { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); } }
        .animate-fade-in-up { animation: fade-in-up 0.7s ease-out forwards; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
        
        /* Hide number input arrows */
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}