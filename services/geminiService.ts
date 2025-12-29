
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Language, DictionaryEntry, Example } from "../types";

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

/**
 * 清洗 AI 返回的 JSON 字符串，移除可能存在的 Markdown 标签
 */
function cleanJsonString(str: string): string {
  // 移除 ```json 和 ``` 标签
  return str.replace(/```json\n?|```/g, '').trim();
}

export async function lookupWord(
  query: string,
  nativeLang: Language,
  targetLang: Language
): Promise<DictionaryEntry> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate and explain the word or phrase "${query}" from ${targetLang} to ${nativeLang}. 
    Return a JSON object only. 
    If targetLang is English, include the IPA phonetic symbols in the "phonetic" field.
    Provide one definition, two natural examples with translations, and a poetic, minimalist explanation in "chitChat".`,
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

  const text = response.text || '{}';
  const cleanJson = cleanJsonString(text);
  
  try {
    const data = JSON.parse(cleanJson);
    return { ...data, nativeLang, targetLang };
  } catch (err) {
    console.error("JSON Parsing failed for:", cleanJson);
    throw new Error("Invalid response format from AI");
  }
}

export async function generateEntryImage(word: string, definition: string): Promise<string | undefined> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: `A minimalist, high-quality artistic visual representation of the concept: "${word}" (${definition}). Clean composition, neutral background, cinematic lighting.`,
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
  } catch (err) {
    console.warn("Image generation skipped", err);
  }
  return undefined;
}

export async function fetchSpeechBuffer(text: string, lang: Language): Promise<ArrayBuffer | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
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

export async function playSpeechBuffer(buffer: ArrayBuffer): Promise<void> {
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const decodedBuffer = await decodeAudioData(new Uint8Array(buffer), audioCtx, 24000, 1);
  const source = audioCtx.createBufferSource();
  source.buffer = decodedBuffer;
  source.connect(audioCtx.destination);
  source.start();
}

export async function getSpeech(text: string, lang: Language): Promise<void> {
  const buffer = await fetchSpeechBuffer(text, lang);
  if (buffer) await playSpeechBuffer(buffer);
}

export async function createStory(words: string[], nativeLang: Language, targetLang: Language): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Write an elegant, poetic short story using these words: ${words.join(', ')}. 
    Write in ${targetLang} with a full ${nativeLang} translation following it.`,
  });
  return response.text || "";
}

export function createChatSession(entry: DictionaryEntry) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a sophisticated linguistic curator. Explain the word "${entry.word}" and its nuances elegantly.`,
    },
  });
}
