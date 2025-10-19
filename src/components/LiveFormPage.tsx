'use client';

import { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, UploadCloud, Send, XCircle, ChevronDown, Users, MessageSquare, Link, Smartphone, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';

// --- TYPE DEFINITIONS ---
interface Field {
  id: string; type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'sangha' | 'file' | 'whatsapp_optin' | 'arratai_optin' | string;
  label: string; required: boolean; placeholder?: string; options?: string[];
}

interface ConditionalRule {
  id: string;
  targetSection: string;
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
  action: 'show' | 'hide';
}

interface Section { 
  id: string; 
  title: string; 
  description: string; 
  fields: Field[]; 
  conditionalRules: ConditionalRule[];
}

interface Form { 
    _id: string; 
    title: string; 
    description: string; 
    sections: Section[]; 
    images?: { banner?: string; logo?: string; }; 
    settings?: { 
        customSlug?: string, 
        allowMultipleResponses: boolean, 
        enableProgressSave: boolean,
        showGroupLinks?: boolean,
        whatsappGroupLink?: string,
        arrataiGroupLink?: string
    }; 
}

// --- API DATA STRUCTURES for Sangha ---
interface Valaya { _id: string; name: string; milans: string[]; }
interface Khanda { _id: string; name: string; code: string; valays: Valaya[]; milans: string[]; }
interface Vibhaaga { _id: string; name: string; khandas: Khanda[]; }

// --- API Fetchers ---
const fetchFormBySlug = async (slug: string): Promise<Form> => {
    const response = await fetch(`/api/forms/${slug}`);
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to load form (Status: ${response.status})`);
    }
    const data = await response.json();
    
    return data;
};

// FIXED: Proper organization data fetching
const fetchOrganizationData = async (): Promise<Vibhaaga[]> => {
    try {
        console.log('Fetching organization data from /api/organization...');
        const response = await fetch('/api/organization');
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Organization API error:', response.status, errorText);
            throw new Error(`Failed to fetch organization data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Organization API response:', data);
        
        // Handle different response structures
        if (data.organizations && Array.isArray(data.organizations)) {
            console.log('Found organizations array with', data.organizations.length, 'items');
            return data.organizations;
        } else if (data.success && data.organizations) {
            console.log('Found success response with organizations:', data.organizations.length);
            return data.organizations;
        } else if (Array.isArray(data)) {
            console.log('Direct array response with', data.length, 'items');
            return data;
        } else {
            console.warn('Unexpected organization data structure:', data);
            toast.error('Unexpected data format from organization API');
            return [];
        }
    } catch (error) {
        console.error('Organization fetch error:', error);
        toast.error('Failed to load Sangha hierarchy data');
        return [];
    }
};

// ----------------------------------------------------

