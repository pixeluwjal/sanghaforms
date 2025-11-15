import { useEffect } from 'react';

interface ToastProps {
  toast: { message: string; type: 'success' | 'error' } | null;
  onClose: () => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-2xl shadow-lg border transform animate-slide-in ${
      toast.type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <p className="font-medium">{toast.message}</p>
      </div>
    </div>
  );
}