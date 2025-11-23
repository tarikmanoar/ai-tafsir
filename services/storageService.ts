import { Bookmark } from '../types';

const BOOKMARKS_KEY = 'ai_tafsir_bookmarks';

export const StorageService = {
  getBookmarks(): Bookmark[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(BOOKMARKS_KEY);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse bookmarks", e);
      return [];
    }
  },

  saveBookmarks(bookmarks: Bookmark[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
  },

  addBookmark(bookmark: Bookmark): Bookmark[] {
    const bookmarks = this.getBookmarks();
    // Check if already exists
    const exists = bookmarks.some(b => b.id === bookmark.id);
    if (exists) return bookmarks;

    const newBookmarks = [bookmark, ...bookmarks];
    this.saveBookmarks(newBookmarks);
    return newBookmarks;
  },

  removeBookmark(id: string): Bookmark[] {
    const bookmarks = this.getBookmarks();
    const newBookmarks = bookmarks.filter(b => b.id !== id);
    this.saveBookmarks(newBookmarks);
    return newBookmarks;
  },

  toggleBookmark(bookmark: Bookmark): Bookmark[] {
    const bookmarks = this.getBookmarks();
    const exists = bookmarks.some(b => b.id === bookmark.id);
    
    if (exists) {
      return this.removeBookmark(bookmark.id);
    } else {
      return this.addBookmark(bookmark);
    }
  },

  updateNote(id: string, note: string): Bookmark[] {
    const bookmarks = this.getBookmarks();
    const index = bookmarks.findIndex(b => b.id === id);
    
    if (index !== -1) {
      bookmarks[index].note = note;
      this.saveBookmarks(bookmarks);
      return [...bookmarks];
    }
    return bookmarks;
  },
  
  getBookmark(surah: number, ayah: number): Bookmark | undefined {
      const bookmarks = this.getBookmarks();
      const id = `${surah}:${ayah}`;
      return bookmarks.find(b => b.id === id);
  }
};
