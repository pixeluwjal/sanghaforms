import { Zap, Shield, UsersIcon, Globe } from "lucide-react";
import FeatureCard from "./FeatureCard";

interface FormFeaturesProps {
  settings: FormSettings;
  onUpdate: (updates: Partial<FormSettings>) => void;
}

export default function FormFeatures({ settings, onUpdate }: FormFeaturesProps) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
      <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center shadow-lg">
          <Zap className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
        </div>
        <div>
          <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
            Form Features
          </h3>
          <p className="text-xs sm:text-sm text-slate-500">
            Configure form behavior and options
          </p>
        </div>
      </header>

      <div className="space-y-4">
        <FeatureCard
          icon={Shield}
          title="Progress Saving"
          description="Allow users to save and continue later"
          isActive={settings.enableProgressSave}
          onToggle={(val) => onUpdate({ enableProgressSave: val })}
          labelId="progress-saving"
        />
        <FeatureCard
          icon={UsersIcon}
          title="Collect Email"
          description="Require email address for responses"
          isActive={settings.collectEmail}
          onToggle={(val) => onUpdate({ collectEmail: val })}
          labelId="collect-email"
        />
        <FeatureCard
          icon={Globe}
          title="Multiple Responses"
          description="Allow users to submit multiple times"
          isActive={settings.allowMultipleResponses}
          onToggle={(val) => onUpdate({ allowMultipleResponses: val })}
          labelId="multiple-responses"
        />
      </div>
    </section>
  );
}