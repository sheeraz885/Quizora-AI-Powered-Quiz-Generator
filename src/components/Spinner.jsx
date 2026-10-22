import { Loader as Loader2 } from 'lucide-react';

export function Spinner({ className = '', size = 20 }) {
  return <Loader2 className={`animate-spin ${className}`} size={size} />;
}

export function FullPageLoader({ label = 'Loading...' }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-gray-400">
      <Spinner className="text-violet-500" size={32} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