// Component for Sangha Hierarchy (Interactive Dropdowns)
// Component for Sangha Hierarchy (Interactive Dropdowns)
const SanghaHierarchyField = ({ field, onFieldChange }: { field: Field, onFieldChange: (fieldId: string, value: string) => void }) => {
    const commonInputClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200";

    const [hierarchyData, setHierarchyData] = useState<Vibhaaga[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // State for user selections
    const [vibhaagId, setVibhaagId] = useState('');
    const [khandaId, setKhandaId] = useState('');
    const [valayaId, setValayaId] = useState('');
    const [milanName, setMilanName] = useState('');

    useEffect(() => {
        const loadOrganizationData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await fetchOrganizationData();
                setHierarchyData(data);
                
                if (data.length === 0) {
                    setError('No organization data found');
                }
            } catch (err) {
                setError('Failed to load organization data');
                console.error('Error loading organization data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadOrganizationData();
    }, []);

    // Derived states
    const selectedVibhaag = hierarchyData.find(v => v._id === vibhaagId);
    const availableKhandas = selectedVibhaag?.khandas || [];
    const selectedKhanda = availableKhandas.find(k => k._id === khandaId);
    const availableValayas = selectedKhanda?.valays || [];
    const selectedValaya = availableValayas.find(v => v._id === valayaId);
    
    // Get milans - either from valaya or directly from khanda
    const availableMilans = selectedValaya?.milans || 
                           (selectedKhanda?.milans && availableValayas.length === 0 ? selectedKhanda.milans : []);
    
    // Handlers (Updating state)
    const handleVibhaagChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
        const value = e.target.value;
        setVibhaagId(value); 
        setKhandaId(''); 
        setValayaId(''); 
        setMilanName(''); 
        onFieldChange(`${field.id}-vibhaag`, value);
    };

    const handleKhandaChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
        const value = e.target.value;
        setKhandaId(value); 
        setValayaId(''); 
        setMilanName(''); 
        onFieldChange(`${field.id}-khanda`, value);
    };

    const handleValayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
        const value = e.target.value;
        setValayaId(value); 
        setMilanName(''); 
        onFieldChange(`${field.id}-valaya`, value);
    };

    const handleMilanChange = (e: React.ChangeEvent<HTMLSelectElement>) => { 
        const value = e.target.value;
        setMilanName(value); 
        onFieldChange(`${field.id}-milan`, value);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-6 bg-purple-50 rounded-xl border border-purple-200">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-600"/>
                <p className="text-sm text-purple-700">Loading Sangha hierarchy...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm font-medium">{error}</p>
                <p className="text-red-600 text-xs mt-1">
                    Please refresh the page or contact support if the issue persists.
                </p>
            </div>
        );
    }

    if (hierarchyData.length === 0) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <p className="text-yellow-700 text-sm">No Sangha data available</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-4 p-5 bg-purple-50/50 rounded-xl border-2 border-purple-200 shadow-inner">
            <p className="flex items-center gap-2 text-base font-bold text-purple-800">
                <Users className="w-5 h-5"/> Sangha Hierarchy: {field.label}
            </p>

            {/* Vibhaag Selector */}
            <div className="relative">
                <label htmlFor={`${field.id}-vibhaag`} className="block text-sm font-medium text-purple-700 mb-2">
                    Vibhaag *
                </label>
                <select 
                    id={`${field.id}-vibhaag`} 
                    name={`${field.id}-vibhaag`} 
                    required={field.required} 
                    value={vibhaagId} 
                    onChange={handleVibhaagChange} 
                    className={commonInputClasses}
                >
                    <option value="">Select Vibhaag</option>
                    {hierarchyData.map(v => (
                        <option key={v._id} value={v._id}>{v.name}</option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3/4 transform -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>

            {/* Khanda Selector */}
            <div className="relative">
                <label htmlFor={`${field.id}-khanda`} className="block text-sm font-medium text-purple-700 mb-2">
                    Khanda *
                </label>
                <select 
                    id={`${field.id}-khanda`} 
                    name={`${field.id}-khanda`} 
                    required={field.required} 
                    value={khandaId} 
                    onChange={handleKhandaChange} 
                    disabled={!vibhaagId} 
                    className={commonInputClasses}
                >
                    <option value="">Select Khanda</option>
                    {availableKhandas.map(k => (
                        <option key={k._id} value={k._id}>{k.name} ({k.code})</option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3/4 transform -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>
            
            {/* Valaya Selector (Visible only if applicable) */}
            {selectedKhanda && availableValayas.length > 0 && (
                <div className="relative">
                    <label htmlFor={`${field.id}-valaya`} className="block text-sm font-medium text-purple-700 mb-2">
                        Valaya {field.required ? '*' : ''}
                    </label>
                    <select 
                        id={`${field.id}-valaya`} 
                        name={`${field.id}-valaya`} 
                        required={field.required} 
                        value={valayaId} 
                        onChange={handleValayaChange} 
                        disabled={!khandaId} 
                        className={commonInputClasses}
                    >
                        <option value="">Select Valaya</option>
                        {availableValayas.map(v => (
                            <option key={v._id} value={v._id}>{v.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-3/4 transform -translate-y-1/2 pointer-events-none text-slate-500" />
                </div>
            )}

            {/* Milan Selector */}
            <div className="relative">
                <label htmlFor={`${field.id}-milan`} className="block text-sm font-medium text-purple-700 mb-2">
                    Milan *
                </label>
                <select 
                    id={`${field.id}-milan`} 
                    name={`${field.id}-milan`} 
                    required={field.required} 
                    value={milanName} 
                    onChange={handleMilanChange} 
                    disabled={!khandaId || (availableValayas.length > 0 && !valayaId)} 
                    className={commonInputClasses}
                >
                    <option value="">Select Milan</option>
                    {availableMilans.map(m => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3/4 transform -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>

            {/* Debug info (remove in production) */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs">
                    <p><strong>Debug:</strong> Vibhaags: {hierarchyData.length}, Khandas: {availableKhandas.length}, Valayas: {availableValayas.length}, Milans: {availableMilans.length}</p>
                </div>
            )}
        </div>
    );
};

// Form Field Renderer Component
const FormField = ({ field, onFieldChange, isVisible = true }: { field: Field, onFieldChange: (fieldId: string, value: string) => void, isVisible?: boolean }) => {
    const commonInputClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-base shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all duration-200";
    const inputId = `field-${field.id}`;

    const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        onFieldChange(field.id, e.target.value);
    };

    const handleCheckboxChange = (value: string, isChecked: boolean) => {
        onFieldChange(field.id, value);
    };

    const inputElement = (() => {
        switch (field.type) {
            case 'text': case 'email': case 'number':
                return <input id={inputId} name={field.id} type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'} required={field.required} placeholder={field.placeholder} className={commonInputClasses} onChange={handleFieldChange} />;
            case 'textarea':
                return <textarea id={inputId} name={field.id} required={field.required} placeholder={field.placeholder} rows={4} className={`${commonInputClasses} resize-y`} onChange={handleFieldChange} />;
            case 'select':
                return (
                    <div className="relative">
                        <select id={inputId} name={field.id} required={field.required} className={`${commonInputClasses} appearance-none pr-8 bg-white cursor-pointer`} onChange={handleFieldChange}>
                            <option value="">{field.placeholder || `Select ${field.label}`}</option>
                            {field.options?.map((option, idx) => (<option key={idx} value={option}>{option}</option>))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
                    </div>
                );
            case 'radio':
                return (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        {field.options?.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-3 text-slate-700 cursor-pointer">
                                <input type="radio" name={field.id} required={field.required} value={option} className="text-indigo-600 border-slate-300 w-5 h-5 focus:ring-indigo-500" onChange={handleFieldChange} />
                                <span className="text-base">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox':
                return (
                    <div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        {field.options?.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-3 text-slate-700 cursor-pointer">
                                <input type="checkbox" name={field.id} value={option} className="rounded text-indigo-600 border-slate-300 w-5 h-5 focus:ring-indigo-500" onChange={(e) => handleCheckboxChange(option, e.target.checked)} />
                                <span className="text-base">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'date':
                return <input id={inputId} name={field.id} type="date" required={field.required} className={commonInputClasses} onChange={handleFieldChange} />;
            case 'sangha':
                return <SanghaHierarchyField field={field} onFieldChange={onFieldChange} />;
            case 'file':
                return <div className="border-2 border-dashed border-indigo-400 rounded-xl p-8 text-center bg-indigo-50/50 hover:border-indigo-600 transition-all cursor-pointer">
                    <UploadCloud className="w-10 h-10 text-indigo-600 mx-auto mb-3" />
                    <p className="text-base text-slate-800 font-bold">Click or drag files here</p>
                    <p className="text-xs text-slate-500 mt-1">Max 10MB per file. Supports: Images, PDF, Docs</p>
                </div>;
            case 'whatsapp_optin':
                return (
                    <div className="space-y-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-inner">
                        <p className="flex items-center gap-3 text-lg font-bold text-green-800">
                            <MessageCircle className="w-5 h-5" /> 
                            WhatsApp Updates
                        </p>
                        
                        {/* Mobile Number Field */}
                        <div>
                            <label className="block text-sm font-medium text-green-700 mb-2">
                                Mobile Number *
                            </label>
                            <input 
                                type="tel"
                                id={`${field.id}-mobile`}
                                name={`${field.id}-mobile`}
                                required={true}
                                placeholder="Enter your 10-digit mobile number"
                                pattern="[0-9]{10}"
                                className={commonInputClasses}
                                onChange={handleFieldChange}
                            />
                        </div>
                    </div>
                );
            case 'arratai_optin':
                return (
                    <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border-2 border-blue-200 shadow-inner">
                        <p className="flex items-center gap-3 text-lg font-bold text-blue-800">
                            <Users className="w-5 h-5" /> 
                            Arratai Platform
                        </p>
                        
                        {/* Mobile Number Field */}
                        <div>
                            <label className="block text-sm font-medium text-blue-700 mb-2">
                                Mobile Number for Arratai *
                            </label>
                            <input 
                                type="tel"
                                id={`${field.id}-mobile`}
                                name={`${field.id}-mobile`}
                                required={true}
                                placeholder="Enter your 10-digit mobile number for Arratai"
                                pattern="[0-9]{10}"
                                className={commonInputClasses}
                                onChange={handleFieldChange}
                            />
                        </div>
                        
                        {/* Additional Arratai Information */}
                        <div className="space-y-3 p-4 bg-white/60 rounded-xl border border-blue-100">
                            <div>
                                <label className="block text-xs font-medium text-blue-600 mb-1">
                                    Arratai Username (Optional)
                                </label>
                                <input
                                    type="text"
                                    id={`${field.id}-username`}
                                    name={`${field.id}-username`}
                                    placeholder="Choose your Arratai username"
                                    className="w-full px-3 py-2 text-sm border border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                    onChange={handleFieldChange}
                                />
                            </div>
                            <p className="text-xs text-blue-600">
                                By joining Arratai, you'll get access to exclusive discussions, events, and networking opportunities.
                            </p>
                        </div>
                    </div>
                );
            default:
                return <p className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">Unsupported field type: {field.type}</p>;
        }
    })();

    if (!isVisible) return null;

    return (
        <div className="mb-8 p-4 bg-white rounded-xl shadow-md border border-slate-100">
            <label htmlFor={inputId} className="block text-base font-bold text-slate-800 mb-2">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {inputElement}
        </div>
    );
};

// ----------------------------------------------------

interface LiveFormPageProps {
    slug: string;
}

export default function LiveFormPage({ slug }: LiveFormPageProps) {
    const [form, setForm] = useState<Form | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
    
    // BOTH ARE MANDATORY - ALWAYS TRUE
    const [isWhatsAppOptedIn, setIsWhatsAppOptedIn] = useState(false);
    const [isArrataiOptedIn, setIsArrataiOptedIn] = useState(false);

    const evaluateAllSectionVisibility = useCallback((currentValues: Record<string, string>, currentForm: Form | null): Set<string> => {
        if (!currentForm) return new Set();

        const newVisibleSections = new Set<string>();

        currentForm.sections.forEach(section => {
            if (!section.conditionalRules || section.conditionalRules.length === 0) {
                newVisibleSections.add(section.id);
                return;
            }

            const allRulesMet = section.conditionalRules.every(rule => {
                const fieldValue = currentValues[rule.field];

                if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
                    return false;
                }
                
                const fieldValueStr = String(fieldValue).toLowerCase();
                const ruleValueStr = String(rule.value).toLowerCase();

                switch (rule.operator) {
                    case 'equals':
                        return fieldValueStr === ruleValueStr;
                    case 'not_equals':
                        return fieldValueStr !== ruleValueStr;
                    case 'contains':
                        return fieldValueStr.includes(ruleValueStr);
                    case 'greater_than':
                        return Number(fieldValue) > Number(rule.value);
                    case 'less_than':
                        return Number(fieldValue) < Number(rule.value);
                    default:
                        return false;
                }
            });
            
            if (allRulesMet) {
                newVisibleSections.add(section.id);
            }
        });
        
        return newVisibleSections;
    }, []);

    useEffect(() => {
        if (typeof slug !== 'string' || slug.length === 0) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        fetchFormBySlug(slug)
            .then(data => {
                setForm({ ...data, _id: data._id });
                
                const initialVisibleSections = evaluateAllSectionVisibility({}, data);
                setVisibleSections(initialVisibleSections);
            })
            .catch((e) => {
                toast.error(e.message || "Failed to load form.");
                setForm(null);
            })
            .finally(() => setIsLoading(false));
    }, [slug, evaluateAllSectionVisibility]);

    const handleFieldChange = useCallback((fieldId: string, value: string) => {
        setFormValues(prev => ({ ...prev, [fieldId]: value }));
    }, []);

    useEffect(() => {
        if (form) {
            const updatedVisibleSections = evaluateAllSectionVisibility(formValues, form);
            
            const newIds = Array.from(updatedVisibleSections).sort().join(',');
            const currentIds = Array.from(visibleSections).sort().join(',');

            if (newIds !== currentIds) {
                setVisibleSections(updatedVisibleSections);
            }
        }
    }, [formValues, form, evaluateAllSectionVisibility, visibleSections]);

    // BOTH ARE MANDATORY - ALWAYS TRUE
    const hasWhatsAppField = true; // Always mandatory
    const hasArrataiField = true; // Always mandatory

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmissionStatus('idle');

        // BOTH ARE MANDATORY - Check both consents
        if (!isWhatsAppOptedIn) {
            toast.error("Please agree to WhatsApp communications to continue.");
            setIsSubmitting(false);
            return;
        }

        if (!isArrataiOptedIn) {
            toast.error("Please agree to join Arratai platform to continue.");
            setIsSubmitting(false);
            return;
        }

        const relevantFieldIds = new Set(
            form?.sections
                .filter(section => visibleSections.has(section.id))
                .flatMap(section => section.fields.map(f => f.id)) || []
        );
         form?.sections
            .filter(section => visibleSections.has(section.id))
            .flatMap(section => section.fields)
            .filter(field => field.type === 'sangha')
            .forEach(field => {
                relevantFieldIds.add(`${field.id}-vibhaag`);
                relevantFieldIds.add(`${field.id}-khanda`);
                relevantFieldIds.add(`${field.id}-valaya`);
                relevantFieldIds.add(`${field.id}-milan`);
            });

        const formResponsesArray = Object.keys(formValues)
            .filter(key => relevantFieldIds.has(key))
            .map(key => ({
                fieldId: key, 
                value: formValues[key]
            }));

        // Add MANDATORY opt-in responses
        formResponsesArray.push({
            fieldId: 'whatsapp_optin_consent',
            value: isWhatsAppOptedIn ? 'agreed' : 'not_agreed'
        });
        formResponsesArray.push({
            fieldId: 'arratai_optin_consent', 
            value: isArrataiOptedIn ? 'agreed' : 'not_agreed'
        });

        const requiredFields = new Set<string>();
        form?.sections.forEach(section => {
            if (visibleSections.has(section.id)) {
                section.fields.forEach(field => {
                    if (field.required) {
                        if (field.type === 'sangha') {
                            requiredFields.add(`${field.id}-milan`); 
                        } else {
                            requiredFields.add(field.id);
                        }
                    }
                });
            }
        });

        const missingFields = Array.from(requiredFields).filter(fieldId => !formValues[fieldId] || String(formValues[fieldId]).trim() === '');

        if (missingFields.length > 0) {
            toast.error(`Please fill all required fields.`);
            setIsSubmitting(false);
            return;
        }

        const submissionPayload = {
            formId: form?._id, 
            responses: formResponsesArray,
        };
        
        try {
            const response = await fetch(`/api/forms/${slug}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionPayload)
            });

            if (!response.ok) {
                 const data = await response.json();
                 throw new Error(data.error || "Submission failed.");
            }
            
            setSubmissionStatus('success');
            toast.success("Response recorded successfully!");

        } catch (error: any) {
            setSubmissionStatus('error');
            toast.error(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="ml-3 text-lg font-medium text-slate-700">Loading Form...</p>
            </div>
        );
    }

    if (!slug) { 
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="p-10 bg-white rounded-xl shadow-xl text-center border-4 border-red-400">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-xl text-red-700 font-semibold">Error: Form Link is Missing.</p>
                    <p className="text-sm text-slate-500 mt-2">Please ensure the URL contains a form ID or slug.</p>
                </div>
            </div>
        );
    }

    if (!form) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <p className="text-xl text-red-600 font-semibold">Form not found or unavailable.</p>
            </div>
        );
    }

    if (submissionStatus === 'success') {
        const { showGroupLinks, whatsappGroupLink, arrataiGroupLink } = form?.settings || {};
        const showLinks = showGroupLinks && (whatsappGroupLink || arrataiGroupLink);

        const getFullUrl = (domain: string) => {
            if (!domain) return '';
            if (domain.startsWith('http')) return domain;
            return `https://${domain}`;
        };

        return (
            <div className="min-h-screen bg-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-xl w-full bg-white rounded-3xl shadow-2xl p-10 text-center border-4 border-indigo-400">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Success!</h2>
                    <p className="text-xl text-slate-600">Your response has been successfully submitted.</p>
                    
                    {showLinks && (
                        <div className="mt-8 p-6 bg-indigo-100 rounded-xl space-y-4">
                            <p className="text-lg font-bold text-indigo-800 flex items-center justify-center gap-2">
                                <Smartphone className="w-5 h-5"/> Join Our Community
                            </p>
                            <p className="text-sm text-indigo-600">You can join our group to stay updated on next activities.</p>
                            
                            <div className="flex flex-col sm:flex-row justify-center gap-4">
                                {whatsappGroupLink && (
                                    <a 
                                        href={getFullUrl(whatsappGroupLink)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-all duration-200 shadow-md"
                                    >
                                        <MessageSquare className="w-5 h-5"/> WhatsApp Group
                                    </a>
                                )}
                                {arrataiGroupLink && (
                                    <a 
                                        href={getFullUrl(arrataiGroupLink)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all duration-200 shadow-md"
                                    >
                                        <Users className="w-5 h-5"/> Arratai Group
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {!showLinks && (
                        <div className="mt-6 p-4 bg-indigo-100 rounded-xl">
                            <p className="text-sm font-semibold text-indigo-800">What happens next?</p>
                            <p className="text-sm text-indigo-600 mt-1">We will review your submission and contact you shortly regarding the next steps.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                
                {/* --- Header Card --- */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-8 border-t-8 border-indigo-600">
                    
                    {/* Banner */}
                    <div className="relative h-48 bg-slate-100/70 flex items-center justify-center">
                        {form.images?.banner && (
                            <img src={form.images.banner} alt="Banner" className="w-full h-full object-cover" onError={(e) => e.currentTarget.style.display = 'none'} />
                        )}
                        {/* Logo */}
                        <div className="absolute -bottom-16">
                            <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 shadow-xl flex items-center justify-center">
                                {form.images?.logo ? <img src={form.images.logo} alt="Logo" className="w-full h-full object-cover rounded-full" onError={(e) => e.currentTarget.style.display = 'none'} /> : <span className="text-slate-500 font-bold">LOGO</span>}
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 pb-8 px-6 sm:px-10 text-center">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-2">{form.title}</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{form.description}</p>
                    </div>
                </div>

                {/* --- Form Sections --- */}
                <div className="space-y-10">
                    {form.sections.map((section) => {
                        const isSectionVisible = visibleSections.has(section.id);
                        
                        if (!isSectionVisible) return null;

                        return (
                            <div key={section.id} className="bg-white rounded-2xl shadow-xl p-6 sm:p-10 border-t-4 border-purple-500">
                                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{section.title}</h2>
                                <p className="text-md text-slate-500 mb-6 border-b pb-4">{section.description}</p>
                                
                                <div className="space-y-4">
                                    {section.fields.map((field) => (
                                        <FormField 
                                            key={field.id} 
                                            field={field} 
                                            onFieldChange={handleFieldChange}
                                            isVisible={true}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- MANDATORY OPT-IN CONSENT SECTION --- */}
                <div className="mt-8 space-y-6">
                    {/* WhatsApp Opt-in - MANDATORY */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg p-8">
                        <div className="flex items-start gap-4">
                            <input
                                type="checkbox"
                                id="whatsapp-optin-consent"
                                name="whatsapp-optin-consent"
                                required={true}
                                checked={isWhatsAppOptedIn}
                                onChange={(e) => setIsWhatsAppOptedIn(e.target.checked)}
                                className="mt-1 w-6 h-6 text-green-600 border-green-300 rounded focus:ring-green-500 flex-shrink-0"
                            />
                            <div className="flex-1">
                                <label htmlFor="whatsapp-optin-consent" className="block text-xl font-bold text-green-800 mb-2 flex items-center gap-3">
                                    <MessageCircle className="w-6 h-6" />
                                    WhatsApp Communication Consent (Required)
                                </label>
                                <p className="text-green-700 text-lg mb-3">
                                    I opt-in to receive communication about Yuva initiatives via WhatsApp group.
                                </p>
                                <p className="text-green-600 text-sm font-semibold">
                                    This is mandatory for all registrations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Arratai Opt-in - MANDATORY */}
                    <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-2xl border-2 border-blue-200 shadow-lg p-8">
                        <div className="flex items-start gap-4">
                            <input
                                type="checkbox"
                                id="arratai-optin-consent"
                                name="arratai-optin-consent"
                                required={true}
                                checked={isArrataiOptedIn}
                                onChange={(e) => setIsArrataiOptedIn(e.target.checked)}
                                className="mt-1 w-6 h-6 text-blue-600 border-blue-300 rounded focus:ring-blue-500 flex-shrink-0"
                            />
                            <div className="flex-1">
                                <label htmlFor="arratai-optin-consent" className="block text-xl font-bold text-blue-800 mb-2 flex items-center gap-3">
                                    <Users className="w-6 h-6" />
                                    Arratai Platform Consent (Required)
                                </label>
                                <p className="text-blue-700 text-lg mb-3">
                                    I would like to join the Arratai platform to connect with like-minded individuals and participate in Yuva initiatives.
                                </p>
                                <p className="text-blue-600 text-sm font-semibold">
                                    This is mandatory for all registrations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Submission Bar --- */}
                <div className="mt-12 p-6 bg-white rounded-xl shadow-2xl border border-slate-200/80 sticky bottom-0 z-10">
                    <button
                        type="submit"
                        disabled={isSubmitting || !isWhatsAppOptedIn || !isArrataiOptedIn}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg font-bold text-lg hover:from-indigo-700 hover:to-purple-800 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                            </>
                        ) : !isWhatsAppOptedIn || !isArrataiOptedIn ? (
                            <>
                                <XCircle className="w-5 h-5" />
                                Agree to All Required Consents
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" /> Submit Registration
                            </>
                        )}
                    </button>
                    
                    {/* Show message when disabled due to opt-in */}
                    {(!isWhatsAppOptedIn || !isArrataiOptedIn) ? (
                        <div className="mt-4 text-center">
                            <p className="text-red-600 font-semibold text-sm">
                                Both WhatsApp and Arratai consents are required to submit this form
                            </p>
                        </div>
                    ) : submissionStatus === 'error' && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-red-600 font-semibold text-sm">
                            <XCircle className="w-4 h-4" /> Please correct the errors above and try again.
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}