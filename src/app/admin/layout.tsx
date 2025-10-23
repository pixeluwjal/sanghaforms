'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  User,
  Eye,
  FilePlus,
  MessageSquare,
  Database
} from 'lucide-react';

// --- Navigation Items ---
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Forms', href: '/admin/forms', icon: FileText },
  { name: 'Responses', href: '/admin/responses', icon: Eye },
  { name: 'Users', href: '/admin/users', icon: Users },
];

const secondaryNavigation = [
  { name: 'Sangha Hierarchy', href: '/admin/sangha-hierarchy', icon: Users },
  { name: 'Sources', href: '/admin/sources', icon: Database },
  { name: 'Bulk Upload', href: '/admin/bulk-upload', icon: Database },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // --- Routes that won't use this layout ---
  const noLayoutRoutes = [
    '/admin/setup-account',
    '/admin/login',
    '/admin/forgot-password'
  ];

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear any client-side storage if needed
        localStorage.removeItem('adminToken');
        sessionStorage.removeItem('adminToken');
        
        // Redirect to login page
        router.push('/login');
      } else {
        console.error('Logout failed');
        // Fallback: redirect anyway
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect anyway
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const shouldShowLayout = !noLayoutRoutes.some(route => 
    pathname?.startsWith(route)
  );

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50/50 to-indigo-100/50 font-sans">
      
      {/* --- Mobile Sidebar Overlay --- */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- Sidebar --- */}
      <div className={`fixed inset-y-0 left-0 z-40 w-80 bg-white/90 backdrop-blur-xl shadow-2xl transform transition-all duration-500 ease-out lg:translate-x-0 lg:static lg:inset-0 border-r border-purple-200/30 ${
        sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          
          {/* Logo and Branding */}
          <div className="flex items-center h-24 px-6 border-b border-purple-200/30 bg-gradient-to-r from-white to-purple-50/50">
            <Link 
              href="/admin" 
              className="flex items-center gap-3 group flex-1"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-300 shadow-purple-500/25">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  SS Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Create Form Button - Moved to Sidebar */}
          <div className="p-4 border-b border-purple-200/30 bg-white/50">
            <Link
              href="/admin/forms/create"
              className="flex items-center gap-3 w-full px-4 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-semibold shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-[1.02] active:scale-95 group"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FilePlus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm">Create New Form</span>
            </Link>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto">
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-4 px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-300 group ${
                      isActive
                        ? 'bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-700 border border-purple-200/50 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white hover:shadow-md border border-transparent hover:border-purple-200/30'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Section: User Profile & Logout */}
            <div className="p-4 border-t border-purple-200/30 bg-white/50">
              {/* Secondary Nav */}
              <nav className="mb-4 space-y-2">
                {secondaryNavigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href} 
                      className={`flex items-center gap-4 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                        isActive 
                          ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`} 
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* User Info */}
              <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-purple-200/30 shadow-sm">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center border border-purple-200/50">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Administrator</p>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-10 h-10 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-all duration-300 rounded-xl flex items-center justify-center border border-gray-200 hover:border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Logout"
                >
                  {isLoggingOut ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <LogOut className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Menu Button - Only visible on mobile */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-2xl text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-all duration-300 border border-transparent hover:border-purple-200 bg-white/80 backdrop-blur-xl shadow-lg"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>

        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        
        /* Custom scrollbar */
        .overflow-y-auto::-webkit-scrollbar {
          width: 6px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #c4b5fd;
          border-radius: 10px;
        }
        
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #a78bfa;
        }
      `}</style>
    </div>
  );
}