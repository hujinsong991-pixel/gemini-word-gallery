
import React, { useState } from 'react';
import { NotebookItem, Language } from '../types';
import { createStory } from '../services/geminiService';

interface Props {
  items: NotebookItem[];
  onRemove: (id: string) => void;
  onSelectItem: (item: NotebookItem) => void;
  onStartFlashcards: () => void;
  nativeLang: Language;
  targetLang: Language;
}

const Notebook: React.FC<Props> = ({ items, onRemove, onSelectItem, onStartFlashcards, nativeLang, targetLang }) => {
  const [story, setStory] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const handleCreateStory = async () => {
    if (items.length < 2) return;
    setIsGeneratingStory(true);
    setStory(null);
    try {
      const res = await createStory(items.map(i => i.word), nativeLang, targetLang);
      setStory(res);
    } catch (e) {
      alert("Failed to curate story.");
    } finally {
      setIsGeneratingStory(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-stone-900 pb-24 px-6 max-w-2xl mx-auto w-full animate-fade-in transition-colors duration-500">
      <div className="py-12 space-y-2">
        <h2 className="text-4xl font-serif font-light text-stone-900 dark:text-stone-300">Your Archive</h2>
        <p className="text-[10px] text-stone-400 dark:text-stone-600 uppercase tracking-[0.4em] font-bold">Curated Collection • {items.length}</p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-32 border-t border-stone-100 dark:border-stone-800 mt-8">
          <p className="text-stone-300 dark:text-stone-700 font-serif italic text-lg">Empty gallery</p>
          <p className="text-[10px] text-stone-300 dark:text-stone-700 uppercase tracking-widest mt-2">Archive your discoveries here</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex gap-4">
            <button
              onClick={onStartFlashcards}
              className="flex-1 py-4 border border-stone-100 dark:border-stone-800 text-[10px] font-bold uppercase tracking-[0.3em] text-stone-900 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-all"
            >
              Study Session
            </button>
            <button
              onClick={handleCreateStory}
              disabled={isGeneratingStory}
              className="flex-1 py-4 bg-stone-900 dark:bg-stone-300 text-white dark:text-stone-900 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-stone-800 dark:hover:bg-stone-200 transition-all disabled:opacity-20"
            >
              {isGeneratingStory ? 'Composing...' : 'Create Narrative'}
            </button>
          </div>

          {story && (
            <div className="bg-stone-50 dark:bg-stone-800/50 p-10 relative animate-fade-in transition-colors">
              <button onClick={() => setStory(null)} className="absolute top-6 right-6 text-stone-300 dark:text-stone-600 hover:text-stone-900 dark:hover:text-stone-300">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
              <h3 className="text-xs font-bold text-stone-400 dark:text-stone-600 uppercase tracking-[0.3em] mb-6">Literary Narrative</h3>
              <p className="text-stone-800 dark:text-stone-300 leading-loose font-serif italic text-lg whitespace-pre-wrap transition-colors">{story}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-12 pt-8 border-t border-stone-100 dark:border-stone-800">
            {items.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer space-y-4"
                onClick={() => onSelectItem(item)}
              >
                <div className="w-full aspect-[16/9] overflow-hidden bg-stone-50 dark:bg-stone-800 art-shadow transition-transform duration-700 group-hover:scale-[1.02]">
                  {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover grayscale dark:grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000" alt="" />}
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h4 className="font-serif text-2xl font-light text-stone-900 dark:text-stone-300 group-hover:translate-x-1 transition-all">{item.word}</h4>
                    <p className="text-stone-400 dark:text-stone-600 text-xs font-light transition-colors">{item.definition}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="text-stone-200 dark:text-stone-700 hover:text-stone-900 dark:hover:text-stone-400 transition-colors p-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notebook;
