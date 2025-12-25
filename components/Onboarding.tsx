
import React, { useState } from 'react';

interface OnboardingProps {
  onClose: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to Bridge-Voice",
      description: "We help break language barriers in real-time for live events, from campus lectures to community meetings.",
      icon: (
        <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-1.9a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0L1 17.2a2 2 0 0 0 .1 2.9l1 1a2 2 0 0 0 2.9-.1z"/><path d="M7 17l4-4"/><path d="m14 7 3-3"/><path d="M9 4c0 2 1 2 2 4s2 2 4 4 2 1 4 2"/><path d="M4 9c2 0 2 1 4 2s2 2 4 4 1 2 2 4"/></svg>
        </div>
      )
    },
    {
      title: "Choose Your Role",
      description: "Host an event as a Speaker to broadcast your speech, or Join an event as a Listener to receive instant translations.",
      icon: (
        <div className="flex gap-4">
           <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
           </div>
           <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 10v3"/><path d="M6 6v11"/><path d="M10 3v18"/><path d="M14 8v7"/><path d="M18 5v13"/><path d="M22 10v3"/></svg>
           </div>
        </div>
      )
    },
    {
      title: "Emotional Accuracy",
      description: "Our AI doesn't just translate words—it detects excitement, humor, and concern, preserving the speaker's original intent in the listener's ear.",
      icon: (
        <div className="flex gap-2 items-center">
           <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600 text-2xl">😊</div>
           <div className="w-4 h-0.5 bg-gray-200"></div>
           <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/></svg>
           </div>
           <div className="w-4 h-0.5 bg-gray-200"></div>
           <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">🌍</div>
        </div>
      )
    },
    {
      title: "Try the Demo First",
      description: "The best way to understand Bridge-Voice is through our interactive demo which shows both perspectives side-by-side.",
      icon: (
        <div className="w-20 h-20 bg-green-100 rounded-3xl flex items-center justify-center text-green-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="m22 12-4-4v8z"/></svg>
        </div>
      )
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('bridge_voice_onboarded', 'true');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-[40px] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn">
        <div className="p-10 flex flex-col items-center text-center">
          <div className="mb-8">
            {steps[currentStep].icon}
          </div>
          
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            {steps[currentStep].title}
          </h3>
          
          <p className="text-gray-500 text-lg leading-relaxed mb-10">
            {steps[currentStep].description}
          </p>

          <div className="flex gap-2 mb-10">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-200'}`}
              ></div>
            ))}
          </div>

          <div className="flex w-full gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 text-gray-400 font-bold hover:text-gray-600 transition"
            >
              Skip
            </button>
            <button 
              onClick={handleNext}
              className="flex-[2] py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
            >
              {currentStep === steps.length - 1 ? "Let's Go!" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
