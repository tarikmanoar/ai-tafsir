import React, { useState, useEffect, useCallback, useRef } from 'react';
import { QuranService } from './services/quranService';
import { GeminiService } from './services/geminiService';
import { StorageService } from './services/storageService';
import { Surah, AyahDisplayData, SearchResult, TafsirData, Language, SurahOverviewData, Bookmark } from './types';
import { Icons } from './components/Icons';
import { TafsirModal } from './components/TafsirModal';
import { SurahOverviewModal } from './components/SurahOverviewModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SearchView } from './components/SearchView';
import { ReaderView } from './components/ReaderView';
import { ApiKeyModal } from './components/ApiKeyModal';
import { BookmarksView } from './components/BookmarksView';
import { OfflineIndicator } from './components/OfflineIndicator';

type ViewMode = 'reader' | 'search' | 'bookmarks';

function App() {
  // Config State
  const [language, setLanguage] = useState<Language>('bn');
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [arabicFontSize, setArabicFontSize] = useState(() => parseInt(localStorage.getItem('arabicFontSize') || '36'));
  const [translationFontSize, setTranslationFontSize] = useState(() => parseInt(localStorage.getItem('translationFontSize') || '18'));
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [reciterId, setReciterId] = useState(() => localStorage.getItem('reciterId') || 'ar.alafasy');
  const [continuousPlay, setContinuousPlay] = useState(() => localStorage.getItem('continuousPlay') === 'true');
  const [isPlaying, setIsPlaying] = useState(false);

  // API Key State
  const [apiKey, setApiKey] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('gemini_api_key') || '';
    }
    return '';
  });
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Data State
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [currentSurah, setCurrentSurah] = useState<Surah | null>(null);
  const [currentAyahNum, setCurrentAyahNum] = useState<number>(1);
  const [ayahData, setAyahData] = useState<AyahDisplayData | null>(null);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [surahQuery, setSurahQuery] = useState(''); // Sidebar filter
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('search');

  // Tafsir State
  const [isTafsirOpen, setIsTafsirOpen] = useState(false);
  const [tafsirData, setTafsirData] = useState<TafsirData | null>(null);
  const [isLoadingTafsir, setIsLoadingTafsir] = useState(false);

  // Surah Overview State
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [overviewData, setOverviewData] = useState<SurahOverviewData | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);

  // UI State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingAyah, setIsLoadingAyah] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Touch/Swipe Refs
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const touchEndY = useRef<number | null>(null);

  // Scroll Refs
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Apply Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Persist Fonts & Reciter
  useEffect(() => {
    localStorage.setItem('arabicFontSize', arabicFontSize.toString());
    localStorage.setItem('translationFontSize', translationFontSize.toString());
    localStorage.setItem('reciterId', reciterId);
    localStorage.setItem('continuousPlay', continuousPlay.toString());
  }, [arabicFontSize, translationFontSize, reciterId, continuousPlay]);

  // Persist Position
  useEffect(() => {
    if (currentSurah) {
      localStorage.setItem('lastSurahNumber', currentSurah.number.toString());
      localStorage.setItem('lastAyahNumber', currentAyahNum.toString());
      
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set('surah', currentSurah.number.toString());
      url.searchParams.set('ayah', currentAyahNum.toString());
      window.history.replaceState({}, '', url);
    }
  }, [currentSurah, currentAyahNum]);

  // Initialize API Key
  useEffect(() => {
    if (apiKey) {
      GeminiService.initialize(apiKey);
    } else {
      setIsApiKeyModalOpen(true);
    }
  }, [apiKey]);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    setIsApiKeyModalOpen(false);
  };

  // Initial Load
  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const list = await QuranService.getAllSurahs();
        setSurahs(list);
        setBookmarks(StorageService.getBookmarks());

        // Check URL params first
        const params = new URLSearchParams(window.location.search);
        const urlSurah = parseInt(params.get('surah') || '0');
        const urlAyah = parseInt(params.get('ayah') || '0');

        let targetSurahNum = 0;
        let targetAyahNum = 1;

        if (urlSurah > 0) {
            targetSurahNum = urlSurah;
            targetAyahNum = urlAyah > 0 ? urlAyah : 1;
        } else {
            // Restore last position
            targetSurahNum = parseInt(localStorage.getItem('lastSurahNumber') || '0');
            targetAyahNum = parseInt(localStorage.getItem('lastAyahNumber') || '1');
        }

        if (targetSurahNum > 0) {
           const found = list.find(s => s.number === targetSurahNum);
           if (found) {
             setCurrentSurah(found);
             setCurrentAyahNum(targetAyahNum);
             setViewMode('reader');
             
             // Load the ayah data immediately
             setIsLoadingAyah(true);
             try {
                const data = await QuranService.getAyah(targetSurahNum, targetAyahNum);
                setAyahData(data);
             } catch (e) {
                console.error("Failed to restore last ayah", e);
             } finally {
                setIsLoadingAyah(false);
             }
           }
        }
      } catch (e) {
        setError("Failed to load Surah list. Please check your connection.");
      }
    };
    fetchSurahs();
  }, []);

  // Scroll to active surah in sidebar
  useEffect(() => {
    if ((isSidebarOpen || window.innerWidth >= 1024) && currentSurah) {
       const el = document.getElementById(`surah-${currentSurah.number}`);
       el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [isSidebarOpen, currentSurah]);

  // Scroll main view top on ayah change
  useEffect(() => {
    if (viewMode === 'reader') {
       mainScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [ayahData, viewMode]);

  // Fetch Ayah when navigation changes
  const loadAyah = useCallback(async (surahNum: number, ayahNum: number) => {
    setIsLoadingAyah(true);
    setError(null);
    try {
      const data = await QuranService.getAyah(surahNum, ayahNum, reciterId);
      setAyahData(data);
      setCurrentAyahNum(ayahNum);
      
      if (!currentSurah || currentSurah.number !== surahNum) {
        const foundSurah = surahs.find(s => s.number === surahNum);
        if (foundSurah) setCurrentSurah(foundSurah);
      }
    } catch (e) {
      setError("Could not load Ayah. It might not exist or network is down.");
    } finally {
      setIsLoadingAyah(false);
    }
  }, [surahs, currentSurah, reciterId]);

  // Reload current ayah when reciter changes
  useEffect(() => {
    if (currentSurah && currentAyahNum) {
      loadAyah(currentSurah.number, currentAyahNum);
    }
  }, [reciterId]);

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsSearching(true);
    setSearchResults([]);
    setError(null);
    try {
      const results = await GeminiService.searchQuran(searchQuery, language);
      setSearchResults(results);
      if (results.length === 0) {
        setError(language === 'bn' ? "কোনো আয়াত পাওয়া যায়নি।" : "No relevant ayahs found.");
      }
    } catch (e) {
      setError(language === 'bn' ? "অনুসন্ধান ব্যর্থ হয়েছে।" : "Search failed. Please check connection.");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Tafsir Generation
  const handleViewTafsir = async () => {
    if (!ayahData) return;

    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsTafsirOpen(true);
    
    setIsLoadingTafsir(true);
    setTafsirData(null);
    try {
      const tafsir = await GeminiService.generateTafsir(ayahData, language);
      setTafsirData(tafsir);
    } catch (e) {
      setError("Failed to generate Tafsir.");
      setIsTafsirOpen(false);
    } finally {
      setIsLoadingTafsir(false);
    }
  };

  // Handle Surah Overview
  const handleSurahOverview = async () => {
    if (!currentSurah) return;

    if (!apiKey) {
      setIsApiKeyModalOpen(true);
      return;
    }

    setIsOverviewOpen(true);
    
    setIsLoadingOverview(true);
    setOverviewData(null);
    try {
      const data = await GeminiService.generateSurahOverview(currentSurah.englishName, currentSurah.number, language);
      setOverviewData(data);
    } catch (e) {
      setError("Failed to load overview.");
      setIsOverviewOpen(false);
    } finally {
      setIsLoadingOverview(false);
    }
  };

  // Bookmark Handlers
  const handleToggleBookmark = () => {
    if (!currentSurah || !ayahData) return;
    
    const bookmark: Bookmark = {
      id: `${currentSurah.number}:${currentAyahNum}`,
      surahNumber: currentSurah.number,
      ayahNumber: currentAyahNum,
      surahName: currentSurah.englishName,
      timestamp: Date.now()
    };
    
    const updated = StorageService.toggleBookmark(bookmark);
    setBookmarks(updated);
  };

  const handleRemoveBookmark = (id: string) => {
    const updated = StorageService.removeBookmark(id);
    setBookmarks(updated);
  };

  const handleUpdateNote = (note: string) => {
    if (!currentSurah) return;
    const id = `${currentSurah.number}:${currentAyahNum}`;
    const updated = StorageService.updateNote(id, note);
    setBookmarks(updated);
  };

  const selectBookmark = (surahNum: number, ayahNum: number) => {
    setViewMode('reader');
    loadAyah(surahNum, ayahNum);
  };

  // Navigation Handlers
  const handleNextAyah = (keepPlaying = false) => {
    // If triggered by audio end (keepPlaying=true), we definitely keep playing.
    // If triggered manually:
    // - If already playing, we keep playing (seamless skip).
    // - If paused, we stay paused.
    // So we don't force stop here anymore.
    
    if (!currentSurah) return;
    if (currentAyahNum < currentSurah.numberOfAyahs) {
      loadAyah(currentSurah.number, currentAyahNum + 1);
    } else if (currentSurah.number < 114) {
      loadAyah(currentSurah.number + 1, 1);
    }
  };

  const handlePrevAyah = () => {
    // Seamless skip for previous too
    if (!currentSurah) return;
    if (currentAyahNum > 1) {
      loadAyah(currentSurah.number, currentAyahNum - 1);
    } else if (currentSurah.number > 1) {
       loadAyah(currentSurah.number - 1, 1);
    }
  };

  const handleJumpToAyah = (num: number) => {
     // Jump usually implies manual navigation, but if playing, maybe keep playing?
     // Let's keep playing if already playing.
     if (!currentSurah || isNaN(num)) return;
     if (num > 0 && num <= currentSurah.numberOfAyahs) {
        loadAyah(currentSurah.number, num);
     }
  };

  const handleAudioEnded = () => {
    if (continuousPlay) {
      handleNextAyah(true);
    } else {
      setIsPlaying(false);
    }
  };

  // Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
    touchEndX.current = null;
    touchEndY.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
    touchEndY.current = e.targetTouches[0].clientY;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    
    const xDist = touchStartX.current - touchEndX.current;
    const yDist = (touchStartY.current || 0) - (touchEndY.current || 0);
    const minSwipeDistance = 50;

    // Dominant horizontal swipe check
    if (Math.abs(xDist) > minSwipeDistance && Math.abs(xDist) > Math.abs(yDist)) {
      if (xDist > 0) {
        handleNextAyah();
      } else {
        handlePrevAyah();
      }
    }
  };

  const selectSearchResult = (surahNum: number, ayahNum: number) => {
    setIsPlaying(false); // Stop playback when selecting a search result
    setViewMode('reader');
    loadAyah(surahNum, ayahNum);
    setIsSidebarOpen(false);
  };

  const selectSurahFromList = (surah: Surah) => {
    setIsPlaying(false); // Stop playback when selecting a new surah
    setViewMode('reader');
    setCurrentSurah(surah);
    loadAyah(surah.number, 1);
    setIsSidebarOpen(false);
  };

  // Check if current ayah is bookmarked
  const currentBookmark = currentSurah ? StorageService.getBookmark(currentSurah.number, currentAyahNum) : undefined;

  return (
    <div className={`flex h-screen overflow-hidden ${language === 'bn' ? 'font-bengali' : 'font-sans'} bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
      
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        language={language}
        setLanguage={setLanguage}
        viewMode={viewMode}
        setViewMode={setViewMode}
        surahQuery={surahQuery}
        setSurahQuery={setSurahQuery}
        surahs={surahs}
        currentSurah={currentSurah}
        currentAyahNum={currentAyahNum}
        onSelectSurah={selectSurahFromList}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <Header
          onOpenSidebar={() => setIsSidebarOpen(true)}
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          arabicFontSize={arabicFontSize}
          setArabicFontSize={setArabicFontSize}
          translationFontSize={translationFontSize}
          setTranslationFontSize={setTranslationFontSize}
          reciterId={reciterId}
          setReciterId={setReciterId}
          continuousPlay={continuousPlay}
          setContinuousPlay={setContinuousPlay}
        />

        {/* Scrollable Content */}
        <div 
          ref={mainScrollRef}
          className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative"
        >
          {error && (
             <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
               <Icons.Info className="w-5 h-5" />
               {error}
             </div>
          )}

          {viewMode === 'search' ? (
            <SearchView
              language={language}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              handleSearch={handleSearch}
              isSearching={isSearching}
              searchResults={searchResults}
              onSelectResult={selectSearchResult}
            />
          ) : viewMode === 'bookmarks' ? (
            <BookmarksView
              bookmarks={bookmarks}
              onSelectBookmark={selectBookmark}
              onRemoveBookmark={handleRemoveBookmark}
              language={language}
            />
          ) : (
            <ReaderView
              isLoadingAyah={isLoadingAyah}
              ayahData={ayahData}
              language={language}
              setViewMode={setViewMode}
              currentSurah={currentSurah}
              handleSurahOverview={handleSurahOverview}
              isLoadingTafsir={isLoadingTafsir}
              handleViewTafsir={handleViewTafsir}
              arabicFontSize={arabicFontSize}
              translationFontSize={translationFontSize}
              handlePrevAyah={handlePrevAyah}
              handleNextAyah={handleNextAyah}
              currentAyahNum={currentAyahNum}
              handleJumpToAyah={handleJumpToAyah}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              isBookmarked={!!currentBookmark}
              onToggleBookmark={handleToggleBookmark}
              bookmarkNote={currentBookmark?.note}
              onUpdateNote={handleUpdateNote}
              shouldAutoPlay={isPlaying}
              onPlayStateChange={setIsPlaying}
              onAudioEnded={handleAudioEnded}
            />
          )}
        </div>
      </main>

      {/* Tafsir Modal */}
      <TafsirModal 
        isOpen={isTafsirOpen} 
        onClose={() => setIsTafsirOpen(false)} 
        data={tafsirData} 
        isLoading={isLoadingTafsir}
        ayahData={ayahData}
        language={language}
      />

      {/* Surah Overview Modal */}
      <SurahOverviewModal
        isOpen={isOverviewOpen}
        onClose={() => setIsOverviewOpen(false)}
        data={overviewData}
        isLoading={isLoadingOverview}
        language={language}
      />

      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={isApiKeyModalOpen} 
        onSave={handleSaveApiKey} 
      />

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default App;