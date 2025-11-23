import React from 'react';
import { Icons } from './Icons';
import { AVAILABLE_RECITERS } from '../types';

interface HeaderProps {
  onOpenSidebar: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (isOpen: boolean) => void;
  darkMode: boolean;
  setDarkMode: (isDark: boolean) => void;
  arabicFontSize: number;
  setArabicFontSize: (size: number) => void;
  translationFontSize: number;
  setTranslationFontSize: (size: number) => void;
  reciterId: string;
  setReciterId: (id: string) => void;
  continuousPlay: boolean;
  setContinuousPlay: (enabled: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSidebar,
  isSettingsOpen,
  setIsSettingsOpen,
  darkMode,
  setDarkMode,
  arabicFontSize,
  setArabicFontSize,
  translationFontSize,
  setTranslationFontSize,
  reciterId,
  setReciterId,
  continuousPlay,
  setContinuousPlay,
}) => {
  const [deferredPrompt, setDeferredPrompt] = React.useState<any>(null);

  React.useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-950 z-20">
      <div className="flex items-center gap-2">
         <button onClick={onOpenSidebar} className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300">
           <Icons.Menu className="w-6 h-6" />
         </button>
         <span className="font-bold text-lg text-slate-800 dark:text-white font-sans lg:hidden">AI Tafsir</span>
      </div>

      <div className="relative">
        <button 
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className={`p-2 rounded-full transition-colors ${isSettingsOpen ? 'bg-slate-100 dark:bg-slate-800 text-emerald-500' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Icons.Settings className="w-5 h-5" />
        </button>

        {/* Settings Popover */}
        {isSettingsOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right max-h-[80vh] overflow-y-auto custom-scrollbar">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
              <Icons.Settings className="w-4 h-4" /> Settings
            </h4>
            
            {/* Theme Toggle */}
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-slate-600 dark:text-slate-400">Theme</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button 
                  onClick={() => setDarkMode(false)}
                  className={`p-1.5 rounded-md transition-all ${!darkMode ? 'bg-white text-orange-500 shadow-sm' : 'text-slate-400'}`}
                >
                  <Icons.Sun className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setDarkMode(true)}
                  className={`p-1.5 rounded-md transition-all ${darkMode ? 'bg-slate-700 text-blue-400 shadow-sm' : 'text-slate-400'}`}
                >
                  <Icons.Moon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Reciter Selection */}
            <div className="mb-6">
              <span className="text-sm text-slate-600 dark:text-slate-400 block mb-2">Reciter</span>
              <select
                value={reciterId}
                onChange={(e) => setReciterId(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-100 dark:bg-slate-800 border-none text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-emerald-500 mb-3"
              >
                {AVAILABLE_RECITERS.map((reciter) => (
                  <option key={reciter.id} value={reciter.id}>
                    {reciter.name}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">Auto-play Next</span>
                <button 
                  onClick={() => setContinuousPlay(!continuousPlay)}
                  className={`w-10 h-5 rounded-full transition-colors relative ${continuousPlay ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${continuousPlay ? 'left-6' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>

            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
              <Icons.Type className="w-4 h-4" /> Typography
            </h4>

            {/* Arabic Font Size */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Arabic Size</span>
                <span className="text-xs text-slate-400 font-mono">{arabicFontSize}px</span>
              </div>
              <input 
                type="range" 
                min="24" 
                max="60" 
                value={arabicFontSize} 
                onChange={(e) => setArabicFontSize(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Translation Font Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-400">Translation Size</span>
                <span className="text-xs text-slate-400 font-mono">{translationFontSize}px</span>
              </div>
              <input 
                type="range" 
                min="14" 
                max="30" 
                value={translationFontSize} 
                onChange={(e) => setTranslationFontSize(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Install App Button */}
            {deferredPrompt && (
              <>
                <div className="border-t border-slate-100 dark:border-slate-800 my-4"></div>
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg transition-colors text-sm font-medium shadow-sm"
                >
                  <Icons.Download className="w-4 h-4" />
                  Install App
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
