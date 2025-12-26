
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
    <div className="flex flex-col min-h-screen bg-white dark:bg-stone-900 pb-20 animate-fade-in transition-colors duration-500">
      {/* 顶部极简导航 */}
      <div className="sticky top-0 z-10 bg-white/95 dark:bg-stone-900/95 backdrop-blur-sm px-6 py-4 flex items-center justify-between transition-colors border-b border-stone-50 dark:border-stone-800/50">
        <button onClick={onBack} className="text-stone-300 dark:text-stone-700 hover:text-stone-900 dark:hover:text-stone-400 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onSave}
          className={`transition-all duration-700 p-1 ${isSaved ? 'text-stone-900 dark:text-stone-300 scale-110' : 'text-stone-100 dark:text-stone-800 hover:text-stone-200'}`}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
          </svg>
        </button>
      </div>

      <div className="px-6 space-y-10 max-w-xl mx-auto w-full pt-6">
        {/* 词汇标题与音标 */}
        <section className="text-center space-y-4">
          <h2 className="text-6xl font-serif font-light tracking-tighter text-stone-900 dark:text-stone-300 transition-colors">
            {entry.word}
          </h2>
          <div className="flex flex-col items-center gap-3">
            {entry.phonetic && (
              <span className="text-stone-400 dark:text-stone-600 font-serif italic text-sm tracking-[0.2em] px-4 py-1 border border-stone-50 dark:border-stone-800/50 rounded-full bg-stone-50/30 dark:bg-stone-800/20">
                /{entry.phonetic}/
              </span>
            )}
            <TTSButton 
              text={entry.word} 
              lang={entry.targetLang} 
              preloadedBuffer={audioCache[entry.word]} 
              className="hover:scale-110 transition-transform" 
            />
          </div>
        </section>

        {/* 核心紧凑方框：左侧视觉，右侧释义 */}
        <section className="relative group border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900/40 overflow-hidden flex h-52 art-shadow transition-all duration-700 hover:border-stone-300 dark:hover:border-stone-700 rounded-sm">
          {/* 左侧：视觉图像 */}
          <div className="w-[40%] relative bg-stone-50 dark:bg-stone-800/30 border-r border-stone-50 dark:border-stone-800 overflow-hidden transition-colors">
            {entry.imageUrl ? (
              <img 
                src={entry.imageUrl} 
                alt={entry.word} 
                className="w-full h-full object-cover grayscale-[0.2] dark:grayscale-[0.5] group-hover:grayscale-0 transition-all duration-1000 scale-[1.01] group-hover:scale-110" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-stone-200 dark:bg-stone-800 animate-pulse rounded-full"></div>
              </div>
            )}
            <div className="absolute top-2 left-3">
               <span className="text-[7px] uppercase tracking-[0.3em] text-stone-300 dark:text-stone-700 font-bold">Image Ref</span>
            </div>
          </div>

          {/* 右侧：文字释义 */}
          <div className="w-[60%] p-6 flex flex-col justify-center space-y-4 relative">
            <div className="space-y-1">
               <span className="text-[8px] font-bold text-stone-300 dark:text-stone-700 uppercase tracking-[0.4em] block">Interpretation</span>
               <div className="h-px w-8 bg-stone-100 dark:bg-stone-800"></div>
            </div>
            <div className="flex items-start gap-3">
              <p className="text-lg font-serif font-light leading-relaxed text-stone-800 dark:text-stone-400 flex-1 transition-colors">
                {entry.definition}
              </p>
              <TTSButton 
                text={entry.definition} 
                lang={entry.nativeLang} 
                preloadedBuffer={audioCache[entry.definition]}
                className="opacity-40 hover:opacity-100 mt-1"
              />
            </div>
          </div>
        </section>

        {/* 语境例句 */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-bold text-stone-200 dark:text-stone-800 uppercase tracking-[0.5em] whitespace-nowrap">Contextual Usage</span>
            <div className="h-px w-full bg-stone-50 dark:bg-stone-800/50"></div>
          </div>
          <div className="space-y-6">
            {entry.examples.map((ex, i) => (
              <div key={i} className="group relative pl-6 transition-all duration-500">
                {/* 装饰性垂直线 */}
                <div className="absolute left-0 top-1 bottom-1 w-px bg-stone-100 dark:bg-stone-800 group-hover:bg-stone-900 dark:group-hover:bg-stone-400 transition-colors"></div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <p className="text-lg font-medium text-stone-900 dark:text-stone-300 tracking-tight leading-snug transition-colors">
                      {ex.sentence}
                    </p>
                    <TTSButton 
                      text={ex.sentence} 
                      lang={entry.targetLang} 
                      preloadedBuffer={audioCache[`ex-target-${i}`]}
                      className="scale-75 opacity-0 group-hover:opacity-100 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-stone-400 dark:text-stone-600 font-serif italic text-sm transition-colors">
                      {ex.translation}
                    </p>
                    <TTSButton 
                      text={ex.translation} 
                      lang={entry.nativeLang} 
                      preloadedBuffer={audioCache[`ex-native-${i}`]}
                      className="scale-75 opacity-0 group-hover:opacity-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 策展洞察 - 采用引用样式 */}
        <section className="relative px-8 py-10 border-y border-stone-50 dark:border-stone-800/50 transition-colors">
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-white dark:bg-stone-900 px-4 transition-colors">
             <span className="text-[8px] font-bold text-stone-900 dark:text-stone-500 uppercase tracking-[0.4em]">Notes</span>
          </div>
          <p className="text-stone-500 dark:text-stone-500 leading-loose font-serif italic text-sm text-center transition-colors">
            “{entry.chitChat}”
          </p>
        </section>

        {/* 对话触发 */}
        <div className="py-10">
          <button
            onClick={onOpenChat}
            className="w-full py-5 bg-stone-900 dark:bg-stone-300 text-white dark:text-stone-900 text-[10px] uppercase font-bold tracking-[0.5em] hover:bg-stone-800 dark:hover:bg-stone-100 transition-all duration-500 shadow-xl dark:shadow-stone-900/50"
          >
            Engage the Curator
          </button>
        </div>
      </div>
    </div>
  );
};

export default DictionaryView;
