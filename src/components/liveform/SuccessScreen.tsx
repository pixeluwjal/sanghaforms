import { FormData } from './types';

interface SuccessScreenProps {
  formData: FormData;
}

export default function SuccessScreen({ formData }: SuccessScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden animate-fade-in-up border border-emerald-200">
          <div className="bg-gradient-to-r from-emerald-500 to-green-600 py-16 px-6 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center animate-bounce-in">
                <span className="text-4xl text-white">✓</span>
              </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Submission Successful!</h2>
            <p className="text-green-100 text-lg mb-6">Thank you for your submission. We'll be in touch soon!</p>
            <div className="flex items-center justify-center text-green-200">
              <span className="mr-2">★</span>
              <span>Your response has been recorded</span>
              <span className="ml-2">★</span>
            </div>
          </div>
          {formData.settings.showGroupLinks && (
            <div className="p-8 bg-white">
              <div className="space-y-4 max-w-md mx-auto">
                {formData.settings.whatsappGroupLink && (
                  <a
                    href={formData.settings.whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-green-600 text-white py-4 px-6 rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30 font-semibold text-lg"
                  >
                    Join WhatsApp Group
                  </a>
                )}
                {formData.settings.arrataiGroupLink && (
                  <a
                    href={formData.settings.arrataiGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 px-6 rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/30 font-semibold text-lg"
                  >
                    Join ArratAI Community
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}