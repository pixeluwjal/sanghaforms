interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label: string;
}

export default function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <label className="text-sm font-semibold text-slate-700 sm:min-w-[120px]">
        {label}
      </label>
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <input
            type="color"
            value={color}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-12 cursor-pointer rounded-2xl border-4 border-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
          />
          <div className="absolute inset-0 rounded-2xl border border-slate-200 pointer-events-none" />
        </div>
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm font-mono min-w-0 shadow-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
          placeholder="#7C3AED"
        />
      </div>
    </div>
  );
}