import { useState } from "react";
import { Palette, Eye, Layout } from "lucide-react";
import ColorPicker from "./ColorPicker";

interface ThemeCustomizationProps {
  theme: Theme;
  onUpdate: (updates: Partial<Theme>) => void;
}

export default function ThemeCustomization({ theme, onUpdate }: ThemeCustomizationProps) {
  const [previewTheme, setPreviewTheme] = useState(false);

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg">
          <Palette className="w-6 h-6 sm:w-7 sm:h-7 text-purple-600" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Theme Design
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Customize the visual appearance
          </p>
        </div>
      </header>

      {/* Theme Preview */}
      {previewTheme && (
        <div className="p-4 sm:p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-purple-200 animate-in fade-in duration-500">
          <div className="text-center mb-4">
            <h4 className="font-bold text-slate-700 text-base sm:text-lg flex items-center justify-center gap-2">
              <Layout className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" /> Live Preview
            </h4>
          </div>
          <div
            className="p-4 sm:p-6 rounded-2xl border-2 border-slate-200 shadow-lg"
            style={{
              backgroundColor: theme.backgroundColor,
              color: theme.textColor,
              fontFamily: theme.fontFamily,
            }}
          >
            <div className="space-y-4">
              <h5 className="text-lg sm:text-2xl font-bold">Sample Form Title</h5>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Sample input field..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border-2 border-slate-200 focus:border-purple-500 transition-colors"
                  style={{ borderColor: theme.primaryColor + "40" }}
                  disabled
                />
                <button
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl font-bold transition-transform hover:scale-[1.02] text-sm sm:text-base shadow-lg"
                  style={{
                    backgroundColor: theme.primaryColor,
                    color: "white",
                  }}
                >
                  Submit Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <ColorPicker
          label="Primary Color"
          color={theme.primaryColor}
          onChange={(color) => onUpdate({ primaryColor: color })}
        />
        <ColorPicker
          label="Background"
          color={theme.backgroundColor}
          onChange={(color) => onUpdate({ backgroundColor: color })}
        />
        <ColorPicker
          label="Text Color"
          color={theme.textColor}
          onChange={(color) => onUpdate({ textColor: color })}
        />

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-semibold text-slate-700 sm:min-w-[120px]">
            Font Family
          </label>
          <select
            value={theme.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm bg-white shadow-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200"
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

      <button
        onClick={() => setPreviewTheme(!previewTheme)}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-300 text-purple-700 font-semibold border border-purple-200 hover:border-purple-300"
      >
        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
        {previewTheme ? "Hide Live Preview" : "Show Live Preview"}
      </button>
    </section>
  );
}