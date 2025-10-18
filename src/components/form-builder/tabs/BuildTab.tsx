'use client';

import { useState, useRef } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, LayoutTemplate, Image as ImageIcon, Trash2, Loader2, UploadCloud, ChevronRight } from 'lucide-react'; 
import toast from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';

import { Form, Section } from '../shared/types';
import SectionList from '../sections/SectionList';
import ToolboxSidebar from '../shared/ToolboxSidebar';

interface BuildTabProps {
  form: Form;
  updateForm: (updates: Partial<Form>) => void;
  showToolbox: boolean;
  sensors: any;
  onMobileToolboxOpen: () => void;
}

const PRIMARY_COLOR = 'indigo';

export default function BuildTab({
  form,
  updateForm,
  showToolbox,
  sensors,
  onMobileToolboxOpen
}: BuildTabProps) {
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  // NEW STATE: Global flag to signal section dragging is active
  const [isDraggingSection, setIsDraggingSection] = useState(false);
  
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // --- Core Logic Fix: Correctly handling insertion at the top (insertAfterId = null) ---
  const addSection = (insertAfterId: string | null = null) => {
    const newSection: Section = { id: `section-${Date.now()}`, title: 'New Section', description: '', order: 0, fields: [], conditionalRules: [] };
    let newSections = [...(form.sections || [])];
    
    // FIX: Check for null insertion (Add to Top) specifically.
    if (insertAfterId === null || newSections.length === 0) {
      newSections.splice(0, 0, newSection); // Insert at index 0
    } else {
      const insertIndex = newSections.findIndex(s => s.id === insertAfterId) + 1;
      newSections.splice(insertIndex, 0, newSection); // Insert after specified ID
    }
    
    updateForm({ sections: newSections.map((s, i) => ({ ...s, order: i })) });
    toast.success(`New section added`);
  };
  
  // --- Drag Logic Enhancement ---
  const handleDragStart = () => {
    setIsDraggingSection(true); // Minimize all sections when drag starts
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingSection(false); // Restore sections when drag ends
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const sections = form.sections || [];
      const oldIndex = sections.findIndex(s => s.id === active.id);
      const newIndex = sections.findIndex(s => s.id === over.id);
      updateForm({ sections: arrayMove(sections, oldIndex, newIndex).map((s, i) => ({ ...s, order: i })) });
      toast.success('Section order updated');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (type === 'banner') setIsUploadingBanner(true);
    if (type === 'logo') setIsUploadingLogo(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || data.error) throw new Error(data.error || 'Upload failed');
      
      updateForm({ images: { ...form.images, [type]: data.url } });
      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded!`);
    } catch (error: any) {
      toast.error(`Upload error: ${error.message}`);
    } finally {
      if (type === 'banner') setIsUploadingBanner(false);
      if (type === 'logo') setIsUploadingLogo(false);
      event.target.value = '';
    }
  };
  
  const handleImageRemove = (type: 'banner' | 'logo') => {
    const newImages = { ...form.images };
    delete newImages[type];
    updateForm({ images: newImages });
    toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} removed.`);
  };

  return (
    <div className={`flex h-full bg-slate-50/50 relative ${PRIMARY_COLOR}-50`}>
      
      {!showToolbox && (
        <button 
          onClick={onMobileToolboxOpen}
          className={`fixed bottom-6 right-6 z-50 md:hidden p-3 rounded-full bg-white shadow-2xl shadow-${PRIMARY_COLOR}-500/50 border border-slate-200 text-${PRIMARY_COLOR}-600 transition-all duration-300 hover:scale-105 active:scale-95`}
          title="Open Toolbox"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {showToolbox && (
        <ToolboxSidebar 
          onAddSection={() => addSection(null)}
          onAddField={() => toast("Drag & drop fields coming soon!")}
        />
      )}

      <div className={`flex-1 transition-all duration-300 ease-in-out ${showToolbox ? 'md:ml-64' : ''}`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">

          {/* ... [Image Upload and Title Card UI remains the same] ... */}
          <div className={`bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl shadow-${PRIMARY_COLOR}-100 overflow-hidden relative transition-shadow duration-300 hover:shadow-2xl`}>
            
            <div className="relative h-56 bg-slate-100/70 flex items-center justify-center group/banner transition-all duration-300">
              <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" accept="image/*" />
              {form.images?.banner ? (
                <>
                  <img src={form.images.banner} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover/banner:scale-[1.02]" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300 space-x-3">
                    <button onClick={() => bannerInputRef.current?.click()} className="px-5 py-2 bg-white/95 text-slate-800 rounded-full text-sm font-semibold hover:bg-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Change Banner</button>
                  </div>
                  <button onClick={() => handleImageRemove('banner')} className="absolute top-4 right-4 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover/banner:opacity-100 hover:bg-red-600 transition-all duration-300 shadow-lg" title="Remove banner">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button onClick={() => bannerInputRef.current?.click()} disabled={isUploadingBanner} className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-colors disabled:cursor-wait p-6">
                  {isUploadingBanner ? <Loader2 className={`w-10 h-10 animate-spin text-${PRIMARY_COLOR}-600`} /> : <><UploadCloud className={`w-12 h-12 text-${PRIMARY_COLOR}-400`} /><span className="mt-3 text-base font-semibold">Click to Upload Banner (16:9 recommended)</span></>}
                </button>
              )}
            </div>

            <div className="relative flex justify-center -mt-16 z-20 pb-8 px-6">
              <input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" />
              <div className="relative group/logo">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 shadow-2xl flex items-center justify-center transform group-hover/logo:scale-105 transition-transform duration-300">
                  {form.images?.logo ? <img src={form.images.logo} alt="Logo" className="w-full h-full object-cover rounded-full" /> : <ImageIcon className="w-14 h-14 text-slate-400" />}
                </div>
                <button onClick={() => logoInputRef.current?.click()} disabled={isUploadingLogo} className="absolute inset-0 w-32 h-32 bg-black/50 rounded-full flex items-center justify-center text-white text-base font-bold opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 cursor-pointer disabled:cursor-wait">
                  {isUploadingLogo ? <Loader2 className="w-8 h-8 animate-spin" /> : (form.images?.logo ? 'Change' : 'Upload')}
                </button>
                {form.images?.logo && (
                  <button onClick={() => handleImageRemove('logo')} className="absolute -top-1 -right-1 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-110" title="Remove logo">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className={`p-8 bg-white/90 backdrop-blur-xl rounded-3xl border border-slate-200 shadow-xl shadow-${PRIMARY_COLOR}-100`}>
            <input 
              type="text" 
              value={form.title} 
              onChange={(e) => updateForm({ title: e.target.value })} 
              placeholder="Form Title"
              className={`text-5xl font-extrabold text-slate-900 w-full bg-transparent border-none focus:outline-none focus:ring-4 focus:ring-${PRIMARY_COLOR}-200 rounded-xl p-3 -ml-3 transition-all duration-200 placeholder:text-slate-400`} 
            />
            <TextareaAutosize 
              value={form.description} 
              onChange={(e) => updateForm({ description: e.target.value })} 
              placeholder="Add a compelling description for your form..."
              className={`text-xl text-slate-600 w-full bg-transparent border-none focus:outline-none focus:ring-4 focus:ring-${PRIMARY_COLOR}-200 rounded-xl p-3 -ml-3 mt-4 resize-none transition-all duration-200 placeholder:text-slate-400`} 
              minRows={2}
            />
          </div>
          {/* --- END Image Upload and Title Card UI --- */}
          
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart} // NEW: Handle drag start
            onDragEnd={handleDragEnd} 
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={form.sections?.map(s => s.id) || []} strategy={verticalListSortingStrategy}>
              <SectionList 
                form={form} 
                updateForm={updateForm} 
                onAddSection={addSection} 
                isDraggingSection={isDraggingSection} // PASS NEW STATE
              />
            </SortableContext>
          </DndContext>

          {(!form.sections || form.sections.length === 0) && (
            <div className={`text-center p-16 border-4 border-dashed border-${PRIMARY_COLOR}-200 rounded-3xl bg-${PRIMARY_COLOR}-50/50 transition-all duration-300 hover:border-${PRIMARY_COLOR}-400`}>
              <div className={`inline-block p-5 bg-white rounded-full border border-${PRIMARY_COLOR}-100 shadow-xl shadow-${PRIMARY_COLOR}-100`}>
                <LayoutTemplate className={`w-12 h-12 text-${PRIMARY_COLOR}-600`} />
              </div>
              <h3 className="mt-6 text-2xl font-bold text-slate-800">Your Canvas is Waiting</h3>
              <p className="mt-3 text-lg text-slate-500">
                It's empty! Click below to add your first section and bring this form to life.
              </p>
              <button 
                onClick={() => addSection(null)} 
                className={`mt-8 flex items-center gap-2 mx-auto px-8 py-3.5 bg-gradient-to-r from-${PRIMARY_COLOR}-600 to-${PRIMARY_COLOR}-500 text-white rounded-xl shadow-lg shadow-${PRIMARY_COLOR}-500/40 hover:shadow-2xl hover:shadow-${PRIMARY_COLOR}-500/60 transform hover:-translate-y-1 transition-all duration-300 font-bold text-lg focus:ring-4 focus:ring-${PRIMARY_COLOR}-300`}
              >
                <Plus className="w-6 h-6" /> Add First Section
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
