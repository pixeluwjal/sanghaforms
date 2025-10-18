'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Type, 
  FileText, 
  List,
  Eye, 
  CheckSquare,
  Users,
  Loader2
} from 'lucide-react';

import { Field } from '../shared/types';
import FieldPreview from './FieldPreview';

interface FieldItemProps {
  field: Field;
  onUpdate: (updates: Partial<Field>) => void;
  onDelete: () => void;
}

// --- API STRUCTURE FOR SANGHA HIERARCHY ---
interface Valaya { _id: string; name: string; milans: string[]; }
interface Khanda { _id: string; name: string; valays: Valaya[]; milans: string[]; }
interface Vibhaaga { _id: string; name: string; khandas: Khanda[]; }

const fetchSanghaHierarchy = async (): Promise<Vibhaaga[]> => {
    try {
        // Fetching from the specified API endpoint
        const response = await fetch('/api/organization');
        if (!response.ok) {
            throw new Error(`API returned status ${response.status}`);
        }
        const data = await response.json();
        // Assuming the response body is { organizations: Vibhaaga[] }
        return data.organizations || [];
    } catch (error) {
        console.error("Failed to load Sangha data from API:", error);
        // Fallback or empty array if fetch fails
        return [];
    }
};
// ----------------------------------------------------


export default function FieldItem({ field, onUpdate, onDelete }: FieldItemProps) {
  // Use a state-driven approach for smooth expansion
  const [isExpanded, setIsExpanded] = useState(true);

  // --- Sangha Hierarchy State ---
  const [hierarchyData, setHierarchyData] = useState<Vibhaaga[]>([]);
  const [isLoadingHierarchy, setIsLoadingHierarchy] = useState(false);
  const [selectedVibhaag, setSelectedVibhaag] = useState<string>('');
  const [selectedKhanda, setSelectedKhanda] = useState<string>('');
  const [selectedValay, setSelectedValay] = useState<string>('');


  // Fetch hierarchy data on mount if the field is 'sangha'
  useEffect(() => {
    if (field.type === 'sangha' && hierarchyData.length === 0) {
      setIsLoadingHierarchy(true);
      fetchSanghaHierarchy().then(data => {
        setHierarchyData(data);
        setIsLoadingHierarchy(false);
      }).catch(error => {
        // Error handling is inside fetchSanghaHierarchy
        setIsLoadingHierarchy(false);
      });
    }
  }, [field.type, hierarchyData.length]);

  // Handlers for cascading dropdowns
  const handleVibhaagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVibhaag(e.target.value);
    setSelectedKhanda('');
    setSelectedValay('');
    // NOTE: In a real builder, we would update field.options here to store the selected path structure.
  };

  const handleKhandaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedKhanda(e.target.value);
    setSelectedValay('');
  };

  const handleValayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedValay(e.target.value);
  };

  // Derived state for the currently selected hierarchy path
  const currentVibhaag = hierarchyData.find(v => v._id === selectedVibhaag);
  const currentKhanda = currentVibhaag?.khandas.find(k => k._id === selectedKhanda);
  const currentValay = currentKhanda?.valays.find(v => v._id === selectedValay);

  // ----------------------------------------------------------------------

  return (
    // --- Enhanced Container: Deep shadow, purple accent on hover, and slight lift ---
    <div className="border-2 border-slate-200 rounded-2xl transition-all duration-300 bg-white shadow-xl hover:shadow-2xl hover:border-indigo-400/80 transform hover:-translate-y-0.5 group/field">
      <div className="p-5">
        
        {/* --- Header: Summary and Action Bar --- */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Title & Status Badges */}
            <p className="font-extrabold text-xl text-slate-800 truncate">{field.label || 'Untitled Field'}</p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {/* Field Type Badge */}
              <span className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full capitalize font-semibold shadow-inner">
                {field.type}
              </span>
              {/* Required Status Badge */}
              {field.required && (
                <span className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-full font-semibold flex items-center gap-1 shadow-inner">
                  <CheckSquare className="w-3 h-3"/> Required
                </span>
              )}
            </div>
          </div>
          
          {/* --- Action Buttons (Sleek and High-Contrast) --- */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-3 text-slate-500 hover:text-indigo-600 transition-colors duration-200 hover:bg-indigo-50 rounded-xl transform hover:scale-110"
              title={isExpanded ? 'Collapse Settings' : 'Expand Settings'}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <button
              onClick={onDelete}
              className="p-3 text-white bg-red-500 hover:bg-red-600 transition-colors duration-200 rounded-xl shadow-md transform hover:scale-110"
              title="Delete Field"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- Collapsible Body: Smooth Grid Transition --- */}
        <div 
          className={`transition-all duration-500 ease-in-out grid ${isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
        >
          <div className="overflow-hidden">
            {/* Content Area with Spacing */}
            <div className="mt-6 pt-6 border-t border-slate-200 space-y-6">
              
              {/* --- Input Grids (Label and Placeholder) --- */}
              {field.type !== 'sangha' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Field Label Input */}
                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-2">
                      <Type className="w-4 h-4 text-purple-600" />
                      Field Label
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => onUpdate({ label: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-400/50 focus:border-indigo-500 text-sm transition-all duration-200 shadow-inner bg-slate-50 focus:bg-white"
                      placeholder="E.g., Full Name"
                    />
                  </div>
                  
                  {/* Placeholder Text Input */}
                  <div>
                    <label className="block text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-purple-600" />
                      Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={field.placeholder || ''}
                      onChange={(e) => onUpdate({ placeholder: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-400/50 focus:border-indigo-500 text-sm transition-all duration-200 shadow-inner bg-slate-50 focus:bg-white"
                      placeholder="E.g., Enter your full name"
                    />
                  </div>
                </div>
              )}

              {/* --- Sangha Hierarchy Selector (Dynamic/API Driven) --- */}
              {field.type === 'sangha' && (
                <div className="p-6 bg-purple-50/70 rounded-xl border-2 border-purple-200 space-y-4">
                    <div className="flex items-center gap-2 text-purple-800 font-extrabold">
                        <Users className="w-5 h-5"/> Sangha Hierarchy Configuration
                    </div>
                    {isLoadingHierarchy ? (
                        <div className="flex items-center justify-center p-8 text-purple-600">
                            <Loader2 className="w-6 h-6 animate-spin mr-2"/> Loading Organization Data...
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Vibhaag */}
                            <select 
                                value={selectedVibhaag} 
                                onChange={handleVibhaagChange}
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:border-purple-500 text-sm transition-all duration-200 shadow-inner bg-white"
                            >
                                <option value="">Select Vibhaag</option>
                                {hierarchyData.map(v => (
                                    <option key={v._id} value={v._id}>{v.name}</option>
                                ))}
                            </select>

                            {/* Khanda */}
                            <select 
                                value={selectedKhanda} 
                                onChange={handleKhandaChange}
                                disabled={!currentVibhaag}
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:border-purple-500 text-sm transition-all duration-200 shadow-inner bg-white disabled:bg-slate-100"
                            >
                                <option value="">Select Khanda</option>
                                {currentVibhaag?.khandas.map(k => (
                                    <option key={k._id} value={k._id}>{k.name}</option>
                                ))}
                            </select>
                            
                            {/* Valaya */}
                            <select 
                                value={selectedValay} 
                                onChange={handleValayChange}
                                disabled={!currentKhanda}
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:border-purple-500 text-sm transition-all duration-200 shadow-inner bg-white disabled:bg-slate-100"
                            >
                                <option value="">Select Valaya</option>
                                {currentKhanda?.valays.map(v => (
                                    <option key={v._id} value={v._id}>{v.name}</option>
                                ))}
                            </select>

                            {/* Milan (Display only if Valay is selected and Valay has milans, or if Khanda has milans directly) */}
                            <select 
                                disabled={!currentValay && (!currentKhanda || currentKhanda.valays.length > 0)} // Disable if no Valay/Khanda or if Khanda has Valay structure
                                className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-purple-400/50 focus:border-purple-500 text-sm transition-all duration-200 shadow-inner bg-white disabled:bg-slate-100"
                            >
                                <option value="">Select Milan</option>
                                {currentValay 
                                    ? currentValay.milans.map(m => <option key={m} value={m}>{m}</option>)
                                    : (currentKhanda && currentKhanda.valays.length === 0 && currentKhanda.milans)
                                        ? currentKhanda.milans.map(m => <option key={m} value={m}>{m}</option>)
                                        : null
                                }
                            </select>
                            
                            {/* Note on data flow */}
                            <p className="sm:col-span-2 text-xs text-purple-600 mt-2">
                                Current Flow: {currentVibhaag?.name || 'Vibhaag'} &gt; {currentKhanda?.name || 'Khanda'} &gt; {currentValay?.name || 'Valay'} &gt; Milan
                            </p>
                        </div>
                    )}
                </div>
              )}

              {/* --- Options Area (Multi-line text input) --- */}
              {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
                <div>
                  <label className="block text-sm font-extrabold text-slate-700 mb-2 flex items-center gap-2">
                    <List className="w-4 h-4 text-purple-600" />
                    Options (one per line)
                  </label>
                  <textarea
                    value={field.options?.join('\n') || ''}
                    onChange={(e) => onUpdate({ options: e.target.value.split('\n').filter(opt => opt.trim()) })}
                    rows={6} // Increased rows for better usability
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl focus:ring-4 focus:ring-indigo-400/50 focus:border-indigo-500 text-sm transition-all duration-200 shadow-inner bg-slate-50 focus:bg-white resize-y"
                    placeholder="Option 1&#10;Option 2&#10;Option 3"
                  />
                  <p className="text-xs text-slate-500 mt-1">Separate each option onto a new line.</p>
                </div>
              )}

              {/* --- Required Checkbox (Prominent styling) --- */}
              <div className="flex items-center gap-4 p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 shadow-sm">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate({ required: e.target.checked })}
                  className="rounded-lg border-indigo-500 text-indigo-600 focus:ring-indigo-500 w-5 h-5 transition-all duration-200 shadow-md cursor-pointer"
                  id={`required-${field.id}`}
                />
                <label htmlFor={`required-${field.id}`} className="text-base font-semibold text-slate-800 select-none cursor-pointer">
                  Require an answer for this field
                </label>
              </div>

              {/* --- Enhanced Preview Section (Visually distinct) --- */}
              <div className="pt-6 border-t-2 border-indigo-100">
                <label className="block text-base font-extrabold text-slate-800 mb-3 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-indigo-600" />
                  Live Field Preview
                </label>
                
                <div className="p-5 bg-white rounded-xl border-2 border-indigo-300 shadow-inner shadow-indigo-50/50">
                  <FieldPreview field={field} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
