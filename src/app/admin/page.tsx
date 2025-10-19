// app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Users, BarChart3, Eye, Edit, Plus, ArrowUpRight, Calendar } from 'lucide-react';

interface FormStats {
  total: number;
  published: number;
  draft: number;
  totalResponses: number;
  recentForms: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<FormStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-indigo-100/50 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 to-indigo-100/50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Dashboard Overview
            </h1>
            <p className="text-gray-700 text-lg max-w-2xl">
              Welcome back! Here's what's happening with your forms today.
            </p>
          </div>
          
          <Link
            href="/admin/forms/builder/new"
            className="inline-flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Create New Form
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Forms Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-2xl border border-gray-200/60 transition-all duration-500 hover:scale-105 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Forms</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.total || 0}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>All created forms</span>
            </div>
          </div>

          {/* Published Forms Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-2xl border border-gray-200/60 transition-all duration-500 hover:scale-105 animate-fade-in" style={{animationDelay: '100ms'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Eye className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Published</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.published || 0}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Active and live</span>
            </div>
          </div>

          {/* Draft Forms Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-2xl border border-gray-200/60 transition-all duration-500 hover:scale-105 animate-fade-in" style={{animationDelay: '200ms'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Edit className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-amber-400 rounded-full"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Drafts</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.draft || 0}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>In progress</span>
            </div>
          </div>

          {/* Total Responses Card */}
          <div className="group bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm hover:shadow-2xl border border-gray-200/60 transition-all duration-500 hover:scale-105 animate-fade-in" style={{animationDelay: '300ms'}}>
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <p className="text-sm font-medium text-gray-600 mb-2">Total Responses</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{stats?.totalResponses || 0}</p>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>All submissions</span>
            </div>
          </div>
        </div>

        {/* Recent Forms Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Forms Card */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-3xl shadow-sm hover:shadow-md border border-gray-200/60 transition-all duration-300">
            <div className="p-6 border-b border-gray-200/60">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Recent Forms</h2>
                <Link 
                  href="/admin/forms"
                  className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  View all
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            
            <div className="p-6">
              {stats?.recentForms && stats.recentForms.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentForms.map((form, index) => (
                    <div 
                      key={form._id}
                      className="group bg-white rounded-2xl p-4 border border-gray-200/60 hover:border-purple-200 hover:shadow-md transition-all duration-300 animate-fade-in"
                      style={{animationDelay: `${index * 100}ms`}}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-purple-700 transition-colors">
                            {form.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                              <BarChart3 className="w-3 h-3" />
                              {form.responsesCount || 0} responses
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              form.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {form.status}
                            </span>
                            <span className="flex items-center gap-1 bg-gray-100 px-3 py-1 rounded-full">
                              <Calendar className="w-3 h-3" />
                              {new Date(form.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Link
                            href={`/forms/${form.settings.customSlug || form._id}`}
                            target="_blank"
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200"
                            title="Preview Form"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/forms/builder/${form._id}`}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-200"
                            title="Edit Form"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <FileText className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">No forms yet</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    Get started by creating your first form to collect responses and insights.
                  </p>
                  <Link
                    href="/admin/forms/builder/new"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-5 h-5" />
                    Create First Form
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-200/60">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">Response Rate</span>
                  <span className="text-sm font-bold text-gray-900">68%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">Avg. Completion</span>
                  <span className="text-sm font-bold text-gray-900">2.1min</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-600">Active Users</span>
                  <span className="text-sm font-bold text-gray-900">1.2k</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-sm border border-gray-200/60">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/forms"
                  className="flex items-center gap-3 p-3 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">Manage Forms</span>
                </Link>
                <Link
                  href="/admin/responses"
                  className="flex items-center gap-3 p-3 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">View Responses</span>
                </Link>
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-3 text-gray-700 hover:text-purple-700 hover:bg-purple-50 rounded-xl transition-all duration-200 group"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <Users className="w-4 h-4 text-purple-600" />
                  </div>
                  <span className="font-medium">User Management</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add custom styles for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}