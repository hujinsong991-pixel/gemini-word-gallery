
import React from 'react';
import { DictionaryEntry, Language, AudioCache } from '../types';
import TTSButton from './TTSButton';

interface Props {
  entry: DictionaryEntry;
  onSave: () => void;
  isSaved: boolean;
  onBack: () => void;
  onOpenChat: () => void;
  audioCache?: AudioCache;
}

const DictionaryView: React.FC<Props> = ({ entry, onSave, isSaved, onBack, onOpenChat, audioCache = {} }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCF8] animate-fade-in transition-colors duration-1000 pb-40">
      <div className="px-10 py-12 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <p className="text-[10px] text-amber-800 font-bold uppercase tracking-[0.6em]">Discovery</p>
          <div className="h-px w-8 bg-amber-100"></div>
        </div>
        <button
          onClick={onSave}
          className={`transition-all duration-700 ${isSaved ? 'text-amber-700 scale-125' : 'text-stone-200 hover:text-stone-900'}`}
        >
          <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
          </svg>
        </button>
      </div>

      <div className="px-10 space-y-16 max-w-xl mx-auto w-full">
        <section className="text-center space-y-8">
          <h2 className="text-8xl font-serif font-light tracking-tighter text-stone-900 leading-none">
            {entry.word}
          </h2>
          <div className="flex flex-col items-center gap-4">
            {entry.phonetic && (
              <span className="text-stone-400 font-serif italic text-base tracking-[0.2em]">
                /{entry.phonetic}/
              </span>
            )}
            <TTSButton 
              text={entry.word} 
              lang={entry.targetLang} 
              preloadedBuffer={audioCache[entry.word]} 
              className="text-stone-900 hover:text-amber-700"
            />
          </div>
        </section>

        {/* 核心方框 - 象牙白质感 */}
        <section className="relative group bg-white border border-stone-100 overflow-hidden flex h-72 shadow-2xl shadow-stone-200/50 rounded-sm">
          <div className="w-[45%] relative border-r border-stone-50 overflow-hidden">
            {entry.imageUrl ? (
              <img 
                src={entry.imageUrl} 
                alt={entry.word} 
                className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000 scale-[1.02] group-hover:scale-110" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-50">
                <div className="w-3 h-3 bg-amber-200 animate-pulse rounded-full"></div>
              </div>
            )}
          </div>

          <div className="w-[55%] p-10 flex flex-col justify-center space-y-6">
            <div className="space-y-1">
               <span className="text-[9px] font-bold text-amber-800 uppercase tracking-[0.5em]">Annotation</span>
               <div className="h-px w-6 bg-amber-200"></div>
            </div>
            <div className="flex items-start gap-4">
              <p className="text-lg font-serif font-light leading-relaxed text-stone-600">
                {entry.definition}
              </p>
              <TTSButton 
                text={entry.definition} 
                lang={entry.nativeLang} 
                preloadedBuffer={audioCache[entry.definition]}
                className="opacity-40 hover:opacity-100 scale-90"
              />
            </div>
          </div>
        </section>

        {/* 语境例句 */}
        <section className="space-y-12">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-stone-300 uppercase tracking-[0.8em] whitespace-nowrap">Examples</span>
            <div className="h-px w-full bg-stone-100"></div>
          </div>
          <div className="space-y-10">
            {entry.examples.map((ex, i) => (
              <div key={i} className="group relative pl-10">
                <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-stone-100 group-hover:bg-stone-900 transition-all duration-500"></div>
                <div className="space-y-3">
                  <div className="flex items-center gap-5">
                    <p className="text-xl font-light text-stone-900 tracking-tight leading-relaxed">
                      {ex.sentence}
                    </p>
                    <TTSButton 
                      text={ex.sentence} 
                      lang={entry.targetLang} 
                      preloadedBuffer={audioCache[`ex-target-${i}`]}
                      className="scale-90 opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                  <p className="text-stone-400 font-serif italic text-base">
                    {ex.translation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 笔记区域 - 留白美学 */}
        <section className="pt-24 pb-12 px-12 relative flex flex-col items-center">
          <div className="w-px h-16 bg-stone-100 mb-10"></div>
          <p className="text-stone-400 leading-loose font-serif italic text-lg text-center max-w-sm">
            “{entry.chitChat}”
          </p>
        </section>

        {/* 悬浮交互按钮 */}
        <div className="fixed bottom-32 left-10 right-10 max-w-md mx-auto z-10">
          <button
            onClick={onOpenChat}
            className="w-full py-6 bg-stone-900 text-white text-[11px] uppercase font-bold tracking-[0.6em] hover:bg-amber-900 transition-all duration-700 shadow-2xl shadow-stone-400/50"
          >
            Engage the Curator
          </button>
        </div>
      </div>
    </div>
  );
};

export default DictionaryView;
