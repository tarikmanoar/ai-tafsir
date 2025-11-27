import { useEffect, useState } from 'react';
import { QuranService } from '../services/quranService';

const TOTAL_SURAHS = 114;
const STORAGE_KEY = 'offline_surahs_downloaded';

export const OfflineManager = () => {
  const [downloadedSurahs, setDownloadedSurahs] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const downloadNext = async () => {
      if (downloadedSurahs.length >= TOTAL_SURAHS) {
        console.log("Offline download complete.");
        return;
      }

      setIsDownloading(true);

      // Find first missing surah
      let nextSurah = 1;
      while (downloadedSurahs.includes(nextSurah) && nextSurah <= TOTAL_SURAHS) {
        nextSurah++;
      }

      if (nextSurah > TOTAL_SURAHS) return;

      try {
        console.log(`Background downloading Surah ${nextSurah}...`);
        await QuranService.cacheSurah(nextSurah);
        
        // Update state and storage
        const updated = [...downloadedSurahs, nextSurah];
        setDownloadedSurahs(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        // Schedule next download with delay (Low priority)
        // 3 seconds delay to be gentle
        setTimeout(downloadNext, 3000);
      } catch (error) {
        console.error(`Failed to download Surah ${nextSurah}`, error);
        // Retry later or skip? Let's retry after a longer delay
        setTimeout(downloadNext, 10000);
      }
    };

    // Start the process if not already running and not complete
    // We use a small timeout to let the app load first
    const timer = setTimeout(() => {
        // Use requestIdleCallback if available for even lower priority
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(() => downloadNext());
        } else {
            downloadNext();
        }
    }, 5000);

    return () => clearTimeout(timer);
  }, [downloadedSurahs]); // Re-run when state updates to trigger next

  return null; // Invisible component
};
