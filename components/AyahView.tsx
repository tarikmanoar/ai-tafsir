import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
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
  onAudioEnded?: () => void;
  shouldAutoPlay?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const AyahView: React.FC<AyahViewProps> = ({ 
  data, 
  language, 
  onTafsirClick, 
  isLoadingTafsir, 
  isActive,
  arabicFontSize,
  translationFontSize,
  onAudioEnded,
  shouldAutoPlay = false,
  onPlayStateChange
}) => {
  const translation = language === 'bn' ? data.textBn : data.textEn;
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Reset audio when data changes
  useEffect(() => {
    setIsPlaying(false);
    setIsShareOpen(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      if (shouldAutoPlay) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsPlaying(true);
            })
            .catch(error => {
              console.error("Auto-play prevented:", error);
              setIsPlaying(false);
              if (onPlayStateChange) onPlayStateChange(false);
            });
        }
      }
    }
  }, [data, shouldAutoPlay]);

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
      if (onPlayStateChange) onPlayStateChange(false);
    } else {
      audioRef.current.play();
      if (onPlayStateChange) onPlayStateChange(true);
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    if (onAudioEnded) onAudioEnded();
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

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsGeneratingImage(true);
    
    try {
      // Wait a moment for fonts to load if needed, though usually they are ready
      await document.fonts.ready;
      
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // Better quality
        backgroundColor: null,
        useCORS: true,
        logging: false
      });
      
      const link = document.createElement('a');
      link.download = `surah-${data.surahNameEnglish}-${data.surahNumber}-${data.ayahNumber}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      setIsShareOpen(false);
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className={`p-4 md:p-6 rounded-2xl transition-all duration-300 border ${isActive ? 'bg-white dark:bg-slate-800 border-emerald-500 shadow-lg ring-1 ring-emerald-500/50' : 'bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
        <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 px-3 py-1 rounded-full whitespace-nowrap">
          {data.surahNameEnglish} {data.surahNumber}:{data.ayahNumber}
        </span>
        
        <div className="flex flex-wrap gap-2 items-center w-full sm:w-auto justify-end">
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
                 className={`flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors flex-1 sm:flex-none justify-center ${isPlaying ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
               >
                 {isPlaying ? <Icons.Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Icons.Play className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                 {language === 'bn' ? 'শুনুন' : 'Listen'}
               </button>
             </>
           )}

           {/* Share Dropdown */}
           <div className="relative flex-1 sm:flex-none" ref={shareRef}>
             <button 
               onClick={() => setIsShareOpen(!isShareOpen)}
               className="w-full sm:w-auto flex items-center justify-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors"
             >
               <Icons.Share className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
               {language === 'bn' ? 'শেয়ার' : 'Share'}
             </button>

             {isShareOpen && (
               <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
                 <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                   {copied ? <Icons.Check className="w-4 h-4 text-emerald-500" /> : <Icons.Copy className="w-4 h-4" />}
                   {copied ? 'Copied!' : 'Copy Link'}
                 </button>
                 <button onClick={handleDownloadImage} className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                   {isGeneratingImage ? <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /> : <Icons.Image className="w-4 h-4 text-purple-500" />}
                   {language === 'bn' ? 'ইমেজ ডাউনলোড' : 'Download Image'}
                 </button>
                 <div className="h-px bg-slate-100 dark:bg-slate-700 my-1"></div>
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
             className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
           >
             {isLoadingTafsir ? (
               <span className="animate-pulse">Loading...</span> 
             ) : (
               <>
                 <Icons.BookHeart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                 {language === 'bn' ? 'তাফসীর' : 'Tafsir'}
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

      {/* Hidden Quote Card for Generation */}
      <div 
        ref={cardRef}
        className="fixed left-[-9999px] top-0 w-[1080px] h-[1080px] flex flex-col items-center justify-center p-20 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white text-center"
      >
        <div className="border border-emerald-500/30 p-16 rounded-[3rem] bg-white/5 backdrop-blur-sm w-full h-full flex flex-col justify-center items-center relative overflow-hidden shadow-2xl">
           {/* Decorative elements */}
           <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-emerald-600 opacity-50"></div>
           <div className="absolute bottom-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mb-32"></div>
           <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mt-32"></div>
           
           <Icons.Sparkles className="w-16 h-16 text-emerald-400 mb-12 opacity-80" />
           
           <div className="flex-1 flex flex-col justify-center items-center w-full">
             <p className="font-arabic text-6xl leading-[2.5] mb-16 text-emerald-50 w-full px-8" dir="rtl">
               {data.arabicText}
             </p>
             
             <p className={`text-3xl leading-relaxed text-slate-200 max-w-4xl ${language === 'bn' ? 'font-bengali' : 'font-sans'}`}>
               {translation}
             </p>
           </div>
           
           <div className="mt-12 flex items-center gap-4 text-emerald-400 font-medium tracking-[0.3em] uppercase text-lg">
             <span className="w-12 h-[1px] bg-emerald-500/50"></span>
             {data.surahNameEnglish} {data.surahNumber}:{data.ayahNumber}
             <span className="w-12 h-[1px] bg-emerald-500/50"></span>
           </div>
           
           <div className="absolute bottom-8 text-slate-500 text-sm tracking-[0.5em] opacity-40 font-light">
             AI TAFSIR APP
           </div>
        </div>
      </div>
    </div>
  );
};