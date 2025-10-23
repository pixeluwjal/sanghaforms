import { Tag, Loader2, CheckCheck } from "lucide-react";
import { FormSettings, Source } from "../types";

interface DefaultSourceSectionProps {
  settings: FormSettings;
  onUpdate: (updates: Partial<FormSettings>) => void;
  sources: Source[];
  loading: boolean;
}

export default function DefaultSourceSection({ 
  settings, 
  onUpdate, 
  sources, 
  loading 
}: DefaultSourceSectionProps) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
      <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center shadow-lg">
          <Tag className="w-7 h-7 text-teal-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Default Source</h3>
          <p className="text-sm text-slate-500">Set default source for form responses</p>
        </div>
      </header>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Tag className="w-4 h-4 text-purple-600" />
          Default Source
        </label>
        
        {loading ? (
          <div className="flex items-center gap-2 text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading sources...</span>
          </div>
        ) : (
          <div className="space-y-3">
            <select
              value={settings.defaultSource}
              onChange={(e) => onUpdate({ defaultSource: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
            >
              <option value="">Select a default source (optional)</option>
              {sources
                .filter(source => source.isActive)
                .sort((a, b) => a.order - b.order)
                .map((source) => (
                  <option key={source._id} value={source.name}>
                    {source.name}
                  </option>
                ))}
            </select>
            {settings.defaultSource && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                <div className="flex items-center gap-2 text-purple-700">
                  <CheckCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">Default source set to: {settings.defaultSource}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}