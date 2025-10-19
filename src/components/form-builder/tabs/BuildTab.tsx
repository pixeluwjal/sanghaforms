'use client';

import { useState, useRef } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus, LayoutTemplate, Image as ImageIcon, Trash2, Loader2, UploadCloud, ChevronRight, Menu } from 'lucide-react'; 
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
  onMobileToolboxClose: () => void;
}

const PRIMARY_COLOR = 'indigo';

export default function BuildTab({
  form,
  updateForm,
  showToolbox,
  sensors,
  onMobileToolboxOpen,
  onMobileToolboxClose
}: BuildTabProps) {
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isDraggingSection, setIsDraggingSection] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const addSection = (insertAfterId: string | null = null) => {
    const newSection: Section = { id: `section-${Date.now()}`, title: 'New Section', description: '', order: 0, fields: [], conditionalRules: [] };
    let newSections = [...(form.sections || [])];
    
    if (insertAfterId === null || newSections.length === 0) {
      newSections.splice(0, 0, newSection);
    } else {
      const insertIndex = newSections.findIndex(s => s.id === insertAfterId) + 1;
      newSections.splice(insertIndex, 0, newSection);
    }
    
    updateForm({ sections: newSections.map((s, i) => ({ ...s, order: i })) });
    toast.success(`New section added`);
  };
  
  const handleDragStart = () => {
    setIsDraggingSection(true);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDraggingSection(false);
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
      
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 md:hidden">
        <div className="flex items-center justify-between p-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
          
          <h1 className="text-lg font-semibold text-slate-800 truncate max-w-[140px]">
            {form.title || 'Untitled Form'}
          </h1>
          
          <button 
            onClick={onMobileToolboxOpen}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Plus className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-16 left-4 right-4 bg-white rounded-2xl shadow-2xl p-4 animate-in slide-in-from-top-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2">
              <button 
                onClick={() => {
                  addSection(null);
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <Plus className="w-5 h-5 text-slate-700" />
                <span className="font-medium">Add Section</span>
              </button>
              <button 
                onClick={() => {
                  bannerInputRef.current?.click();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <ImageIcon className="w-5 h-5 text-slate-700" />
                <span className="font-medium">Upload Banner</span>
              </button>
              <button 
                onClick={() => {
                  logoInputRef.current?.click();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-left"
              >
                <ImageIcon className="w-5 h-5 text-slate-700" />
                <span className="font-medium">Upload Logo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Toolbox Toggle */}
      {!showToolbox && (
        <button 
          onClick={onMobileToolboxOpen}
          className="fixed bottom-6 right-6 z-50 md:hidden p-4 rounded-full bg-white shadow-2xl shadow-indigo-500/50 border border-slate-200 text-indigo-600 transition-all duration-300 hover:scale-105 active:scale-95"
          title="Open Toolbox"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Toolbox Sidebar */}
      {showToolbox && (
        <ToolboxSidebar 
          onAddSection={() => addSection(null)}
          onAddField={() => toast("Drag & drop fields coming soon!")}
          onMobileClose={onMobileToolboxClose}
        />
      )}

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${showToolbox ? 'md:ml-64' : ''} w-full pt-16 md:pt-0`}>
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-12 space-y-6 md:space-y-8">
          
          {/* Banner & Logo Card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-slate-200 shadow-xl shadow-indigo-100 overflow-hidden relative transition-shadow duration-300 hover:shadow-2xl">
            
            {/* Banner Section */}
            <div className="relative h-40 sm:h-48 md:h-56 bg-slate-100/70 flex items-center justify-center group/banner transition-all duration-300">
              <input type="file" ref={bannerInputRef} onChange={(e) => handleFileUpload(e, 'banner')} className="hidden" accept="image/*" />
              {form.images?.banner ? (
                <>
                  <img 
                    src={form.images.banner} 
                    alt="Banner" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover/banner:scale-[1.02]" 
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/banner:opacity-100 transition-opacity duration-300 space-x-2 md:space-x-3">
                    <button 
                      onClick={() => bannerInputRef.current?.click()} 
                      className="px-3 py-1.5 md:px-5 md:py-2 bg-white/95 text-slate-800 rounded-full text-xs md:text-sm font-semibold hover:bg-white transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    >
                      Change Banner
                    </button>
                  </div>
                  <button 
                    onClick={() => handleImageRemove('banner')} 
                    className="absolute top-2 right-2 md:top-4 md:right-4 p-1.5 md:p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover/banner:opacity-100 hover:bg-red-600 transition-all duration-300 shadow-lg" 
                    title="Remove banner"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => bannerInputRef.current?.click()} 
                  disabled={isUploadingBanner} 
                  className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-200/60 transition-colors disabled:cursor-wait p-4"
                >
                  {isUploadingBanner ? (
                    <Loader2 className="w-6 h-6 md:w-10 md:h-10 animate-spin text-indigo-600" />
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 md:w-12 md:h-12 text-indigo-400" />
                      <span className="mt-2 text-sm md:text-base font-semibold text-center px-4">
                        Click to Upload Banner
                      </span>
                      <span className="text-xs text-slate-500 mt-1 hidden sm:block">
                        16:9 aspect ratio recommended
                      </span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Logo Section */}
            <div className="relative flex justify-center -mt-12 md:-mt-16 z-20 pb-6 md:pb-8 px-4 md:px-6">
              <input type="file" ref={logoInputRef} onChange={(e) => handleFileUpload(e, 'logo')} className="hidden" accept="image/*" />
              <div className="relative group/logo">
                <div className="w-20 h-20 md:w-32 md:h-32 rounded-full border-4 border-white bg-slate-200 shadow-2xl flex items-center justify-center transform group-hover/logo:scale-105 transition-transform duration-300">
                  {form.images?.logo ? (
                    <img src={form.images.logo} alt="Logo" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <ImageIcon className="w-8 h-8 md:w-14 md:h-14 text-slate-400" />
                  )}
                </div>
                <button 
                  onClick={() => logoInputRef.current?.click()} 
                  disabled={isUploadingLogo} 
                  className="absolute inset-0 w-20 h-20 md:w-32 md:h-32 bg-black/50 rounded-full flex items-center justify-center text-white text-sm md:text-base font-bold opacity-0 group-hover/logo:opacity-100 transition-opacity duration-300 cursor-pointer disabled:cursor-wait"
                >
                  {isUploadingLogo ? (
                    <Loader2 className="w-4 h-4 md:w-8 md:h-8 animate-spin" />
                  ) : (
                    form.images?.logo ? 'Change' : 'Upload'
                  )}
                </button>
                {form.images?.logo && (
                  <button 
                    onClick={() => handleImageRemove('logo')} 
                    className="absolute -top-1 -right-1 p-1 md:p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-all duration-300 transform hover:scale-110" 
                    title="Remove logo"
                  >
                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Title & Description Card */}
          <div className="p-4 md:p-8 bg-white/90 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-slate-200 shadow-xl shadow-indigo-100">
            <input 
              type="text" 
              value={form.title} 
              onChange={(e) => updateForm({ title: e.target.value })} 
              placeholder="Form Title"
              className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 w-full bg-transparent border-none focus:outline-none focus:ring-4 focus:ring-indigo-200 rounded-xl p-2 md:p-3 -ml-2 md:-ml-3 transition-all duration-200 placeholder:text-slate-400" 
            />
            <TextareaAutosize 
              value={form.description} 
              onChange={(e) => updateForm({ description: e.target.value })} 
              placeholder="Add a compelling description for your form..."
              className="text-base md:text-xl text-slate-600 w-full bg-transparent border-none focus:outline-none focus:ring-4 focus:ring-indigo-200 rounded-xl p-2 md:p-3 -ml-2 md:-ml-3 mt-2 md:mt-4 resize-none transition-all duration-200 placeholder:text-slate-400" 
              minRows={2}
            />
          </div>

          {/* Sections */}
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd} 
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext items={form.sections?.map(s => s.id) || []} strategy={verticalListSortingStrategy}>
              <SectionList 
                form={form} 
                updateForm={updateForm} 
                onAddSection={addSection} 
                isDraggingSection={isDraggingSection}
              />
            </SortableContext>
          </DndContext>

          {/* Empty State */}
          {(!form.sections || form.sections.length === 0) && (
            <div className="text-center p-8 md:p-16 border-4 border-dashed border-indigo-200 rounded-2xl md:rounded-3xl bg-indigo-50/50 transition-all duration-300 hover:border-indigo-400">
              <div className="inline-block p-3 md:p-5 bg-white rounded-full border border-indigo-100 shadow-xl shadow-indigo-100">
                <LayoutTemplate className="w-8 h-8 md:w-12 md:h-12 text-indigo-600" />
              </div>
              <h3 className="mt-4 md:mt-6 text-xl md:text-2xl font-bold text-slate-800">Your Canvas is Waiting</h3>
              <p className="mt-2 md:mt-3 text-sm md:text-lg text-slate-500 max-w-md mx-auto">
                It's empty! Click below to add your first section and bring this form to life.
              </p>
              <button 
                onClick={() => addSection(null)} 
                className="mt-6 md:mt-8 flex items-center gap-2 mx-auto px-6 py-2.5 md:px-8 md:py-3.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-lg md:rounded-xl shadow-lg shadow-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/60 transform hover:-translate-y-1 transition-all duration-300 font-bold text-sm md:text-lg focus:ring-4 focus:ring-indigo-300"
              >
                <Plus className="w-4 h-4 md:w-6 md:h-6" /> 
                <span>Add First Section</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}