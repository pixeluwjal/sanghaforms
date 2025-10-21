import { SanghaHierarchyField } from '@/components/SanghaHierarchyField';
import { FieldRendererProps } from './types';
import { useEffect } from 'react';

export default function FieldRenderer({
  field,
  register,
  errors,
  getValues,
  setValue,
  handleFieldChange,
  visibleFields,
  formData,
  level = 0
}: FieldRendererProps) {
  const fieldId = field.id;
  const isVisible = visibleFields.has(fieldId);
  
  if (!isVisible) {
    console.log(`Field ${fieldId} is hidden - not rendering`);
    return null;
  }

  console.log(`Rendering field: ${fieldId}`, { 
    type: field.type, 
    label: field.label, 
    defaultValue: field.defaultValue,
    hasNestedFields: field.nestedFields?.length,
    nestedFields: field.nestedFields?.map(f => ({ id: f.id, label: f.label, visible: visibleFields.has(f.id) }))
  });

  const isNested = level > 0;
  const fieldWrapperClass = `mb-6 ${isNested ? 'ml-4 md:ml-6' : ''}`;
  const labelClass = `block text-sm font-semibold text-gray-800 mb-3 ${
    errors[fieldId] ? 'text-red-600' : 'text-gray-800'
  }`;
  const inputBaseClass = `w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all duration-200 bg-white text-gray-900 shadow-sm placeholder-gray-400 hover:border-orange-300 ${
    errors[fieldId] ? 'border-red-500 focus:border-red-500' : ''
  }`;

  // Set default value for readonly_text fields when component mounts
  useEffect(() => {
    if (field.type === 'readonly_text' && field.defaultValue) {
      console.log(`Setting default value for ${fieldId}: ${field.defaultValue}`);
      setValue(fieldId, field.defaultValue);
      // Also call handleFieldChange to ensure it's in the form state
      handleFieldChange(fieldId, field.defaultValue);
    }
  }, [fieldId, field.type, field.defaultValue, setValue, handleFieldChange]);

  const renderNestedFields = (nestedFields?: any[]) => {
    if (!nestedFields || nestedFields.length === 0) {
      console.log(`No nested fields for ${fieldId}`);
      return null;
    }
    
    // Filter nested fields by visibility
    const visibleNestedFields = nestedFields.filter(nestedField => {
      const isNestedVisible = visibleFields.has(nestedField.id);
      console.log(`Nested field ${nestedField.id} visibility: ${isNestedVisible}`);
      return isNestedVisible;
    });

    console.log(`Visible nested fields for ${fieldId}:`, visibleNestedFields.map(f => f.id));

    if (visibleNestedFields.length === 0) {
      console.log(`No visible nested fields for ${fieldId}`);
      return null;
    }
    
    return (
      <div className={`mt-6 space-y-6 ${level > 0 ? 'ml-4 md:ml-6' : ''}`}>
        {visibleNestedFields.map((nestedField: any) => (
          <div key={nestedField.id}>
            <FieldRenderer
              field={nestedField}
              register={register}
              errors={errors}
              getValues={getValues}
              setValue={setValue}
              handleFieldChange={handleFieldChange}
              visibleFields={visibleFields}
              formData={formData}
              level={level + 1}
            />
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
      <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-green-400 transition-all duration-300`}>
        <label className="flex items-start space-x-4 cursor-pointer group">
          <div className="flex-shrink-0 mt-1">
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
            <div className="w-6 h-6 flex items-center justify-center border-2 border-green-500 rounded-lg transition-all duration-200 peer-checked:bg-green-500 peer-checked:border-green-500 group-hover:border-green-600 shadow-sm">
              <span className="text-white text-sm font-bold hidden peer-checked:block">✓</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className={`block text-lg font-bold ${errors[fieldId] ? 'text-red-600' : 'text-green-800'} group-hover:text-green-900 transition-colors`}>
              WhatsApp Communication Consent {field.required && <span className="text-orange-600 ml-1">*</span>}
            </span>
            <p className="text-green-700 text-base mt-2 leading-relaxed">
              I opt-in to receive communication about the initiatives via WhatsApp group.
            </p>
          </div>
        </label>
        {errors[fieldId] && (
          <p className="mt-3 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
        )}
        {renderNestedFields(field.nestedFields)}
      </div>
    );
  }

  // Special handling for ArratAI Opt-in
  if (field.type === 'arratai_optin') {
    return (
      <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-400 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-orange-500 transition-all duration-300`}>
        <label className="flex items-start space-x-4 cursor-pointer group">
          <div className="flex-shrink-0 mt-1">
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
            <div className="w-6 h-6 flex items-center justify-center border-2 border-orange-500 rounded-lg transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500 group-hover:border-orange-600 shadow-sm">
              <span className="text-white text-sm font-bold hidden peer-checked:block">✓</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <span className={`block text-lg font-bold ${errors[fieldId] ? 'text-red-600' : 'text-orange-800'} group-hover:text-orange-900 transition-colors`}>
              ArratAI Community Consent {field.required && <span className="text-orange-600 ml-1">*</span>}
            </span>
            <p className="text-orange-700 text-base mt-2 leading-relaxed">
              I opt-in to receive communication about the initiatives via ArratAI community.
            </p>
          </div>
        </label>
        {errors[fieldId] && (
          <p className="mt-3 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
        )}
        {renderNestedFields(field.nestedFields)}
      </div>
    );
  }

  // Handle readonly_text field type
  if (field.type === 'readonly_text') {
    return (
      <div key={fieldId} className={fieldWrapperClass}>
        <label htmlFor={fieldId} className={labelClass}>
          {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
        </label>
        <input
          type="text"
          id={fieldId}
          {...register(fieldId, { 
            required: field.required && `${field.label} is required`
          })}
          defaultValue={field.defaultValue || ''}
          className={`${inputBaseClass} bg-gray-100 cursor-not-allowed opacity-80`}
          readOnly
          disabled
        />
        {errors[fieldId] && (
          <p className="mt-2 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
        )}
        {renderNestedFields(field.nestedFields)}
      </div>
    );
  }

  // Handle source field type
  if (field.type === 'source') {
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
            className={`${inputBaseClass} appearance-none bg-white pr-12 cursor-pointer hover:border-orange-400 transition-colors`}
            onChange={(e) => {
              handleFieldChange(fieldId, e.target.value);
            }}
          >
            <option value="">Select source</option>
            {field.options?.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
              <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </div>
        </div>
        {errors[fieldId] && (
          <p className="mt-2 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
        )}
        {renderNestedFields(field.nestedFields)}
      </div>
    );
  }

  // Render checkbox groups with nested fields
  if (field.type === 'checkbox' && field.options && field.options.length > 0) {
    return (
      <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-white to-gray-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-orange-400 transition-all duration-300 group`}>
        <label className={`block text-lg font-bold mb-6 ${errors[fieldId] ? 'text-red-600' : 'text-gray-800'} group-hover:text-orange-700 transition-colors`}>
          {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
        </label>
        <div className="space-y-4">
          {field.options.map((option, index) => (
            <div key={index}>
              <label className="flex items-start space-x-4 cursor-pointer text-gray-700 hover:text-gray-900 group/option p-3 rounded-lg hover:bg-orange-50 transition-all duration-200">
                <div className="flex-shrink-0 mt-1">
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
                  <div className="w-6 h-6 flex items-center justify-center border-2 border-orange-400 rounded-lg transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500 group-hover/option:border-orange-500 shadow-sm">
                    <span className="text-white text-sm font-bold hidden peer-checked:block">✓</span>
                  </div>
                </div>
                <span className="text-base font-medium leading-relaxed flex-1 min-w-0">{option}</span>
              </label>
              
              {/* Render nested fields for this specific option if it's "Others" */}
              {option === 'Others' && renderNestedFields(field.nestedFields)}
            </div>
          ))}
        </div>
        {errors[fieldId] && (
          <p className="mt-3 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
        )}
      </div>
    );
  }

  // For other field types, use the regular switch case
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
            <p className="mt-2 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
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
              validate: (value: any) => !isNaN(value) || 'Please enter a valid number'
            })}
            className={inputBaseClass}
            placeholder={field.placeholder}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              handleFieldChange(fieldId, value);
            }}
            onKeyDown={(e) => {
              if (['ArrowUp', 'ArrowDown'].includes(e.key)) {
                e.preventDefault();
              }
            }}
          />
          {errors[fieldId] && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
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
            className={`${inputBaseClass} resize-vertical min-h-[120px]`}
            placeholder={field.placeholder}
            onChange={(e) => {
              handleFieldChange(fieldId, e.target.value);
            }}
          />
          {errors[fieldId] && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
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
              className={`${inputBaseClass} appearance-none bg-white pr-12 cursor-pointer hover:border-orange-400 transition-colors`}
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
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-700">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {errors[fieldId] && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
          )}
          {renderNestedFields(field.nestedFields)}
        </div>
      );

    case 'radio':
      return (
        <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-white to-gray-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-orange-400 transition-all duration-300 group`}>
          <label className={`block text-lg font-bold mb-6 ${errors[fieldId] ? 'text-red-600' : 'text-gray-800'} group-hover:text-orange-700 transition-colors`}>
            {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
          </label>
          <div className="space-y-4">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-start space-x-4 cursor-pointer text-gray-700 hover:text-gray-900 group/option p-3 rounded-lg hover:bg-orange-50 transition-all duration-200">
                <div className="flex-shrink-0 mt-1">
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
                  <div className="w-6 h-6 flex items-center justify-center border-2 border-orange-400 rounded-full transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500 group-hover/option:border-orange-500 shadow-sm">
                    <span className="w-2 h-2 bg-white rounded-full hidden peer-checked:block"></span>
                  </div>
                </div>
                <span className="text-base font-medium leading-relaxed flex-1 min-w-0">{option}</span>
              </label>
            ))}
          </div>
          {errors[fieldId] && (
            <p className="mt-3 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
          )}
          {renderNestedFields(field.nestedFields)}
        </div>
      );

    case 'checkbox':
      // Single checkbox (without options array)
      return (
        <div key={fieldId} className={`${fieldWrapperClass} bg-gradient-to-br from-white to-gray-50 border-2 border-orange-300 rounded-xl p-6 shadow-lg hover:shadow-xl hover:border-orange-400 transition-all duration-300 group`}>
          <label className="flex items-start space-x-4 cursor-pointer group">
            <div className="flex-shrink-0 mt-1">
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
              <div className="w-6 h-6 flex items-center justify-center border-2 border-orange-400 rounded-lg transition-all duration-200 peer-checked:bg-orange-500 peer-checked:border-orange-500 group-hover:border-orange-500 shadow-sm">
                <span className="text-white text-sm font-bold hidden peer-checked:block">✓</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <span className={`block text-lg font-bold ${errors[fieldId] ? 'text-red-600' : 'text-gray-800'} group-hover:text-gray-900 transition-colors`}>
                {field.label} {field.required && <span className="text-orange-600 ml-1">*</span>}
              </span>
              {field.placeholder && (
                <p className="text-gray-600 text-base mt-2 leading-relaxed">{field.placeholder}</p>
              )}
            </div>
          </label>
          {errors[fieldId] && (
            <p className="mt-3 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
          )}
          {renderNestedFields(field.nestedFields)}
        </div>
      );

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
            <p className="mt-2 text-sm text-red-600 font-medium">{errors[fieldId]?.message as string}</p>
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
}