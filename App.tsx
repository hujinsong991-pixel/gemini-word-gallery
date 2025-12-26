
import React, { useState, useEffect } from 'react';
import { Language, DictionaryEntry, NotebookItem, AudioCache } from './types';
import { lookupWord, generateEntryImage, fetchSpeechBuffer } from './services/geminiService';
import LanguageSelector from './components/LanguageSelector';
import DictionaryView from './components/DictionaryView';
import ChatInterface from './components/ChatInterface';
import Notebook from './components/Notebook';
import FlashcardMode from './components/FlashcardMode';

const App: React.FC = () => {
  const [nativeLang, setNativeLang] = useState<Language>('Chinese');
  const [targetLang, setTargetLang] = useState<Language>('English');
  const [view, setView] = useState<'start' | 'search' | 'notebook' | 'flashcards'>('start');
  const [query, setQuery] = useState('');
  const [currentEntry, setCurrentEntry] = useState<DictionaryEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [notebook, setNotebook] = useState<NotebookItem[]>([]);
  
  // 音频预加载缓存
  const [audioCache, setAudioCache] = useState<AudioCache>({});

  useEffect(() => {
    const saved = localStorage.getItem('ai_dictionary_notebook');
    if (saved) setNotebook(JSON.parse(saved));
  }, []);

  const updateNotebook = (newNotebook: NotebookItem[]) => {
    setNotebook(newNotebook);
    localStorage.setItem('ai_dictionary_notebook', JSON.stringify(newNotebook));
  };

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setCurrentEntry(null);
    setView('search');
    setAudioCache({}); // 清空旧缓存

    try {
      const entry = await lookupWord(query, nativeLang, targetLang);
      setCurrentEntry(entry);
      setQuery('');
      
      // 1. 异步获取图像
      generateEntryImage(entry.word, entry.definition).then(img => {
        if (img) setCurrentEntry(prev => prev ? { ...prev, imageUrl: img } : null);
      });

      // 2. 核心优化：预加载主词、定义及所有例句语音
      // 预加载目标语言单词语音
      fetchSpeechBuffer(entry.word, entry.targetLang).then(buffer => {
        if (buffer) setAudioCache(prev => ({ ...prev, [entry.word]: buffer }));
      });
      // 预加载母语定义语音
      fetchSpeechBuffer(entry.definition, entry.nativeLang).then(buffer => {
        if (buffer) setAudioCache(prev => ({ ...prev, [entry.definition]: buffer }));
      });

      // 预加载所有例句语音 (目标语与母语翻译)
      entry.examples.forEach((ex, idx) => {
        fetchSpeechBuffer(ex.sentence, entry.targetLang).then(buffer => {
          if (buffer) setAudioCache(prev => ({ ...prev, [`ex-target-${idx}`]: buffer }));
        });
        fetchSpeechBuffer(ex.translation, entry.nativeLang).then(buffer => {
          if (buffer) setAudioCache(prev => ({ ...prev, [`ex-native-${idx}`]: buffer }));
        });
      });

    } catch (err) {
      alert("Search failed. Try another concept.");
      setView('start');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSave = () => {
    if (!currentEntry) return;
    const isSaved = notebook.some(item => item.word === currentEntry.word && item.targetLang === currentEntry.targetLang);
    
    if (isSaved) {
      updateNotebook(notebook.filter(item => !(item.word === currentEntry.word && item.targetLang === currentEntry.targetLang)));
    } else {
      const newItem: NotebookItem = {
        ...currentEntry,
        id: Date.now().toString(),
        date: Date.now()
      };
      updateNotebook([newItem, ...notebook]);
    }
  };

  const isEntrySaved = currentEntry ? notebook.some(item => item.word === currentEntry.word && item.targetLang === currentEntry.targetLang) : false;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white flex flex-col font-sans selection:bg-stone-100">
      {view === 'start' && (
        <LanguageSelector
          native={nativeLang}
          target={targetLang}
          onNativeChange={setNativeLang}
          onTargetChange={setTargetLang}
          onStart={() => setView('search')}
        />
      )}

      {(view === 'search' || view === 'notebook') && (
        <>
          <div className="bg-white px-8 py-6 sticky top-0 z-20">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${targetLang}...`}
                className="w-full py-3 bg-transparent border-b border-stone-100 font-serif text-2xl focus:outline-none focus:border-stone-900 transition-all duration-700 placeholder:text-stone-200"
              />
              {isLoading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                   <div className="w-4 h-4 border border-stone-100 border-t-stone-800 animate-spin rounded-full"></div>
                </div>
              )}
            </form>
          </div>

          <main className="flex-1 pb-24">
            {view === 'search' && (
              currentEntry ? (
                <DictionaryView
                  entry={currentEntry}
                  isSaved={isEntrySaved}
                  onSave={toggleSave}
                  onBack={() => setView('start')}
                  onOpenChat={() => setIsChatOpen(true)}
                  audioCache={audioCache} // 传递音频缓存
                />
              ) : !isLoading && (
                <div className="flex flex-col items-center justify-center pt-24 text-center px-12 space-y-10 animate-fade-in">
                  <div className="w-36 h-52 border border-stone-50 flex items-center justify-center relative group">
                     <div className="absolute inset-4 bg-stone-50/30 group-hover:inset-2 transition-all duration-1000"></div>
                     <span className="text-stone-100 text-[8px] font-serif italic uppercase tracking-widest">Tabula Rasa</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-serif text-stone-900 font-light">The Silent Gallery</h2>
                    <p className="text-stone-300 text-[9px] uppercase tracking-[0.3em] font-bold">Awaiting your inquiry</p>
                  </div>
                </div>
              )
            )}

            {view === 'notebook' && (
              <Notebook
                items={notebook}
                onRemove={(id) => updateNotebook(notebook.filter(i => i.id !== id))}
                onSelectItem={(item) => { setCurrentEntry(item); setView('search'); }}
                onStartFlashcards={() => setView('flashcards')}
                nativeLang={nativeLang}
                targetLang={targetLang}
              />
            )}
          </main>

          <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl px-10 py-6 flex justify-between items-center max-w-md mx-auto z-40 border-t border-stone-50">
            <button
              onClick={() => { setView('search'); setCurrentEntry(null); }}
              className={`flex flex-col items-center gap-2 transition-all duration-700 ${view === 'search' ? 'text-stone-900 scale-105' : 'text-stone-200'}`}
            >
              <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Curate</span>
            </button>
            <button
              onClick={() => setView('notebook')}
              className={`flex flex-col items-center gap-2 transition-all duration-700 ${view === 'notebook' ? 'text-stone-900 scale-105' : 'text-stone-200'}`}
            >
              <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Archive</span>
            </button>
            <button
              onClick={() => setView('start')}
              className="text-stone-200 hover:text-stone-900 transition-colors"
            >
              <span className="text-[8px] font-bold uppercase tracking-[0.4em]">Exit</span>
            </button>
          </nav>
        </>
      )}

      {view === 'flashcards' && (
        <FlashcardMode items={notebook} onClose={() => setView('notebook')} />
      )}

      {isChatOpen && currentEntry && (
        <ChatInterface entry={currentEntry} onClose={() => setIsChatOpen(false)} />
      )}
    </div>
  );
};

export default App;
