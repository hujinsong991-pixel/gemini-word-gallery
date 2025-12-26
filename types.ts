
export type Language = 'Chinese' | 'English' | 'Japanese' | 'Korean';

export interface Example {
  sentence: string;
  translation: string;
}

export interface DictionaryEntry {
  word: string;
  phonetic?: string;
  definition: string;
  examples: Example[];
  chitChat: string;
  imageUrl?: string;
  targetLang: Language;
  nativeLang: Language;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
}

export interface NotebookItem extends DictionaryEntry {
  id: string;
  date: number;
}

// 用于预加载的音频缓存对象
export interface AudioCache {
  [key: string]: ArrayBuffer;
}
