import { CreditCard, IndianRupee, AlertCircle } from "lucide-react";

interface PaymentSectionProps {
  settings: FormSettings;
  onUpdate: (updates: Partial<FormSettings>) => void;
}

export default function PaymentSection({ settings, onUpdate }: PaymentSectionProps) {
  const handlePaymentToggle = (acceptPayments: boolean) => {
    onUpdate({ 
      acceptPayments,
      // Reset payment amount when disabling payments
      ...(acceptPayments ? {} : { paymentAmount: 0 })
    });
  };

  const handleAmountChange = (amount: number) => {
    // Ensure amount is not negative and has max 2 decimal places
    const validAmount = Math.max(0, parseFloat(amount.toFixed(2)));
    onUpdate({ paymentAmount: validAmount });
  };

  return (
    <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 backdrop-blur-sm overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Payment Settings</h2>
            <p className="text-green-100 text-sm mt-1">
              Configure payment collection for form submissions
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Payment Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">Accept Payments</h3>
              <p className="text-sm text-slate-600">
                Enable to collect payments with form submissions
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.acceptPayments || false}
              onChange={(e) => handlePaymentToggle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        {/* Payment Configuration */}
        {settings.acceptPayments && (
          <div className="space-y-4 p-4 bg-green-50 rounded-xl border border-green-200 animate-in fade-in duration-300">
            <div className="flex items-center space-x-2 text-green-800 mb-4">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Razorpay integration will be implemented later
              </span>
            </div>

            {/* Payment Amount */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Payment Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.paymentAmount || 0}
                  onChange={(e) => handleAmountChange(parseFloat(e.target.value) || 0)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-500 text-sm">INR</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                Amount in Indian Rupees. Users will pay this amount to submit the form.
              </p>
            </div>

            {/* Payment Description */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-slate-700">
                Payment Description
              </label>
              <textarea
                value={settings.paymentDescription || ""}
                onChange={(e) => onUpdate({ paymentDescription: e.target.value })}
                className="block w-full px-3 py-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                rows={3}
                placeholder="Describe what this payment is for..."
                maxLength={200}
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>Optional description shown to users</span>
                <span>{(settings.paymentDescription || "").length}/200</span>
              </div>
            </div>

            {/* Currency Info */}
            <div className="p-3 bg-white rounded-lg border border-slate-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Currency</span>
                <span className="font-medium text-slate-800">Indian Rupee (INR)</span>
              </div>
            </div>
          </div>
        )}

        {/* Disabled State Message */}
        {!settings.acceptPayments && (
          <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center">
            <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-slate-600 text-sm">
              Payment collection is currently disabled
            </p>
          </div>
        )}
      </div>
    </div>
  );
}