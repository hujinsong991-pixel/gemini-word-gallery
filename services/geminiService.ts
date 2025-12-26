
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, DictionaryEntry, Example } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// 基础解码工具
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export async function lookupWord(
  query: string,
  nativeLang: Language,
  targetLang: Language
): Promise<DictionaryEntry> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate and explain "${query}" from ${targetLang} to ${nativeLang}. 
    If targetLang is English, strictly include the IPA phonetic symbols in the "phonetic" field.
    Provide natural explanations, two examples, and a friendly, minimalist explanation.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          word: { type: Type.STRING },
          phonetic: { type: Type.STRING },
          definition: { type: Type.STRING },
          examples: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                sentence: { type: Type.STRING },
                translation: { type: Type.STRING },
              },
              required: ["sentence", "translation"],
            },
          },
          chitChat: { type: Type.STRING },
        },
        required: ["word", "definition", "examples", "chitChat"],
      },
    },
  });

  const data = JSON.parse(response.text || '{}');
  return { ...data, nativeLang, targetLang };
}

export async function generateEntryImage(word: string, definition: string): Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: `A clear, simple, and direct visual representation of the concept: "${word}" (${definition}). The style should be clean, high-quality, and easy to understand immediately. Minimalist composition with a neutral background.`,
  });

  for (const part of response.candidates?.[0]?.content.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return undefined;
}

// 核心：仅获取语音 ArrayBuffer，不播放，用于预加载
export async function fetchSpeechBuffer(text: string, lang: Language): Promise<ArrayBuffer | null> {
  const voiceMap: Record<Language, string> = {
    'Chinese': 'Kore',
    'English': 'Puck',
    'Japanese': 'Kore',
    'Korean': 'Kore',
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceMap[lang] || 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) return null;
    return decode(base64Audio).buffer;
  } catch (e) {
    console.error("TTS Fetch error", e);
    return null;
  }
}

// 播放已有的 Buffer，实现零延迟
export async function playSpeechBuffer(buffer: ArrayBuffer): Promise<void> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const decodedBuffer = await decodeAudioData(new Uint8Array(buffer), audioCtx, 24000, 1);
  const source = audioCtx.createBufferSource();
  source.buffer = decodedBuffer;
  source.connect(audioCtx.destination);
  source.start();
}

// 传统的直接获取并播放（兜底逻辑）
export async function getSpeech(text: string, lang: Language): Promise<void> {
  const buffer = await fetchSpeechBuffer(text, lang);
  if (buffer) await playSpeechBuffer(buffer);
}

export async function createStory(words: string[], nativeLang: Language, targetLang: Language): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write an elegant short story with: ${words.join(', ')}. In ${targetLang} with ${nativeLang} translation. Poetic style.`,
  });
  return response.text || "";
}

export function createChatSession(entry: DictionaryEntry) {
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a sophisticated linguistic curator. Explain nuances elegantly.`,
    },
  });
}
