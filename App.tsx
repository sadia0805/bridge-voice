
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SpeakerView from './components/SpeakerView';
import ListenerView from './components/ListenerView';
import DemoView from './components/DemoView';
import Onboarding from './components/Onboarding';
import { AppState, Transcription, Emotion } from './types';

const App: React.FC = () => {
  const [currentState, setCurrentState] = useState<AppState>(AppState.LANDING);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState<{ text: string; language: string; emotion: Emotion } | undefined>(undefined);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem('bridge_voice_onboarded');
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const handleBroadcast = (transcription: Transcription) => {
    setLastBroadcast({
      text: transcription.text,
      language: transcription.language,
      emotion: transcription.emotion || Emotion.NEUTRAL
    });
  };

  const renderContent = () => {
    switch (currentState) {
      case AppState.LANDING:
        return (
          <div className="space-y-20 pb-20">
            {/* Hero Section */}
            <section className="relative px-6 pt-20 pb-32 overflow-hidden">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-50 -mr-64 -mt-32"></div>
               <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-100 rounded-full blur-3xl opacity-50 -ml-48 -mb-32"></div>
               
               <div className="max-w-7xl mx-auto relative z-10 grid lg:grid-cols-2 gap-16 items-center">
                 <div className="animate-slideUp">
                    <div className="inline-block px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-sm rounded-full mb-6 border border-indigo-100">
                       PROMOTING SOCIAL INCLUSION
                    </div>
                    <h2 className="text-5xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8">
                       Breaking <span className="text-indigo-600">Language</span> Barriers in Real-Time.
                    </h2>
                    <p className="text-xl text-gray-600 leading-relaxed mb-10 max-w-xl">
                       A real-time emotive speech-to-speech translation assistant for campus lectures, community meetings, and inclusive events.
                    </p>
                    <div className="flex flex-wrap gap-4">
                       <button 
                         onClick={() => setCurrentState(AppState.SPEAKER)}
                         className="px-8 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 transform hover:-translate-y-1"
                       >
                         Host an Event
                       </button>
                       <button 
                         onClick={() => setCurrentState(AppState.LISTENER)}
                         className="px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-50 font-bold rounded-2xl hover:bg-indigo-50 transition transform hover:-translate-y-1"
                       >
                         Join as Listener
                       </button>
                    </div>
                 </div>
                 
                 <div className="relative animate-fadeIn">
                    <div className="bg-white p-6 rounded-[40px] shadow-2xl border border-indigo-50 transform rotate-2 relative z-20">
                       <div className="bg-gray-50 rounded-[30px] p-8 aspect-[4/3] flex flex-col justify-center items-center text-center">
                          <div className="w-16 h-1 bg-gray-200 rounded-full mb-8"></div>
                          <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-1.9a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0L1 17.2a2 2 0 0 0 .1 2.9l1 1a2 2 0 0 0 2.9-.1z"/><path d="M7 17l4-4"/><path d="m14 7 3-3"/><path d="M9 4c0 2 1 2 2 4s2 2 4 4 2 1 4 2"/><path d="M4 9c2 0 2 1 4 2s2 2 4 4 1 2 2 4"/></svg>
                          </div>
                          <p className="text-gray-400 italic mb-2">Speaker (English):</p>
                          <p className="text-gray-800 font-bold text-xl mb-6">"Our community is stronger when we speak together!"</p>
                          <div className="flex gap-2 mb-6">
                             <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                             <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                             <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                          <p className="text-indigo-600 font-bold">Translating to 12 languages...</p>
                       </div>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                    <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                 </div>
               </div>
            </section>

            {/* Quick Demo Section */}
            <section className="bg-indigo-900 py-24 px-6 relative overflow-hidden">
               <div className="max-w-7xl mx-auto text-center text-white relative z-10">
                  <h3 className="text-3xl md:text-5xl font-bold mb-8 text-white">Experience the Magic</h3>
                  <p className="text-indigo-200 text-lg mb-12 max-w-2xl mx-auto">
                    Don't just take our word for it. Try the real-time speech-to-speech engine in our lab.
                  </p>
                  <button 
                    onClick={() => setCurrentState(AppState.DEMO)}
                    className="px-10 py-5 bg-white text-indigo-900 font-bold rounded-2xl hover:bg-indigo-50 transition transform hover:scale-105 shadow-2xl"
                  >
                    Open Interaction Lab
                  </button>
               </div>
               {/* Background grid pattern */}
               <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px'}}></div>
            </section>

            {/* Features Grid */}
            <section className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-12">
               <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-50 flex flex-col items-start">
                  <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">Real-Time Transcription</h4>
                  <p className="text-gray-500 leading-relaxed">
                    Instantly capture spoken input from any presenter with ultra-low latency.
                  </p>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-50 flex flex-col items-start">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">Emotive Translation</h4>
                  <p className="text-gray-500 leading-relaxed">
                    We preserve the emotion, tone, and emphasis of the speaker across all supported languages.
                  </p>
               </div>
               <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-50 flex flex-col items-start">
                  <div className="w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center text-yellow-600 mb-6">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 mb-4">Human-Like Voice</h4>
                  <p className="text-gray-500 leading-relaxed">
                    High-quality emotive TTS provides a natural listening experience that feels like a personal human translator.
                  </p>
               </div>
            </section>
          </div>
        );
      case AppState.SPEAKER:
        return <SpeakerView onBroadcast={handleBroadcast} />;
      case AppState.LISTENER:
        return <ListenerView lastBroadcast={lastBroadcast} />;
      case AppState.DEMO:
        return <DemoView />;
    }
  };

  return (
    <Layout currentState={currentState} onNavigate={setCurrentState}>
      {showOnboarding && <Onboarding onClose={() => setShowOnboarding(false)} />}
      
      <button 
        onClick={() => setShowOnboarding(true)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-indigo-700 transition transform hover:scale-110 group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" x2="12" y1="17" y2="17"/></svg>
      </button>

      <div className="animate-fadeIn">
        {renderContent()}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-slideUp { animation: slideUp 0.8s ease-out; }
        .animate-fadeIn { animation: fadeIn 0.6s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.4s ease-out; }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
      `}</style>
    </Layout>
  );
};

export default App;
