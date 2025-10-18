'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Users as UsersIcon, Link as LinkIcon, Copy, CheckCheck, 
  Target, Shield, Zap, Rocket, X, AlertTriangle, MessageSquare, Smartphone,
  Heart, Award, Loader2, Palette, Eye, Layout
} from 'lucide-react';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

// Mock types for demonstration - replace with your actual imports
type FormSettings = {
  userType: string;
  validityDuration: number;
  maxResponses: number;
  allowMultipleResponses: boolean;
  enableProgressSave: boolean;
  collectEmail: boolean;
  customSlug: string;
  enableCustomSlug: boolean;
  isActive: boolean;
  previousSlugs: string[];
  whatsappGroupLink: string;
  arrataiGroupLink: string;
  showGroupLinks: boolean;
};

type Theme = {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

type Form = {
  _id: string;
  title: string;
  status: 'draft' | 'published';
  settings: FormSettings;
  theme: Theme;
};

interface SettingsTabProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => void;
}

// Global path constant for the form access route
const BASE_FORM_PATH = '/forms/'; 

// Modern Toggle Switch Component
const ToggleSwitch = ({ checked, onChange, labelId }: { checked: boolean, onChange: (checked: boolean) => void, labelId: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-labelledby={labelId}
    onClick={() => onChange(!checked)}
    className={`${
      checked ? 'bg-indigo-600' : 'bg-slate-300'
    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
  >
    <span
      aria-hidden="true"
      className={`${
        checked ? 'translate-x-5' : 'translate-x-0'
      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
    />
  </button>
);

// Function to safely get app origin
const getAppOrigin = () => {
  return typeof window !== 'undefined' ? window.location.origin : '';
};

// Color picker component - Mobile responsive
const ColorPicker = ({ color, onChange, label }: { color: string; onChange: (color: string) => void; label: string }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
    <label className="text-sm font-medium text-slate-700 sm:min-w-[120px]">{label}</label>
    <div className="flex items-center gap-2 flex-1">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 cursor-pointer rounded-xl border-4 border-white shadow-lg transition-all duration-150 hover:scale-105"
      />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono min-w-0 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        placeholder="#000000"
      />
    </div>
  </div>
);

// Status Indicator Component
const StatusIndicator = ({ status, message }: { status: 'idle' | 'loading' | 'success' | 'error', message: string }) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'loading':
        return { color: 'text-blue-600 bg-blue-50 border-blue-200', icon: <Loader2 className="w-4 h-4 animate-spin" /> };
      case 'success':
        return { color: 'text-green-600 bg-green-50 border-green-200', icon: <CheckCheck className="w-4 h-4" /> };
      case 'error':
        return { color: 'text-red-600 bg-red-50 border-red-200', icon: <AlertTriangle className="w-4 h-4" /> };
      default:
        return { color: 'text-slate-600 bg-slate-50 border-slate-200', icon: null };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${config.color} transition-all duration-300 shadow-md`}>
      {config.icon}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default function SettingsTab({ form, onUpdate }: SettingsTabProps) {
  const defaultSettings: FormSettings = {
    userType: 'swayamsevak',
    validityDuration: 10080,
    maxResponses: 0,
    allowMultipleResponses: false,
    enableProgressSave: true,
    collectEmail: true,
    customSlug: '',
    enableCustomSlug: false,
    isActive: form.status === 'published',
    previousSlugs: [],
    whatsappGroupLink: '',
    arrataiGroupLink: '',
    showGroupLinks: false,
  };

  const defaultTheme: Theme = {
    primaryColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter'
  };

  const [settings, setSettings] = useState<FormSettings>(form.settings || defaultSettings);
  const [theme, setTheme] = useState<Theme>(form.theme || defaultTheme);
  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null as boolean | null, message: '' });
  const [copiedLink, setCopiedLink] = useState('');
  const [previewTheme, setPreviewTheme] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const appOrigin = getAppOrigin();

  // Real slug availability check
  const debouncedCheckSlug = useCallback(
    debounce(async (slug: string) => {
      if (!slug) {
        setSlugStatus({ checking: false, available: null, message: '' });
        return;
      }

      // Basic validation
      if (slug.length < 3) {
        setSlugStatus({ checking: false, available: false, message: 'Slug must be at least 3 characters' });
        return;
      }

      if (!/^[a-z0-9-]+$/.test(slug)) {
        setSlugStatus({ checking: false, available: false, message: 'Only lowercase letters, numbers, and hyphens allowed' });
        return;
      }

      setSlugStatus({ checking: true, available: null, message: 'Checking availability...' });

      try {
        const response = await fetch(`/api/forms/check-slug?slug=${encodeURIComponent(slug)}&formId=${form._id}`);
        const data = await response.json();

        if (response.ok) {
          setSlugStatus({
            checking: false,
            available: data.available,
            message: data.message || (data.available ? 'Slug is available! 🎉' : 'Slug is already taken 😔'),
          });
        } else {
          throw new Error(data.error || 'Failed to check slug');
        }
      } catch (error) {
        console.error('Error checking slug:', error);
        setSlugStatus({ 
          checking: false, 
          available: false, 
          message: 'Error checking slug availability' 
        });
      }
    }, 800),
    [form._id]
  );

  useEffect(() => {
    return () => debouncedCheckSlug.cancel();
  }, [debouncedCheckSlug]);

  useEffect(() => {
    if (settings.enableCustomSlug && settings.customSlug) {
      if (settings.customSlug !== form.settings?.customSlug) {
        debouncedCheckSlug(settings.customSlug);
      }
    } else {
      setSlugStatus({ checking: false, available: null, message: '' });
    }
  }, [settings.customSlug, settings.enableCustomSlug, debouncedCheckSlug, form.settings?.customSlug]);

  useEffect(() => {
    setSettings(prev => ({ ...prev, isActive: form.status === 'published' }));
  }, [form.status]);

  const updateSettings = (updates: Partial<FormSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onUpdate({ settings: newSettings });
  };

  const updateTheme = (updates: Partial<Theme>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    onUpdate({ theme: newTheme });
  };

  const generateSlugFromTitle = () => {
    if (!form.title) return;
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    updateSettings({ customSlug: slug });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text); 
      setCopiedLink(type);
      toast.success('Link copied! 🔗');
      setTimeout(() => setCopiedLink(''), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  // FIXED: Dynamic Save/Publish/Update Handler - NO DOMAIN VALIDATION
  const handleSaveChanges = async (newStatus: 'published' | 'draft') => {
    console.log('🚀 PUBLISH BUTTON CLICKED!', { newStatus, currentStatus: form.status });
    
    setSaveStatus('loading');
    
    if (newStatus === 'published' && form.status === 'draft') {
      setStatusMessage('Publishing form... 🚀');
    } else if (newStatus === 'published' && form.status === 'published') {
      setStatusMessage('Updating settings...');
    } else {
      setStatusMessage('Unpublishing form...');
    }

    // REMOVED DOMAIN VALIDATION - Group links are optional

    // Slug validation for publishing
    if (newStatus === 'published' && settings.enableCustomSlug) {
      if (!settings.customSlug || settings.customSlug.length < 3) {
        setSaveStatus('error');
        setStatusMessage('Custom Slug too short');
        toast.error('Custom slug must be at least 3 characters.');
        setTimeout(() => setSaveStatus('idle'), 3000);
        return;
      }
      if (settings.customSlug !== form.settings?.customSlug) {
        if (slugStatus.checking) {
          setSaveStatus('error');
          setStatusMessage('Please wait for slug check');
          toast.error('Please wait for slug availability check to finish.');
          setTimeout(() => setSaveStatus('idle'), 3000);
          return;
        }
        if (slugStatus.available === false) {
          setSaveStatus('error');
          setStatusMessage('Slug is not available');
          toast.error('The chosen slug is not available.');
          setTimeout(() => setSaveStatus('idle'), 3000);
          return;
        }
      }
    }

    // Prepare payload
    const payload = {
      formId: form._id,
      status: newStatus,
      settings: {
        ...settings,
        isActive: newStatus === 'published',
        customSlug: settings.enableCustomSlug ? settings.customSlug : undefined,
      },
      theme: theme,
    };

    console.log('📦 Sending payload:', payload);

    try {
      setStatusMessage('Saving to server...');
      
      const response = await fetch('/api/forms/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('📡 API Response status:', response.status);

      const data = await response.json();
      console.log('📡 API Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // SUCCESS
      setSaveStatus('success');
      
      if (newStatus === 'published' && form.status === 'draft') {
        setStatusMessage('Form published successfully! 🎉');
        toast.success('Form published successfully! 🚀');
      } else if (newStatus === 'published' && form.status === 'published') {
        setStatusMessage('Settings updated successfully! ✅');
        toast.success('Settings updated!');
      } else {
        setStatusMessage('Form unpublished successfully');
        toast.success('Form unpublished successfully');
      }
      
      // Update parent component
      onUpdate({ 
        status: newStatus, 
        settings: data.form?.settings || payload.settings, 
        theme: data.form?.theme || payload.theme 
      });

      // Reset status after success
      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 3000);

    } catch (error: any) {
      console.error('❌ Save error:', error);
      setSaveStatus('error');
      setStatusMessage(error.message || 'Failed to save changes');
      toast.error(error.message || 'Failed to save changes. Please try again.');
      
      // Reset error status
      setTimeout(() => {
        setSaveStatus('idle');
        setStatusMessage('');
      }, 5000);
    }
  };

  const currentSlug = settings.enableCustomSlug && settings.customSlug 
    ? settings.customSlug 
    : form._id; 
    
  const currentFormUrl = `${appOrigin}${BASE_FORM_PATH}${currentSlug}`;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 space-y-6 sm:space-y-8 pb-8 sm:pb-16 font-sans">
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-block p-4 bg-indigo-50/50 backdrop-blur-sm rounded-3xl shadow-2xl border border-indigo-100">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-purple-700 rounded-xl flex items-center justify-center shadow-2xl shadow-indigo-500/50">
            <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-pulse" style={{ animationDuration: '4s' }}/>
          </div>
        </div>
        <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">Form Configuration</h2>
        <p className="mt-2 text-base sm:text-lg text-slate-500">Customize the URL, Theme, and Behavior of your form.</p>
      </div>

      {/* Status Indicator */}
      {saveStatus !== 'idle' && (
        <div className="animate-in slide-in-from-top duration-300">
          <StatusIndicator status={saveStatus} message={statusMessage} />
        </div>
      )}

      {/* Live Status Bar */}
      <div className={`p-4 sm:p-5 rounded-2xl text-center shadow-xl transition-all duration-500 ${
        form.status === 'published' ? 'bg-green-50 border-2 border-green-300 text-green-800' : 'bg-yellow-50 border-2 border-yellow-300 text-yellow-800'
      }`}>
        <h4 className="font-extrabold text-lg sm:text-xl flex items-center justify-center gap-2 flex-wrap">
          {form.status === 'published' ? (
            <>
              <Rocket className="w-6 h-6 sm:w-7 sm:h-7"/> FORM IS LIVE
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7"/> FORM IS DRAFT
            </>
          )}
        </h4>
        <p className="mt-1 text-xs sm:text-sm font-mono break-all text-slate-600/90">
          {form.status === 'published' ? `URL: ${currentFormUrl}` : 'The form is not currently visible to the public.'}
        </p>
      </div>

      {/* Theme Customization Section */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shadow-md">
              <Palette className="w-6 h-6 text-purple-600"/>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Theme Customization</h3>
              <p className="text-sm text-slate-500">Set the look and feel of your form.</p>
            </div>
          </div>
          <button
            onClick={() => setPreviewTheme(!previewTheme)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition text-sm font-medium text-indigo-700 shadow-inner w-full sm:w-auto justify-center"
          >
            <Eye className="w-4 h-4"/>
            {previewTheme ? 'Hide Live Preview' : 'Show Live Preview'}
          </button>
        </header>

        {previewTheme && (
          <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-indigo-200 animate-in fade-in duration-300">
            <div className="text-center mb-4">
              <h4 className="font-extrabold text-slate-700 text-lg flex items-center justify-center gap-2">
                <Layout className='w-5 h-5'/> Live Theme Preview
              </h4>
            </div>
            <div 
              className="p-5 sm:p-8 rounded-xl border-2 border-slate-200 shadow-xl"
              style={{ 
                backgroundColor: theme.backgroundColor,
                color: theme.textColor,
                fontFamily: theme.fontFamily 
              }}
            >
              <div className="space-y-4">
                <h5 className='text-2xl font-bold'>Form Title Sample</h5>
                <button 
                  className="px-5 py-2.5 rounded-xl font-bold transition-transform hover:scale-[1.02] text-base shadow-lg"
                  style={{ backgroundColor: theme.primaryColor, color: 'white' }}
                >
                  Submit Response
                </button>
                <div className="p-4 rounded-lg border text-sm" style={{ borderColor: theme.primaryColor + '60' }}>
                  <p className='font-medium'>This is a sample field container.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-x-6 gap-y-5">
          <ColorPicker
            label="Primary Color"
            color={theme.primaryColor}
            onChange={(color) => updateTheme({ primaryColor: color })}
          />
          <ColorPicker
            label="Background Color"
            color={theme.backgroundColor}
            onChange={(color) => updateTheme({ backgroundColor: color })}
          />
          <ColorPicker
            label="Text Color"
            color={theme.textColor}
            onChange={(color) => updateTheme({ textColor: color })}
          />
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="text-sm font-medium text-slate-700 sm:min-w-[120px]">Font Family</label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white shadow-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Inter">Inter (Default)</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Lato">Lato</option>
            </select>
          </div>
        </div>
      </section>

      {/* URL & Links Section */}
      <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
        <header className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-100 to-green-100 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
            <LinkIcon className="w-6 h-6 text-teal-600"/>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Form Access & URL</h3>
            <p className="text-sm text-slate-500">Configure your public link and redirect options.</p>
          </div>
        </header>
        
        {/* Current Live URL Display */}
        <div className="p-4 sm:p-5 bg-indigo-50/70 rounded-xl border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-semibold text-indigo-700 uppercase'>Public Form Link</p>
            <p className='text-sm sm:text-base font-mono break-all text-indigo-900 font-medium'>{currentFormUrl}</p>
          </div>
          <button 
            onClick={() => copyToClipboard(currentFormUrl, 'main')} 
            className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
              copiedLink === 'main' ? 'bg-green-500 text-white' : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-300'
            } self-end sm:self-auto shadow-md`}
          >
            {copiedLink === 'main' ? <CheckCheck className='w-5 h-5'/> : <Copy className='w-5 h-5'/>}
          </button>
        </div>

        {/* Custom Slug Section */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label id="custom-slug-label" className="font-semibold text-slate-700 text-base flex items-center gap-2">
              <Zap className='w-5 h-5 text-indigo-500'/> Custom URL Slug
            </label>
            <ToggleSwitch 
              checked={settings.enableCustomSlug} 
              onChange={(val) => updateSettings({ enableCustomSlug: val })} 
              labelId="custom-slug-label"
            />
          </div>
          <p className='text-xs text-slate-500'>Enable a memorable, human-readable URL instead of the default ID.</p>
          
          {settings.enableCustomSlug && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-in fade-in duration-300">
              <label className="block text-sm font-bold text-slate-700">Set Custom Slug</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center bg-white border-slate-300 border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition px-3 shadow-sm">
                  <span className="text-slate-400 text-sm hidden lg:inline-block break-all mr-1">{`${appOrigin}${BASE_FORM_PATH}`}</span>
                  <input 
                    type="text" 
                    value={settings.customSlug ?? ''} 
                    onChange={(e) => updateSettings({ customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="flex-1 bg-transparent p-2 text-sm focus:outline-none placeholder:text-slate-400 min-w-0" 
                    placeholder="my-special-event" 
                  />
                </div>
                <button 
                  onClick={generateSlugFromTitle} 
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-semibold transition flex-shrink-0 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                >
                  <Target className="w-4 h-4"/> Auto-Generate
                </button>
              </div>
              {settings.customSlug && (
                <div className={`text-xs font-medium flex items-center gap-1 ${
                  slugStatus.available === true ? 'text-green-600' : 
                  slugStatus.available === false ? 'text-red-600' : 
                  'text-slate-600'
                }`}>
                  {slugStatus.checking ? <Loader2 className='w-4 h-4 animate-spin text-indigo-500'/> : null}
                  {slugStatus.message}
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Community Links Section */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <label id="show-groups-label" className="font-semibold text-slate-700 flex items-center gap-2 text-base">
              <Smartphone className="w-5 h-5 text-purple-600"/> Display Community Links
            </label>
            <ToggleSwitch 
              checked={settings.showGroupLinks} 
              onChange={(val) => updateSettings({ showGroupLinks: val })} 
              labelId="show-groups-label"
            />
          </div>
          <p className='text-xs text-slate-500'>Show links to WhatsApp/Arratai groups on the form completion page.</p>

          {settings.showGroupLinks && (
            <div className="p-4 bg-indigo-50/70 rounded-lg border border-indigo-200 space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600"/> WhatsApp Group Domain
                </label>
                <input 
                  type="text" 
                  value={settings.whatsappGroupLink} 
                  onChange={(e) => updateSettings({ whatsappGroupLink: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-slate-300 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm transition shadow-sm" 
                  placeholder="chat.whatsapp.com/invitecode" 
                />
                <p className="text-xs text-slate-500 mt-1">Enter only the domain/path (e.g., chat.whatsapp.com/invite)</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-orange-600"/> Arratai Group Domain
                </label>
                <input 
                  type="text" 
                  value={settings.arrataiGroupLink} 
                  onChange={(e) => updateSettings({ arrataiGroupLink: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-slate-300 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm transition shadow-sm" 
                  placeholder="arratai-group.com/join" 
                />
                <p className="text-xs text-slate-500 mt-1">Enter only the domain/path (e.g., arratai.org/group)</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* FIXED: Publish/Update/Unpublish Bar */}
      <section className="p-5 sm:p-7 bg-white rounded-3xl border-2 border-indigo-100 shadow-2xl mt-6 sm:mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className='flex-1 text-center sm:text-left'>
            <h4 className="font-extrabold text-xl text-slate-800">
              {form.status === 'published' ? 'Manage Publication' : 'Ready to Launch?'}
            </h4>
            <p className="text-sm text-slate-500 mt-1">
              {form.status === 'published' 
                ? 'Save your changes or unpublish the form to take it offline.' 
                : 'Publish your form to make it public and start collecting responses.'
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {form.status === 'published' ? (
              <>
                <button 
                  onClick={() => handleSaveChanges('draft')} 
                  disabled={saveStatus === 'loading'}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 disabled:opacity-50 text-sm font-bold transition w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg shadow-red-300/50"
                >
                  {saveStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4" />}
                  Unpublish
                </button>
                <button 
                  onClick={() => handleSaveChanges('published')} 
                  disabled={saveStatus === 'loading'}
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-xl hover:shadow-xl hover:shadow-indigo-300/60 disabled:opacity-50 text-sm font-bold transition w-full sm:w-auto flex items-center justify-center gap-2"
                >
                  {saveStatus === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                  {saveStatus === 'loading' ? 'Updating...' : 'Update Settings'}
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleSaveChanges('published')} 
                disabled={saveStatus === 'loading'}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl shadow-2xl shadow-green-300/60 hover:shadow-xl hover:shadow-teal-300/70 disabled:opacity-50 text-base font-bold transition w-full flex items-center justify-center gap-2"
              >
                {saveStatus === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <Rocket className="w-5 h-5"/>}
                {saveStatus === 'loading' ? 'Publishing...' : 'Publish Form Now'}
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}