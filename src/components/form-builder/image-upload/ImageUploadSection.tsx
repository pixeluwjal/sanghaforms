'use client';

import { Form } from '../shared/types';
import ImageUpload from './ImageUpload';

interface ImageUploadSectionProps {
  form: Form;
  onImageUpload: (type: 'logo' | 'banner', url: string) => void;
  onImageRemove: (type: 'logo' | 'banner') => void;
  onThemeUpdate: (theme: any) => void;
}

export default function ImageUploadSection({
  form,
  onImageUpload,
  onImageRemove,
  onThemeUpdate
}: ImageUploadSectionProps) {
  return (
    <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-3">Form Branding</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Logo</label>
          <ImageUpload
            type="logo"
            currentImage={form.images?.logo}
            onUpload={(url) => onImageUpload('logo', url)}
            onRemove={() => onImageRemove('logo')}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Banner</label>
          <ImageUpload
            type="banner"
            currentImage={form.images?.banner}
            onUpload={(url) => onImageUpload('banner', url)}
            onRemove={() => onImageRemove('banner')}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Primary Color
        </label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={form.theme?.primaryColor || '#7C3AED'}
            onChange={(e) => onThemeUpdate({ ...form.theme, primaryColor: e.target.value })}
            className="w-12 h-12 rounded-xl cursor-pointer border border-gray-300 shadow-inner"
          />
          <div className="flex-1">
            <input
              type="text"
              value={form.theme?.primaryColor || '#7C3AED'}
              onChange={(e) => onThemeUpdate({ ...form.theme, primaryColor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-mono"
              placeholder="#7C3AED"
            />
          </div>
        </div>
      </div>
    </div>
  );
}