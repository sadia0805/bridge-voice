
export enum AppState {
  LANDING = 'LANDING',
  SPEAKER = 'SPEAKER',
  LISTENER = 'LISTENER',
  DEMO = 'DEMO'
}

export enum Emotion {
  NEUTRAL = 'neutral',
  EXCITED = 'excited',
  SERIOUS = 'serious',
  HUMOROUS = 'humorous',
  CONCERNED = 'concerned'
}

export interface Transcription {
  id: string;
  text: string;
  language: string;
  timestamp: number;
  emotion?: Emotion;
}

export interface Translation extends Transcription {
  sourceText: string;
  targetLanguage: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  voice: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', voice: 'Kore' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', voice: 'Puck' },
  { code: 'fr', name: 'French', nativeName: 'Français', voice: 'Charon' },
  { code: 'zh', name: 'Mandarin', nativeName: '中文', voice: 'Kore' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', voice: 'Fenrir' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', voice: 'Kore' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', voice: 'Puck' }
];
