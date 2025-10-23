import { Rocket, AlertTriangle } from "lucide-react";

interface StatusBannerProps {
  form: Form;
  settings: FormSettings;
  currentFormUrl: string;
}

export default function StatusBanner({ form, settings, currentFormUrl }: StatusBannerProps) {
  return (
    <div
      className={`p-4 sm:p-6 rounded-3xl text-center shadow-xl transition-all duration-500 backdrop-blur-sm ${
        form.status === "published"
          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800"
          : "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 text-amber-800"
      }`}
    >
      <div className="flex items-center justify-center gap-3 mb-2">
        {form.status === "published" ? (
          <>
            <Rocket className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
            <h4 className="font-bold text-xl sm:text-2xl">FORM IS LIVE</h4>
          </>
        ) : (
          <>
            <AlertTriangle className="w-6 h-6 sm:w-7 sm:h-7 text-amber-600" />
            <h4 className="font-bold text-xl sm:text-2xl">FORM IS DRAFT</h4>
          </>
        )}
      </div>
      <p className="text-xs sm:text-sm font-medium text-slate-600">
        {form.status === "published"
          ? `Your form is publicly accessible at:`
          : "Your form is not currently visible to the public"}
      </p>
      {form.status === "published" && (
        <p className="mt-2 font-mono text-xs sm:text-sm bg-white/50 px-3 sm:px-4 py-2 rounded-xl border border-green-200 inline-block max-w-full overflow-x-auto">
          {currentFormUrl}
        </p>
      )}
    </div>
  );
}