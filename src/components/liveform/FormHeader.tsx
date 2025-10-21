import Image from 'next/image';
import { FormData } from './types';

interface FormHeaderProps {
  formData: FormData;
}

export default function FormHeader({ formData }: FormHeaderProps) {
  return (
    <div className="text-center mb-12">
      {/* Header with Logo and Title */}
      <div className="flex flex-col lg:flex-row items-center justify-center mb-8 space-y-6 lg:space-y-0 lg:space-x-8">
        {formData.images?.logo && (
          <div className="relative w-28 h-28 lg:w-32 lg:h-32 flex items-center justify-center rounded-2xl shadow-2xl bg-gradient-to-br from-orange-50 to-amber-50 border-4 border-orange-200 transform hover:scale-105 transition-transform duration-300">
            <Image
              src={formData.images.logo}
              width={120}
              height={120}
              alt="Form logo"
              className="rounded-xl object-contain p-3"
              priority
            />
          </div>
        )}
        
        <div className="text-center lg:text-left max-w-3xl">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 animate-gradient">
            {formData.title}
          </h1>
          {formData.description && (
            <p className="text-lg sm:text-xl text-gray-600 mt-4 leading-relaxed font-medium">
              {formData.description}
            </p>
          )}
        </div>
      </div>

      {/* Banner Image - Responsive and Attractive */}
      {formData.images?.banner && (
        <div className="mt-8 rounded-3xl overflow-hidden shadow-2xl max-w-6xl mx-auto border-4 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-2">
          <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 rounded-2xl overflow-hidden">
            <Image
              src={formData.images.banner}
              fill
              alt="Form banner"
              className="object-cover object-center hover:scale-105 transition-transform duration-700"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      )}

      {/* Decorative elements */}
      <div className="flex justify-center space-x-2 mt-6">
        <div className="w-3 h-3 bg-orange-400 rounded-full animate-bounce"></div>
        <div className="w-3 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
    </div>
  );
}