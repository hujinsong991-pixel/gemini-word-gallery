
import React from 'react';
import { Language } from '../types';
import { LANGUAGES } from '../constants';

interface Props {
  native: Language;
  target: Language;
  onNativeChange: (lang: Language) => void;
  onTargetChange: (lang: Language) => void;
  onStart: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const LanguageSelector: React.FC<Props> = ({ native, target, onNativeChange, onTargetChange, onStart, theme, onToggleTheme }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-white dark:bg-stone-900 transition-colors duration-500 animate-fade-in relative overflow-hidden">
      {/* Theme Toggle in Start Screen */}
      <button 
        onClick={onToggleTheme}
        className="absolute top-8 right-8 z-20 p-2 text-stone-200 hover:text-stone-900 dark:text-stone-700 dark:hover:text-stone-500 transition-colors"
      >
        {theme === 'light' ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        )}
      </button>

      {/* "The Raft of the Medusa" Background Silhouette - Dimmed for Eye Protection */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] dark:opacity-[0.02] flex items-center justify-center translate-y-12 scale-125 transition-opacity duration-1000">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="fill-stone-900 dark:fill-stone-100">
          <path d="M5,85 L95,85 L85,75 L15,75 Z" />
          <path d="M40,75 L42,30 L38,30 Z" />
          <path d="M42,35 Q60,40 65,60 Q50,65 42,65 Z" />
          <path d="M20,75 Q30,60 45,75 Z" /> 
          <path d="M40,75 Q50,45 65,75 Z" />
          <path d="M60,75 Q75,30 85,75 Z" />
          <path d="M82,45 Q85,40 88,45 L85,55 Z" />
        </svg>
      </div>

      <div className="w-full max-w-sm space-y-12 relative z-10">
        <div className="text-center space-y-4">
          <h1 className="text-6xl font-serif font-light tracking-tighter text-stone-900 dark:text-stone-300 transition-colors">Spark</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-6 bg-stone-200 dark:bg-stone-800"></div>
            <p className="text-[9px] uppercase tracking-[0.5em] text-stone-400 dark:text-stone-600 font-bold">Linguistic Archive</p>
            <div className="h-px w-6 bg-stone-200 dark:bg-stone-800"></div>
          </div>
        </div>

        <div className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-stone-300 dark:text-stone-700 uppercase tracking-[0.3em]">Origin</span>
              <div className="h-px flex-1 bg-stone-50 dark:bg-stone-800 transition-colors"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={`native-${lang.value}`}
                  onClick={() => onNativeChange(lang.value)}
                  className={`relative px-4 py-5 border transition-all duration-700 text-left group ${
                    native === lang.value 
                    ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-300 dark:bg-stone-300 dark:text-stone-900' 
                    : 'border-stone-100 bg-white text-stone-400 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-600 dark:hover:border-stone-700'
                  }`}
                >
                  <span className={`absolute top-2 right-3 text-[10px] font-serif italic ${native === lang.value ? 'text-stone-500 dark:text-stone-500' : 'text-stone-100 dark:text-stone-800'}`}>
                    {lang.code}
                  </span>
                  <p className="text-sm font-serif">{lang.native}</p>
                  <p className="text-[8px] uppercase tracking-widest opacity-60 mt-1">{lang.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-stone-300 dark:text-stone-700 uppercase tracking-[0.3em]">Target</span>
              <div className="h-px flex-1 bg-stone-50 dark:bg-stone-800 transition-colors"></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={`target-${lang.value}`}
                  onClick={() => onTargetChange(lang.value)}
                  disabled={lang.value === native}
                  className={`relative px-4 py-5 border transition-all duration-700 text-left group ${
                    target === lang.value 
                    ? 'border-stone-900 bg-stone-900 text-white dark:border-stone-300 dark:bg-stone-300 dark:text-stone-900' 
                    : 'border-stone-100 bg-white text-stone-400 hover:border-stone-300 dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-600 dark:hover:border-stone-700 disabled:opacity-5 disabled:cursor-not-allowed'
                  }`}
                >
                  <span className={`absolute top-2 right-3 text-[10px] font-serif italic ${target === lang.value ? 'text-stone-500 dark:text-stone-500' : 'text-stone-100 dark:text-stone-800'}`}>
                    {lang.code}
                  </span>
                  <p className="text-sm font-serif">{lang.native}</p>
                  <p className="text-[8px] uppercase tracking-widest opacity-60 mt-1">{lang.label}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <button
              onClick={onStart}
              className="w-full py-6 bg-stone-900 dark:bg-stone-300 text-white dark:text-stone-900 font-serif text-lg tracking-[0.3em] hover:bg-stone-800 dark:hover:bg-stone-200 transition-all duration-700 active:scale-[0.98] shadow-2xl"
            >
              INITIALIZE
            </button>
            <p className="mt-6 text-center text-[8px] text-stone-300 dark:text-stone-600 uppercase tracking-[0.2em] font-medium leading-relaxed">
              Classical Interpretation of Modern Language
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageSelector;
