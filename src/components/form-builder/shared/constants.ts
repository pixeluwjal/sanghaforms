import { 
  Type, Mail, Hash, FileText, Calendar, List, Radio, CheckSquare,
  Building2, File, Users 
} from 'lucide-react';

export const FIELD_TYPES = [
  { type: 'text', label: 'Text', icon: Type, description: 'Single line text' },
  { type: 'email', label: 'Email', icon: Mail, description: 'Email address' },
  { type: 'number', label: 'Number', icon: Hash, description: 'Numbers only' },
  { type: 'textarea', label: 'Paragraph', icon: FileText, description: 'Long text' },
  { type: 'select', label: 'Dropdown', icon: List, description: 'Select from list' },
  { type: 'radio', label: 'Multiple Choice', icon: Radio, description: 'Choose one option' },
  { type: 'checkbox', label: 'Checkboxes', icon: CheckSquare, description: 'Choose multiple' },
  { type: 'date', label: 'Date', icon: Calendar, description: 'Date picker' },
  { type: 'sangha', label: 'Sangha Hierarchy', icon: Users, description: 'Sangha organizational structure' },
  { type: 'file', label: 'File Upload', icon: File, description: 'Upload files' },
];

export const QUICK_SECTIONS = [
  {
    title: 'Personal Information',
    description: 'Collect basic personal details',
    fields: [
      { type: 'text', label: 'Full Name', placeholder: 'Enter your full name', required: true },
      { type: 'email', label: 'Email Address', placeholder: 'Enter your email', required: true },
      { type: 'text', label: 'Phone Number', placeholder: 'Enter your phone number', required: false },
    ]
  },
  {
    title: 'Sangha Details', 
    description: 'Select your sangha hierarchy',
    fields: [
      { type: 'sangha', label: 'Sangha Hierarchy', placeholder: 'Select your sangha', required: true },
    ]
  },
  {
    title: 'Additional Information',
    description: 'Any other relevant details',
    fields: [
      { type: 'textarea', label: 'Comments', placeholder: 'Enter any additional comments', required: false },
    ]
  }
];

export const CONDITIONAL_OPERATORS = [
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'greater_than', label: 'Greater Than' },
  { value: 'less_than', label: 'Less Than' },
];