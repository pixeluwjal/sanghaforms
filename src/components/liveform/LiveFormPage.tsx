'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import LoadingState from './LoadingState';
import FormHeader from './FormHeader';
import FormSection from './FormSection';
import SuccessScreen from './SuccessScreen';
import { LiveFormPageProps, FormData, FormSection as FormSectionType } from './types';

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

  // Function to set default values for all fields
  const setDefaultValues = useCallback((data: FormData) => {
    if (!data.sections) return;
    
    // Recursive function to set default values for fields and nested fields
    const setFieldDefaults = (fields: any[]) => {
      fields.forEach((field: any) => {
        // Set default value if it exists
        if (field.defaultValue) {
          console.log(`Setting default value for ${field.id}: ${field.defaultValue}`);
          setValue(field.id, field.defaultValue);
        }
        
        // Process nested fields recursively
        if (field.nestedFields && field.nestedFields.length > 0) {
          setFieldDefaults(field.nestedFields);
        }
      });
    };

    // Set defaults for all sections and fields
    data.sections.forEach((section: FormSectionType) => {
      if (section.fields && section.fields.length > 0) {
        setFieldDefaults(section.fields);
      }
    });
  }, [setValue]);

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
        
        // Set default values after form data is loaded
        setDefaultValues(data);
        
        const initialSections = new Set(data.sections?.map((section: FormSectionType) => section.id) || []);
        const initialFields = new Set();
        data.sections?.forEach((section: FormSectionType) => {
          section.fields?.forEach((field: any) => {
            initialFields.add(field.id);
            if (field.nestedFields) {
              field.nestedFields.forEach((nestedField: any) => {
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
  }, [slug, setDefaultValues]);

  const evaluateConditionalLogic = useCallback(() => {
  if (!formData || !formData.sections) return;

  const evaluateCondition = (rule: any, currentValues: any) => {
    console.log('Evaluating rule:', rule);
    
    // DYNAMIC FIX: Find the target field from the form structure
    let targetFieldId = rule.targetField;
    
    // If targetField is missing, try to infer it from the form structure
    if (!targetFieldId) {
      // Look for radio/select fields that have the value we're checking for
      formData.sections?.forEach((section: FormSectionType) => {
        section.fields?.forEach((field: any) => {
          if (field.options && field.options.includes(rule.value)) {
            targetFieldId = field.id;
            console.log(`Inferred target field: ${targetFieldId} for value: ${rule.value}`);
          }
        });
      });
    }
    
    if (!targetFieldId) {
      console.log('Could not determine target field for rule:', rule);
      return false;
    }
    
    const targetValue = currentValues[targetFieldId];
    
    console.log(`Evaluating condition: ${targetFieldId} = ${targetValue}, operator: ${rule.operator}, value: ${rule.value}`);
    
    if (targetValue === undefined || targetValue === null) {
      console.log(`Target value is undefined/null for field ${targetFieldId}`);
      return false;
    }

    // Handle array values (for checkboxes)
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

    // Handle string/number values
    switch (rule.operator) {
      case 'equals':
        const equalsResult = String(targetValue) === String(rule.value);
        console.log(`Equals check: ${targetValue} === ${rule.value} = ${equalsResult}`);
        return equalsResult;
      case 'not_equals':
        return String(targetValue) !== String(rule.value);
      case 'contains':
        return String(targetValue).includes(String(rule.value));
      case 'greater_than':
        return Number(targetValue) > Number(rule.value);
      case 'less_than':
        return Number(targetValue) < Number(rule.value);
      default:
        console.log(`Unknown operator: ${rule.operator}`);
        return false;
    }
  };

  const currentValues = getValues();
  console.log('=== CURRENT FORM VALUES ===', currentValues);
  
  const newVisibleSections = new Set();
  const newVisibleFields = new Set();

  // Recursive function to evaluate field visibility
  const evaluateFieldVisibility = (field: any, currentValues: any) => {
    let shouldShowField = true;
    
    // Check field-level conditional rules
    if (field.conditionalRules && field.conditionalRules.length > 0) {
      shouldShowField = field.conditionalRules.every(rule => 
        evaluateCondition(rule, currentValues)
      );
      console.log(`Field ${field.id} should show:`, shouldShowField, 'rules:', field.conditionalRules);
    }

    return shouldShowField;
  };

  // Recursive function to process all fields (including nested)
  const processFieldsRecursively = (fields: any[], currentValues: any) => {
    fields.forEach((field: any) => {
      // Check if this field should be visible
      if (evaluateFieldVisibility(field, currentValues)) {
        newVisibleFields.add(field.id);
        console.log(`✅ Adding field to visible: ${field.id}`);
        
        // Process nested fields recursively
        if (field.nestedFields && field.nestedFields.length > 0) {
          processFieldsRecursively(field.nestedFields, currentValues);
        }
      } else {
        console.log(`❌ Hiding field: ${field.id}`);
      }
    });
  };

  // Create sections with their original indices for proper sorting
  const sectionsWithIndices = formData.sections.map((section, index) => ({
    ...section,
    originalIndex: index
  }));

  // Sort sections by order first, then by original index
  const sortedSections = [...sectionsWithIndices].sort((a, b) => {
    // Primary sort by order
    if (a.order !== b.order) {
      return a.order - b.order;
    }
    // Secondary sort by original array position for same order values
    return a.originalIndex - b.originalIndex;
  });

  console.log('Sorted sections:', sortedSections.map(s => ({ 
    title: s.title, 
    order: s.order, 
    originalIndex: s.originalIndex 
  })));

  sortedSections.forEach((section: FormSectionType & { originalIndex: number }) => {
    let shouldShowSection = true;
    
    // Evaluate section-level conditional rules
    if (section.conditionalRules && section.conditionalRules.length > 0) {
      console.log(`=== EVALUATING SECTION: ${section.title} ===`);
      console.log('Section conditional rules:', section.conditionalRules);
      
      shouldShowSection = section.conditionalRules.every(rule => {
        const conditionMet = evaluateCondition(rule, currentValues);
        console.log(`Section ${section.title} condition result: ${conditionMet}`);
        return conditionMet;
      });
      
      console.log(`Section ${section.title} final visibility: ${shouldShowSection}`);
    }

    if (shouldShowSection) {
      newVisibleSections.add(section.id);
      console.log(`✅ Showing section: ${section.title}`);
      
      // Process ALL fields in this section (including nested ones)
      if (section.fields && section.fields.length > 0) {
        processFieldsRecursively(section.fields, currentValues);
      }
    } else {
      console.log(`❌ Hiding section: ${section.title}`);
    }
  });

  console.log('=== FINAL VISIBLE SECTIONS ===', Array.from(newVisibleSections));
  console.log('=== FINAL VISIBLE FIELDS ===', Array.from(newVisibleFields));

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
      
      // Check if form has WhatsApp or Arratai links and redirect instead of showing success screen
      const whatsappLink = formData?.settings?.whatsappGroupLink;
      const arrataiLink = formData?.settings?.arrataiGroupLink;
      
      // Check if user opted in to WhatsApp
      const whatsappOptin = responses.find(r => {
        const field = formData?.sections?.flatMap(s => s.fields || [])
          .find(f => f.id === r.fieldId && f.type === 'whatsapp_optin');
        return field && r.value === 'true';
      });
      
      // Check if user opted in to Arratai
      const arrataiOptin = responses.find(r => {
        const field = formData?.sections?.flatMap(s => s.fields || [])
          .find(f => f.id === r.fieldId && f.type === 'arratai_optin');
        return field && r.value === 'true';
      });
      
      // Redirect to WhatsApp if opted in and link exists
      if (whatsappOptin && whatsappLink) {
        window.location.href = whatsappLink;
        return;
      }
      
      // Redirect to Arratai if opted in and link exists (and no WhatsApp redirect)
      if (arrataiOptin && arrataiLink && !whatsappLink) {
        window.location.href = arrataiLink;
        return;
      }
      
      // If no redirects, show success screen
      setSubmitStatus('success');
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState />;
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
    return <SuccessScreen formData={formData} />;
  }

  // Create properly sorted sections for rendering
  const getSortedVisibleSections = () => {
    if (!formData?.sections) return [];
    
    // Add original indices to sections
    const sectionsWithIndices = formData.sections.map((section, index) => ({
      ...section,
      originalIndex: index
    }));
    
    // Filter visible sections
    const visibleSectionsWithIndices = sectionsWithIndices.filter(section => 
      visibleSections.has(section.id)
    );
    
    // Sort by order first, then by original index
    return visibleSectionsWithIndices.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.originalIndex - b.originalIndex;
    });
  };

  const sortedVisibleSections = getSortedVisibleSections();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <FormHeader formData={formData} />

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 sm:p-10 shadow-2xl rounded-2xl border border-gray-100">
          {sortedVisibleSections.map((section: FormSectionType) => (
            <FormSection
              key={section.id}
              section={section}
              register={register}
              errors={errors}
              getValues={getValues}
              setValue={setValue}
              handleFieldChange={handleFieldChange}
              visibleFields={visibleFields}
              formData={formData}
            />
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
      </div>

      <GlobalStyles />
    </div>
  );
}

function GlobalStyles() {
  return (
    <style jsx global>{`
      @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes fade-in-up { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); } 20%, 40%, 60%, 80% { transform: translateX(5px); } }
      @keyframes bounce-in { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); } }
      .animate-fade-in-up { animation: fade-in-up 0.7s ease-out forwards; }
      .animate-shake { animation: shake 0.5s ease-in-out; }
      .animate-bounce-in { animation: bounce-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) both; }
      
      input[type="number"]::-webkit-outer-spin-button,
      input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      input[type="number"] {
        -moz-appearance: textfield;
      }
    `}</style>
  );
}