
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
  const [audioCache, setAudioCache] = useState<AudioCache>({});

  useEffect(() => {
    const saved = localStorage.getItem('ai_dictionary_notebook');
    if (saved) setNotebook(JSON.parse(saved));
    // 移除强制暗色，保持明亮的奶白色调
    document.documentElement.classList.remove('dark');
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
    setAudioCache({});

    try {
      const entry = await lookupWord(query, nativeLang, targetLang);
      setCurrentEntry(entry);
      setQuery('');
      
      generateEntryImage(entry.word, entry.definition).then(img => {
        if (img) setCurrentEntry(prev => prev ? { ...prev, imageUrl: img } : null);
      }).catch(console.error);

      setTimeout(() => {
        fetchSpeechBuffer(entry.word, entry.targetLang).then(buffer => {
          if (buffer) setAudioCache(prev => ({ ...prev, [entry.word]: buffer }));
        });
      }, 300);

    } catch (err) {
      alert("Consultation failed. The archive is temporarily inaccessible.");
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
    <div className="max-w-md mx-auto min-h-screen bg-[#FDFCF8] flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 transition-colors duration-1000">
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
          <header className="bg-[#FDFCF8]/90 backdrop-blur-xl px-8 py-10 sticky top-0 z-20 flex items-center gap-4 border-b border-stone-100/50">
            <form onSubmit={handleSearch} className="relative flex-1">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Discover ${targetLang}...`}
                className="w-full py-2 bg-transparent border-b border-stone-200 font-serif text-3xl focus:outline-none focus:border-amber-600 transition-all duration-700 placeholder:text-stone-300 text-stone-900"
              />
              {isLoading && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                   <div className="w-4 h-4 border-2 border-stone-100 border-t-amber-600 animate-spin rounded-full"></div>
                </div>
              )}
            </form>
          </header>

          <main className="flex-1 pb-32">
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
                <div className="flex flex-col items-center justify-center pt-32 text-center px-12 space-y-12 animate-fade-in">
                  <div className="w-px h-24 bg-gradient-to-b from-transparent via-stone-200 to-transparent"></div>
                  <div className="space-y-4">
                    <h2 className="text-xs font-serif italic text-stone-400 tracking-[0.4em]">In Silence</h2>
                    <p className="text-stone-300 text-[9px] uppercase tracking-[0.6em] font-bold italic">Curating your linguistic journey</p>
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

          <nav className="fixed bottom-0 left-0 right-0 bg-white/60 backdrop-blur-2xl px-12 py-8 flex justify-between items-center max-w-md mx-auto z-40 border-t border-stone-100/30">
            <button
              onClick={() => { setView('search'); setCurrentEntry(null); }}
              className={`text-[9px] font-bold uppercase tracking-[0.4em] transition-all duration-700 ${view === 'search' ? 'text-amber-700 scale-110' : 'text-stone-300 hover:text-stone-500'}`}
            >
              Curate
            </button>
            <button
              onClick={() => setView('notebook')}
              className={`text-[9px] font-bold uppercase tracking-[0.4em] transition-all duration-700 ${view === 'notebook' ? 'text-amber-700 scale-110' : 'text-stone-300 hover:text-stone-500'}`}
            >
              Gallery
            </button>
            <button
              onClick={() => { setView('start'); setCurrentEntry(null); }}
              className="text-[9px] font-bold uppercase tracking-[0.4em] text-stone-200 hover:text-amber-700 transition-colors"
            >
              Reset
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
