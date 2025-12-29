
import React from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';

interface Props {
  native: Language;
  target: Language;
  onNativeChange: (lang: Language) => void;
  onTargetChange: (lang: Language) => void;
  onStart: () => void;
}

const LanguageSelector: React.FC<Props> = ({ native, target, onNativeChange, onTargetChange, onStart }) => {
  return (
    <div className="flex flex-col min-h-screen bg-[#FDFCF8] text-stone-900 transition-all duration-1000 animate-fade-in relative overflow-hidden p-12">
      {/* 艺术装饰线条 */}
      <div className="absolute top-0 right-[15%] w-px h-screen bg-stone-100 opacity-80"></div>
      <div className="absolute top-[40%] left-0 w-full h-px bg-stone-100 opacity-80"></div>
      
      {/* 标题 - 经典排版 */}
      <div className="relative mt-20 mb-24">
        <h1 className="text-9xl font-serif font-light tracking-[-0.08em] leading-none text-stone-900 mb-4 animate-fade-in">
          Spark<span className="text-amber-600">.</span>
        </h1>
        <div className="flex items-center gap-6 ml-2">
          <div className="h-px w-10 bg-amber-600/30"></div>
          <p className="text-[10px] uppercase tracking-[0.8em] text-stone-400 font-bold">The Art of Translation</p>
        </div>
      </div>

      <div className="flex-1 space-y-20 max-w-sm relative z-10">
        {/* 源语言选择 */}
        <section className="space-y-8">
          <div className="flex items-center justify-between group">
            <span className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.5em]">Native</span>
            <span className="h-px flex-1 bg-stone-100 ml-4 group-hover:bg-amber-100 transition-colors"></span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {LANGUAGES.map((lang) => (
              <button
                key={`native-${lang.value}`}
                onClick={() => onNativeChange(lang.value)}
                className={`group py-5 px-6 border text-left transition-all duration-700 rounded-sm ${
                  native === lang.value 
                  ? 'border-stone-900 bg-stone-900 text-white shadow-xl' 
                  : 'border-transparent bg-white text-stone-400 hover:bg-stone-50 hover:text-stone-600 shadow-sm'
                }`}
              >
                <p className="text-sm font-serif mb-1">{lang.native}</p>
                <p className="text-[8px] uppercase tracking-widest opacity-60">{lang.label}</p>
              </button>
            ))}
          </div>
        </section>

        {/* 目标语言选择 */}
        <section className="space-y-8">
          <div className="flex items-center justify-between group">
            <span className="text-[11px] font-bold text-stone-900 uppercase tracking-[0.5em]">Target</span>
            <span className="h-px flex-1 bg-stone-100 ml-4 group-hover:bg-amber-100 transition-colors"></span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {LANGUAGES.map((lang) => (
              <button
                key={`target-${lang.value}`}
                onClick={() => onTargetChange(lang.value)}
                disabled={lang.value === native}
                className={`group py-5 px-6 border text-left transition-all duration-700 rounded-sm ${
                  target === lang.value 
                  ? 'border-stone-900 bg-stone-900 text-white shadow-xl' 
                  : 'border-transparent bg-white text-stone-400 hover:bg-stone-50 hover:text-stone-600 disabled:opacity-0 shadow-sm'
                }`}
              >
                <p className="text-sm font-serif mb-1">{lang.native}</p>
                <p className="text-[8px] uppercase tracking-widest opacity-60">{lang.label}</p>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* 极简启动按钮 */}
      <div className="mt-20">
        <button
          onClick={onStart}
          className="group relative w-full py-10 transition-all duration-1000"
        >
          <div className="absolute inset-0 border border-stone-200 group-hover:border-stone-900 transition-colors rounded-sm"></div>
          <span className="relative z-10 text-stone-900 font-serif text-3xl tracking-[0.5em] group-hover:translate-x-2 transition-transform inline-block">
            ENTER
          </span>
          <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-700">
             <span className="text-[8px] uppercase tracking-[1em] text-amber-700 font-bold">Initializing Archive</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default LanguageSelector;
