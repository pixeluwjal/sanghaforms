'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  FilePlus
} from 'lucide-react';

// --- Navigation Items ---
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Forms', href: '/admin/forms', icon: FileText },
  { name: 'Responses', href: '/admin/responses', icon: Eye },
  { name: 'Users', href: '/admin/users', icon: Users },
];

const secondaryNavigation = [
    { name: 'Account Settings', href: '/admin/settings', icon: Settings }
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  // --- Routes that won't use this layout ---
  const noLayoutRoutes = [
    '/admin/setup-account',
    '/admin/login',
    '/admin/forgot-password'
  ];

  const shouldShowLayout = !noLayoutRoutes.some(route => 
    pathname?.startsWith(route)
  );

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      
      {/* --- Mobile Sidebar Overlay --- */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* --- Sidebar --- */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 border-r border-gray-200 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          
          {/* Logo and Branding */}
          <div className="flex items-center h-20 px-6 border-b border-gray-200">
            <Link href="/admin" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-slate-800">Formify</span>
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
                    className={`flex items-center gap-4 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-600'
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

            {/* Bottom Section: User Profile & Logout */}
            <div className="p-4 border-t border-gray-200">
                {/* Secondary Nav */}
                 <nav className="mb-4 space-y-2">
                      {secondaryNavigation.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                         return (
                            <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`} onClick={() => setSidebarOpen(false)}>
                               <Icon className="w-5 h-5" />
                               <span>{item.name}</span>
                            </Link>
                         );
                      })}
                 </nav>

                {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center ring-2 ring-gray-200">
                  <User className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    Admin User
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
                <Link
                  href="/login"
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors rounded-full hover:bg-gray-100"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Content --- */}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between h-20 px-6 bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <div className="flex-1" />
          
          {/* ✨ Attractive "Create Form" Button */}
          <Link
            href="/admin/forms/builder/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 transform active:scale-95"
          >
            <FilePlus className="w-5 h-5" />
            Create New Form
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

