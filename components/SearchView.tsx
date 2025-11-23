import React from 'react';
import { Icons } from './Icons';
import { SearchResult, Language, AyahDisplayData } from '../types';

interface SearchViewProps {
  language: Language;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  isSearching: boolean;
  searchResults: SearchResult[];
  onSelectResult: (surahNum: number, ayahNum: number) => void;
  verseOfTheDay: AyahDisplayData | null;
}

export const SearchView: React.FC<SearchViewProps> = ({
  language,
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  searchResults,
  onSelectResult,
  verseOfTheDay,
}) => {
  return (
    <div className="max-w-3xl mx-auto mt-8 md:mt-16 text-center pb-20">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white mb-6 shadow-xl shadow-emerald-500/20">
          <Icons.Sparkles className="w-8 h-8" />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
          {language === 'bn' ? 'কুরআন জিজ্ঞাসা করুন' : 'Ask the Quran'}
        </h1>
        <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          {language === 'bn' 
            ? 'বাংলা বা ইংরেজিতে অনুসন্ধান করুন। এআই এর মাধ্যমে জানুন সঠিক তথ্য।' 
            : 'Search with natural language. Discover guidance through AI-powered semantic search.'}
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12">
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={language === 'bn' ? "উদাহরণ: ধৈর্য সম্পর্কে কুরআন কি বলে?" : "Example: What does Quran say about patience?"}
          className="w-full pl-6 pr-14 py-4 rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-lg shadow-sm focus:border-emerald-500 focus:ring-0 transition-colors"
        />
        <button 
          type="submit"
          disabled={isSearching}
          className="absolute right-2 top-2 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full transition-colors disabled:bg-slate-400"
        >
          {isSearching ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Icons.Search className="w-6 h-6" />
          )}
        </button>
      </form>

      {/* Verse of the Day (Only show when not searching and no results) */}
      {!isSearching && searchResults.length === 0 && verseOfTheDay && (
        <div className="max-w-2xl mx-auto mt-12 animate-in fade-in duration-700">
          <div className="flex items-center justify-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-xs">
            <Icons.Sparkles className="w-4 h-4" />
            {language === 'bn' ? 'আজকের আয়াত' : 'Verse of the Day'}
          </div>
          
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-emerald-600"></div>
            
            <div className="text-center mb-6">
              <p className="font-arabic text-2xl md:text-3xl text-slate-800 dark:text-slate-200 leading-loose mb-4">
                {verseOfTheDay.arabicText}
              </p>
              <p className={`text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed ${language === 'bn' ? 'font-bengali' : 'font-sans'}`}>
                {language === 'bn' ? verseOfTheDay.textBn : verseOfTheDay.textEn}
              </p>
            </div>

            <div className="flex justify-center">
              <button 
                onClick={() => onSelectResult(verseOfTheDay.surahNumber, verseOfTheDay.ayahNumber)}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all text-sm font-medium"
              >
                <span>{verseOfTheDay.surahNameEnglish} {verseOfTheDay.surahNumber}:{verseOfTheDay.ayahNumber}</span>
                <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="text-left space-y-4 animate-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">
            {language === 'bn' ? 'প্রস্তাবিত আয়াতসমূহ' : 'Suggested Verses'}
          </h2>
          {searchResults.map((result, index) => (
            <button
              key={index}
              onClick={() => onSelectResult(result.surahNumber, result.ayahNumber)}
              className="w-full group bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all hover:shadow-md text-left"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex gap-2 items-center">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 font-sans">
                    Surah {result.surahNumber}, Ayah {result.ayahNumber}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-sans ${result.confidenceScore > 80 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                     {result.confidenceScore}% Match
                  </span>
                </div>
                <Icons.ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </div>
              <p className={`text-slate-600 dark:text-slate-300 text-sm leading-relaxed ${language === 'bn' ? 'font-bengali' : 'font-sans'}`}>
                {result.reasoning}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
