
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
    <div className="min-h-screen bg-[#FDFCF8] pb-40 px-8 max-w-2xl mx-auto w-full animate-fade-in">
      <div className="py-16 space-y-4">
        <h2 className="text-5xl font-serif font-light text-stone-900">Archive</h2>
        <div className="flex items-center gap-4">
          <p className="text-[11px] text-stone-300 uppercase tracking-[0.5em] font-bold">Linguistic Collection • {items.length}</p>
          <div className="h-px flex-1 bg-stone-100"></div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-40 border-t border-stone-50">
          <p className="text-stone-300 font-serif italic text-xl">The gallery is currently vacant</p>
        </div>
      ) : (
        <div className="space-y-16">
          <div className="flex gap-4">
            <button
              onClick={onStartFlashcards}
              className="flex-1 py-5 border border-stone-100 text-[10px] font-bold uppercase tracking-[0.5em] text-stone-900 hover:bg-stone-900 hover:text-white transition-all duration-700"
            >
              Study Session
            </button>
            <button
              onClick={handleCreateStory}
              disabled={isGeneratingStory}
              className="flex-1 py-5 bg-amber-700 text-white text-[10px] font-bold uppercase tracking-[0.5em] hover:bg-amber-800 transition-all disabled:opacity-20 shadow-xl shadow-amber-900/10"
            >
              {isGeneratingStory ? 'Composing...' : 'Curate Story'}
            </button>
          </div>

          {story && (
            <div className="bg-white p-12 relative animate-fade-in shadow-2xl shadow-stone-200/50 border border-stone-50">
              <button onClick={() => setStory(null)} className="absolute top-8 right-8 text-stone-200 hover:text-stone-900 transition-colors">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                 </svg>
              </button>
              <h3 className="text-[10px] font-bold text-amber-800 uppercase tracking-[0.5em] mb-10">Literary Curator</h3>
              <p className="text-stone-800 leading-relaxed font-serif italic text-xl whitespace-pre-wrap">{story}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-16 pt-8">
            {items.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer space-y-6"
                onClick={() => onSelectItem(item)}
              >
                <div className="w-full aspect-[16/10] overflow-hidden bg-stone-50 relative">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      className="w-full h-full object-cover grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000" 
                      alt="" 
                    />
                  )}
                  <div className="absolute inset-0 border border-stone-100 group-hover:border-stone-900/10 transition-colors"></div>
                </div>
                <div className="flex justify-between items-end border-b border-stone-50 pb-6">
                  <div className="space-y-2">
                    <h4 className="font-serif text-3xl font-light text-stone-900 group-hover:translate-x-2 transition-all">{item.word}</h4>
                    <p className="text-stone-400 text-sm font-light max-w-xs truncate">{item.definition}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(item.id);
                    }}
                    className="text-stone-100 hover:text-amber-800 transition-colors p-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
