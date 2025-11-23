import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 3000); // Hide "Back online" after 3s
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showBanner && isOnline) return null;

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 transition-all duration-300 ${isOnline ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-white'}`}>
      {isOnline ? (
        <>
          <Icons.Wifi className="w-4 h-4" />
          <span className="text-sm font-medium">Back Online</span>
        </>
      ) : (
        <>
          <Icons.WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">You are offline</span>
        </>
      )}
    </div>
  );
};
