import { Image, Eye } from "lucide-react";
import FaviconUpload from "./FaviconUpload";
import PageTitleEditor from "./PageTitleEditor";

interface PageBrandingSectionProps {
  form: Form;
  settings: FormSettings;
  onImagesUpdate: (images: any) => void;
  onPageTitleUpdate: (pageTitle: string) => void;
}

export default function PageBrandingSection({ 
  form, 
  settings, 
  onImagesUpdate, 
  onPageTitleUpdate 
}: PageBrandingSectionProps) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
      <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-14 h-14 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center shadow-lg">
          <Image className="w-7 h-7 text-orange-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Page Branding</h3>
          <p className="text-sm text-slate-500">Customize browser tab appearance</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Favicon Upload */}
        <FaviconUpload form={form} onUpdate={onImagesUpdate} />
        
        {/* Page Title Editor */}
        <PageTitleEditor 
          value={settings.pageTitle} 
          onChange={onPageTitleUpdate} 
        />
      </div>

      {/* Preview Section */}
      <div className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
        <h4 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-600" />
          Browser Tab Preview
        </h4>
        <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-300">
          {form.images?.favicon && (
            <img 
              src={form.images.favicon} 
              alt="Favicon" 
              className="w-6 h-6 rounded"
            />
          )}
          <span className="text-sm font-medium text-slate-700">
            {settings.pageTitle || form.title}
          </span>
        </div>
      </div>
    </section>
  );
}