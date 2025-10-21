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
        fields={section.fields || []}
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