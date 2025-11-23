import React, { useState, useRef, useEffect } from 'react';
import { AyahDisplayData, Language } from '../types';
import { Icons } from './Icons';

interface AyahViewProps {
  data: AyahDisplayData;
  language: Language;
  onTafsirClick: () => void;
  isLoadingTafsir: boolean;
  isActive: boolean; // Is this the currently focused ayah?
  arabicFontSize: number;
  translationFontSize: number;
}

export const AyahView: React.FC<AyahViewProps> = ({ 
  data, 
  language, 
  onTafsirClick, 
  isLoadingTafsir, 
  isActive,
  arabicFontSize,
  translationFontSize
}) => {
  const translation = language === 'bn' ? data.textBn : data.textEn;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  // Reset audio when data changes
  useEffect(() => {
    setIsPlaying(false);
    setIsShareOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [data]);

  // Close share dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setIsShareOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleShare = (platform: 'copy' | 'facebook' | 'twitter') => {
    const url = window.location.href;
    const text = `Read Surah ${data.surahNameEnglish} ${data.surahNumber}:${data.ayahNumber} on AI Tafsir`;

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      setIsShareOpen(false);
    } else if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      setIsShareOpen(false);
    }
  };

  return (
    <div className={`p-6 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-lg ring-1 ring-emerald-500/50' : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full">
          {data.surahNameEnglish} {data.surahNumber}:{data.ayahNumber}
        </span>
        <div className="flex gap-2 items-center">
           {data.audioUrl && (
             <>
               <audio 
                 ref={audioRef} 
                 src={data.audioUrl} 
                 onEnded={handleAudioEnded}
                 className="hidden"
               />
               <button 
                 onClick={toggleAudio}
                 className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${isPlaying ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
               >
                 {isPlaying ? <Icons.Pause className="w-4 h-4" /> : <Icons.Play className="w-4 h-4" />}
                 {language === 'bn' ? 'শুনুন' : 'Listen'}
               </button>
             </>
           )}

           {/* Share Dropdown */}
           <div className="relative" ref={shareRef}>
             <button 
               onClick={() => setIsShareOpen(!isShareOpen)}
               className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
             >
               <Icons.Share className="w-4 h-4" />
               {language === 'bn' ? 'শেয়ার' : 'Share'}
             </button>

             {isShareOpen && (
               <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                 <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                   {copied ? <Icons.Check className="w-4 h-4 text-emerald-500" /> : <Icons.Copy className="w-4 h-4" />}
                   {copied ? 'Copied!' : 'Copy Link'}
                 </button>
                 <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                   <Icons.Facebook className="w-4 h-4 text-blue-600" />
                   Facebook
                 </button>
                 <button onClick={() => handleShare('twitter')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                   <Icons.Twitter className="w-4 h-4 text-sky-500" />
                   Twitter
                 </button>
               </div>
             )}
           </div>

           <button 
             onClick={onTafsirClick}
             disabled={isLoadingTafsir}
             className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
           >
             {isLoadingTafsir ? (
               <span className="animate-pulse">Loading...</span> 
             ) : (
               <>
                 <Icons.BookHeart className="w-4 h-4" />
                 {language === 'bn' ? 'তাফসীর পড়ুন' : 'Read Tafsir'}
               </>
             )}
           </button>
        </div>
      </div>

      {/* Arabic Text */}
      <div className="text-right mb-6" dir="rtl">
        <p 
          className="font-arabic leading-[2.2] text-slate-800 dark:text-slate-100 font-normal transition-all duration-200"
          style={{ fontSize: `${arabicFontSize}px` }}
        >
          {data.arabicText}
        </p>
      </div>

      {/* Translation */}
      <div className="text-left">
        <p 
          className={`text-slate-600 dark:text-slate-300 leading-relaxed transition-all duration-200 ${language === 'bn' ? 'font-bengali' : 'font-sans'}`}
          style={{ fontSize: `${translationFontSize}px` }}
        >
          {translation}
        </p>
      </div>
    </div>
  );
};