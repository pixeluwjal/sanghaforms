import { Database, Users, UserCheck, CheckCheck } from "lucide-react";

interface DataCollectionSectionProps {
  settings: FormSettings;
  onUpdate: (updates: Partial<FormSettings>) => void;
}

export default function DataCollectionSection({ settings, onUpdate }: DataCollectionSectionProps) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6">
      <header className="flex items-center gap-4 pb-4 border-b border-slate-100">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center shadow-lg">
          <Database className="w-7 h-7 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-slate-900">Data Collection</h3>
          <p className="text-sm text-slate-500">Choose where responses will be saved</p>
        </div>
      </header>

      <div className="space-y-4">
        <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-600" />
          Save Responses To Collection
        </label>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => onUpdate({ userType: 'swayamsevak' })}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
              settings.userType === 'swayamsevak'
                ? 'bg-blue-50 border-blue-300 shadow-lg shadow-blue-500/10'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                settings.userType === 'swayamsevak' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Swayamsevak Collection</h4>
                <p className="text-xs text-slate-500 mt-1">Save responses to volunteer database</p>
              </div>
            </div>
            {settings.userType === 'swayamsevak' && (
              <div className="mt-2 flex items-center gap-1 text-blue-600 text-xs font-semibold">
                <CheckCheck className="w-3 h-3" />
                Currently Selected
              </div>
            )}
          </button>

          <button
            onClick={() => onUpdate({ userType: 'lead' })}
            className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
              settings.userType === 'lead'
                ? 'bg-green-50 border-green-300 shadow-lg shadow-green-500/10'
                : 'bg-slate-50 border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                settings.userType === 'lead' 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-slate-100 text-slate-500'
              }`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Lead Collection</h4>
                <p className="text-xs text-slate-500 mt-1">Save responses to leads database</p>
              </div>
            </div>
            {settings.userType === 'lead' && (
              <div className="mt-2 flex items-center gap-1 text-green-600 text-xs font-semibold">
                <CheckCheck className="w-3 h-3" />
                Currently Selected
              </div>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Choose where form responses will be stored. This determines which database collection will be used.
        </p>
      </div>
    </section>
  );
}