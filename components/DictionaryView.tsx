
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
    <div className="flex flex-col min-h-screen bg-white pb-20 animate-fade-in">
      {/* 顶部导航 */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-6 py-6 flex items-center justify-between">
        <button onClick={onBack} className="text-stone-300 hover:text-stone-900 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={onSave}
          className={`transition-all duration-700 ${isSaved ? 'text-stone-900' : 'text-stone-100 hover:text-stone-300'}`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 3H7a2 2 0 00-2 2v16l7-3 7 3V5a2 2 0 00-2-2z" />
          </svg>
        </button>
      </div>

      <div className="px-6 space-y-8 max-w-xl mx-auto w-full">
        {/* 词汇头部 */}
        <section className="text-center pt-2 space-y-4">
          <h2 className="text-5xl font-serif font-light tracking-tighter text-stone-900">{entry.word}</h2>
          <div className="flex flex-col items-center gap-2">
            {entry.phonetic && (
              <span className="text-stone-400 font-serif italic text-sm tracking-widest px-3 py-0.5 border border-stone-50 rounded-full">
                /{entry.phonetic}/
              </span>
            )}
            <TTSButton 
              text={entry.word} 
              lang={entry.targetLang} 
              preloadedBuffer={audioCache[entry.word]} 
              className="scale-110" 
            />
          </div>
        </section>

        {/* 核心整合方框：左图右义 */}
        <section className="border border-stone-100 bg-white overflow-hidden flex min-h-[160px] art-shadow transition-all duration-500 hover:border-stone-200">
          {/* 左侧：图片区域 */}
          <div className="w-2/5 relative bg-stone-50 border-r border-stone-50 overflow-hidden flex-shrink-0">
            {entry.imageUrl ? (
              <img 
                src={entry.imageUrl} 
                alt={entry.word} 
                className="w-full h-full object-cover grayscale-[0.1] hover:grayscale-0 transition-all duration-700" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-1 h-1 bg-stone-900 animate-ping"></div>
              </div>
            )}
            <div className="absolute bottom-1 left-2">
               <span className="text-[6px] uppercase tracking-widest text-stone-400 font-bold opacity-50">Visual Ref</span>
            </div>
          </div>

          {/* 右侧：释义区域 */}
          <div className="w-3/5 p-5 flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-2">
               <h3 className="text-[7px] font-bold text-stone-900 uppercase tracking-[0.2em]">Interpretation</h3>
               <div className="h-px flex-1 bg-stone-50"></div>
            </div>
            <div className="flex items-start gap-2">
              <p className="text-base font-serif font-light leading-snug text-stone-800 flex-1">
                {entry.definition}
              </p>
              <TTSButton 
                text={entry.definition} 
                lang={entry.nativeLang} 
                preloadedBuffer={audioCache[entry.definition]}
                className="scale-90 opacity-60 hover:opacity-100"
              />
            </div>
          </div>
        </section>

        {/* 例句用法 */}
        <section className="space-y-6">
          <h3 className="text-[8px] font-bold text-stone-300 uppercase tracking-[0.3em]">Contextual Usage</h3>
          <div className="space-y-5">
            {entry.examples.map((ex, i) => (
              <div key={i} className="group border-l border-stone-50 pl-5 py-1 hover:border-stone-400 transition-all duration-500 relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-base font-medium text-stone-900 tracking-tight leading-snug">{ex.sentence}</p>
                      <TTSButton 
                        text={ex.sentence} 
                        lang={entry.targetLang} 
                        preloadedBuffer={audioCache[`ex-target-${i}`]}
                        className="scale-75 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <p className="text-stone-400 font-serif italic text-xs">{ex.translation}</p>
                      <TTSButton 
                        text={ex.translation} 
                        lang={entry.nativeLang} 
                        preloadedBuffer={audioCache[`ex-native-${i}`]}
                        className="scale-75 opacity-0 group-hover:opacity-100 transition-opacity"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 策展人笔记 */}
        <section className="bg-stone-50/40 p-7 space-y-3">
          <div className="flex items-center gap-2">
             <div className="w-1 h-1 bg-stone-900"></div>
             <h3 className="text-[8px] font-bold text-stone-900 uppercase tracking-[0.3em]">Annotated Insights</h3>
          </div>
          <p className="text-stone-600 leading-[1.7] font-serif italic text-sm whitespace-pre-wrap">{entry.chitChat}</p>
        </section>

        {/* 对话按钮 */}
        <div className="py-6">
          <button
            onClick={onOpenChat}
            className="w-full py-4 border border-stone-900 text-stone-900 text-[9px] uppercase font-bold tracking-[0.4em] hover:bg-stone-900 hover:text-white transition-all duration-500"
          >
            Engage in Dialogue
          </button>
        </div>
      </div>
    </div>
  );
};

export default DictionaryView;
