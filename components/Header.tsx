import React from 'react';
import { Icons } from './Icons';

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
}) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-950 z-20">
      <div className="flex items-center gap-2">
         <button onClick={onOpenSidebar} className="lg:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300">
           <Icons.Menu className="w-6 h-6" />
         </button>
         <span className="font-bold text-lg text-slate-800 dark:text-white font-sans lg:hidden">Nur Al-Quran</span>
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
          <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-4 text-sm uppercase tracking-wide flex items-center gap-2">
              <Icons.Settings className="w-4 h-4" /> Appearance
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
          </div>
        )}
      </div>
    </header>
  );
};
