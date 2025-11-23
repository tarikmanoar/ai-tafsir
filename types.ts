// Al-Quran Cloud API Types

export interface QuranApiResponse<T> {
  code: number;
  status: string;
  data: T;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
}

export interface AyahContent {
  text: string;
  edition: Edition;
  surah: Surah;
  numberInSurah: number;
  hizbQuarter: number;
  ruku: number;
  manzil: number;
  audio?: string; // For audio editions
}

// The response structure when requesting multiple editions for a single ayah
export type SingleAyahResponse = AyahContent[];

// App Types
export type Language = 'bn' | 'en';

export interface SearchResult {
  surahNumber: number;
  ayahNumber: number;
  reasoning: string;
  confidenceScore: number;
}

export interface AyahDisplayData {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
  textBn: string;
  textEn: string;
  surahNameEnglish: string;
  surahNameArabic: string;
  audioUrl?: string;
}

// AI Response Types
export interface TafsirData {
  ayahReference: string;
  arabicSnippet: string;
  tafsirText: string; // Markdown formatted
  keyThemes: string[];
}

export interface SurahOverviewData {
  surahName: string;
  introduction: string;
  historicalContext: string;
  keyThemes: string[];
  keyLessons: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface Bookmark {
  id: string; // Format: "surah:ayah"
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  timestamp: number;
  note?: string;
}

export interface Reciter {
  id: string;
  name: string;
}

export const AVAILABLE_RECITERS: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit (Murattal)' },
  { id: 'ar.sudais', name: 'Abdurrahmaan As-Sudais' },
  { id: 'ar.husary', name: 'Mahmoud Khalil Al-Husary' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq Al-Minshawi' },
];

export interface JuzStart {
  juzNumber: number;
  surahNumber: number;
  ayahNumber: number;
  nameEn: string;
  nameBn: string;
}

export const JUZ_DATA: JuzStart[] = [
  { juzNumber: 1, surahNumber: 1, ayahNumber: 1, nameEn: "Juz 1", nameBn: "পারা ১" },
  { juzNumber: 2, surahNumber: 2, ayahNumber: 142, nameEn: "Juz 2", nameBn: "পারা ২" },
  { juzNumber: 3, surahNumber: 2, ayahNumber: 253, nameEn: "Juz 3", nameBn: "পারা ৩" },
  { juzNumber: 4, surahNumber: 3, ayahNumber: 93, nameEn: "Juz 4", nameBn: "পারা ৪" },
  { juzNumber: 5, surahNumber: 4, ayahNumber: 24, nameEn: "Juz 5", nameBn: "পারা ৫" },
  { juzNumber: 6, surahNumber: 4, ayahNumber: 148, nameEn: "Juz 6", nameBn: "পারা ৬" },
  { juzNumber: 7, surahNumber: 5, ayahNumber: 82, nameEn: "Juz 7", nameBn: "পারা ৭" },
  { juzNumber: 8, surahNumber: 6, ayahNumber: 111, nameEn: "Juz 8", nameBn: "পারা ৮" },
  { juzNumber: 9, surahNumber: 7, ayahNumber: 88, nameEn: "Juz 9", nameBn: "পারা ৯" },
  { juzNumber: 10, surahNumber: 8, ayahNumber: 41, nameEn: "Juz 10", nameBn: "পারা ১০" },
  { juzNumber: 11, surahNumber: 9, ayahNumber: 93, nameEn: "Juz 11", nameBn: "পারা ১১" },
  { juzNumber: 12, surahNumber: 11, ayahNumber: 6, nameEn: "Juz 12", nameBn: "পারা ১২" },
  { juzNumber: 13, surahNumber: 12, ayahNumber: 53, nameEn: "Juz 13", nameBn: "পারা ১৩" },
  { juzNumber: 14, surahNumber: 15, ayahNumber: 1, nameEn: "Juz 14", nameBn: "পারা ১৪" },
  { juzNumber: 15, surahNumber: 17, ayahNumber: 1, nameEn: "Juz 15", nameBn: "পারা ১৫" },
  { juzNumber: 16, surahNumber: 18, ayahNumber: 75, nameEn: "Juz 16", nameBn: "পারা ১৬" },
  { juzNumber: 17, surahNumber: 21, ayahNumber: 1, nameEn: "Juz 17", nameBn: "পারা ১৭" },
  { juzNumber: 18, surahNumber: 23, ayahNumber: 1, nameEn: "Juz 18", nameBn: "পারা ১৮" },
  { juzNumber: 19, surahNumber: 25, ayahNumber: 21, nameEn: "Juz 19", nameBn: "পারা ১৯" },
  { juzNumber: 20, surahNumber: 27, ayahNumber: 56, nameEn: "Juz 20", nameBn: "পারা ২০" },
  { juzNumber: 21, surahNumber: 29, ayahNumber: 46, nameEn: "Juz 21", nameBn: "পারা ২১" },
  { juzNumber: 22, surahNumber: 33, ayahNumber: 31, nameEn: "Juz 22", nameBn: "পারা ২২" },
  { juzNumber: 23, surahNumber: 36, ayahNumber: 28, nameEn: "Juz 23", nameBn: "পারা ২৩" },
  { juzNumber: 24, surahNumber: 39, ayahNumber: 32, nameEn: "Juz 24", nameBn: "পারা ২৪" },
  { juzNumber: 25, surahNumber: 41, ayahNumber: 47, nameEn: "Juz 25", nameBn: "পারা ২৫" },
  { juzNumber: 26, surahNumber: 46, ayahNumber: 1, nameEn: "Juz 26", nameBn: "পারা ২৬" },
  { juzNumber: 27, surahNumber: 51, ayahNumber: 31, nameEn: "Juz 27", nameBn: "পারা ২৭" },
  { juzNumber: 28, surahNumber: 58, ayahNumber: 1, nameEn: "Juz 28", nameBn: "পারা ২৮" },
  { juzNumber: 29, surahNumber: 67, ayahNumber: 1, nameEn: "Juz 29", nameBn: "পারা ২৯" },
  { juzNumber: 30, surahNumber: 78, ayahNumber: 1, nameEn: "Juz 30", nameBn: "পারা ৩০" },
];