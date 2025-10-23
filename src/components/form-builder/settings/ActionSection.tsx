import { Rocket, X, CheckCheck, Loader2 } from "lucide-react";

interface ActionSectionProps {
  form: Form;
  saveStatus: "idle" | "loading" | "success" | "error";
  onSaveChanges: (status: "published" | "draft") => void;
  settings: FormSettings;
}

export default function ActionSection({ form, saveStatus, onSaveChanges, settings }: ActionSectionProps) {
  return (
    <section className="p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white to-purple-50/30 rounded-3xl border-2 border-purple-200 shadow-2xl">
      <div className="text-center mb-6">
        <h4 className="font-bold text-xl sm:text-2xl text-slate-800 mb-2">
          {form.status === "published" ? "Form Management" : "Ready to Launch?"}
        </h4>
        <p className="text-xs sm:text-sm text-slate-600">
          {form.status === "published" ? "Your form is live and collecting responses" : "Publish to make your form publicly accessible"}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
        {form.status === "published" ? (
          <>
            <button
              onClick={() => onSaveChanges("draft")}
              disabled={saveStatus === "loading"}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-2xl hover:shadow-2xl hover:shadow-red-300/50 disabled:opacity-50 font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg text-sm sm:text-base"
            >
              {saveStatus === "loading" ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <X className="w-4 h-4 sm:w-5 sm:h-5" />}
              {saveStatus === "loading" ? "Unpublishing..." : "Unpublish Form"}
            </button>
            <button
              onClick={() => onSaveChanges("published")}
              disabled={saveStatus === "loading"}
              className="flex-1 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-2xl hover:shadow-2xl hover:shadow-purple-300/60 disabled:opacity-50 font-bold transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 shadow-lg text-sm sm:text-base"
            >
              {saveStatus === "loading" ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> : <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" />}
              {saveStatus === "loading" ? "Updating..." : "Update Settings"}
            </button>
          </>
        ) : (
          <button
            onClick={() => onSaveChanges("published")}
            disabled={saveStatus === "loading"}
            className="w-full px-6 sm:px-8 py-4 sm:py-5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl shadow-2xl shadow-green-300/60 hover:shadow-3xl hover:shadow-emerald-300/70 disabled:opacity-50 text-base sm:text-lg font-bold transition-all duration-300 flex items-center justify-center gap-3 hover:scale-105"
          >
            {saveStatus === "loading" ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" /> : <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />}
            {saveStatus === "loading" ? "Publishing..." : "Publish Form Now"}
          </button>
        )}
      </div>

      {form.status === "published" && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-50 text-green-700 rounded-xl border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm font-medium">
              Live • {settings.userType === 'swayamsevak' ? 'Swayamsevak' : 'Lead'} Collection • {settings.defaultSource ? `Source: ${settings.defaultSource}` : 'No Source'}
            </span>
          </div>
        </div>
      )}
    </section>
  );
}