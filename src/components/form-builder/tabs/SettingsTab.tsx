'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Settings, Users as UsersIcon, Link as LinkIcon, Copy, CheckCheck, 
  Target, Shield, Zap, Rocket, X, AlertTriangle, MessageSquare, Smartphone,
  Heart, Award, Loader2, Palette, Eye
} from 'lucide-react';
import toast from 'react-hot-toast';
import { debounce } from 'lodash';

import { Form, FormSettings } from '../shared/types';

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

// Color picker component
const ColorPicker = ({ color, onChange, label }: { color: string; onChange: (color: string) => void; label: string }) => (
  <div className="flex items-center gap-3">
    <label className="text-sm font-medium text-slate-700 min-w-[120px]">{label}</label>
    <div className="flex items-center gap-2 flex-1">
      <input
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-12 cursor-pointer rounded-lg border border-slate-300"
      />
      <input
        type="text"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono"
        placeholder="#000000"
      />
    </div>
  </div>
);

export default function SettingsTab({ form, onUpdate }: SettingsTabProps) {
  const [settings, setSettings] = useState<FormSettings>(form.settings || {
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
  });

  const [theme, setTheme] = useState(form.theme || {
    primaryColor: '#7C3AED',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    fontFamily: 'Inter'
  });

  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null as boolean | null, message: '' });
  const [copiedLink, setCopiedLink] = useState('');
  const [previewTheme, setPreviewTheme] = useState(false);
  
  const appOrigin = getAppOrigin();

  // Real slug availability check
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
          message: data.message || (data.available ? 'Slug is available!' : 'Slug is already taken'),
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
    if (settings.enableCustomSlug && settings.customSlug) {
      debouncedCheckSlug(settings.customSlug);
    } else {
      setSlugStatus({ checking: false, available: null, message: '' });
    }
  }, [settings.customSlug, settings.enableCustomSlug, debouncedCheckSlug]);

  // Sync state on external form change
  useEffect(() => {
    setSettings(prev => ({ ...prev, isActive: form.status === 'published' }));
  }, [form.status]);

  const updateSettings = (updates: Partial<FormSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    onUpdate({ settings: newSettings });
  };

  const updateTheme = (updates: Partial<typeof theme>) => {
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
    await navigator.clipboard.writeText(text); 
    setCopiedLink(type);
    toast.success('Link copied!');
    setTimeout(() => setCopiedLink(''), 2000);
  };

  // Validate domain format
  const isValidDomain = (domain: string) => {
    if (!domain) return false;
    // Basic domain validation - should contain a dot and valid characters
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*$/;
    return domainRegex.test(domain) && domain.includes('.');
  };

  // Dynamic Save/Publish/Update Handler
