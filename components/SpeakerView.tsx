
import React, { useState, useEffect, useRef } from 'react';
import { Emotion, Transcription } from '../types';

interface SpeakerViewProps {
  onBroadcast?: (transcription: Transcription) => void;
}

const SpeakerView: React.FC<SpeakerViewProps> = ({ onBroadcast }) => {
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [activeEmotion, setActiveEmotion] = useState<Emotion>(Emotion.NEUTRAL);
  const [audienceCount, setAudienceCount] = useState(12);

  const mockPhrases = [
    { text: "Good morning everyone! I am so excited to see you all here today for this seminar.", emotion: Emotion.EXCITED },
    { text: "Today we will discuss the critical impact of language in our diverse campus community.", emotion: Emotion.SERIOUS },
    { text: "Did you hear the one about the translator? No? Well, it's a bit lost in translation anyway!", emotion: Emotion.HUMOROUS },
    { text: "Our main goal is to ensure every student feels at home, regardless of their native tongue.", emotion: Emotion.CONCERNED },
    { text: "Let's begin by looking at some key statistics on international student engagement.", emotion: Emotion.NEUTRAL }
  ];

  const handleToggleBroadcast = () => {
    if (!isBroadcasting) {
      setIsBroadcasting(true);
      startMockBroadcast();
    } else {
      setIsBroadcasting(false);
    }
  };

  const startMockBroadcast = () => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= mockPhrases.length) {
        clearInterval(interval);
        setIsBroadcasting(false);
        return;
      }
      
      const newEntry: Transcription = {
        id: Math.random().toString(36).substr(2, 9),
        text: mockPhrases[index].text,
        language: 'en',
        timestamp: Date.now(),
        emotion: mockPhrases[index].emotion
      };
      
      setTranscriptions(prev => [newEntry, ...prev]);
      setActiveEmotion(mockPhrases[index].emotion);
      if (onBroadcast) onBroadcast(newEntry);
      index++;
    }, 4000);
    
    return () => clearInterval(interval);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="p-8 bg-indigo-600 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Speaker Control Center</h2>
            <p className="text-indigo-100">Broadcasting live from Main Hall A</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500 px-4 py-2 rounded-xl flex items-center gap-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="font-semibold">{audienceCount} Listeners</span>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="flex flex-col items-center mb-10">
            <div className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-500 ${isBroadcasting ? 'bg-red-500 scale-110' : 'bg-gray-200'}`}>
              {isBroadcasting && (
                <div className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-75"></div>
              )}
              <button 
                onClick={handleToggleBroadcast}
                className="relative z-10 w-20 h-20 bg-white rounded-full flex items-center justify-center text-indigo-600 hover:text-indigo-700 transition shadow-inner"
              >
                {isBroadcasting ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                )}
              </button>
            </div>
            <p className={`mt-4 font-bold text-lg tracking-wide ${isBroadcasting ? 'text-red-500' : 'text-gray-400'}`}>
              {isBroadcasting ? 'LIVE BROADCASTING' : 'CLICK TO START'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-gray-500 uppercase mb-2">Source Language</span>
              <span className="text-xl font-bold text-indigo-600">English (Auto)</span>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-gray-500 uppercase mb-2">Detected Emotion</span>
              <span className={`text-xl font-bold capitalize ${
                activeEmotion === Emotion.EXCITED ? 'text-yellow-500' :
                activeEmotion === Emotion.SERIOUS ? 'text-blue-600' :
                activeEmotion === Emotion.HUMOROUS ? 'text-pink-500' :
                activeEmotion === Emotion.CONCERNED ? 'text-orange-600' :
                'text-indigo-600'
              }`}>
                {activeEmotion}
              </span>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col items-center text-center">
              <span className="text-sm font-semibold text-gray-500 uppercase mb-2">Signal Strength</span>
              <div className="flex gap-1 items-end h-6">
                <div className="w-1.5 h-2 bg-indigo-500 rounded-t-sm"></div>
                <div className="w-1.5 h-4 bg-indigo-500 rounded-t-sm"></div>
                <div className="w-1.5 h-6 bg-indigo-500 rounded-t-sm"></div>
                <div className="w-1.5 h-5 bg-indigo-500 rounded-t-sm"></div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              Live Transcription
            </h3>
            <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {transcriptions.length === 0 && (
                <div className="text-center py-10 text-gray-400 italic">
                  No transcription available. Start broadcasting to see your speech converted to text in real-time.
                </div>
              )}
              {transcriptions.map(t => (
                <div key={t.id} className="bg-white p-4 rounded-xl border-l-4 border-indigo-500 shadow-sm flex gap-4 animate-fadeIn">
                  <div className="flex-grow">
                    <p className="text-gray-800 leading-relaxed">{t.text}</p>
                    <div className="flex items-center gap-3 mt-2">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{t.language}</span>
                       <span className="text-[10px] text-gray-400">{new Date(t.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second: '2-digit'})}</span>
                    </div>
                  </div>
                  <div className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-500 self-start capitalize">
                    {t.emotion}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakerView;
