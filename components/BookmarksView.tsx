import React from 'react';
import { Bookmark, Language } from '../types';
import { Icons } from './Icons';

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  onSelectBookmark: (surahNum: number, ayahNum: number) => void;
  onRemoveBookmark: (id: string) => void;
  language: Language;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({ 
  bookmarks, 
  onSelectBookmark, 
  onRemoveBookmark,
  language 
}) => {
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500">
        <Icons.BookHeart className="w-16 h-16 mb-4 opacity-20" />
        <p className="text-lg font-medium">
          {language === 'bn' ? 'কোনো বুকমার্ক নেই' : 'No bookmarks yet'}
        </p>
        <p className="text-sm mt-2">
          {language === 'bn' 
            ? 'পড়ার সময় বুকমার্ক আইকনে ক্লিক করে আয়াত সংরক্ষণ করুন।' 
            : 'Tap the bookmark icon while reading to save ayahs here.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto w-full pb-20">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
        <Icons.BookHeart className="w-8 h-8 text-emerald-600" />
        {language === 'bn' ? 'বুকমার্কসমূহ' : 'Bookmarks'}
      </h2>

      <div className="grid gap-4">
        {bookmarks.map((bookmark) => (
          <div 
            key={bookmark.id}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow group"
          >
            <div className="flex justify-between items-start gap-4">
              <div 
                className="flex-1 cursor-pointer"
                onClick={() => onSelectBookmark(bookmark.surahNumber, bookmark.ayahNumber)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-md">
                    {bookmark.surahNumber}:{bookmark.ayahNumber}
                  </span>
                  <h3 className="font-bold text-slate-700 dark:text-slate-200">
                    {bookmark.surahName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {new Date(bookmark.timestamp).toLocaleDateString()}
                  </span>
                </div>
                
                {bookmark.note && (
                  <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-sm text-slate-600 dark:text-slate-300 italic border-l-2 border-gold-400">
                    "{bookmark.note}"
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveBookmark(bookmark.id);
                }}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                title="Remove Bookmark"
              >
                <Icons.Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
