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
  // Filter out hidden fields first
  const visibleFieldsList = fields.filter(field => {
    const isHidden = field.customData?.hidden || false;
    const isConditionallyVisible = visibleFields.has(field.id);
    
    console.log(`FieldGrouping - Field "${field.label}": hidden=${isHidden}, conditional=${isConditionallyVisible}`);
    
    return !isHidden && isConditionallyVisible;
  });

  // Sort fields by order first
  const sortedFields = [...visibleFieldsList].sort((a, b) => a.order - b.order);
  
  console.log(`FieldGrouping - Total fields: ${fields.length}, Visible: ${sortedFields.length}`);

  // If no visible fields, don't render anything
  if (sortedFields.length === 0) {
    return null;
  }

  // If only one field, make it full width
  if (sortedFields.length === 1) {
    return (
      <div className="space-y-6">
        <div className="w-full">
          <FieldRenderer
            field={sortedFields[0]}
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
      {sortedFields.map((field) => (
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