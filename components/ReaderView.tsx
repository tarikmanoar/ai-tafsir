import React from 'react';
import { Icons } from './Icons';
import { AyahView } from './AyahView';
import { AyahDisplayData, Surah, Language } from '../types';

interface ReaderViewProps {
  isLoadingAyah: boolean;
  ayahData: AyahDisplayData | null;
  language: Language;
  setViewMode: (mode: 'reader' | 'search') => void;
  currentSurah: Surah | null;
  handleSurahOverview: () => void;
  isLoadingTafsir: boolean;
  handleViewTafsir: () => void;
  arabicFontSize: number;
  translationFontSize: number;
  handlePrevAyah: () => void;
  handleNextAyah: () => void;
  currentAyahNum: number;
  handleJumpToAyah: (ayahNumber: number) => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: () => void;
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  isLoadingAyah,
  ayahData,
  language,
  setViewMode,
  currentSurah,
  handleSurahOverview,
  isLoadingTafsir,
  handleViewTafsir,
  arabicFontSize,
  translationFontSize,
  handlePrevAyah,
  handleNextAyah,
  currentAyahNum,
  handleJumpToAyah,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const [inputVal, setInputVal] = React.useState(currentAyahNum.toString());

  // Sync input when currentAyahNum changes externally (e.g. Next/Prev buttons)
  React.useEffect(() => {
    setInputVal(currentAyahNum.toString());
  }, [currentAyahNum]);

  // Debounce input changes to trigger jump
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const num = parseInt(inputVal);
      if (!isNaN(num) && num !== currentAyahNum) {
        handleJumpToAyah(num);
      }
    }, 800); // 800ms delay for typing multiple digits

    return () => clearTimeout(timer);
  }, [inputVal, currentAyahNum, handleJumpToAyah]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
  };

  return (
    <div 
      className="max-w-4xl mx-auto pb-32 min-h-[60vh] outline-none"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {isLoadingAyah ? (
        <div className="flex flex-col items-center justify-center h-64">
           <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
           <p className="text-slate-400">{language === 'bn' ? 'লোড হচ্ছে...' : 'Loading Ayah...'}</p>
        </div>
      ) : ayahData ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <button 
               onClick={() => setViewMode('search')}
               className="text-slate-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium transition-colors font-sans"
            >
              <Icons.ChevronLeft className="w-4 h-4" /> {language === 'bn' ? 'অনুসন্ধানে ফিরে যান' : 'Back to Search'}
            </button>
            
            {currentSurah && (
              <button 
                 onClick={handleSurahOverview}
                 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gold-600 dark:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/20 px-3 py-2 rounded-lg transition-colors font-sans"
              >
                <Icons.Info className="w-4 h-4" />
                {language === 'bn' ? 'সূরা পরিচিতি' : 'Surah Overview'}
              </button>
            )}
          </div>

          <AyahView 
            data={ayahData} 
            language={language}
            isActive={true}
            isLoadingTafsir={isLoadingTafsir}
            onTafsirClick={handleViewTafsir}
            arabicFontSize={arabicFontSize}
            translationFontSize={translationFontSize}
          />

          {/* Pagination Controls */}
          <div className="fixed bottom-0 left-0 lg:left-72 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 flex justify-center items-center gap-4 sm:gap-8 z-10 shadow-lg font-sans">
             <button 
               onClick={handlePrevAyah}
               className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-95"
             >
               <Icons.ChevronLeft className="w-5 h-5" />
               <span className="hidden sm:inline font-medium">Prev</span>
             </button>

             <div className="flex flex-col items-center bg-slate-100 dark:bg-slate-900 rounded-xl px-4 py-2 border border-slate-200 dark:border-slate-800">
               <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-bold mb-1">
                 {currentSurah?.englishName}
               </span>
               <div className="flex items-baseline gap-1">
                 <span className="text-xs text-slate-400 font-medium">Ayah</span>
                 <input 
                    type="number" 
                    value={inputVal}
                    onChange={handleInputChange}
                    className="w-16 text-center bg-transparent text-2xl font-bold text-emerald-600 dark:text-emerald-400 border-none p-0 focus:ring-0 focus:outline-none"
                 />
                 <span className="text-xs text-slate-400 font-medium">/ {currentSurah?.numberOfAyahs}</span>
               </div>
             </div>

             <button 
               onClick={handleNextAyah}
               className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all active:scale-95"
             >
               <span className="hidden sm:inline font-medium">Next</span>
               <Icons.ChevronRight className="w-5 h-5" />
             </button>
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-slate-400 font-sans">
          Select a Surah or Search to begin.
        </div>
      )}
    </div>
  );
};
