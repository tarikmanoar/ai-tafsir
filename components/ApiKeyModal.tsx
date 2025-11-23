import React, { useState } from 'react';
import { Icons } from './Icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onSave: (key: string) => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onSave }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) {
      setError('Please enter a valid API key');
      return;
    }
    onSave(key);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-300">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-500">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Icons.Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Setup AI Features</h2>
          </div>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm leading-relaxed">
            To enable AI search and Tafsir generation, please provide your Google Gemini API Key.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3 mb-6 flex gap-3">
            <Icons.Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-300">
              <strong>Privacy Note:</strong> Your API key is stored locally in your browser. We do not send it to any server. It is used directly to communicate with Google's API.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                value={key}
                onChange={(e) => {
                  setKey(e.target.value);
                  setError('');
                }}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-slate-800 dark:text-slate-200"
              />
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-emerald-500/20"
            >
              Save & Continue
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-emerald-500 transition-colors underline"
            >
              Get a free API key from Google AI Studio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
