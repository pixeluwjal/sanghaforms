import { useState } from "react";
import { Type, Edit3, Save, X, FileText } from "lucide-react";
import toast from "react-hot-toast";

interface FormDetailsEditorProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => void;
}

export default function FormDetailsEditor({ form, onUpdate }: FormDetailsEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState(form.title);
  const [localFormName, setLocalFormName] = useState(form.form_name12 || "");
  const [localDescription, setLocalDescription] = useState(form.description || "");

  const handleSave = () => {
    if (localTitle.trim() === "") {
      toast.error("Form title cannot be empty");
      return;
    }
    if (localFormName.trim() === "") {
      toast.error("Form name cannot be empty");
      return;
    }
    onUpdate({
      title: localTitle.trim(),
      form_name12: localFormName.trim(),
      description: localDescription.trim() || undefined
    });
    setIsEditing(false);
    toast.success("Form details updated!");
  };

  const handleCancel = () => {
    setLocalTitle(form.title);
    setLocalFormName(form.form_name12 || "");
    setLocalDescription(form.description || "");
    setIsEditing(false);
  };

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
      <header className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center shadow-lg">
            <Type className="w-7 h-7 text-blue-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-900">Form Details</h3>
            <p className="text-sm text-slate-500">Edit title, name and description</p>
          </div>
        </div>
        
        {!isEditing ? (
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
            <Edit3 className="w-4 h-4" />
            <span className="font-semibold">Edit</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-xl hover:bg-slate-600 transition-all duration-300 shadow-lg">
              <X className="w-4 h-4" />
              <span className="font-semibold">Cancel</span>
            </button>
            <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Save className="w-4 h-4" />
              <span className="font-semibold">Save</span>
            </button>
          </div>
        )}
      </header>

      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Form Title *
          </label>
          {isEditing ? (
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-lg font-semibold transition-all duration-200 shadow-sm"
              placeholder="Enter form title..."
              maxLength={100}
            />
          ) : (
            <div className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent">
              <h4 className="text-lg font-semibold text-slate-800">{form.title}</h4>
            </div>
          )}
        </div>

        {/* Form Name */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Form Name *
          </label>
          {isEditing ? (
            <input
              type="text"
              value={localFormName}
              onChange={(e) => setLocalFormName(e.target.value)}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm"
              placeholder="Enter form name..."
              maxLength={100}
            />
          ) : (
            <div className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent">
              <p className="text-sm text-slate-700 font-medium">{form.form_name12}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Description
          </label>
          {isEditing ? (
            <textarea
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm transition-all duration-200 shadow-sm resize-none"
              placeholder="Describe the purpose of this form..."
              maxLength={500}
            />
          ) : (
            <div className="px-4 py-3 bg-slate-50 rounded-xl border-2 border-transparent min-h-[80px]">
              <p className="text-sm text-slate-700">{form.description || "No description provided"}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}