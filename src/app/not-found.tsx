// app/not-found.tsx
'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search, FileText, Rocket } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10">
          {/* Animated Number */}
          <div className="mb-8">
            <div className="relative inline-block">
              <div className="text-9xl font-black bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent animate-bounce">
                404
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            </div>
          </div>

          {/* Icon */}
          <div className="mb-8">
            <div className="relative inline-flex">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 transform rotate-6 animate-float">
                <FileText className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-ping-slow">
                <span className="text-white font-bold text-lg">!</span>
              </div>
            </div>
          </div>

          {/* Message */}
          <div className="mb-8 space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
              Page Not Found
            </h1>
            <p className="text-xl text-gray-600 max-w-md mx-auto leading-relaxed">
              Oops! The page you're looking for seems to have wandered off into the digital void.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              href="/"
              className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Home className="w-5 h-5 mr-3 relative z-10" />
              <span className="relative z-10">Back to Home</span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </Link>

            <button
              onClick={() => window.history.back()}
              className="group inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl hover:border-purple-300 hover:text-purple-700 transform hover:scale-105 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform duration-300" />
              Go Back
            </button>
          </div>

          {/* Quick Links */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Search className="w-5 h-5 text-purple-600" />
              Quick Links
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                href="/admin/forms"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-300">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Form Builder</div>
                  <div className="text-sm text-gray-600">Create new forms</div>
                </div>
              </Link>

              <Link
                href="/admin/responses"
                className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:border-green-300 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors duration-300">
                  <Rocket className="w-5 h-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Responses</div>
                  <div className="text-sm text-gray-600">View submissions</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Still lost?{' '}
              <a
                href="mailto:support@yourdomain.com"
                className="text-purple-600 hover:text-purple-700 font-medium underline transition-colors duration-300"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(6deg);
          }
          50% {
            transform: translateY(-20px) rotate(6deg);
          }
        }

        @keyframes ping-slow {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-ping-slow {
          animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
}