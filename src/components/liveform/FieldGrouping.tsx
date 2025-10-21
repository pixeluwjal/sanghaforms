import FieldRenderer from './FieldRenderer';
import { FormField, FieldRendererProps } from './types';

interface FieldGroupingProps extends Omit<FieldRendererProps, 'field' | 'level'> {
  fields: FormField[];
}

export default function FieldGrouping({ 
  fields, 
  register, 
  errors, 
  getValues, 
  setValue, 
  handleFieldChange, 
  visibleFields, 
  formData 
}: FieldGroupingProps) {
  // Sort fields by order first
  const sortedFields = [...fields].sort((a, b) => a.order - b.order);
  const visibleSortedFields = sortedFields.filter(field => visibleFields.has(field.id));
  
  // If only one field, make it full width
  if (visibleSortedFields.length === 1) {
    return (
      <div className="space-y-6">
        <div className="w-full">
          <FieldRenderer
            field={visibleSortedFields[0]}
            register={register}
            errors={errors}
            getValues={getValues}
            setValue={setValue}
            handleFieldChange={handleFieldChange}
            visibleFields={visibleFields}
            formData={formData}
          />
        </div>
      </div>
    );
  }
  
  // For multiple fields, use 2-column grid
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {visibleSortedFields.map((field) => (
        <div key={field.id} className="relative">
          <FieldRenderer
            field={field}
            register={register}
            errors={errors}
            getValues={getValues}
            setValue={setValue}
            handleFieldChange={handleFieldChange}
            visibleFields={visibleFields}
            formData={formData}
          />
        </div>
      ))}
    </div>
  );
}