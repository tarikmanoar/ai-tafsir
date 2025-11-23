import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { TafsirData, AyahDisplayData, Language, ChatMessage } from '../types';
import { Icons } from './Icons';
import { GeminiService } from '../services/geminiService';

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: TafsirData | null;
  isLoading: boolean;
  ayahData: AyahDisplayData | null;
  language: Language;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({ isOpen, onClose, data, isLoading, ayahData, language }) => {
  const [activeTab, setActiveTab] = useState<'tafsir' | 'chat'>('tafsir');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens/closes or ayah changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab('tafsir');
      setChatHistory([]);
      setInputMessage('');
    }
  }, [isOpen, ayahData]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !ayahData) return;

    const userMsg: ChatMessage = { role: 'user', text: inputMessage };
    setChatHistory(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const responseText = await GeminiService.chatWithAyah(ayahData, chatHistory, userMsg.text, language);
      const aiMsg: ChatMessage = { role: 'model', text: responseText };
      setChatHistory(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat failed", error);
      // Optionally add an error message to chat
    } finally {
      setIsChatLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-3xl h-[80vh] max-h-[85vh] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Icons.Sparkles className="w-5 h-5 text-gold-500" />
              AI Tafsir
            </h3>
            
            {/* Tabs */}
            {!isLoading && data && (
              <div className="flex bg-slate-200 dark:bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('tafsir')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    activeTab === 'tafsir' 
                      ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Tafsir
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${
                    activeTab === 'chat' 
                      ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icons.MessageCircle className="w-3 h-3" />
                  Chat
                </button>
              </div>
            )}
          </div>

          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
          >
            <Icons.X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 p-8">
              <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-500 dark:text-slate-400 font-bengali animate-pulse">
                বিশ্লেষণ করা হচ্ছে... (Analyzing...)
              </p>
            </div>
          ) : data ? (
            <>
              {/* Tafsir View */}
              <div className={`absolute inset-0 overflow-y-auto p-6 md:p-8 custom-scrollbar transition-opacity duration-300 ${activeTab === 'tafsir' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                <div className="space-y-6">
                  {/* Reference Header */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800/30">
                    <h4 className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                      {data.ayahReference}
                    </h4>
                    <p className="font-arabic text-2xl text-slate-700 dark:text-slate-300 opacity-80" dir="rtl">
                      {data.arabicSnippet}...
                    </p>
                  </div>

                  {/* Themes */}
                  <div className="flex flex-wrap gap-2">
                    {data.keyThemes.map((theme, idx) => (
                      <span key={idx} className="px-3 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-700 dark:bg-gold-900/30 dark:text-gold-400 border border-gold-200 dark:border-gold-800">
                        {theme}
                      </span>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="prose prose-slate dark:prose-invert max-w-none font-bengali prose-headings:text-emerald-700 dark:prose-headings:text-emerald-400 prose-p:leading-8">
                    <ReactMarkdown>{data.tafsirText}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500 italic">
                    Disclaimer: This Tafsir is generated by AI based on authentic sources. Always verify with a qualified scholar for legal rulings.
                  </div>
                </div>
              </div>

              {/* Chat View */}
              <div className={`absolute inset-0 flex flex-col transition-opacity duration-300 ${activeTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
                  {chatHistory.length === 0 && (
                    <div className="text-center text-slate-400 dark:text-slate-500 mt-10 px-6">
                      <Icons.MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>Ask a question about this Ayah.</p>
                      <p className="text-sm mt-2">Examples: "What is the context?", "Explain the grammar", "How does this apply today?"</p>
                    </div>
                  )}
                  
                  {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-emerald-600 text-white rounded-br-none' 
                          : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-600'
                      }`}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                  ))}
                  
                  {isChatLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm border border-slate-100 dark:border-slate-600">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder={language === 'bn' ? "এই আয়াত সম্পর্কে প্রশ্ন করুন..." : "Ask about this Ayah..."}
                      className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={isChatLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isChatLoading}
                      className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icons.Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
             <div className="text-center text-slate-500 p-8">
                Something went wrong. Please try again.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