// Dynamic Save/Publish/Update Handler
const handleSaveChanges = async (newStatus: 'published' | 'draft') => {
  // Domain validation for group links
  if (settings.showGroupLinks) {
    if (settings.whatsappGroupLink && !isValidDomain(settings.whatsappGroupLink)) {
      toast.error('Please enter a valid WhatsApp group domain (e.g., chat.whatsapp.com)');
      return;
    }
    if (settings.arrataiGroupLink && !isValidDomain(settings.arrataiGroupLink)) {
      toast.error('Please enter a valid Arratai group domain');
      return;
    }
  }

  // Slug validation logic for publishing
  if (newStatus === 'published' && settings.enableCustomSlug) {
    if (!settings.customSlug || settings.customSlug.length < 3) {
      toast.error('Custom slug must be at least 3 characters.');
      return;
    }
    if (slugStatus.available === false) {
      toast.error('The chosen slug is not available.');
      return;
    }
    if (slugStatus.checking) {
      toast.error('Please wait for slug availability check to finish.');
      return;
    }
  }

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

  try {
    const response = await fetch('/api/forms/update-settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save changes');
    }

    if (newStatus === 'published' && form.status === 'draft') {
      toast.success('Form published successfully! 🚀');
    } else if (newStatus === 'published' && form.status === 'published') {
      toast.success('Settings updated!');
    } else {
      toast.success('Form unpublished successfully');
    }
    
    // Update the local state with the response
    onUpdate({ 
      status: newStatus, 
      settings: data.form.settings, 
      theme: data.form.theme 
    });

  } catch (error: any) {
    console.error('Save error:', error);
    toast.error(error.message || 'Failed to save changes.');
  }
};

  const currentSlug = settings.enableCustomSlug && settings.customSlug 
    ? settings.customSlug 
    : form._id; 
    
  const currentFormUrl = `${appOrigin}${BASE_FORM_PATH}${currentSlug}`;

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-8 pb-16">
      
      <div className="text-center">
        <div className="inline-block p-4 bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Settings className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '10s' }}/>
          </div>
        </div>
        <h2 className="mt-4 text-4xl font-bold text-slate-800">Form Settings</h2>
        <p className="mt-2 text-lg text-slate-600">Fine-tune your form's behavior and appearance.</p>
      </div>

      {/* --- LIVE STATUS BAR --- */}
      <div className={`p-5 rounded-xl text-center shadow-xl ${
        form.status === 'published' ? 'bg-green-100 border-2 border-green-400 text-green-800' : 'bg-yellow-100 border-2 border-yellow-400 text-yellow-800'
      }`}>
        <h4 className="font-extrabold text-xl flex items-center justify-center gap-2">
          {form.status === 'published' ? (
            <>
              <Rocket className="w-6 h-6"/> FORM IS LIVE & PUBLISHED
            </>
          ) : (
            <>
              <AlertTriangle className="w-6 h-6"/> FORM IS DRAFT
            </>
          )}
        </h4>
        <p className="mt-1 text-sm">{form.status === 'published' ? `URL is active: ${currentFormUrl}` : 'The form is not currently visible to the public.'}</p>
      </div>

      {/* --- THEME CUSTOMIZATION SECTION --- */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
              <Palette className="w-6 h-6 text-purple-600"/>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Theme Customization</h3>
              <p className="text-slate-500">Customize the appearance of your form</p>
            </div>
          </div>
          <button
            onClick={() => setPreviewTheme(!previewTheme)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <Eye className="w-4 h-4"/>
            {previewTheme ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>

        {previewTheme && (
          <div className="p-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <div className="text-center mb-4">
              <h4 className="font-bold text-slate-700">Theme Preview</h4>
              <p className="text-sm text-slate-500">This shows how your form will look</p>
            </div>
            <div 
              className="p-6 rounded-lg border-2 border-slate-200 shadow-inner"
              style={{ 
                backgroundColor: theme.backgroundColor,
                color: theme.textColor 
              }}
            >
              <div className="space-y-4">
                <button 
                  className="px-6 py-3 rounded-lg font-semibold transition-transform hover:scale-105"
                  style={{ backgroundColor: theme.primaryColor, color: 'white' }}
                >
                  Sample Button
                </button>
                <p className="text-lg font-medium">Sample Form Text</p>
                <div className="p-4 rounded border" style={{ borderColor: theme.primaryColor + '40' }}>
                  <p className="text-sm">Sample form field</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4">
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
          
          {/* Font Family Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 min-w-[120px]">Font Family</label>
            <select
              value={theme.fontFamily}
              onChange={(e) => updateTheme({ fontFamily: e.target.value })}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Poppins">Poppins</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Lato">Lato</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- URL & LINKS SECTION --- */}
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 mb-6 border-b pb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
            <LinkIcon className="w-6 h-6 text-emerald-600"/>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">URL & Community Links</h3>
            <p className="text-slate-500">Set a custom URL and submission redirect options.</p>
          </div>
        </div>
        
        {/* Current Live URL Display */}
        <div className="p-4 bg-indigo-50/70 rounded-lg border border-indigo-200 flex items-center justify-between gap-3 shadow-inner">
          <div className='flex-1 min-w-0'>
            <p className='text-xs font-semibold text-indigo-700 uppercase'>Current Link</p>
            <p className='text-base font-mono truncate text-indigo-900 break-all'>{currentFormUrl}</p>
          </div>
          <button 
            onClick={() => copyToClipboard(currentFormUrl, 'main')} 
            className={`p-2 rounded-full transition-all duration-200 flex-shrink-0 ${copiedLink === 'main' ? 'bg-green-500 text-white' : 'bg-white text-indigo-600 hover:bg-slate-100'}`}
          >
            {copiedLink === 'main' ? <CheckCheck className='w-5 h-5'/> : <Copy className='w-5 h-5'/>}
          </button>
        </div>

        {/* Custom Slug Toggle & Input */}
        <div className="space-y-5">
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <label id="custom-slug-label" className="font-semibold text-slate-700">Enable Custom URL Slug</label>
            <ToggleSwitch checked={settings.enableCustomSlug} onChange={(val) => updateSettings({ enableCustomSlug: val })} labelId="custom-slug-label"/>
          </div>
          {settings.enableCustomSlug && (
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
              <label className="block text-sm font-bold text-slate-700">Custom Slug</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center bg-white border-slate-200 border rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 transition px-3">
                  <span className="text-slate-400 text-sm hidden sm:inline-block break-words">{`${appOrigin}${BASE_FORM_PATH}`}</span>
                  <input 
                    type="text" 
                    value={settings.customSlug ?? ''} 
                    onChange={(e) => updateSettings({ customSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="flex-1 bg-transparent p-2 text-sm focus:outline-none placeholder:text-slate-400" 
                    placeholder="event-registration" 
                  />
                </div>
                <button 
                  onClick={generateSlugFromTitle} 
                  className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 text-sm font-semibold transition flex-shrink-0 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4"/> Generate from Title
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
        
        {/* --- COMMUNITY LINKS SECTION --- */}
        <div className="pt-6 border-t border-slate-200 space-y-5">
          <div className="flex items-center justify-between">
            <label id="show-groups-label" className="font-semibold text-slate-700 flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600"/> Show Group Join Links on Submission
            </label>
            <ToggleSwitch checked={settings.showGroupLinks} onChange={(val) => updateSettings({ showGroupLinks: val })} labelId="show-groups-label"/>
          </div>

          {settings.showGroupLinks && (
            <div className="p-4 bg-indigo-50/70 rounded-lg border border-indigo-200 space-y-4">
              {/* WhatsApp Link Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-green-600"/> WhatsApp Group Domain
                </label>
                <input 
                  type="text" 
                  value={settings.whatsappGroupLink} 
                  onChange={(e) => updateSettings({ whatsappGroupLink: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-slate-300 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm transition" 
                  placeholder="chat.whatsapp.com" 
                />
                <p className="text-xs text-slate-500 mt-1">Enter only the domain (e.g., chat.whatsapp.com)</p>
              </div>

              {/* Arratai Link Input */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-orange-600"/> Arratai Group Domain
                </label>
                <input 
                  type="text" 
                  value={settings.arrataiGroupLink} 
                  onChange={(e) => updateSettings({ arrataiGroupLink: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-slate-300 border rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm transition" 
                  placeholder="arratai-group.com" 
                />
                <p className="text-xs text-slate-500 mt-1">Enter only the domain</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- PUBLISH / UPDATE / UNPUBLISH BAR --- */}
      <div className="p-6 bg-white/80 backdrop-blur-lg rounded-2xl border-2 border-slate-200 shadow-xl mt-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className='flex-1'>
            <h4 className="font-extrabold text-xl text-slate-800">
              {form.status === 'published' ? 'Manage Publication Status' : 'Final Step: Go Live!'}
            </h4>
            <p className="text-sm text-slate-500">
              {form.status === 'published' ? 'Save changes to settings or take the form offline.' : 'Publish your form to make it accessible via the link above.'}
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {form.status === 'published' ? (
              <>
                <button 
                  onClick={() => handleSaveChanges('draft')} 
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-bold transition w-full sm:w-auto"
                >
                  Unpublish
                </button>
                <button 
                  onClick={() => handleSaveChanges('published')} 
                  className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-300/50 text-base font-bold transition w-full sm:w-auto"
                >
                  Update Settings
                </button>
              </>
            ) : (
              <button 
                onClick={() => handleSaveChanges('published')} 
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg shadow-xl shadow-green-300/50 hover:shadow-2xl text-base font-bold transition w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Rocket className="w-5 h-5"/> Publish Form Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}