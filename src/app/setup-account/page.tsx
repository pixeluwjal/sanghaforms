// app/admin/setup-account/page.tsx
'use client';

import { Suspense } from 'react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Shield, CheckCircle, XCircle, Lock, User, Mail } from 'lucide-react';

function SetupAccountContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [validToken, setValidToken] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState('');
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/admin/validate-token?token=${token}`);
      const data = await response.json();
      
      if (response.ok) {
        setValidToken(true);
        setAdminEmail(data.email);
        setAdminRole(data.role);
      } else {
        setValidToken(false);
        setMessage(data.error || 'Invalid or expired invitation link');
      }
    } catch (error) {
      setValidToken(false);
      setMessage('Error validating invitation');
    }
  };

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/setup-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Account setup successful! Redirecting to login...');
        setTimeout(() => {
          router.push('/admin/login');
        }, 2000);
      } else {
        setMessage(data.error || 'Failed to setup account');
      }
    } catch (error) {
      setMessage('Failed to setup account');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-200/60 shadow-2xl p-8 text-center max-w-md w-full animate-fade-in">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3">
            Invalid Link
          </h1>
          <p className="text-gray-600 text-lg">Invitation token is missing or invalid.</p>
        </div>
      </div>
    );
  }

  if (!validToken && message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 p-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-200/60 shadow-2xl p-8 text-center max-w-md w-full animate-fade-in">
          <div className="w-20 h-20 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent mb-3">
            Invalid Invitation
          </h1>
          <p className="text-gray-600 text-lg">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100 p-4 lg:p-8">
      <div className="max-w-md w-full">
        {/* Background Animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        </div>

        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-purple-200/60 shadow-2xl p-8 lg:p-10 relative z-10 animate-slide-up">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/30">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
              Setup Account
            </h1>
            <p className="text-gray-600 text-lg">Complete your admin account setup</p>
          </div>

          {/* Admin Info */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/70 rounded-2xl border-2 border-purple-200 p-6 mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Email</p>
                <p className="text-lg font-medium text-gray-900 truncate">{adminEmail}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-indigo-700 uppercase tracking-wide">Role</p>
                <p className="text-lg font-medium text-gray-900 capitalize">{adminRole}</p>
              </div>
            </div>
          </div>

          {/* Setup Form */}
          <form onSubmit={handleSetup} className="space-y-6">
            {/* Password Field */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                Create Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium shadow-sm hover:shadow-md placeholder-gray-400"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-focus-within:border-purple-300 pointer-events-none transition-all duration-300"></div>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-purple-600" />
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium shadow-sm hover:shadow-md placeholder-gray-400"
                  placeholder="Confirm your password"
                  required
                />
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-focus-within:border-purple-300 pointer-events-none transition-all duration-300"></div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Setting Up Account...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Complete Setup
                </>
              )}
            </button>

            {/* Message Display */}
            {message && (
              <div className={`p-4 rounded-2xl border-2 text-center transition-all duration-300 animate-fade-in ${
                message.includes('successful') 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-red-50 border-red-200 text-red-700'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  {message.includes('successful') ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span className="font-medium">{message}</span>
                </div>
              </div>
            )}
          </form>

          {/* Security Note */}
          <div className="mt-6 pt-6 border-t border-gray-200/60">
            <div className="flex items-start gap-3 text-sm text-gray-500">
              <Shield className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
              <p>Your account is secured with enterprise-grade encryption. Choose a strong password to protect your access.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}

export default function SetupAccount() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-indigo-100">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30">
            <Shield className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="text-xl font-semibold text-gray-700">Loading Setup...</div>
            <div className="text-sm text-gray-500">Preparing your account setup</div>
          </div>
        </div>
      </div>
    }>
      <SetupAccountContent />
    </Suspense>
  );
}