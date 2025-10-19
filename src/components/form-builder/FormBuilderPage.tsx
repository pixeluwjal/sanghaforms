'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Eye, Plus, Sparkles, Settings, CheckCircle, RefreshCw, Layers, Loader2, UploadCloud, Send, XCircle, ChevronDown, Users, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

// --- MOCK/PLACEHOLDER IMPORTS FOR SELF-CONTAINED FILE ---
import { Form, Section, Field, FormSettings } from './shared/types';
import BuildTab from './tabs/BuildTab';
import AITab from './tabs/AITab';
import SettingsTab from './tabs/SettingsTab';
import TextareaAutosize from 'react-textarea-autosize';

// --- START: INLINE COMPONENT DEFINITIONS ---

const fetchOrganizationData = async (): Promise<any[]> => {
    try {
        const response = await fetch('/api/organization');
        if (!response.ok) throw new Error('Failed to fetch organization data.');
        const data = await response.json();
        return data.organizations || [];
    } catch (error) {
        console.error("Org data fetch error:", error);
        return [];
    }
};

const SanghaHierarchyField = ({ field }: { field: Field }) => {
    const commonInputClasses = "w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm sm:text-base shadow-sm focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all duration-300";

    const [hierarchyData, setHierarchyData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [vibhaagId, setVibhaagId] = useState('');
    const [khandaId, setKhandaId] = useState('');
    const [valayaId, setValayaId] = useState('');
    const [milanName, setMilanName] = useState('');

    useEffect(() => {
        setIsLoading(true);
        fetchOrganizationData()
            .then(data => setHierarchyData(data))
            .finally(() => setIsLoading(false));
    }, []);

    const selectedVibhaag = hierarchyData.find(v => v._id === vibhaagId);
    const availableKhandas = selectedVibhaag?.khandas || [];
    const selectedKhanda = availableKhandas.find((k: any) => k._id === khandaId);
    const availableValayas = selectedKhanda?.valays || [];
    const selectedValaya = availableValayas.find((v: any) => v._id === valayaId);
    const availableMilans = selectedValaya?.milans || (selectedKhanda?.milans && availableValayas.length === 0 ? selectedKhanda.milans : []);
    
    const handleVibhaagChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setVibhaagId(e.target.value); setKhandaId(''); setValayaId(''); setMilanName(''); };
    const handleKhandaChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setKhandaId(e.target.value); setValayaId(''); setMilanName(''); };
    const handleValayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setValayaId(e.target.value); setMilanName(''); };
    const handleMilanChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setMilanName(e.target.value); };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-4 sm:p-6 bg-purple-50/80 rounded-2xl border-2 border-purple-200/60">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin mr-2 sm:mr-3 text-purple-600"/> 
                <p className="text-xs sm:text-sm font-medium text-purple-700">Loading hierarchy data...</p>
            </div>
        );
    }
    
    return (
        <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-br from-purple-50/60 to-indigo-50/60 rounded-2xl border-2 border-purple-200/60 shadow-inner">
            <p className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold text-purple-800">
                <Users className="w-4 h-4 sm:w-5 sm:h-5"/> 
                Sangha Hierarchy: {field.label}
            </p>

            <div className="relative">
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
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
            
            <div className="relative">
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
                    {availableKhandas.map((k: any) => (
                        <option key={k._id} value={k._id}>{k.name}</option>
                    ))}
                </select>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
            
            <div className="relative">
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
                    {availableMilans.map((m: any) => (
                        <option key={m} value={m}>{m}</option>
                    ))}
                </select>
                <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
            </div>
        </div>
    );
};

