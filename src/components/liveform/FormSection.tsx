import FieldGrouping from './FieldGrouping';
import { FormSectionProps } from './types';

export default function FormSection({
  section,
  register,
  errors,
  getValues,
  setValue,
  handleFieldChange,
  visibleFields,
  formData
}: FormSectionProps) {
  // Filter out hidden fields
  const visibleSectionFields = section.fields?.filter(field => {
    const isHidden = field.customData?.hidden || false;
    const isConditionallyVisible = visibleFields.has(field.id);
    
    console.log(`Field ${field.label}: hidden=${isHidden}, conditional=${isConditionallyVisible}`);
    
    return !isHidden && isConditionallyVisible;
  }) || [];

  console.log(`Section "${section.title}" - Total fields: ${section.fields?.length || 0}, Visible: ${visibleSectionFields.length}`);

  // Don't render section if no visible fields
  if (visibleSectionFields.length === 0) {
    console.log(`Skipping section "${section.title}" - no visible fields`);
    return null;
  }

  return (
    <div className="mb-10 last:mb-0 border-b border-gray-100 last:border-b-0 pb-8 last:pb-0">
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

      <FieldGrouping
        fields={visibleSectionFields} // Pass only visible fields
        register={register}
        errors={errors}
        getValues={getValues}
        setValue={setValue}
        handleFieldChange={handleFieldChange}
        visibleFields={visibleFields}
        formData={formData}
      />
    </div>
  );
}