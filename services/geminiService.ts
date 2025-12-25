
import { GoogleGenAI, Modality, Type, LiveServerMessage } from "@google/genai";
import { Emotion } from "../types";

// Re-initialize to ensure it uses the latest process.env.API_KEY
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const translateWithEmotion = async (
  text: string,
  sourceLang: string,
  targetLang: string
) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Translate the following text from ${sourceLang} to ${targetLang}. 
    Crucially, detect the emotional tone (Excited, Serious, Humorous, Neutral, Concerned) and 
    provide the translation while preserving that specific intent and vibe. 
    Return the response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translatedText: { type: Type.STRING },
          detectedEmotion: { type: Type.STRING, description: "One of: excited, serious, humorous, neutral, concerned" },
          toneNotes: { type: Type.STRING }
        },
        required: ["translatedText", "detectedEmotion"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const generateSpeech = async (text: string, voiceName: string, emotion: Emotion) => {
  const ai = getAI();
  const prompt = `Say ${emotion}ly: ${text}`;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName },
        },
      },
    },
  });

  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};

/**
 * Connects to the Live API to perform real-time emotive translation.
 */
export const connectLiveTranslator = async (
  targetLanguage: string,
  voiceName: string,
  callbacks: {
    onAudio: (base64Audio: string) => void;
    onTranscription: (text: string, isUser: boolean) => void;
    onError: (err: any) => void;
  }
) => {
  const ai = getAI();
  
  const sessionPromise = ai.live.connect({
    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName } },
      },
      systemInstruction: `You are a real-time speech-to-speech translator. 
      Listen to the user's speech and translate it into ${targetLanguage} IMMEDIATELY. 
      DO NOT engage in conversation. ONLY translate.
      Crucially, match the speaker's emotion, pace, and intensity. 
      If they are excited, your translation must sound excited. 
      If they are serious, sound serious.`,
      inputAudioTranscription: {},
      outputAudioTranscription: {},
    },
    callbacks: {
      onopen: () => console.log("Live session opened"),
      onmessage: async (message: LiveServerMessage) => {
        if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
          callbacks.onAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
        }
        if (message.serverContent?.inputTranscription) {
          callbacks.onTranscription(message.serverContent.inputTranscription.text, true);
        }
        if (message.serverContent?.outputTranscription) {
          callbacks.onTranscription(message.serverContent.outputTranscription.text, false);
        }
      },
      onerror: (e) => callbacks.onError(e),
      onclose: () => console.log("Live session closed"),
    }
  });

  return sessionPromise;
};

// Audio Utilities
export function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
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

export function createPcmBlob(data: Float32Array): { data: string; mimeType: string } {
  const int16 = new Int16Array(data.length);
  for (let i = 0; i < data.length; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}
