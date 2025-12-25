
import React, { useState, useEffect, useRef } from 'react';
import { Emotion, SUPPORTED_LANGUAGES, Translation, Language } from '../types';
// Fixed: Imported 'decode' instead of 'decodeBase64' as it is the correct exported name in geminiService.ts
import { generateSpeech, decode, decodeAudioData, translateWithEmotion } from '../services/geminiService';

interface ListenerViewProps {
  lastBroadcast?: { text: string; language: string; emotion: Emotion };
}

const ListenerView: React.FC<ListenerViewProps> = ({ lastBroadcast }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(SUPPORTED_LANGUAGES[1]); // Spanish by default
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (isJoined && lastBroadcast && lastBroadcast.text) {
      handleNewBroadcast(lastBroadcast.text, lastBroadcast.language, lastBroadcast.emotion);
    }
  }, [lastBroadcast]);

  const handleNewBroadcast = async (text: string, sourceLang: string, emotion: Emotion) => {
    setIsProcessing(true);
    try {
      // 1. Translate
      const result = await translateWithEmotion(text, sourceLang, selectedLanguage.code);
      
      const newTranslation: Translation = {
        id: Math.random().toString(36).substr(2, 9),
        text: result.translatedText,
        sourceText: text,
        language: selectedLanguage.code,
        targetLanguage: selectedLanguage.code,
        timestamp: Date.now(),
        emotion: (result.detectedEmotion as Emotion) || emotion
      };

      setTranslations(prev => [newTranslation, ...prev]);

      // 2. Play Audio
      const audioBase64 = await generateSpeech(result.translatedText, selectedLanguage.voice, newTranslation.emotion!);
      if (audioBase64) {
        playAudio(audioBase64);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const playAudio = async (base64: string) => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') await ctx.resume();

    // Fixed: Using 'decode' instead of 'decodeBase64'
    const bytes = decode(base64);
    const buffer = await decodeAudioData(bytes, ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  };

  const handleJoin = () => {
    setIsJoined(true);
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {!isJoined ? (
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-gray-100 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Join Live Session</h2>
          <p className="text-gray-500 mb-8">Select your primary language to receive real-time emotional translation through your earbuds.</p>
          
          <div className="space-y-4 mb-8">
            <label className="block text-left text-sm font-bold text-gray-700 ml-1">Preferred Language</label>
            <div className="grid grid-cols-2 gap-3">
              {SUPPORTED_LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center ${selectedLanguage.code === lang.code ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-indigo-200 text-gray-600'}`}
                >
                  <span className="font-bold">{lang.nativeName}</span>
                  <span className="text-xs opacity-75">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleJoin}
            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200 transform hover:-translate-y-1"
          >
            Start Listening
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 h-[80vh] flex flex-col">
          <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold flex items-center gap-2">
                <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                LIVE SESSION
              </h2>
              <p className="text-xs text-indigo-100">Main Hall A • Speaker: Prof. Adams</p>
            </div>
            <button 
              onClick={() => setIsJoined(false)}
              className="text-indigo-200 hover:text-white transition"
            >
              Leave
            </button>
          </div>

          <div className="bg-indigo-50 px-6 py-4 flex justify-between items-center border-b border-indigo-100">
             <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-indigo-600">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
                </div>
                <span className="font-bold text-indigo-700">{selectedLanguage.nativeName}</span>
             </div>
             {isProcessing && (
               <div className="flex items-center gap-2 text-indigo-400">
                  <span className="text-xs font-medium animate-pulse">Translating...</span>
                  <div className="flex gap-0.5">
                    <div className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                    <div className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-1 h-3 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
               </div>
             )}
          </div>

          <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {translations.length === 0 && !isProcessing && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                <div className="w-20 h-20 border-4 border-dashed border-indigo-200 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 10l-4 4l6 6l4-16l-18 7l4 2l2 6l3-4"/></svg>
                </div>
                <p className="font-medium text-indigo-900">Waiting for speaker to begin...</p>
                <p className="text-xs mt-1">Make sure your volume is on</p>
              </div>
            )}
            
            {translations.map((t, i) => (
              <div key={t.id} className={`flex flex-col gap-2 ${i === 0 ? 'animate-fadeIn' : ''}`}>
                <div className="flex justify-between items-end">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {t.targetLanguage} • {t.emotion}
                  </span>
                  <span className="text-[10px] text-gray-400">{new Date(t.timestamp).toLocaleTimeString([], {minute:'2-digit', second:'2-digit'})}</span>
                </div>
                <div className={`p-5 rounded-2xl ${i === 0 ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-gray-50 text-gray-800'}`}>
                  <p className="leading-relaxed font-medium">{t.text}</p>
                  <p className={`mt-3 pt-3 border-t text-xs italic ${i === 0 ? 'border-indigo-500 text-indigo-100' : 'border-gray-200 text-gray-400'}`}>
                    Original: "{t.sourceText}"
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center gap-4">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
             </div>
             <p className="text-xs text-gray-500 leading-tight">
               Bridge-Voice is automatically translating the speaker's tone and emotion. Use your device's volume buttons to adjust audio level.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListenerView;
