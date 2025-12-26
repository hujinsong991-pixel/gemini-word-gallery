
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('ai_dict_theme') as 'light' | 'dark') || 'light';
  });
  
  const [audioCache, setAudioCache] = useState<AudioCache>({});

  useEffect(() => {
    const saved = localStorage.getItem('ai_dictionary_notebook');
    if (saved) setNotebook(JSON.parse(saved));
    
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('ai_dict_theme', newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

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
    setAudioCache({});

    try {
      const entry = await lookupWord(query, nativeLang, targetLang);
      setCurrentEntry(entry);
      setQuery('');
      
      generateEntryImage(entry.word, entry.definition).then(img => {
        if (img) setCurrentEntry(prev => prev ? { ...prev, imageUrl: img } : null);
      });

      fetchSpeechBuffer(entry.word, entry.targetLang).then(buffer => {
        if (buffer) setAudioCache(prev => ({ ...prev, [entry.word]: buffer }));
      });
      fetchSpeechBuffer(entry.definition, entry.nativeLang).then(buffer => {
        if (buffer) setAudioCache(prev => ({ ...prev, [entry.definition]: buffer }));
      });

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
    <div className={`max-w-md mx-auto min-h-screen bg-white dark:bg-stone-900 flex flex-col font-sans transition-colors duration-500 selection:bg-stone-100 dark:selection:bg-stone-800`}>
      {view === 'start' && (
        <LanguageSelector
          native={nativeLang}
          target={targetLang}
          onNativeChange={setNativeLang}
          onTargetChange={setTargetLang}
          onStart={() => setView('search')}
          theme={theme}
          onToggleTheme={toggleTheme}
        />
      )}

      {(view === 'search' || view === 'notebook') && (
        <>
          <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm px-8 py-6 sticky top-0 z-20 flex items-center gap-4 transition-colors duration-500">
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${targetLang}...`}
                className="w-full py-3 bg-transparent border-b border-stone-100 dark:border-stone-800 font-serif text-2xl focus:outline-none focus:border-stone-900 dark:focus:border-stone-300 transition-all duration-700 placeholder:text-stone-200 dark:placeholder:text-stone-700 text-stone-900 dark:text-stone-300"
              />
              {isLoading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                   <div className="w-4 h-4 border border-stone-100 dark:border-stone-800 border-t-stone-800 dark:border-t-stone-300 animate-spin rounded-full"></div>
                </div>
              )}
            </form>
            <button 
              onClick={toggleTheme}
              className="p-2 text-stone-300 hover:text-stone-900 dark:text-stone-700 dark:hover:text-stone-500 transition-colors"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </button>
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
                  audioCache={audioCache}
                />
              ) : !isLoading && (
                <div className="flex flex-col items-center justify-center pt-24 text-center px-12 space-y-10 animate-fade-in">
                  <div className="w-36 h-52 border border-stone-50 dark:border-stone-800 flex items-center justify-center relative group transition-colors">
                     <div className="absolute inset-4 bg-stone-50/30 dark:bg-stone-800/10 group-hover:inset-2 transition-all duration-1000"></div>
                     <span className="text-stone-100 dark:text-stone-800 text-[8px] font-serif italic uppercase tracking-widest">Tabula Rasa</span>
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-xl font-serif text-stone-900 dark:text-stone-300 font-light transition-colors">The Silent Gallery</h2>
                    <p className="text-stone-300 dark:text-stone-700 text-[9px] uppercase tracking-[0.3em] font-bold">Awaiting your inquiry</p>
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

          <nav className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl px-10 py-6 flex justify-between items-center max-w-md mx-auto z-40 border-t border-stone-50 dark:border-stone-800 transition-colors duration-500">
            <button
              onClick={() => { setView('search'); setCurrentEntry(null); }}
              className={`flex flex-col items-center gap-2 transition-all duration-700 ${view === 'search' ? 'text-stone-900 dark:text-stone-300 scale-105' : 'text-stone-200 dark:text-stone-700'}`}
            >
              <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Curate</span>
            </button>
            <button
              onClick={() => setView('notebook')}
              className={`flex flex-col items-center gap-2 transition-all duration-700 ${view === 'notebook' ? 'text-stone-900 dark:text-stone-300 scale-105' : 'text-stone-200 dark:text-stone-700'}`}
            >
              <span className="text-[8px] font-bold uppercase tracking-[0.3em]">Archive</span>
            </button>
            <button
              onClick={() => setView('start')}
              className="text-stone-200 dark:text-stone-700 hover:text-stone-900 dark:hover:text-stone-300 transition-colors"
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
