interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  labelId: string;
}

export default function ToggleSwitch({ checked, onChange, labelId }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      onClick={() => onChange(!checked)}
      className={`${
        checked ? "bg-purple-600" : "bg-slate-300"
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 shadow-inner`}
    >
      <span
        aria-hidden="true"
        className={`${
          checked ? "translate-x-5" : "translate-x-0"
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-all duration-300 ease-in-out ${
          checked ? "shadow-purple-500/25" : "shadow-slate-400/25"
        }`}
      />
    </button>
  );
}