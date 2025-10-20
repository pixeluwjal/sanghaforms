// app/admin/sangha-hierarchy/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  PlusIcon, 
  TrashIcon, 
  ChevronDownIcon, 
  ChevronRightIcon,
  DocumentPlusIcon,
  FolderPlusIcon,
  UserPlusIcon,
  UsersIcon,
  BuildingLibraryIcon,
  MapPinIcon,
  UserGroupIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

interface Ghata {
  _id: string;
  name: string;
  description?: string;
}

interface Milan {
  _id: string;
  name: string;
  description?: string;
  ghatas: Ghata[];
}

interface Valay {
  _id: string;
  name: string;
  description?: string;
  milans: Milan[];
}

interface Khanda {
  _id: string;
  name: string;
  code: string;
  description?: string;
  valays: Valay[];
}

interface Organization {
  _id: string;
  name: string;
  description?: string;
  khandas: Khanda[];
}

export default function SanghaHierarchyAdmin() {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ khandas: 0, valays: 0, milans: 0, ghatas: 0 });

  // Calculate statistics
  useEffect(() => {
    if (!organization) return;
    
    const khandas = organization.khandas.length;
    let valays = 0, milans = 0, ghatas = 0;
    
    organization.khandas.forEach(khanda => {
      valays += khanda.valays.length;
      khanda.valays.forEach(valay => {
        milans += valay.milans.length;
        valay.milans.forEach(milan => {
          ghatas += milan.ghatas.length;
        });
      });
    });
    
    setStats({ khandas, valays, milans, ghatas });
  }, [organization]);

  const showMessage = useCallback((text: string, type: 'success' | 'error' | 'info' = 'info') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  }, []);

  const fetchOrganization = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/organization');
      const data = await response.json();
      
      if (data.success && data.organizations && data.organizations.length > 0) {
        const orgData = data.organizations[0];
        setOrganization(orgData);
        
        // Expand all sections by default
        const sections = new Set<string>();
        orgData.khandas.forEach((khanda: Khanda, khandaIndex: number) => {
          sections.add(`khanda-${khandaIndex}`);
        });
        setExpandedSections(sections);
        
        showMessage('Organization data loaded successfully', 'success');
      } else {
        const defaultOrg: Organization = {
          _id: 'org_' + Date.now(),
          name: 'Spiritual Organization',
          description: 'Main spiritual organization structure',
          khandas: []
        };
        setOrganization(defaultOrg);
        showMessage('Created new organization template', 'info');
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
      showMessage('Error loading organization data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const updateOrganization = async () => {
    if (!organization) return;

    setSaving(true);
    try {
      const response = await fetch('/api/organization', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(organization),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('Organization updated successfully!', 'success');
      } else {
        showMessage(`Error: ${data.error || 'Failed to update organization'}`, 'error');
      }
    } catch (error) {
      console.error('Error updating organization:', error);
      showMessage('Error updating organization', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Search functionality
  const matchesSearch = useCallback((text: string): boolean => {
    if (!searchTerm.trim()) return true;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  }, [searchTerm]);

  // Filter organization based on search
  const getFilteredOrganization = useCallback((): Organization | null => {
    if (!organization || !searchTerm.trim()) return organization;

    return {
      ...organization,
      khandas: organization.khandas
        .map(khanda => ({
          ...khanda,
          valays: khanda.valays
            .map(valay => ({
              ...valay,
              milans: valay.milans
                .map(milan => ({
                  ...milan,
                  ghatas: milan.ghatas.filter(ghata => 
                    matchesSearch(ghata.name)
                  )
                }))
                .filter(milan => 
                  matchesSearch(milan.name) || 
                  milan.ghatas.length > 0
                )
            }))
            .filter(valay => 
              matchesSearch(valay.name) || 
              valay.milans.length > 0
            )
        }))
        .filter(khanda => 
          matchesSearch(khanda.name) || 
          matchesSearch(khanda.code) || 
          khanda.valays.length > 0
        )
    };
  }, [organization, searchTerm, matchesSearch]);

  const filteredOrganization = getFilteredOrganization();

  // Toggle section expansion
  const toggleSection = useCallback((sectionId: string) => {
    setExpandedSections(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(sectionId)) {
        newExpanded.delete(sectionId);
      } else {
        newExpanded.add(sectionId);
      }
      return newExpanded;
    });
  }, []);

  // Expand/Collapse all
  const toggleAllSections = useCallback((expand: boolean) => {
    if (!organization) return;
    
    const newExpanded = new Set<string>();
    if (expand) {
      organization.khandas.forEach((khanda, khandaIndex) => {
        newExpanded.add(`khanda-${khandaIndex}`);
        khanda.valays.forEach((valay, valayIndex) => {
          newExpanded.add(`valay-${khandaIndex}-${valayIndex}`);
          valay.milans.forEach((milan, milanIndex) => {
            newExpanded.add(`milan-${khandaIndex}-${valayIndex}-${milanIndex}`);
          });
        });
      });
    }
    setExpandedSections(newExpanded);
  }, [organization]);

  // Add new items
  const addKhanda = useCallback(() => {
    if (!organization) return;

    const newKhanda: Khanda = {
      _id: `khanda_${Date.now()}`,
      name: 'New Khanda',
      code: `K${organization.khandas.length + 1}`,
      description: '',
      valays: []
    };

    const updatedOrg = {
      ...organization,
      khandas: [...organization.khandas, newKhanda]
    };
    
    setOrganization(updatedOrg);
    toggleSection(`khanda-${organization.khandas.length}`);
    showMessage('New Khanda added', 'success');
  }, [organization, toggleSection, showMessage]);

  const addValay = useCallback((khandaIndex: number) => {
    if (!organization) return;

    const updatedKhandas = [...organization.khandas];
    const newValay: Valay = {
      _id: `valay_${Date.now()}`,
      name: 'New Valay',
      description: '',
      milans: []
    };

    updatedKhandas[khandaIndex].valays.push(newValay);
    const updatedOrg = { ...organization, khandas: updatedKhandas };
    
    setOrganization(updatedOrg);
    toggleSection(`valay-${khandaIndex}-${updatedKhandas[khandaIndex].valays.length - 1}`);
    showMessage('New Valay added', 'success');
  }, [organization, toggleSection, showMessage]);

  const addMilan = useCallback((khandaIndex: number, valayIndex: number) => {
    if (!organization) return;

    const updatedKhandas = [...organization.khandas];
    const newMilan: Milan = {
      _id: `milan_${Date.now()}`,
      name: 'New Milan',
      description: '',
      ghatas: []
    };

    updatedKhandas[khandaIndex].valays[valayIndex].milans.push(newMilan);
    const updatedOrg = { ...organization, khandas: updatedKhandas };
    
    setOrganization(updatedOrg);
    toggleSection(`milan-${khandaIndex}-${valayIndex}-${updatedKhandas[khandaIndex].valays[valayIndex].milans.length - 1}`);
    showMessage('New Milan added', 'success');
  }, [organization, toggleSection, showMessage]);

  const addGhata = useCallback((khandaIndex: number, valayIndex: number, milanIndex: number) => {
    if (!organization) return;

    const updatedKhandas = [...organization.khandas];
    const newGhata: Ghata = {
      _id: `ghata_${Date.now()}`,
      name: 'New Ghata'
    };

    updatedKhandas[khandaIndex].valays[valayIndex].milans[milanIndex].ghatas.push(newGhata);
    const updatedOrg = { ...organization, khandas: updatedKhandas };
    
    setOrganization(updatedOrg);
    showMessage('New Ghata added', 'success');
  }, [organization, showMessage]);

  // Update field value
  const updateField = useCallback((path: string[], value: string) => {
    if (!organization) return;

    const updatedOrg = JSON.parse(JSON.stringify(organization));
    let current: any = updatedOrg;

    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    
    setOrganization(updatedOrg);
  }, [organization]);

  // Delete items with confirmation
  const deleteItem = useCallback((type: string, index: number, subIndex?: number, milanIndex?: number, ghataIndex?: number) => {
    if (!organization) return;

    if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;

    const updatedKhandas = [...organization.khandas];

    if (type === 'khanda') {
      updatedKhandas.splice(index, 1);
    } else if (type === 'valay' && subIndex !== undefined) {
      updatedKhandas[index].valays.splice(subIndex, 1);
    } else if (type === 'milan' && subIndex !== undefined && milanIndex !== undefined) {
      updatedKhandas[index].valays[subIndex].milans.splice(milanIndex, 1);
    } else if (type === 'ghata' && subIndex !== undefined && milanIndex !== undefined && ghataIndex !== undefined) {
      updatedKhandas[index].valays[subIndex].milans[milanIndex].ghatas.splice(ghataIndex, 1);
    }

    const updatedOrg = { ...organization, khandas: updatedKhandas };
    setOrganization(updatedOrg);
    showMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`, 'success');
  }, [organization, showMessage]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <BuildingLibraryIcon className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Loading Spiritual Hierarchy...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing your organizational structure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-8 mb-6 sm:mb-8 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                <BuildingLibraryIcon className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Sangha Hierarchy
                </h1>
                <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-lg">Manage your spiritual organization structure</p>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-blue-50/80 rounded-2xl p-3 text-center border border-blue-200/50">
                <div className="text-lg sm:text-xl font-bold text-blue-600">{stats.khandas}</div>
                <div className="text-xs sm:text-sm text-blue-600/70">Khandas</div>
              </div>
              <div className="bg-green-50/80 rounded-2xl p-3 text-center border border-green-200/50">
                <div className="text-lg sm:text-xl font-bold text-green-600">{stats.valays}</div>
                <div className="text-xs sm:text-sm text-green-600/70">Valays</div>
              </div>
              <div className="bg-purple-50/80 rounded-2xl p-3 text-center border border-purple-200/50">
                <div className="text-lg sm:text-xl font-bold text-purple-600">{stats.milans}</div>
                <div className="text-xs sm:text-sm text-purple-600/70">Milans</div>
              </div>
              <div className="bg-orange-50/80 rounded-2xl p-3 text-center border border-orange-200/50">
                <div className="text-lg sm:text-xl font-bold text-orange-600">{stats.ghatas}</div>
                <div className="text-xs sm:text-sm text-orange-600/70">Ghatas</div>
              </div>
            </div>
          </div>

          {/* Search and Controls */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Search for khandas, valays, milans, or ghatas..."
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => toggleAllSections(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl text-sm"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                  Expand All
                </button>
                <button
                  onClick={() => toggleAllSections(false)}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-2xl hover:bg-gray-600 transition-all shadow-lg hover:shadow-xl text-sm"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  Collapse All
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={addKhanda}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200 flex-1 sm:flex-none"
              >
                <FolderPlusIcon className="h-5 w-5" />
                <span className="text-sm sm:text-base">Add Khanda</span>
              </button>
              <button
                onClick={updateOrganization}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 transform duration-200 disabled:opacity-50 flex-1 sm:flex-none"
              >
                <DocumentPlusIcon className="h-5 w-5" />
                <span className="text-sm sm:text-base">{saving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>

          {/* Message Display */}
          {message.text && (
            <div className={`mt-4 p-4 rounded-2xl border-2 backdrop-blur-sm ${
              message.type === 'error' 
                ? 'bg-red-50/80 border-red-200 text-red-700' 
                : message.type === 'success'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-700'
                : 'bg-blue-50/80 border-blue-200 text-blue-700'
            }`}>
              <div className="flex items-center gap-3">
                {message.type === 'error' ? (
                  <XCircleIcon className="h-5 w-5 flex-shrink-0" />
                ) : message.type === 'success' ? (
                  <CheckCircleIcon className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <InformationCircleIcon className="h-5 w-5 flex-shrink-0" />
                )}
                <span className="text-sm sm:text-base">{message.text}</span>
              </div>
            </div>
          )}
        </div>

        {/* Organization Name */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-white/20">
          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-blue-600" />
            Organization Details
          </label>
          <div className="space-y-4">
            <input
              type="text"
              value={organization?.name || ''}
              onChange={(e) => setOrganization(prev => prev ? { ...prev, name: e.target.value } : null)}
              className="w-full px-4 py-3 text-lg sm:text-xl font-semibold bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
              placeholder="Enter your spiritual organization name..."
            />
            <textarea
              value={organization?.description || ''}
              onChange={(e) => setOrganization(prev => prev ? { ...prev, description: e.target.value } : null)}
              className="w-full px-4 py-3 bg-white/50 border-2 border-gray-200/50 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400 resize-none"
              placeholder="Organization description (optional)"
              rows={2}
            />
          </div>
        </div>

        {/* Khandas */}
        <div className="space-y-4 sm:space-y-6">
          {filteredOrganization?.khandas.map((khanda, khandaIndex) => (
            <div key={khanda._id} className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-white/20 overflow-hidden">
              {/* Khanda Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 border-b border-blue-200/50">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleSection(`khanda-${khandaIndex}`)}
                      className="p-2 hover:bg-white/50 rounded-xl transition-all duration-200 hover:scale-110 flex-shrink-0"
                    >
                      {expandedSections.has(`khanda-${khandaIndex}`) ? (
                        <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                      )}
                    </button>
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 font-bold text-sm">{khandaIndex + 1}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                      <input
                        type="text"
                        value={khanda.name}
                        onChange={(e) => updateField(['khandas', khandaIndex.toString(), 'name'], e.target.value)}
                        className="w-full pl-10 pr-4 py-2 sm:py-3 text-base sm:text-lg font-bold bg-white border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Khanda Name"
                      />
                    </div>
                    <div className="relative">
                      <CubeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-600" />
                      <input
                        type="text"
                        value={khanda.code}
                        onChange={(e) => updateField(['khandas', khandaIndex.toString(), 'code'], e.target.value)}
                        className="w-full pl-10 pr-4 py-2 sm:py-3 bg-white border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        placeholder="Khanda Code"
                      />
                    </div>
                    <div className="relative">
                      <InformationCircleIcon className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
                      <textarea
                        value={khanda.description || ''}
                        onChange={(e) => updateField(['khandas', khandaIndex.toString(), 'description'], e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border-2 border-gray-200/50 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                        placeholder="Description"
                        rows={1}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => addValay(khandaIndex)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                    >
                      <PlusIcon className="h-4 w-4" />
                      <span className="hidden sm:inline">Valay</span>
                    </button>
                    <button
                      onClick={() => deleteItem('khanda', khandaIndex)}
                      className="p-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Valays */}
              {expandedSections.has(`khanda-${khandaIndex}`) && (
                <div className="p-4 sm:p-6 space-y-4">
                  {khanda.valays.map((valay, valayIndex) => (
                    <div key={valay._id} className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl border-2 border-gray-200/50 overflow-hidden">
                      {/* Valay Header */}
                      <div className="bg-white/80 p-3 sm:p-4 border-b border-gray-200/50">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => toggleSection(`valay-${khandaIndex}-${valayIndex}`)}
                              className="p-1 sm:p-2 hover:bg-gray-100/50 rounded-lg transition-all duration-200 hover:scale-110 flex-shrink-0"
                            >
                              {expandedSections.has(`valay-${khandaIndex}-${valayIndex}`) ? (
                                <ChevronDownIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                              ) : (
                                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                              )}
                            </button>
                            <div className="w-6 h-6 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                              <span className="text-green-600 font-bold text-xs">{valayIndex + 1}</span>
                            </div>
                          </div>
                          
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="relative">
                              <UserGroupIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-600" />
                              <input
                                type="text"
                                value={valay.name}
                                onChange={(e) => updateField(
                                  ['khandas', khandaIndex.toString(), 'valays', valayIndex.toString(), 'name'], 
                                  e.target.value
                                )}
                                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base font-semibold bg-white border-2 border-gray-200/50 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                placeholder="Valay Name"
                              />
                            </div>
                            <div className="relative">
                              <InformationCircleIcon className="absolute left-3 top-3 h-4 w-4 text-green-600" />
                              <input
                                type="text"
                                value={valay.description || ''}
                                onChange={(e) => updateField(
                                  ['khandas', khandaIndex.toString(), 'valays', valayIndex.toString(), 'description'], 
                                  e.target.value
                                )}
                                className="w-full pl-10 pr-4 py-2 bg-white border-2 border-gray-200/50 rounded-lg focus:outline-none focus:ring-4 focus:ring-green-500/20 focus:border-green-500 transition-all"
                                placeholder="Description"
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => addMilan(khandaIndex, valayIndex)}
                              className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                            >
                              <PlusIcon className="h-3 w-3" />
                              <span className="hidden sm:inline">Milan</span>
                            </button>
                            <button
                              onClick={() => deleteItem('valay', khandaIndex, valayIndex)}
                              className="p-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                            >
                              <TrashIcon className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Milans */}
                      {expandedSections.has(`valay-${khandaIndex}-${valayIndex}`) && (
                        <div className="p-3 sm:p-4 space-y-3">
                          {valay.milans.map((milan, milanIndex) => (
                            <div key={milan._id} className="bg-white/80 rounded-xl border-2 border-gray-200/50 p-3 sm:p-4">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center flex-shrink-0">
                                    <span className="text-purple-600 font-bold text-xs">{milanIndex + 1}</span>
                                  </div>
                                  <div className="relative flex-1">
                                    <UsersIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-600" />
                                    <input
                                      type="text"
                                      value={milan.name}
                                      onChange={(e) => updateField(
                                        ['khandas', khandaIndex.toString(), 'valays', valayIndex.toString(), 'milans', milanIndex.toString(), 'name'], 
                                        e.target.value
                                      )}
                                      className="w-full pl-10 pr-4 py-2 text-sm font-medium bg-white border-2 border-gray-200/50 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                                      placeholder="Milan Name"
                                    />
                                  </div>
                                </div>
                                
                                <div className="flex gap-2 justify-end">
                                  <button
                                    onClick={() => addGhata(khandaIndex, valayIndex, milanIndex)}
                                    className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 text-sm"
                                  >
                                    <UserPlusIcon className="h-3 w-3" />
                                    <span className="hidden sm:inline">Ghata</span>
                                  </button>
                                  <button
                                    onClick={() => deleteItem('milan', khandaIndex, valayIndex, milanIndex)}
                                    className="p-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                                  >
                                    <TrashIcon className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>

                              {/* Ghatas */}
                              <div className="ml-4 sm:ml-8 space-y-2">
                                {milan.ghatas.map((ghata, ghataIndex) => (
                                  <div key={ghata._id} className="flex items-center gap-3 bg-gradient-to-r from-gray-50 to-orange-50/50 rounded-lg p-2 sm:p-3">
                                    <div className="w-4 h-4 bg-orange-100 rounded flex items-center justify-center flex-shrink-0">
                                      <span className="text-orange-600 font-bold text-xs">{ghataIndex + 1}</span>
                                    </div>
                                    <div className="relative flex-1">
                                      <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-orange-600" />
                                      <input
                                        type="text"
                                        value={ghata.name}
                                        onChange={(e) => updateField(
                                          ['khandas', khandaIndex.toString(), 'valays', valayIndex.toString(), 'milans', milanIndex.toString(), 'ghatas', ghataIndex.toString(), 'name'], 
                                          e.target.value
                                        )}
                                        className="w-full pl-8 pr-4 py-1 sm:py-2 bg-white border-2 border-gray-200/50 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                                        placeholder="Ghata Name"
                                      />
                                    </div>
                                    <button
                                      onClick={() => deleteItem('ghata', khandaIndex, valayIndex, milanIndex, ghataIndex)}
                                      className="p-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-lg hover:shadow-xl hover:scale-105 flex-shrink-0"
                                    >
                                      <TrashIcon className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={() => addGhata(khandaIndex, valayIndex, milanIndex)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:text-orange-700 transition-colors ml-4"
                                >
                                  <PlusIcon className="h-4 w-4" />
                                  Add Ghata
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredOrganization?.khandas.length === 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-12 lg:p-16 text-center border-2 border-dashed border-gray-300/50">
            <div className="max-w-md mx-auto">
              <BuildingLibraryIcon className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-6" />
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-600 mb-3">
                {searchTerm ? 'No matching results found' : 'No Khandas Created Yet'}
              </h3>
              <p className="text-gray-500 mb-8 text-sm sm:text-base lg:text-lg">
                {searchTerm 
                  ? 'Try adjusting your search terms to find what you\'re looking for.'
                  : 'Start building your spiritual organization hierarchy by creating your first Khanda'
                }
              </p>
              {!searchTerm && (
                <button
                  onClick={addKhanda}
                  className="inline-flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 transform duration-200 text-base sm:text-lg font-semibold"
                >
                  <FolderPlusIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                  Create Your First Khanda
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple UserIcon component
function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}