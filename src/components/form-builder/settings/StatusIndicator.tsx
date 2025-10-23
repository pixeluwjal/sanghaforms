import { Loader2, CheckCheck, AlertTriangle } from "lucide-react";

interface StatusIndicatorProps {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}

export default function StatusIndicator({ status, message }: StatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "loading":
        return {
          color: "text-purple-600 bg-purple-50 border-purple-200",
          icon: <Loader2 className="w-4 h-4 animate-spin" />,
        };
      case "success":
        return {
          color: "text-green-600 bg-green-50 border-green-200",
          icon: <CheckCheck className="w-4 h-4" />,
        };
      case "error":
        return {
          color: "text-red-600 bg-red-50 border-red-200",
          icon: <AlertTriangle className="w-4 h-4" />,
        };
      default:
        return {
          color: "text-slate-600 bg-slate-50 border-slate-200",
          icon: null,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 ${config.color} transition-all duration-300 shadow-lg backdrop-blur-sm`}
    >
      {config.icon}
      <span className="text-sm font-semibold">{message}</span>
    </div>
  );
}