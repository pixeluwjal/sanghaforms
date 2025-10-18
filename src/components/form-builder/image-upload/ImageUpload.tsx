'use client';

import { useState } from 'react';
import { Upload } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  type: 'logo' | 'banner';
  currentImage?: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
}

const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'form_builder_preset');

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/dcp3r3dc3/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    
    if (data.secure_url) {
      return data.secure_url;
    } else {
      throw new Error(data.error?.message || 'Upload failed');
    }
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export default function ImageUpload({ type, currentImage, onUpload, onRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, GIF, WebP, SVG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      onUpload(imageUrl);
    } catch (error) {
      toast.error('Failed to upload image: ' + (error as Error).message);
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-dashed border-gray-300 p-6 text-center hover:border-purple-400 transition-all duration-300 hover:shadow-lg">
      {currentImage ? (
        <div className="relative">
          <img 
            src={currentImage} 
            alt={type}
            className={`mx-auto mb-4 object-contain transition-transform duration-300 hover:scale-105 ${
              type === 'logo' ? 'w-24 h-24 rounded-2xl shadow-md' : 'w-full h-32 rounded-xl shadow-md'
            }`}
          />
          <div className="flex gap-3 justify-center">
            <label className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-sm rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg">
              {isUploading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'Change'
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
            <button
              onClick={onRemove}
              disabled={isUploading}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label className="cursor-pointer block">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="py-6">
              <div className="w-12 h-12 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-semibold text-gray-800">Uploading...</p>
              <p className="text-xs text-gray-500 mt-1">Please wait</p>
            </div>
          ) : (
            <div className="py-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                <Upload className="w-8 h-8 text-purple-600" />
              </div>
              <p className="text-sm font-semibold text-gray-800 capitalize">Upload {type}</p>
              <p className="text-xs text-gray-500 mt-2">Click to browse files</p>
              <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, WebP, SVG up to 5MB</p>
            </div>
          )}
        </label>
      )}
    </div>
  );
}