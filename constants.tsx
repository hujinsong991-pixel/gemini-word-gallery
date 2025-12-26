
import React from 'react';
import { Language } from './types';

export const LANGUAGES: { label: string; value: Language; native: string; code: string }[] = [
  { label: 'Chinese', value: 'Chinese', native: '中文', code: 'ZH' },
  { label: 'English', value: 'English', native: 'English', code: 'EN' },
  { label: 'Japanese', value: 'Japanese', native: '日本語', code: 'JP' },
  { label: 'Korean', value: 'Korean', native: '한국어', code: 'KR' },
];

export const UI_COLORS = {
  primary: 'bg-stone-900',
  secondary: 'bg-stone-100',
  accent: 'bg-amber-800',
  textPrimary: 'text-stone-900',
  textSecondary: 'text-stone-500',
};
