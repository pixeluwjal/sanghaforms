import { FormBuilder } from '@/components/builder/FormBuilder';

interface BuildTabProps {
  form: any;
  updateForm: (updates: any) => void;
  showToolbox: boolean;
  sensors: any;
  onMobileToolboxOpen: () => void;
}

export default function BuildTab({ form, updateForm, showToolbox, sensors, onMobileToolboxOpen }: BuildTabProps) {
  return (
    <div className="min-h-[70vh]">
      <FormBuilder form={form} updateForm={updateForm} />
    </div>
  );
}