// app/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { UserPlus, Mail, Users, Shield, Trash2, MoreVertical, Edit, Calendar, RefreshCw } from 'lucide-react';

interface AdminUser {
  _id: string;
  email: string;
  role: 'super_admin' | 'admin';
  status: 'active' | 'pending';
  createdAt: string;
}

export default function UsersPage() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'super_admin' | 'admin'>('admin');
  const [loading, setLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role }),
      });

      const data = await response.json();

      if (response.ok) {
        showToast(`Invitation sent to ${email}`);
        setEmail('');
        fetchAdmins();
      } else {
        showToast(data.error || 'Failed to send invitation', 'error');
      }
    } catch (error) {
      showToast('Failed to send invitation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdmins = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setAdmins(data.admins || []);
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      showToast('Failed to load admin users', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  const deleteAdmin = async (adminId: string) => {
    if (!confirm('Are you sure you want to remove this admin? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/users/${adminId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showToast('Admin user removed successfully');
        fetchAdmins();
        setActiveMenu(null);
      } else {
        showToast('Failed to remove admin', 'error');
      }
    } catch (error) {
      console.error('Error deleting admin:', error);
      showToast('Error removing admin', 'error');
    }
  };

  const toggleMenu = (adminId: string) => {
    setActiveMenu(activeMenu === adminId ? null : adminId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-indigo-100/50 p-4 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Toast Notification */}
        {message && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg border transform animate-slide-in ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <p className="font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Admin Users
            </h1>
            <p className="text-gray-700 text-lg">
              Manage admin users and their permissions across the platform
            </p>
          </div>
          
          <button
            onClick={fetchAdmins}
            disabled={refreshing}
            className="px-6 py-3 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Invitation Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <UserPlus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Invite New Admin</h2>
              <p className="text-gray-600 mt-1">Send invitation to new admin users</p>
            </div>
          </div>
          
          <form onSubmit={handleInvite} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 placeholder-gray-400 text-gray-900 font-medium shadow-sm hover:shadow-md"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Role Permissions
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'super_admin' | 'admin')}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-300 text-gray-900 font-medium shadow-sm hover:shadow-md"
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="px-8 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-3"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Mail className="w-5 h-5" />
              )}
              Send Invitation
            </button>
          </form>
        </div>

        {/* Admin Users Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/60 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="p-6 border-b border-gray-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Admin Users</h2>
                  <p className="text-gray-600 mt-1">{admins.length} team members</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {admins.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {admins.map((admin, index) => (
                  <div 
                    key={admin._id}
                    className="group bg-white rounded-2xl p-6 border border-gray-200/60 hover:border-purple-200 hover:shadow-lg transition-all duration-500 hover:scale-105 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                          admin.role === 'super_admin' 
                            ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                            : 'bg-gradient-to-br from-blue-500 to-blue-600'
                        }`}>
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg truncate">
                            {admin.email}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              admin.role === 'super_admin' 
                                ? 'bg-purple-100 text-purple-700 shadow-sm' 
                                : 'bg-blue-100 text-blue-700 shadow-sm'
                            }`}>
                              {admin.role.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                              admin.status === 'active' 
                                ? 'bg-green-100 text-green-700 shadow-sm' 
                                : 'bg-amber-100 text-amber-700 shadow-sm'
                            }`}>
                              {admin.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="relative">
                        <button 
                          onClick={() => toggleMenu(admin._id)}
                          className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenu === admin._id && (
                          <div className="absolute right-0 top-10 z-10 w-48 bg-white rounded-2xl shadow-lg border border-gray-200 py-2 animate-dropdown">
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                              <Edit className="w-4 h-4" />
                              Edit Permissions
                            </button>
                            <button
                              onClick={() => deleteAdmin(admin._id)}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove Admin
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(admin.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Users className="w-10 h-10 text-purple-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Admin Users</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                  Get started by inviting your first admin user to help manage the platform.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      <div 
        className={`fixed inset-0 z-0 ${activeMenu ? 'block' : 'hidden'}`}
        onClick={() => setActiveMenu(null)}
      />

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes dropdown {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out forwards;
        }
        
        .animate-dropdown {
          animation: dropdown 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}