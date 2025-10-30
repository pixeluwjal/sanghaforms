import { useState } from "react";
import { LinkIcon, Target, MessageSquare, UsersIcon, Smartphone, Copy, CheckCheck, Loader2, Plus, Trash2 } from "lucide-react";
import { Form, FormSettings, SlugStatus, ConditionalGroupLink } from "../types";
import ToggleSwitch from "./ToggleSwitch";
import toast from "react-hot-toast";

interface FormAccessSectionProps {
  settings: FormSettings;
  form: Form;
  appOrigin: string;
  baseFormPath: string;
  slugStatus: SlugStatus;
  onUpdate: (updates: Partial<FormSettings>) => void;
  onSlugCheck: (slug: string) => void;
}

export default function FormAccessSection({
  settings,
  form,
  appOrigin,
  baseFormPath,
  slugStatus,
  onUpdate,
  onSlugCheck
}: FormAccessSectionProps) {
  const [copiedLink, setCopiedLink] = useState("");

  // Get all available form fields for dropdown - FIXED VERSION
// FIXED: Always use field.id for consistency
const getAllFormFields = () => {
  const fields: { id: string; label: string; type: string; options: string[] }[] = [];
  
  console.log('🔍 Form sections for field detection:', form.sections);
  
  form.sections?.forEach(section => {
    console.log('📋 Section:', section.title, 'Fields:', section.fields?.length);
    
    section.fields?.forEach(field => {
      console.log('🏷️ Field:', field.label, 'Type:', field.type, 'Options:', field.options);
      
      // Include dropdown, radio, and select fields
      if (field.type === 'dropdown' || field.type === 'radio' || field.type === 'select') {
        // 🎯 FIX: Always use field.id for consistency
        fields.push({
          id: field.id, // ✅ CHANGED: Use field.id only
          label: field.label,
          type: field.type,
          options: field.options || []
        });
      }
    });
  });
  
  console.log('✅ Available fields for conditions:', fields);
  return fields;
};

  const availableFields = getAllFormFields();

  const addConditionalLink = () => {
    const newLink: ConditionalGroupLink = {
      id: Date.now().toString(), // Unique ID for the rule
      fieldId: "",
      fieldValue: "",
      platform: "whatsapp", // Default to WhatsApp
      groupLink: ""
    };
    
    onUpdate({
      conditionalGroupLinks: [...(settings.conditionalGroupLinks || []), newLink]
    });
  };

  const updateConditionalLink = (index: number, updates: Partial<ConditionalGroupLink>) => {
    const updatedLinks = [...(settings.conditionalGroupLinks || [])];
    updatedLinks[index] = { ...updatedLinks[index], ...updates };
    onUpdate({ conditionalGroupLinks: updatedLinks });
  };

  const removeConditionalLink = (index: number) => {
    const updatedLinks = [...(settings.conditionalGroupLinks || [])];
    updatedLinks.splice(index, 1);
    onUpdate({ conditionalGroupLinks: updatedLinks });
  };

  const getSelectedFieldOptions = (fieldId: string) => {
    if (!fieldId) return [];
    
    const field = availableFields.find(f => f.id === fieldId);
    console.log('🔍 Getting options for field:', fieldId, 'Found:', field);
    
    return field?.options || [];
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedLink(type);
      toast.success("Link copied! 🔗");
      setTimeout(() => setCopiedLink(""), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    onUpdate({ customSlug: newSlug });
  };

  const generateSlugFromTitle = () => {
    if (!form.title) return;
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    onUpdate({ customSlug: slug });
  };

  const currentSlug = settings.enableCustomSlug && settings.customSlug
    ? settings.customSlug
    : form._id;
  const currentFormUrl = `${appOrigin}${baseFormPath}${currentSlug}`;

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 max-h-[80vh] flex flex-col">
      {/* Header - Fixed */}
      <header className="flex items-center gap-4 pb-4 border-b border-slate-100 flex-shrink-0">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg">
          <LinkIcon className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Form Access</h3>
          <p className="text-xs sm:text-sm text-slate-500">Configure your public URL and links</p>
        </div>
      </header>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto space-y-6 py-4 custom-scrollbar">
        {/* Current Live URL */}
        <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-indigo-50/70 rounded-2xl border-2 border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide mb-1">Public Form Link</p>
            <p className="text-sm sm:text-base font-mono break-all text-purple-900 font-medium">{currentFormUrl}</p>
          </div>
          <button
            onClick={() => copyToClipboard(currentFormUrl, "main")}
            className={`p-2 sm:p-3 rounded-xl transition-all duration-300 flex-shrink-0 shadow-lg ${
              copiedLink === "main" ? "bg-green-500 text-white scale-110" : "bg-white text-purple-600 hover:bg-purple-50 border border-purple-200 hover:scale-105"
            }`}
          >
            {copiedLink === "main" ? <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

        {/* Custom Slug */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label id="custom-slug-label" className="font-semibold text-slate-700 text-base sm:text-lg flex items-center gap-3">
              <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> Custom URL Slug
            </label>
            <ToggleSwitch checked={settings.enableCustomSlug} onChange={(val) => onUpdate({ enableCustomSlug: val })} labelId="custom-slug-label" />
          </div>
          
          {settings.enableCustomSlug && (
            <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border-2 border-slate-200 space-y-4">
              <label className="block text-sm font-bold text-slate-700">Set Custom Slug</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={settings.customSlug ?? ""}
                    onChange={handleSlugChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm font-medium"
                    placeholder="my-special-event"
                  />
                </div>
                <button onClick={generateSlugFromTitle} className="px-3 sm:px-4 py-2 sm:py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-900 text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  <span className="hidden sm:inline">Auto-Generate</span>
                </button>
              </div>
              {settings.customSlug && (
                <div className={`text-sm font-semibold flex items-center gap-2 ${
                  slugStatus.available === true ? "text-green-600" : slugStatus.available === false ? "text-red-600" : "text-purple-600"
                }`}>
                  {slugStatus.checking && <Loader2 className="w-4 h-4 animate-spin" />}
                  {slugStatus.message}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Community Links */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <label id="show-groups-label" className="font-semibold text-slate-700 text-base sm:text-lg flex items-center gap-3">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /> Community Links
            </label>
            <ToggleSwitch checked={settings.showGroupLinks} onChange={(val) => onUpdate({ showGroupLinks: val })} labelId="show-groups-label" />
          </div>
          
          {settings.showGroupLinks && (
            <div className="space-y-6">
              {/* Default Links */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-indigo-50/70 rounded-2xl border-2 border-purple-200 space-y-4">
                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-600" />
                  Default Group Links
                </h4>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Default WhatsApp Group</label>
                  <input
                    type="text"
                    value={settings.whatsappGroupLink}
                    onChange={(e) => onUpdate({ whatsappGroupLink: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
                    placeholder="https://chat.whatsapp.com/invitecode"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Default Arratai Group</label>
                  <input
                    type="text"
                    value={settings.arrataiGroupLink}
                    onChange={(e) => onUpdate({ arrataiGroupLink: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
                    placeholder="https://arratai-group.com/join"
                  />
                </div>
              </div>

              {/* Conditional Links */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-orange-50 to-amber-50/70 rounded-2xl border-2 border-orange-200 space-y-4">
                <div className="flex items-center justify-between">
                  <label id="conditional-links-label" className="font-semibold text-slate-700 text-base flex items-center gap-3">
                    <UsersIcon className="w-5 h-5 text-orange-600" /> Conditional Group Links
                  </label>
                  <ToggleSwitch 
                    checked={settings.enableConditionalLinks} 
                    onChange={(val) => onUpdate({ enableConditionalLinks: val })} 
                    labelId="conditional-links-label" 
                  />
                </div>

                {settings.enableConditionalLinks && (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Show different group links based on form field values
                    </p>

                    {/* Available Fields Info */}
                    {availableFields.length > 0 ? (
                      <div className="bg-white/50 p-3 rounded-lg border border-orange-200">
                        <p className="text-xs font-semibold text-orange-700 mb-2">Available Fields for Conditions:</p>
                        <div className="space-y-1">
                          {availableFields.map(field => (
                            <div key={field.id} className="text-xs text-slate-600 flex items-center gap-2">
                              <span className="font-medium">"{field.label}"</span>
                              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">({field.type})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-700">
                          No dropdown or radio fields found in your form. Add some to use conditional links.
                        </p>
                      </div>
                    )}

                    {/* Conditional Links List - Scrollable */}
                    <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                      {(settings.conditionalGroupLinks || []).map((link, index) => (
                        <div key={link.id || index} className="bg-white p-4 rounded-xl border-2 border-orange-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <h5 className="font-semibold text-slate-700 text-sm">Condition #{index + 1}</h5>
                            <button
                              onClick={() => removeConditionalLink(index)}
                              className="p-1 text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Field Selection */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">When this field is:</label>
                            <select
                              value={link.fieldId}
                              onChange={(e) => updateConditionalLink(index, { fieldId: e.target.value })}
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                            >
                              <option value="">Select a field</option>
                              {availableFields.map(field => (
                                <option key={field.id} value={field.id}>
                                  {field.label} ({field.type})
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Field Value */}
                          {link.fieldId && (
                            <div>
                              <label className="block text-xs font-semibold text-slate-700 mb-1">Has this value:</label>
                              <select
                                value={link.fieldValue}
                                onChange={(e) => updateConditionalLink(index, { fieldValue: e.target.value })}
                                className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                              >
                                <option value="">Select value</option>
                                {getSelectedFieldOptions(link.fieldId).map((option, optIndex) => (
                                  <option key={optIndex} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Platform Selection - WhatsApp OR Arratai */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">Show this group link:</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`platform-${index}`}
                                  value="whatsapp"
                                  checked={link.platform === 'whatsapp'}
                                  onChange={(e) => updateConditionalLink(index, { platform: 'whatsapp' })}
                                  className="text-orange-500 focus:ring-orange-500"
                                />
                                <MessageSquare className="w-4 h-4 text-green-600" />
                                <span className="text-sm">WhatsApp</span>
                              </label>
                              <label className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name={`platform-${index}`}
                                  value="arratai"
                                  checked={link.platform === 'arratai'}
                                  onChange={(e) => updateConditionalLink(index, { platform: 'arratai' })}
                                  className="text-orange-500 focus:ring-orange-500"
                                />
                                <UsersIcon className="w-4 h-4 text-orange-600" />
                                <span className="text-sm">Arratai</span>
                              </label>
                            </div>
                          </div>

                          {/* Group Link */}
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              {link.platform === 'whatsapp' ? 'WhatsApp' : 'Arratai'} Group Link:
                            </label>
                            <input
                              type="text"
                              value={link.groupLink}
                              onChange={(e) => updateConditionalLink(index, { groupLink: e.target.value })}
                              className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm"
                              placeholder={link.platform === 'whatsapp' 
                                ? "https://chat.whatsapp.com/invitecode" 
                                : "https://arratai-group.com/join"
                              }
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add New Condition Button */}
                    <button
                      onClick={addConditionalLink}
                      className="w-full p-3 border-2 border-dashed border-orange-300 rounded-xl text-orange-600 hover:bg-orange-50 transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="text-sm font-semibold">Add Condition</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </section>
  );
}