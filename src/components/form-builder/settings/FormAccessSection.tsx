import { useState } from "react";
import { LinkIcon, Target, MessageSquare, UsersIcon, Smartphone, Copy, CheckCheck, Loader2 } from "lucide-react";
import { Form, FormSettings, SlugStatus } from "../types";
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

  const generateSlugFromTitle = () => {
    if (!form.title) return;
    const slug = form.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    onUpdate({ customSlug: slug });
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

  const currentSlug = settings.enableCustomSlug && settings.customSlug
    ? settings.customSlug
    : form._id;
  const currentFormUrl = `${appOrigin}${baseFormPath}${currentSlug}`;

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-teal-100 to-green-100 rounded-2xl flex items-center justify-center shadow-lg">
          <LinkIcon className="w-6 h-6 sm:w-7 sm:h-7 text-teal-600" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Form Access</h3>
          <p className="text-xs sm:text-sm text-slate-500">Configure your public URL and links</p>
        </div>
      </header>

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
          <div className="p-4 sm:p-5 bg-gradient-to-br from-purple-50 to-indigo-50/70 rounded-2xl border-2 border-purple-200 space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" /> WhatsApp Group
              </label>
              <input
                type="text"
                value={settings.whatsappGroupLink}
                onChange={(e) => onUpdate({ whatsappGroupLink: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
                placeholder="https://chat.whatsapp.com/invitecode"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <UsersIcon className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" /> Arratai Group
              </label>
              <input
                type="text"
                value={settings.arrataiGroupLink}
                onChange={(e) => onUpdate({ arrataiGroupLink: e.target.value })}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
                placeholder="https://arratai-group.com/join"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}