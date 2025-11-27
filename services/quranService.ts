import { QuranApiResponse, Surah, SingleAyahResponse, AyahDisplayData } from '../types';
import { DBService } from './db';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const QuranService = {
  /**
   * Fetches the list of all Surahs.
   */
  async getAllSurahs(): Promise<Surah[]> {
    try {
      // Try cache first
      const cached = await DBService.getSurahs();
      if (cached && cached.length > 0) {
        return cached;
      }

      const response = await fetch(`${BASE_URL}/surah`);
      if (!response.ok) throw new Error('Failed to fetch Surahs');
      const json: QuranApiResponse<Surah[]> = await response.json();
      
      // Cache the result
      await DBService.saveSurahs(json.data);
      
      return json.data;
    } catch (error) {
      console.error('Error fetching surahs:', error);
      throw error;
    }
  },

  /**
   * Fetches a specific Ayah with Arabic, Bengali, and English translations.
   */
  async getAyah(surahNumber: number, ayahNumber: number, reciterId: string = 'ar.alafasy'): Promise<AyahDisplayData> {
    const id = `${surahNumber}:${ayahNumber}`;
    
    try {
      // Try cache first
      const cached = await DBService.getAyah(id);
      if (cached) {
        // If cached, we might want to update the audio URL if the reciter is different
        // But for offline reading, we prioritize the cached content.
        // If we are online and want to support dynamic reciter, we could check connection.
        // For now, return cached.
        return cached;
      }

      // Requesting: Simple Quran (Arabic), Bengali Translation, English Translation (Sahih International), Audio (Dynamic)
      const editions = `quran-simple,bn.bengali,en.sahih,${reciterId}`;
      const url = `${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/editions/${editions}`;

      const response = await fetch(url);
      if (!response.ok) {
        if (response.status === 404) {
           throw new Error(`Ayah ${surahNumber}:${ayahNumber} not found.`);
        }
        throw new Error('Failed to fetch Ayah data');
      }

      const json: QuranApiResponse<SingleAyahResponse> = await response.json();
      const data = json.data;

      // Identify editions by language/format
      const arabicEntry = data.find(d => d.edition.language === 'ar' && d.edition.format === 'text') || data[0];
      const bengaliEntry = data.find(d => d.edition.language === 'bn');
      const englishEntry = data.find(d => d.edition.language === 'en');
      const audioEntry = data.find(d => d.edition.format === 'audio');

      const ayahData: AyahDisplayData = {
        surahNumber: arabicEntry.surah.number,
        ayahNumber: arabicEntry.numberInSurah,
        arabicText: arabicEntry.text,
        textBn: bengaliEntry?.text || 'অনুবাদ অনুপলব্ধ',
        textEn: englishEntry?.text || 'Translation unavailable',
        surahNameEnglish: arabicEntry.surah.englishName,
        surahNameArabic: arabicEntry.surah.name,
        audioUrl: audioEntry?.audio,
      };

      // Cache it
      await DBService.saveAyah(id, ayahData);

      return ayahData;
    } catch (error) {
      console.error('Error fetching ayah:', error);
      throw error;
    }
  },

  /**
   * Caches an entire Surah by fetching all editions and storing individual ayahs.
   */
  async cacheSurah(surahNumber: number): Promise<void> {
    // We use a default reciter for caching
    const reciterId = 'ar.alafasy';
    const editions = `quran-simple,bn.bengali,en.sahih,${reciterId}`;
    const url = `${BASE_URL}/surah/${surahNumber}/editions/${editions}`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch Surah ${surahNumber}`);

      const json = await response.json();
      const data = json.data; // Array of editions

      const arabicEdition = data.find((d: any) => d.edition.identifier === 'quran-simple');
      const bnEdition = data.find((d: any) => d.edition.identifier === 'bn.bengali');
      const enEdition = data.find((d: any) => d.edition.identifier === 'en.sahih');
      const audioEdition = data.find((d: any) => d.edition.identifier === reciterId);

      if (!arabicEdition) return;

      const promises = arabicEdition.ayahs.map(async (ayah: any, index: number) => {
        const id = `${surahNumber}:${ayah.numberInSurah}`;
        
        // Check if already exists to avoid overwrite if not needed (optional optimization)
        // But here we want to ensure we have it.
        
        const ayahData: AyahDisplayData = {
          surahNumber: surahNumber,
          ayahNumber: ayah.numberInSurah,
          arabicText: ayah.text,
          textBn: bnEdition?.ayahs[index]?.text || 'অনুবাদ অনুপলব্ধ',
          textEn: enEdition?.ayahs[index]?.text || 'Translation unavailable',
          surahNameEnglish: arabicEdition.englishName, // Note: API structure might differ slightly for Surah endpoint
          surahNameArabic: arabicEdition.name,
          audioUrl: audioEdition?.ayahs[index]?.audio
        };
        
        // Fix: Surah endpoint returns surah info in the root of the edition object, not in every ayah
        // Actually, for 'surah' endpoint, 'ayahs' array elements contain 'text', 'number', 'numberInSurah', 'juz', 'manzil', etc.
        // The surah info is in `arabicEdition.englishName` etc. is NOT correct, it's `arabicEdition.englishName` is the edition name?
        // No, `data` is array of objects. Each object has `edition` metadata and `ayahs` array.
        // The Surah metadata is NOT explicitly in the edition object usually, wait.
        // `http://api.alquran.cloud/v1/surah/1` returns `{ code: 200, status: "OK", data: { number: 1, name: "سورة الفاتحة", englishName: "Al-Fatiha", ... ayahs: [...] } }`
        // But with editions: `http://api.alquran.cloud/v1/surah/1/editions/quran-simple` returns `{ data: [ { number: 1, name: ..., ayahs: [...] } ] }`
        // So `arabicEdition` IS the Surah object with an `ayahs` property.
        
        ayahData.surahNameEnglish = arabicEdition.englishName;
        ayahData.surahNameArabic = arabicEdition.name;

        await DBService.saveAyah(id, ayahData);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error(`Error caching Surah ${surahNumber}:`, error);
      throw error;
    }
  },

  /**
   * Helper to get the total ayahs in a surah to prevent out-of-bounds queries.
   */
  isValidAyah(surah: Surah, ayahNumber: number): boolean {
    return ayahNumber > 0 && ayahNumber <= surah.numberOfAyahs;
  },

  /**
   * Fetches a random verse (Verse of the Day) based on the current date.
   */
  async getVerseOfTheDay(surahs: Surah[]): Promise<AyahDisplayData> {
    if (surahs.length === 0) throw new Error("Surahs not loaded");

    // Simple hash function for the date
    const today = new Date().toDateString();
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = ((hash << 5) - hash) + today.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    
    // Use hash to pick a Surah
    const surahIndex = Math.abs(hash) % surahs.length;
    const surah = surahs[surahIndex];
    
    // Use hash to pick an Ayah
    // We re-hash to get a different number for the ayah
    let ayahHash = hash;
    ayahHash = ((ayahHash << 5) - ayahHash) + surah.number;
    const ayahNum = (Math.abs(ayahHash) % surah.numberOfAyahs) + 1;

    return this.getAyah(surah.number, ayahNum);
  }
};