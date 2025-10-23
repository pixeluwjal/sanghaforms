import { useState } from "react";
import { Image, Upload, Loader2, CheckCheck } from "lucide-react";
import toast from "react-hot-toast";

interface FaviconUploadProps {
  form: Form;
  onUpdate: (updates: Partial<Form>) => void;
}

export default function FaviconUpload({ form, onUpdate }: FaviconUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(form.images?.favicon || "");

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (PNG, JPG, etc.)');
      return;
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }

    setUploading(true);

    try {
      console.log('📤 FaviconUpload - Starting upload...', {
        name: file.name,
        type: file.type,
        size: file.size
      });

      const formData = new FormData();
      formData.append('file', file);

      console.log('📤 FaviconUpload - Calling Cloudinary API...');
      const response = await fetch('/api/upload/cloudinary', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 FaviconUpload - API Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ FaviconUpload - Upload failed:', errorData);
        throw new Error(errorData.error || `Upload failed with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ FaviconUpload - Upload successful:', data);

      if (!data.url) {
        throw new Error('No URL returned from upload');
      }

      // FIXED: Update form images correctly
      const updatedImages = {
        ...form.images,
        favicon: data.url
      };

      console.log('🖼️ FaviconUpload - Sending form update with images:', updatedImages);
      
      // FIXED: Send the correct structure
      onUpdate({ images: updatedImages });
      setPreviewUrl(data.url);
      toast.success('Favicon uploaded successfully!');

    } catch (error: any) {
      console.error('❌ FaviconUpload - Error:', error);
      toast.error(error.message || 'Failed to upload favicon. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const removeFavicon = () => {
    const updatedImages = {
      ...form.images,
      favicon: ""
    };
    console.log('🗑️ FaviconUpload - Removing favicon');
    onUpdate({ images: updatedImages });
    setPreviewUrl("");
    toast.success('Favicon removed');
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Image className="w-4 h-4 text-purple-600" />
        Favicon
      </label>
      
      <div className="p-6 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 transition-all duration-300 hover:border-purple-400">
        <div className="text-center">
          {previewUrl ? (
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <img 
                  src={previewUrl} 
                  alt="Favicon preview" 
                  className="w-16 h-16 rounded-lg object-cover border-2 border-purple-200 shadow-lg"
                  onError={(e) => {
                    console.error('❌ FaviconUpload - Image failed to load:', previewUrl);
                    toast.error('Failed to load favicon image');
                  }}
                />
                <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                  <CheckCheck className="w-3 h-3" />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-slate-700">Favicon uploaded</p>
                <button
                  onClick={removeFavicon}
                  className="px-3 py-1 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-lg flex items-center justify-center border-2 border-purple-200">
                <Image className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700 mb-1">Upload Favicon</p>
                <p className="text-xs text-slate-500 mb-3">
                  Recommended: 32×32 or 64×64 PNG
                </p>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                  <div className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors inline-flex items-center gap-2 ${
                    uploading 
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                      : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                  }`}>
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="text-xs text-slate-500">
        This favicon will be displayed in the browser tab when users visit your form.
      </p>
    </div>
  );
}