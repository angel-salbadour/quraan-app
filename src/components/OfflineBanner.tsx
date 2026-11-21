import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-300/60 bg-amber-50 dark:bg-amber-950/70 dark:border-amber-800/60 px-4 py-2 text-center text-xs font-medium text-amber-900 dark:text-amber-200"
    >
      <span className="inline-flex items-center gap-1.5">
        <WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>وضع عدم الاتصال — يمكنك قراءة السور المحفوظة مسبقًا دون إنترنت.</span>
      </span>
    </div>
  );
};
