'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Eye, Plus, Sparkles, Settings, Menu, X, CheckCircle, RefreshCw, Layers, Loader2, UploadCloud, Send, XCircle, ChevronDown, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

// --- MOCK/PLACEHOLDER IMPORTS FOR SELF-CONTAINED FILE ---
// These components need to be self-defined or assumed to be available
import { Form, Section, Field, FormSettings } from './shared/types';
import BuildTab from './tabs/BuildTab';
import AITab from './tabs/AITab';
import SettingsTab from './tabs/SettingsTab';
import MobileToolbox from './mobile/MobileToolbox';
import TextareaAutosize from 'react-textarea-autosize'; // Assumed dependency for BuildTab

// --- START: INLINE COMPONENT DEFINITIONS ---

// Define the Sangha Hierarchy API fetcher here since it is shared
const fetchOrganizationData = async (): Promise<any[]> => {
    try {
        // NOTE: Uses actual API endpoint.
        const response = await fetch('/api/organization');
        if (!response.ok) throw new Error('Failed to fetch organization data.');
        const data = await response.json();
        return data.organizations || [];
    } catch (error) {
        console.error("Org data fetch error:", error);
        return [];
    }
};

// Sangha Hierarchy Field Component (Interacts with API)
const SanghaHierarchyField = ({ field }: { field: Field }) => {
    const commonInputClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-base shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 transition-all duration-200";

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
    
    // Handlers (Simplified for brevity, assuming standard selection logic)
    const handleVibhaagChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setVibhaagId(e.target.value); setKhandaId(''); setValayaId(''); setMilanName(''); };
    const handleKhandaChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setKhandaId(e.target.value); setValayaId(''); setMilanName(''); };
    const handleValayaChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setValayaId(e.target.value); setMilanName(''); };
    const handleMilanChange = (e: React.ChangeEvent<HTMLSelectElement>) => { setMilanName(e.target.value); };

    if (isLoading) {
        return <div className="flex items-center justify-center p-6 bg-purple-50 rounded-xl border border-purple-200"><Loader2 className="w-5 h-5 animate-spin mr-2 text-purple-600"/> <p className="text-sm text-purple-700">Loading hierarchy data...</p></div>;
    }
    
    return (
        <div className="space-y-4 p-5 bg-purple-50/50 rounded-xl border-2 border-purple-200 shadow-inner">
            <p className="flex items-center gap-2 text-base font-bold text-purple-800"><Users className="w-5 h-5"/> Sangha Hierarchy: {field.label}</p>

            {/* Vibhaag Selector */}
            <div className="relative">
                <select id={`${field.id}-vibhaag`} name={`${field.id}-vibhaag`} required={field.required} value={vibhaagId} onChange={handleVibhaagChange} className={commonInputClasses}>
                    <option value="">Select Vibhaag</option>
                    {hierarchyData.map(v => (<option key={v._id} value={v._id}>{v.name}</option>))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>
            {/* ... Other cascading dropdowns (Khanda, Valaya, Milan) ... */}
            <div className="relative">
                <select id={`${field.id}-khanda`} name={`${field.id}-khanda`} required={field.required} value={khandaId} onChange={handleKhandaChange} disabled={!vibhaagId} className={commonInputClasses}>
                    <option value="">Select Khanda</option>
                    {availableKhandas.map((k: any) => (<option key={k._id} value={k._id}>{k.name}</option>))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>
            <div className="relative">
                <select id={`${field.id}-milan`} name={`${field.id}-milan`} required={field.required} value={milanName} onChange={handleMilanChange} disabled={!khandaId || (availableValayas.length > 0 && !valayaId)} className={commonInputClasses}>
                    <option value="">Select Milan</option>
                    {availableMilans.map((m: any) => (<option key={m} value={m}>{m}</option>))}
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>
        </div>
    );
};

// Form Field Renderer Component (Reused from FormPreviewPage)
const FormField = ({ field }: { field: Field }) => {
  const commonInputClasses = "w-full px-4 py-3 border border-slate-300 rounded-lg bg-white text-base shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 transition-all duration-200";
  const inputId = `field-${field.id}`;
  const inputElement = (() => {
    switch (field.type) {
      case 'text': case 'email': case 'number': return <input id={inputId} name={field.id} type={field.type === 'email' ? 'email' : field.type === 'number' ? 'number' : 'text'} required={field.required} placeholder={field.placeholder} className={commonInputClasses} />;
      case 'textarea': return <textarea id={inputId} name={field.id} required={field.required} placeholder={field.placeholder} rows={4} className={`${commonInputClasses} resize-y`} />;
      case 'select': return (<div className="relative"><select id={inputId} name={field.id} required={field.required} className={`${commonInputClasses} appearance-none pr-8 bg-white cursor-pointer`}><option value="">{field.placeholder || `Select ${field.label}`}</option>{field.options?.map((option, idx) => (<option key={idx} value={option}>{option}</option>))}</select><ChevronDown className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate-500" /></div>);
      case 'radio': return (<div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">{field.options?.map((option, idx) => (<label key={idx} className="flex items-center gap-3 text-slate-700 cursor-pointer"><input type="radio" name={field.id} required={field.required} value={option} className="text-indigo-600 border-slate-300 w-5 h-5 focus:ring-indigo-500" /><span className="text-base">{option}</span></label>))}</div>);
      case 'checkbox': return (<div className="space-y-3 p-4 bg-slate-50 rounded-lg border border-slate-200">{field.options?.map((option, idx) => (<label key={idx} className="flex items-center gap-3 text-slate-700 cursor-pointer"><input type="checkbox" name={field.id} value={option} className="rounded text-indigo-600 border-slate-300 w-5 h-5 focus:ring-indigo-500" /><span className="text-base">{option}</span></label>))}</div>);
      case 'date': return <input id={inputId} name={field.id} type="date" required={field.required} className={commonInputClasses} />;
      case 'sangha': return <SanghaHierarchyField field={field} />;
      case 'file': return <div className="border-2 border-dashed border-indigo-400 rounded-xl p-8 text-center bg-indigo-50/50 hover:border-indigo-600 transition-all cursor-pointer"><UploadCloud className="w-10 h-10 text-indigo-600 mx-auto mb-3" /><p className="text-base text-slate-800 font-bold">Click or drag files here</p><p className="text-xs text-slate-500 mt-1">Max 10MB per file. Supports: Images, PDF, Docs</p></div>;
      default: return <p className="text-red-500 text-sm p-3 bg-red-50 border border-red-200 rounded-lg">Unsupported field type: {field.type}</p>;
    }
  })();
  return (
    <div className="mb-8 p-4 bg-white rounded-xl shadow-md border border-slate-100">
      <label htmlFor={inputId} className="block text-base font-bold text-slate-800 mb-2">
        {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {inputElement}
    </div>
  );
};

// --- PREVIEW TAB COMPONENT ---
interface PreviewTabProps {
    form: Form;
}

const PreviewTab = ({ form }: PreviewTabProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmissionStatus('idle');
        
        // Simulate API submission
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        
        // Mock validity check
        const isValid = true; 

        if (isValid) {
            setSubmissionStatus('success');
            toast.success("Preview submitted successfully!");
        } else {
            setSubmissionStatus('error');
            toast.error("Submission failed.");
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="min-h-[70vh] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 border-4 border-dashed border-indigo-300 rounded-3xl shadow-inner">
            <div className="text-center mb-6">
                <h3 className="text-2xl font-extrabold text-indigo-600">Live Preview</h3>
                <p className="text-slate-500">This is how your published form looks and behaves.</p>
            </div>
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
                
                {/* --- Header Card (Simplified for preview context) --- */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8 border-t-8 border-indigo-600">
                    
                    {/* Banner Area */}
                    <div className="relative h-24 bg-slate-100 flex items-center justify-center">
                       {form.images?.banner ? (
                            <img src={form.images.banner} alt="Banner" className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-slate-400">Banner Preview</span>
                        )}
                    </div>

                    <div className="p-6 text-center">
                        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">{form.title}</h1>
                        <p className="text-md text-slate-600 max-w-2xl mx-auto">{form.description}</p>
                    </div>
                </div>

                {/* --- Form Sections --- */}
                <div className="space-y-8">
                    {form.sections.map((section) => (
                        <div key={section.id} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border-t-2 border-purple-500">
                            <h2 className="text-xl font-bold text-slate-800 mb-2">{section.title}</h2>
                            <p className="text-sm text-slate-500 mb-6 border-b pb-4">{section.description}</p>
                            
                            <div className="space-y-4">
                                {section.fields.map((field) => (
                                    <FormField key={field.id} field={field} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* --- Submission Bar --- */}
                <div className="mt-10 p-4 bg-white rounded-xl shadow-xl sticky bottom-0 z-10">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg font-bold text-lg transition-all duration-300 shadow-md flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-wait"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                        ) : submissionStatus === 'success' ? (
                            <><CheckCircle className="w-5 h-5" /> Submission Sent (Preview)</>
                        ) : (
                            <><Send className="w-5 h-5" /> Submit Form</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- END: INLINE COMPONENT DEFINITIONS ---


export default function FormBuilderPage() {
  const params = useParams();
  const router = useRouter();
  // Ensure formId is always treated as string, defaulting to empty string if undefined.
  const formId = (params?.formId as string) || ''; 
  
  const [form, setForm] = useState<Form | null>(null);
  // NEW TAB: Set 'preview' as a potential active tab
  const [activeTab, setActiveTab] = useState('build'); 
  const [isLoading, setIsLoading] = useState(true);
  
  const showToolbox = false; 
  const [mobileToolboxOpen, setMobileToolboxOpen] = useState(false);
  
  const [saveStatus, setSaveStatus] = useState<'Saved' | 'Saving...' | 'Failed'>('Saved');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // --- Data Fetching Logic ---
  const fetchForm = useCallback(async (id: string) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/forms?id=${id}`);
      const data = await response.json();
      if (data.form) {
        setForm(data.form);
      } else {
        toast.error('Form not found');
        // router.push('/admin/forms'); // Disable redirect during build simulation
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
        // If formId is missing (e.g., in a mock/test path), fail gracefully.
        setIsLoading(false);
        setForm(null); // Ensure form is null if ID is missing
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100">
          <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800">Loading Form Builder</h2>
          <p className="text-slate-500 mt-1">Please wait a moment while we load your canvas.</p>
        </div>
      </div>
    );
  }
  
  if (!form || !formId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-10 bg-white rounded-xl shadow-xl border-4 border-red-400">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-xl text-red-700 font-semibold">Error: Form not found or ID is missing.</p>
            <p className="text-sm text-slate-500 mt-2">Please ensure the URL contains a valid Form ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white"> 
      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- Top Header Bar --- */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/70 mb-8">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            {form.title || 'Untitled Form'}
          </h1>
          <div className="flex items-center gap-4">
            {/* Save Status (Enhanced) */}
            <div className={`flex items-center gap-2 text-sm font-semibold p-2 px-3 rounded-full border transition-all duration-300 ${
              saveStatus === 'Saving...' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
              saveStatus === 'Saved' ? 'bg-green-100 text-green-800 border-green-300' :
              'bg-red-100 text-red-800 border-red-300'
            }`}>
              {saveStatus === 'Saving...' && <RefreshCw className="w-4 h-4 animate-spin" />}
              {saveStatus === 'Saved' && <CheckCircle className="w-4 h-4" />}
              {saveStatus === 'Failed' && <X className="w-4 h-4" />}
              <span>{saveStatus === 'Saved' ? 'Saved' : saveStatus}</span>
            </div>

            {/* Preview Button (Now switches tabs instead of routing) */}
            <button
              onClick={() => setActiveTab('preview')}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-indigo-400/50 transform hover:-translate-y-0.5 text-base font-bold shadow-md transition-all duration-300"
            >
              <Eye className="w-5 h-5" /> Preview
            </button>
          </div>
        </div>
        
        {/* --- Tab Navigation --- */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          
          {/* Tab Switcher (Floating Card Style) */}
          <div className="bg-white p-2 rounded-xl shadow-xl border border-slate-100 flex items-center gap-1">
            {[
              { id: 'build', label: 'Build', icon: Layers },
              { id: 'preview', label: 'Preview', icon: Eye }, // NEW PREVIEW TAB
              { id: 'ai', label: 'AI Magic', icon: Sparkles },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-2.5 px-4 font-bold text-sm whitespace-nowrap flex items-center justify-center gap-2 transition-all duration-300 rounded-lg focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-300/50'
                    : 'text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                <tab.icon className="w-5 h-5" /> <span className="hidden sm:inline">{tab.label}</span>
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
              showToolbox={showToolbox}
              sensors={sensors}
              onMobileToolboxOpen={() => setMobileToolboxOpen(true)}
            />
          )}
          {activeTab === 'preview' && <PreviewTab form={form} />} {/* RENDER NEW PREVIEW TAB */}
          {activeTab === 'ai' && <AITab onAIGenerated={handleAIGenerated} />}
          {activeTab === 'settings' && <SettingsTab form={form} onUpdate={updateForm} />}
        </div>
      </main>

      {/* --- Mobile Toolbox (Fixed and Enhanced) --- */}
      <MobileToolbox
        onAddSection={() => {}} 
        onAddField={() => {}}
        isOpen={mobileToolboxOpen}
        onClose={() => setMobileToolboxOpen(false)}
      />
      
      {/* --- Mobile Floating Action Button (Only visible on mobile) --- */}
      <button
        onClick={() => setMobileToolboxOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-5 rounded-full shadow-2xl shadow-indigo-500/50 hover:scale-105 active:scale-95 transition-all duration-300 md:hidden z-40"
        aria-label="Open Toolbox"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
