import { useState } from "react";
import { FileText } from "lucide-react";
import toast from "react-hot-toast";

interface PageTitleEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function PageTitleEditor({ value, onChange }: PageTitleEditorProps) {
  const [localTitle, setLocalTitle] = useState(value || "");

  const handleSave = () => {
    if (localTitle.trim() === "") {
      toast.error("Page title cannot be empty");
      return;
    }
    onChange(localTitle.trim());
    toast.success('Page title updated!');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
        <FileText className="w-4 h-4 text-purple-600" />
        Page Title
      </label>
      
      <div className="space-y-3">
        <input
          type="text"
          value={localTitle}
          onChange={(e) => setLocalTitle(e.target.value)}
          placeholder="Enter page title for browser tab..."
          className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
          maxLength={60}
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500">
            This title will appear in the browser tab
          </p>
          <div className="text-xs text-slate-500">
            {localTitle.length}/60
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={!localTitle.trim()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Save Page Title
        </button>
      </div>
    </div>
  );
}