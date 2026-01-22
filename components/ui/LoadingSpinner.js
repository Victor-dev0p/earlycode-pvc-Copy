import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ size = 24, className = '' }) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <Loader2 className="animate-spin text-blue-500" size={size} />
    </div>
  );
}