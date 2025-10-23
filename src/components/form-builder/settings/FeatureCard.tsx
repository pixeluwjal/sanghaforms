import ToggleSwitch from "./ToggleSwitch";

interface FeatureCardProps {
  icon: any;
  title: string;
  description: string;
  isActive: boolean;
  onToggle: (checked: boolean) => void;
  labelId: string;
}

export default function FeatureCard({
  icon: Icon,
  title,
  description,
  isActive,
  onToggle,
  labelId,
}: FeatureCardProps) {
  return (
    <div
      className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
        isActive
          ? "bg-purple-50 border-purple-200 shadow-lg shadow-purple-500/10"
          : "bg-slate-50 border-slate-200 hover:border-slate-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`p-2 rounded-xl transition-all duration-300 ${
              isActive
                ? "bg-purple-100 text-purple-600"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-800 text-sm">{title}</h4>
            <p className="text-xs text-slate-500 mt-1">{description}</p>
          </div>
        </div>
        <ToggleSwitch checked={isActive} onChange={onToggle} labelId={labelId} />
      </div>
    </div>
  );
}