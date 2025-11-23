import { QuranApiResponse, Surah, SingleAyahResponse, AyahDisplayData } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export const QuranService = {
  /**
   * Fetches the list of all Surahs.
   */
  async getAllSurahs(): Promise<Surah[]> {
    try {
      const response = await fetch(`${BASE_URL}/surah`);
      if (!response.ok) throw new Error('Failed to fetch Surahs');
      const json: QuranApiResponse<Surah[]> = await response.json();
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
    // Requesting: Simple Quran (Arabic), Bengali Translation, English Translation (Sahih International), Audio (Dynamic)
    const editions = `quran-simple,bn.bengali,en.sahih,${reciterId}`;
    const url = `${BASE_URL}/ayah/${surahNumber}:${ayahNumber}/editions/${editions}`;

    try {
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

      return {
        surahNumber: arabicEntry.surah.number,
        ayahNumber: arabicEntry.numberInSurah,
        arabicText: arabicEntry.text,
        textBn: bengaliEntry?.text || 'অনুবাদ অনুপলব্ধ',
        textEn: englishEntry?.text || 'Translation unavailable',
        surahNameEnglish: arabicEntry.surah.englishName,
        surahNameArabic: arabicEntry.surah.name,
        audioUrl: audioEntry?.audio,
      };
    } catch (error) {
      console.error('Error fetching ayah:', error);
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