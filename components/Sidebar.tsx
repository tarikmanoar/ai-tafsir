import React from 'react';
import { Icons } from './Icons';
import { Surah, Language } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  viewMode: 'reader' | 'search';
  setViewMode: (mode: 'reader' | 'search') => void;
  surahQuery: string;
  setSurahQuery: (query: string) => void;
  surahs: Surah[];
  currentSurah: Surah | null;
  currentAyahNum: number;
  onSelectSurah: (surah: Surah) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  language,
  setLanguage,
  viewMode,
  setViewMode,
  surahQuery,
  setSurahQuery,
  surahs,
  currentSurah,
  currentAyahNum,
  onSelectSurah,
}) => {
  // Filter Surahs Logic
  const filteredSurahs = surahs.filter(s => 
    s.number.toString().includes(surahQuery) || 
    s.englishName.toLowerCase().includes(surahQuery.toLowerCase()) || 
    s.englishNameTranslation.toLowerCase().includes(surahQuery.toLowerCase()) ||
    s.name.includes(surahQuery)
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} flex flex-col`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500 font-bold text-xl">
             <Icons.BookOpen className="w-6 h-6" />
             <span className="font-sans">Nur Al-Quran</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-500">
            <Icons.X className="w-6 h-6" />
          </button>
        </div>

        {/* Language Toggle in Sidebar */}
        <div className="px-4 py-4 border-b border-slate-100 dark:border-slate-900">
           <div className="flex bg-slate-100 dark:bg-slate-900 rounded-lg p-1">
             <button 
               onClick={() => setLanguage('bn')}
               className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${language === 'bn' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
             >
               বাংলা
             </button>
             <button 
               onClick={() => setLanguage('en')}
               className={`flex-1 py-1.5 text-sm rounded-md font-medium transition-all ${language === 'en' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
             >
               English
             </button>
           </div>
        </div>

        <nav className="flex-1 overflow-y-auto custom-scrollbar p-2">
           <button 
             onClick={() => setViewMode('search')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-4 transition-colors ${viewMode === 'search' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 font-semibold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
           >
             <Icons.Search className="w-5 h-5" />
             {language === 'bn' ? 'এআই অনুসন্ধান' : 'AI Search'}
           </button>
           
           <div className="px-4 pb-2">
              <div className="relative">
                <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                <input
                  type="text"
                  value={surahQuery}
                  onChange={(e) => setSurahQuery(e.target.value)}
                  placeholder={language === 'bn' ? "সূরা খুঁজুন..." : "Filter Surahs..."}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-100 dark:bg-slate-900 border-none rounded-lg focus:ring-1 focus:ring-emerald-500 placeholder-slate-400 text-slate-700 dark:text-slate-300 font-sans"
                />
              </div>
           </div>
           
           <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
             Surahs
           </div>
           
           <div className="space-y-1">
             {filteredSurahs.map(surah => {
               const isActive = currentSurah?.number === surah.number && viewMode === 'reader';
               return (
                 <button
                   key={surah.number}
                   id={`surah-${surah.number}`}
                   onClick={() => onSelectSurah(surah)}
                   className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm transition-all ${isActive ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900'}`}
                 >
                   <div className="flex items-center gap-3">
                     <span className={`flex items-center justify-center w-6 h-6 text-xs rounded-full border font-sans ${isActive ? 'border-white/30 bg-white/10' : 'border-slate-300 dark:border-slate-700 text-slate-500'}`}>
                       {surah.number}
                     </span>
                     <div className="flex flex-col items-start font-sans">
                        <span className="font-medium">{surah.englishName}</span>
                        <div className="flex gap-2 items-center">
                          <span className={`text-[10px] ${isActive ? 'opacity-80' : 'opacity-60'}`}>{surah.englishNameTranslation}</span>
                          {isActive && (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
                               Ayah {currentAyahNum}
                            </span>
                          )}
                        </div>
                     </div>
                   </div>
                   <span className="font-arabic text-lg opacity-80">{surah.name.replace('سورة', '')}</span>
                 </button>
               );
             })}
             {filteredSurahs.length === 0 && (
               <div className="px-4 py-4 text-center text-xs text-slate-400">
                 No Surah found.
               </div>
             )}
           </div>
        </nav>
      </aside>
    </>
  );
};