// Update your FormField component to handle the new field types
const FormField = ({ field }: { field: Field }) => {
    const commonInputClasses = "w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm sm:text-base shadow-sm focus:border-purple-500 focus:ring-3 focus:ring-purple-500/20 transition-all duration-300";
    const inputId = `field-${field.id}`;
    
    const inputElement = (() => {
        switch (field.type) {
            case 'text': 
            case 'email': 
            case 'number': 
                return (
                    <input 
                        id={inputId} 
                        name={field.id} 
                        type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'} 
                        required={field.required} 
                        placeholder={field.placeholder} 
                        className={commonInputClasses} 
                    />
                );
            case 'textarea': 
                return (
                    <textarea 
                        id={inputId} 
                        name={field.id} 
                        required={field.required} 
                        placeholder={field.placeholder} 
                        rows={4} 
                        className={`${commonInputClasses} resize-y`} 
                    />
                );
            case 'select': 
                return (
                    <div className="relative">
                        <select 
                            id={inputId} 
                            name={field.id} 
                            required={field.required} 
                            className={`${commonInputClasses} appearance-none pr-8 sm:pr-10 bg-white cursor-pointer`}
                        >
                            <option value="">{field.placeholder || `Select ${field.label}`}</option>
                            {field.options?.map((option, idx) => (
                                <option key={idx} value={option}>{option}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500" />
                    </div>
                );
            case 'radio': 
                return (
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-gray-50/80 rounded-xl border border-gray-200/60">
                        {field.options?.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-2 sm:gap-3 text-gray-700 cursor-pointer">
                                <input 
                                    type="radio" 
                                    name={field.id} 
                                    required={field.required} 
                                    value={option} 
                                    className="text-purple-600 border-gray-300 w-4 h-4 sm:w-5 sm:h-5 focus:ring-purple-500" 
                                />
                                <span className="text-sm sm:text-base">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox': 
                return (
                    <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-gray-50/80 rounded-xl border border-gray-200/60">
                        {field.options?.map((option, idx) => (
                            <label key={idx} className="flex items-center gap-2 sm:gap-3 text-gray-700 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name={field.id} 
                                    value={option} 
                                    className="rounded text-purple-600 border-gray-300 w-4 h-4 sm:w-5 sm:h-5 focus:ring-purple-500" 
                                />
                                <span className="text-sm sm:text-base">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'date': 
                return (
                    <input 
                        id={inputId} 
                        name={field.id} 
                        type="date" 
                        required={field.required} 
                        className={commonInputClasses} 
                    />
                );
            case 'sangha': 
                return <SanghaHierarchyField field={field} />;
            case 'file': 
                return (
                    <div className="border-2 border-dashed border-purple-400 rounded-2xl p-4 sm:p-8 text-center bg-purple-50/50 hover:border-purple-600 transition-all duration-300 cursor-pointer">
                        <UploadCloud className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600 mx-auto mb-2 sm:mb-3" />
                        <p className="text-sm sm:text-base text-gray-800 font-bold">Click or drag files here</p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2">Max 10MB per file. Supports: Images, PDF, Docs</p>
                    </div>
                );
            // ADD THESE NEW CASES FOR WHATSAPP AND ARRATAI OPT-IN
            case 'whatsapp_optin': 
                return (
                    <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-br from-green-50/60 to-emerald-50/60 rounded-2xl border-2 border-green-200/60 shadow-inner">
                        <p className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold text-green-800">
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" /> 
                            WhatsApp Updates: {field.label}
                        </p>
                        
                        {/* Mobile Number Field */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-green-700 mb-2">
                                Mobile Number *
                            </label>
                            <input 
                                type="tel"
                                id={`${field.id}-mobile`}
                                name={`${field.id}-mobile`}
                                required={field.required}
                                placeholder="Enter your 10-digit mobile number"
                                pattern="[0-9]{10}"
                                className={commonInputClasses}
                            />
                        </div>
                        
                        {/* WhatsApp Opt-in Checkbox */}
                        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/80 rounded-xl border border-green-200">
                            <input
                                type="checkbox"
                                id={`${field.id}-consent`}
                                name={`${field.id}-consent`}
                                required={field.required}
                                className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-green-600 border-green-300 rounded focus:ring-green-500"
                            />
                            <label htmlFor={`${field.id}-consent`} className="text-xs sm:text-sm text-green-800 font-medium">
                                I opt-in to receive communication about Yuva initiatives via WhatsApp group
                            </label>
                        </div>
                    </div>
                );
            case 'arratai_optin': 
                return (
                    <div className="space-y-3 sm:space-y-4 p-4 sm:p-6 bg-gradient-to-br from-blue-50/60 to-sky-50/60 rounded-2xl border-2 border-blue-200/60 shadow-inner">
                        <p className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold text-blue-800">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5" /> 
                            Arratai Platform: {field.label}
                        </p>
                        
                        {/* Mobile Number Field */}
                        <div>
                            <label className="block text-xs sm:text-sm font-medium text-blue-700 mb-2">
                                Mobile Number for Arratai *
                            </label>
                            <input 
                                type="tel"
                                id={`${field.id}-mobile`}
                                name={`${field.id}-mobile`}
                                required={field.required}
                                placeholder="Enter your 10-digit mobile number for Arratai"
                                pattern="[0-9]{10}"
                                className={commonInputClasses}
                            />
                        </div>
                        
                        {/* Arratai Join Checkbox */}
                        <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4 bg-white/80 rounded-xl border border-blue-200">
                            <input
                                type="checkbox"
                                id={`${field.id}-consent`}
                                name={`${field.id}-consent`}
                                required={field.required}
                                className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-blue-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`${field.id}-consent`} className="text-xs sm:text-sm text-blue-800 font-medium">
                                I would like to join the Arratai platform to connect with like-minded individuals and participate in Yuva initiatives
                            </label>
                        </div>
                        
                        {/* Additional Arratai Information */}
                        <div className="space-y-2 sm:space-y-3 p-3 sm:p-4 bg-white/60 rounded-xl border border-blue-100">
                            <div>
                                <label className="block text-xs font-medium text-blue-600 mb-1">
                                    Arratai Username (Optional)
                                </label>
                                <input
                                    type="text"
                                    id={`${field.id}-username`}
                                    name={`${field.id}-username`}
                                    placeholder="Choose your Arratai username"
                                    className="w-full px-3 py-2 text-xs sm:text-sm border border-blue-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                            <p className="text-xs text-blue-600">
                                By joining Arratai, you'll get access to exclusive discussions, events, and networking opportunities.
                            </p>
                        </div>
                    </div>
                );
            default: 
                return (
                    <div className="p-3 sm:p-4 bg-red-50/80 border border-red-200 rounded-xl">
                        <p className="text-red-600 text-xs sm:text-sm font-medium">Unsupported field type: {field.type}</p>
                    </div>
                );
        }
    })();
    
    return (
        <div className="mb-4 sm:mb-6 p-3 sm:p-5 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/60 hover:shadow-xl transition-all duration-300">
            <label htmlFor={inputId} className="block text-sm sm:text-base font-bold text-gray-800 mb-2 sm:mb-3">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {inputElement}
        </div>
    );
};

interface PreviewTabProps {
    form: Form;
}

const PreviewTab = ({ form }: PreviewTabProps) => {
    return (
        <div className="min-h-[70vh] bg-gradient-to-br from-purple-50/30 to-indigo-100/30 py-6 sm:py-10 px-3 sm:px-6 lg:px-8 border-4 border-dashed border-purple-300 rounded-3xl shadow-inner">
            <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                    <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Live Preview</h3>
                <p className="text-gray-600 mt-2 text-sm sm:text-lg">This is how your published form looks and behaves</p>
            </div>
            
            <div className="max-w-4xl mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden mb-6 sm:mb-8 border-t-8 border-purple-600">
                    <div className="relative h-20 sm:h-28 bg-gradient-to-r from-purple-100 to-indigo-100 flex items-center justify-center">
                        {form.images?.banner ? (
                            <img src={form.images.banner} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-gray-400 text-sm sm:text-base font-medium">Banner Preview Area</span>
                        )}
                    </div>

                    <div className="p-4 sm:p-8 text-center">
                        <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-3">{form.title}</h1>
                        <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">{form.description}</p>
                    </div>
                </div>

                <div className="space-y-6 sm:space-y-8">
                    {form.sections.map((section) => (
                        <div key={section.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-8 border-l-4 border-purple-500">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">{section.title}</h2>
                            <p className="text-sm sm:text-md text-gray-500 mb-4 sm:mb-6 border-b border-gray-200/60 pb-3 sm:pb-4">{section.description}</p>
                            
                            <div className="space-y-4 sm:space-y-6">
                                {section.fields.map((field) => (
                                    <FormField key={field.id} field={field} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Preview Notice - No Submit Button */}
                <div className="mt-8 sm:mt-12 p-4 sm:p-6 bg-yellow-50/90 backdrop-blur-sm rounded-2xl shadow-lg border-2 border-yellow-200 text-center">
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                        <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                        <h4 className="text-lg sm:text-xl font-bold text-yellow-800">Preview Mode</h4>
                    </div>
                    <p className="text-sm sm:text-base text-yellow-700">
                        This is a preview of your form. The submit button is disabled in preview mode.
                    </p>
                    <p className="text-xs sm:text-sm text-yellow-600 mt-2">
                        Publish your form to enable submission functionality.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- END: INLINE COMPONENT DEFINITIONS ---

export default function FormBuilderPage() {
    const params = useParams();
    const router = useRouter();
    const formId = (params?.formId as string) || ''; 
    
    const [form, setForm] = useState<Form | null>(null);
    const [activeTab, setActiveTab] = useState('build');
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Failed'>('Saved');

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const fetchForm = useCallback(async (id: string) => {
        if (!id) return;
        try {
            const response = await fetch(`/api/forms?id=${id}`);
            const data = await response.json();
            if (data.form) {
                setForm(data.form);
            } else {
                toast.error('Form not found');
            }
        } catch (error) {
            toast.error('Failed to load form');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (formId) {
            fetchForm(formId);
        } else {
            setIsLoading(false);
            setForm(null);
        }
    }, [formId, fetchForm]);

    const debouncedSave = useCallback(
        debounce(async (id, updates) => {
            try {
                await fetch('/api/forms', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ formId: id, ...updates })
                });
                setSaveStatus('Saved');
            } catch (error) {
                console.error('Save failed:', error);
                setSaveStatus('Failed');
                toast.error("Couldn't save changes. Check your connection.");
            }
        }, 1000), 
        []
    );

    const updateForm = (updates: Partial<Form>) => {
        if (!form) return;
        
        setSaveStatus('Saving...');
        const updatedForm = { ...form, ...updates };
        setForm(updatedForm);
        
        debouncedSave(formId, updatedForm); 
    };

    const handleAIGenerated = (aiFormData: Partial<Form>) => {
        if (!form) return;
        const mergedForm = { ...form, ...aiFormData, id: form.id, status: form.status || 'draft' };
        updateForm(mergedForm);
        setActiveTab('build');
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id && form && form.sections) {
            const oldIndex = form.sections.findIndex(s => s.id === active.id);
            const newIndex = form.sections.findIndex(s => s.id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                const reorderedSections = arrayMove(form.sections, oldIndex, newIndex)
                    .map((section, index) => ({ ...section, order: index }));
                updateForm({ sections: reorderedSections });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-indigo-100/50 flex items-center justify-center p-4">
                <div className="text-center p-6 sm:p-10 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-purple-200/60 max-w-md w-full">
                    <RefreshCw className="w-10 h-10 sm:w-14 sm:h-14 text-purple-600 animate-spin mx-auto mb-4 sm:mb-6" />
                    <h2 className="text-xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-3">Loading Form Builder</h2>
                    <p className="text-gray-600 text-sm sm:text-lg">Please wait a moment while we load your canvas</p>
                </div>
            </div>
        );
    }
    
    if (!form || !formId) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-indigo-100/50 flex items-center justify-center p-4">
                <div className="text-center p-6 sm:p-12 bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border-4 border-red-400/60 max-w-md w-full">
                    <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4 sm:mb-6" />
                    <h2 className="text-lg sm:text-2xl font-bold text-red-700 mb-2 sm:mb-3">Form Not Found</h2>
                    <p className="text-gray-600 text-sm sm:text-lg">Please ensure the URL contains a valid Form ID</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50/30 to-indigo-100/30"> 
            <main className="max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
                
                {/* --- Top Header Bar --- */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-gray-200/60 mb-6 sm:mb-8">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent break-words">
                            {form.title || 'Untitled Form'}
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-lg mt-1 sm:mt-2">Build and customize your form with drag & drop</p>
                    </div>
                    
                    <div className="flex items-center gap-3 sm:gap-4 mt-4 lg:mt-0">
                        <div className={`flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl border-2 transition-all duration-300 ${
                            saveStatus === 'Saving...' ? 'bg-amber-100 text-amber-800 border-amber-300' :
                            saveStatus === 'Saved' ? 'bg-green-100 text-green-800 border-green-300' :
                            'bg-red-100 text-red-800 border-red-300'
                        }`}>
                            {saveStatus === 'Saving...' && <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />}
                            {saveStatus === 'Saved' && <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                            {saveStatus === 'Failed' && <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />}
                            <span>{saveStatus}</span>
                        </div>

                        <button
                            onClick={() => setActiveTab('preview')}
                            className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-500/30 transform hover:scale-105 text-sm sm:text-base font-bold shadow-lg transition-all duration-300"
                        >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" /> 
                            <span className="hidden sm:inline">Preview</span>
                        </button>
                    </div>
                </div>
                
                {/* --- Tab Navigation --- */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <div className="bg-white/90 backdrop-blur-sm p-1 sm:p-2 rounded-2xl shadow-xl border border-gray-200/60 flex items-center gap-1 overflow-x-auto w-full">
                        {[
                            { id: 'build', label: 'Build', icon: Layers },
                            { id: 'preview', label: 'Preview', icon: Eye },
                            { id: 'ai', label: 'AI Magic', icon: Sparkles },
                            { id: 'settings', label: 'Settings', icon: Settings }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 py-2 sm:py-3 px-3 sm:px-6 font-bold text-xs sm:text-sm whitespace-nowrap flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 rounded-xl min-w-0 ${
                                    activeTab === tab.id
                                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30'
                                        : 'text-gray-600 hover:bg-gray-100/80 hover:text-gray-800'
                                }`}
                            >
                                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" /> 
                                <span className="truncate">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Main Content Area --- */}
                <div>
                    {activeTab === 'build' && (
                        <BuildTab
                            form={form}
                            updateForm={updateForm}
                            showToolbox={false}
                            sensors={sensors}
                            onMobileToolboxOpen={() => {}}
                        />
                    )}
                    {activeTab === 'preview' && <PreviewTab form={form} />}
                    {activeTab === 'ai' && <AITab onAIGenerated={handleAIGenerated} />}
                    {activeTab === 'settings' && <SettingsTab form={form} onUpdate={updateForm} />}
                </div>
            </main>
        </div>
    );
}