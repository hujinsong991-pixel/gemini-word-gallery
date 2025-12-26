
import React, { useState } from 'react';
import { NotebookItem } from '../types';
import TTSButton from './TTSButton';

interface Props {
  items: NotebookItem[];
  onClose: () => void;
}

const FlashcardMode: React.FC<Props> = ({ items, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const current = items[currentIndex];

  const next = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((currentIndex + 1) % items.length);
    }, 150);
  };

  const prev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((currentIndex - 1 + items.length) % items.length);
    }, 150);
  };

  if (items.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col p-8 items-center justify-center overflow-hidden animate-fade-in">
      <div className="w-full max-w-md flex flex-col h-full max-h-[800px]">
        {/* Header */}
        <div className="flex items-center justify-between text-stone-900 mb-12">
          <button onClick={onClose} className="p-2 text-stone-300 hover:text-stone-900">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400">
            Study {currentIndex + 1} / {items.length}
          </div>
          <div className="w-10"></div>
        </div>

        {/* Card Container */}
        <div className="flex-1 perspective-1000 relative">
          <div
            className={`w-full h-full relative transition-transform duration-1000 transform-style-3d cursor-pointer ${
              isFlipped ? 'rotate-y-180' : ''
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-white border border-stone-100 art-shadow p-12 flex flex-col items-center justify-center text-center">
              <div className="mb-12 w-full aspect-[4/5] bg-stone-50 overflow-hidden shadow-inner grayscale">
                {current.imageUrl && (
                  <img src={current.imageUrl} className="w-full h-full object-cover" alt="" />
                )}
              </div>
              <h3 className="text-4xl font-serif font-light text-stone-900">{current.word}</h3>
              <p className="text-[10px] text-stone-300 uppercase tracking-[0.3em] font-bold mt-8">Contemplate</p>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-white border border-stone-100 art-shadow p-12 flex flex-col items-center justify-center text-center overflow-y-auto">
              <div className="space-y-12 w-full">
                <section>
                  <h3 className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.3em] mb-4">Definition</h3>
                  <p className="text-2xl font-serif text-stone-900">{current.definition}</p>
                </section>
                
                <section className="space-y-4">
                  <h3 className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.3em]">Examples</h3>
                  {current.examples.map((ex, i) => (
                    <div key={i} className="text-center">
                      <p className="font-medium text-stone-800 text-sm">{ex.sentence}</p>
                      <p className="text-stone-400 text-xs italic mt-1">{ex.translation}</p>
                    </div>
                  ))}
                </section>

                <div className="pt-8">
                  <TTSButton text={current.word} lang={current.targetLang} className="!bg-stone-50 p-5" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-16 gap-8">
          <button
            onClick={prev}
            className="text-[10px] font-bold uppercase tracking-[0.3em] text-stone-300 hover:text-stone-900 transition-colors"
          >
            Back
          </button>
          <button
            onClick={next}
            className="flex-1 py-5 border border-stone-900 text-[10px] font-bold uppercase tracking-[0.4em] text-stone-900 hover:bg-stone-900 hover:text-white transition-all duration-500"
          >
            Advance
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardMode;
