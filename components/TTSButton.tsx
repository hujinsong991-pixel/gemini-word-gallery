
import React, { useState } from 'react';
import { getSpeech, playSpeechBuffer } from '../services/geminiService';
import { Language } from '../types';

interface Props {
  text: string;
  lang: Language;
  preloadedBuffer?: ArrayBuffer | null;
  className?: string;
}

const TTSButton: React.FC<Props> = ({ text, lang, preloadedBuffer, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleClick = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      if (preloadedBuffer) {
        await playSpeechBuffer(preloadedBuffer);
      } else {
        await getSpeech(text, lang);
      }
    } catch (e) {
      console.error("Playback failed", e);
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPlaying}
      className={`p-2 rounded-none transition-all duration-300 group ${className}`}
      title="Instant Play"
    >
      {isPlaying ? (
        <div className="w-5 h-5 flex items-center justify-center gap-0.5">
          <div className="w-1 bg-amber-700 animate-[bounce_0.6s_infinite]"></div>
          <div className="w-1 bg-amber-700 animate-[bounce_0.6s_infinite_0.1s]"></div>
          <div className="w-1 bg-amber-700 animate-[bounce_0.6s_infinite_0.2s]"></div>
        </div>
      ) : (
        <svg className="w-6 h-6 text-stone-200 group-hover:text-stone-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )}
    </button>
  );
};

export default TTSButton;
