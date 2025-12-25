
import React, { useState, useEffect, useRef } from 'react';
import { Emotion, SUPPORTED_LANGUAGES, Language } from '../types';
import { connectLiveTranslator, createPcmBlob, decode, decodeAudioData } from '../services/geminiService';

const DemoView: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'speaker' | 'listener' | 'live'>('overview');
  const [selectedDemoLang, setSelectedDemoLang] = useState(SUPPORTED_LANGUAGES[1]); // Spanish
  
  // Live Demo State
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveTranscription, setLiveTranscription] = useState<{user: string, model: string}>({user: '', model: ''});
  const [audioSources, setAudioSources] = useState<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

  const demoTimeline = [
    {
      speaker: "Welcome everyone to our community town hall! I'm thrilled to have so many neighbors here today.",
      emotion: Emotion.EXCITED,
      translations: {
        es: "¡Bienvenidos todos a nuestra reunión comunitaria! Estoy emocionado de tener a tantos vecinos hoy aquí.",
        fr: "Bienvenue à tous à notre réunion communautaire ! Je suis ravi d'avoir autant de voisins ici aujourd'hui.",
        zh: "欢迎大家参加我们的社区大会！今天看到这么多邻居来到这里，我感到非常激动。",
        ar: "أهلاً بالجميع في اجتماعنا المجتمعي! يسعدني جداً وجود هذا العدد الكبير من الجيران هنا اليوم."
      }
    },
    {
      speaker: "However, we must discuss the serious issue of the upcoming rezoning project in the north district.",
      emotion: Emotion.SERIOUS,
      translations: {
        es: "Sin embargo, debemos discutir el serio problema del próximo proyecto de rezonificación en el distrito norte.",
        fr: "Cependant, nous devons discuter de la grave question du prochain projet de zonage dans le district nord.",
        zh: "然而，我们必须讨论北区即将进行的重新分区项目这一严肃问题。",
        ar: "ومع ذلك، يجب أن نناقش المسألة الخطيرة المتعلقة بمشروع إعادة تقسيم المناطق القادم في المنطقة الشمالية."
      }
    },
    {
      speaker: "I tried to explain the blueprint to my dog this morning, but I think he preferred the physical paper to the plan!",
      emotion: Emotion.HUMOROUS,
      translations: {
        es: "Intenté explicarle el plano a mi perro esta mañana, ¡pero creo que prefería el papel físico al plan!",
        fr: "J'ai essayé d'expliquer le plan à mon chien ce matin, mais je pense qu'il préférait le papier physique au plan !",
        zh: "今天早上我试着向我的狗解释这个蓝图，但我想它更喜欢这张纸而不是那个计划！",
        ar: "حاولت شرح المخطط لكلبي هذا الصباح، لكنني أعتقد أنه فضل الورق الملموس على الخطة!"
      }
    }
  ];

  useEffect(() => {
    let interval: any;
    if (isPlaying && activeTab !== 'live') {
      interval = setInterval(() => {
        setStep(prev => (prev + 1) % demoTimeline.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTab]);

  const toggleLiveDemo = async () => {
    if (isLiveActive) {
      stopLiveDemo();
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 16000});
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      setIsLiveActive(true);
      setLiveTranscription({user: '', model: ''});

      const sessionPromise = connectLiveTranslator(
        selectedDemoLang.name,
        selectedDemoLang.voice,
        {
          onAudio: async (base64) => {
            const ctx = audioContextRef.current!;
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
            const buffer = await decodeAudioData(decode(base64), ctx, 24000, 1);
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            setAudioSources(prev => new Set(prev).add(source));
          },
          onTranscription: (text, isUser) => {
            setLiveTranscription(prev => ({
              user: isUser ? prev.user + " " + text : prev.user,
              model: !isUser ? prev.model + " " + text : prev.model
            }));
          },
          onError: (e) => {
            console.error(e);
            stopLiveDemo();
          }
        }
      );

      const source = inputCtx.createMediaStreamSource(stream);
      const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
      scriptProcessor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        const pcmBlob = createPcmBlob(inputData);
        sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
      };
      source.connect(scriptProcessor);
      scriptProcessor.connect(inputCtx.destination);
      scriptProcessorRef.current = scriptProcessor;

    } catch (err) {
      console.error("Failed to start live demo", err);
    }
  };

  const stopLiveDemo = () => {
    setIsLiveActive(false);
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    audioSources.forEach(s => { try { s.stop(); } catch(e) {} });
    setAudioSources(new Set());
    nextStartTimeRef.current = 0;
  };

  const currentSegment = demoTimeline[step];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">Complete System Experience</h2>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Explore Bridge-Voice through guided simulations or try the Live Translation Lab.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        <button 
          onClick={() => { stopLiveDemo(); setActiveTab('overview'); }}
          className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          Overview Mode
        </button>
        <button 
          onClick={() => { stopLiveDemo(); setActiveTab('speaker'); }}
          className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'speaker' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          Speaker View
        </button>
        <button 
          onClick={() => { stopLiveDemo(); setActiveTab('listener'); }}
          className={`px-6 py-3 rounded-xl font-bold transition ${activeTab === 'listener' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
        >
          Listener View
        </button>
        <button 
          onClick={() => setActiveTab('live')}
          className={`px-6 py-3 rounded-xl font-bold transition border-2 border-indigo-600 ${activeTab === 'live' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
        >
          ✨ Live Translation Lab
        </button>
      </div>

      {activeTab === 'live' ? (
        <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
          <div className="bg-white rounded-[40px] shadow-2xl border border-indigo-100 overflow-hidden">
            <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-700 text-white flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold">Live Emotive Translation</h3>
                <p className="text-indigo-100 opacity-80">Test the real-time speech-to-speech connection</p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold opacity-70">Target:</span>
                <select 
                  value={selectedDemoLang.code}
                  onChange={(e) => setSelectedDemoLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!)}
                  disabled={isLiveActive}
                  className="bg-white/20 text-white border-none rounded-lg px-3 py-1 outline-none text-sm font-bold"
                >
                  {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code} className="text-gray-900">{l.name}</option>)}
                </select>
              </div>
            </div>

            <div className="p-10 grid md:grid-cols-2 gap-10 bg-gray-50">
              {/* Speaker Perspective */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Speaker (You)</h4>
                  {isLiveActive && <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm min-h-[200px] flex flex-col justify-center items-center text-center">
                   {!isLiveActive ? (
                     <button 
                       onClick={toggleLiveDemo}
                       className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:scale-110 transition shadow-lg"
                     >
                       <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                     </button>
                   ) : (
                     <div className="w-full">
                       <p className="text-gray-800 text-lg leading-relaxed">{liveTranscription.user || "Speak now..."}</p>
                       <div className="mt-8 flex justify-center gap-1 h-12">
                          {[...Array(12)].map((_, i) => (
                            <div key={i} className="w-1.5 bg-indigo-300 rounded-full animate-pulse" style={{height: `${20 + Math.random() * 60}%`, animationDelay: `${i*0.1}s`}}></div>
                          ))}
                       </div>
                     </div>
                   )}
                </div>
              </div>

              {/* Listener Perspective */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-400 uppercase tracking-widest text-xs">Listener Earbud ({selectedDemoLang.name})</h4>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M3 12h.01"/><path d="M7 12h.01"/><path d="M11 12h.01"/><path d="M15 12h.01"/><path d="M19 12h.01"/><path d="M23 12h.01"/></svg>
                </div>
                <div className="bg-indigo-600 p-6 rounded-3xl shadow-xl shadow-indigo-100 min-h-[200px] flex flex-col justify-center items-center text-center text-white">
                  {isLiveActive ? (
                    <div className="w-full">
                      <p className="text-lg font-medium leading-relaxed">{liveTranscription.model || "Waiting for translation..."}</p>
                      {liveTranscription.model && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <span className="text-[10px] font-bold text-indigo-200 tracking-tighter uppercase">Emotive AI Voice Playing</span>
                          <div className="flex gap-0.5">
                            <div className="w-1 h-3 bg-white rounded-full animate-bounce"></div>
                            <div className="w-1 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="opacity-40">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>
                      <p className="text-sm">Start the Speaker Mic to begin</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex justify-center bg-white">
              {isLiveActive && (
                <button 
                  onClick={stopLiveDemo}
                  className="px-8 py-3 bg-red-50 text-red-600 font-bold rounded-xl border border-red-100 hover:bg-red-100 transition"
                >
                  End Live Session
                </button>
              )}
            </div>
          </div>
          
          <div className="bg-indigo-50 p-8 rounded-3xl border border-indigo-100">
            <h4 className="font-bold text-indigo-900 mb-2">How it works:</h4>
            <p className="text-indigo-700 text-sm leading-relaxed">
              In this live mode, we use the <strong>Gemini 2.5 Live API</strong>. It takes your raw microphone input, performs real-time speech-to-text, translates it emotively, and synthesizes a natural human voice in your target language—all in under a second. Try saying something with high energy or a whisper to see how the tone is preserved.
            </p>
          </div>
        </div>
      ) : activeTab === 'overview' ? (
        <div className="grid lg:grid-cols-2 gap-8 items-start animate-fadeIn">
          {/* Mock Speaker Side */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <div className="flex justify-between items-center mb-6">
              <span className="px-3 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-full animate-pulse flex items-center gap-2">
                 <div className="w-2 h-2 bg-red-600 rounded-full"></div> BROADCASTING
              </span>
              <span className="text-sm font-bold text-indigo-600">English (Source)</span>
            </div>
            <div className="aspect-video bg-gray-900 rounded-2xl flex items-center justify-center mb-6 relative overflow-hidden">
               <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse"></div>
               </div>
               <div className="text-center z-10 px-8">
                  <p className="text-white text-2xl font-medium leading-tight mb-4 animate-fadeIn">
                    "{currentSegment.speaker}"
                  </p>
                  <div className="flex justify-center gap-1">
                    {[...Array(20)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-indigo-400 rounded-full animate-bounce" 
                        style={{ height: `${Math.random() * 40 + 10}px`, animationDelay: `${i * 0.05}s` }}
                      ></div>
                    ))}
                  </div>
               </div>
               <div className="absolute bottom-4 right-4 bg-indigo-600 text-[10px] font-bold text-white px-2 py-1 rounded uppercase tracking-tighter">
                 {currentSegment.emotion} detected
               </div>
            </div>
          </div>

          {/* Mock Audience Side */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800 ml-2">Connected Listeners (4)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['es', 'fr', 'zh', 'ar'].map(langCode => {
                const lang = SUPPORTED_LANGUAGES.find(l => l.code === langCode);
                return (
                  <div key={langCode} className="bg-white p-5 rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md transition">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-bold text-indigo-700">{lang?.nativeName}</span>
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                        <div className="w-1 h-1 bg-green-500 rounded-full"></div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed min-h-[4rem]">
                      {(currentSegment.translations as any)[langCode]}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : activeTab === 'speaker' ? (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-3xl mx-auto border border-gray-100 animate-fadeIn">
           <div className="p-8 bg-indigo-600 text-white">
              <h2 className="text-2xl font-bold">Speaker's Viewpoint</h2>
              <p className="text-indigo-100">Managing a high-impact community event.</p>
           </div>
           <div className="p-8">
              <div className="bg-gray-50 rounded-2xl p-6 border-dashed border-2 border-indigo-200 mb-8 flex flex-col items-center">
                 <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4 animate-pulse">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                 </div>
                 <h4 className="font-bold text-xl mb-2 text-gray-800 text-center">Currently Speaking</h4>
                 <p className="text-gray-500 text-center leading-relaxed max-w-md">
                   The system automatically detects when you speak and translates your message to 12+ languages for 150+ audience members.
                 </p>
              </div>
           </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-xl mx-auto border border-gray-100 h-[600px] flex flex-col animate-fadeIn">
           <div className="p-6 bg-indigo-600 text-white flex justify-between items-center">
              <h2 className="font-bold">Listener's Viewpoint</h2>
              <select 
                value={selectedDemoLang.code}
                onChange={(e) => setSelectedDemoLang(SUPPORTED_LANGUAGES.find(l => l.code === e.target.value)!)}
                className="bg-indigo-500 text-white border-none text-sm rounded px-2 py-1 outline-none"
              >
                {SUPPORTED_LANGUAGES.map(l => <option key={l.code} value={l.code} className="text-gray-900">{l.nativeName}</option>)}
              </select>
           </div>
           <div className="flex-grow p-6 overflow-y-auto space-y-6">
              <div className="flex flex-col gap-2">
                 <span className="text-[10px] font-bold text-gray-400 uppercase">Incoming Translation ({selectedDemoLang.name})</span>
                 <div className="bg-indigo-600 text-white p-5 rounded-2xl shadow-lg">
                    <p className="text-lg font-medium leading-relaxed">
                       {(currentSegment.translations as any)[selectedDemoLang.code] || (currentSegment.translations as any)['es']}
                    </p>
                    <div className="mt-4 pt-4 border-t border-indigo-500 flex items-center justify-between">
                       <span className="text-[10px] font-bold uppercase text-indigo-100">Audio Playback Active</span>
                       <span className="text-[10px] font-bold capitalize text-yellow-300">{currentSegment.emotion} Tone</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {activeTab !== 'live' && (
        <div className="sticky bottom-8 z-40 bg-white/80 backdrop-blur-md border border-gray-200 rounded-2xl p-4 shadow-xl max-w-md mx-auto flex items-center gap-4">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="4" height="12"/><rect x="14" y="6" width="4" height="12"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="m7 4 12 8-12 8V4z"/></svg>
            )}
          </button>
          <div className="flex-grow">
            <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-1">
               <span>Demo Progress</span>
               <span>Step {step + 1} / {demoTimeline.length}</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-indigo-600 transition-all duration-500 ease-linear" 
                 style={{ width: `${((step + 1) / demoTimeline.length) * 100}%` }}
               ></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoView;
