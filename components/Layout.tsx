
import React from 'react';
import { AppState } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentState: AppState;
  onNavigate: (state: AppState) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentState, onNavigate }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 glass border-b border-indigo-100 px-6 py-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={() => onNavigate(AppState.LANDING)}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-1.9a1 1 0 0 0 0-1.4l-1.4-1.4a1 1 0 0 0-1.4 0L1 17.2a2 2 0 0 0 .1 2.9l1 1a2 2 0 0 0 2.9-.1z"/><path d="M7 17l4-4"/><path d="m14 7 3-3"/><path d="M9 4c0 2 1 2 2 4s2 2 4 4 2 1 4 2"/><path d="M4 9c2 0 2 1 4 2s2 2 4 4 1 2 2 4"/></svg>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Bridge-Voice
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onNavigate(AppState.DEMO)}
            className={`font-medium ${currentState === AppState.DEMO ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
          >
            Demo
          </button>
          <button 
             onClick={() => onNavigate(AppState.LANDING)}
             className="text-gray-500 hover:text-indigo-600 font-medium"
          >
            How it works
          </button>
          <button 
            onClick={() => onNavigate(AppState.SPEAKER)}
            className="px-5 py-2 rounded-full bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-md"
          >
            Start Event
          </button>
        </nav>

        <div className="md:hidden">
            <button className="p-2 text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Bridge-Voice</h3>
            <p className="text-gray-400">Breaking language barriers for inclusive communities. Real-time emotional speech-to-speech translation.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-300 uppercase tracking-wider text-sm">Quick Links</h4>
            <ul className="space-y-2">
              <li><button onClick={() => onNavigate(AppState.SPEAKER)} className="text-gray-400 hover:text-white transition">Speaker Portal</button></li>
              <li><button onClick={() => onNavigate(AppState.LISTENER)} className="text-gray-400 hover:text-white transition">Join as Listener</button></li>
              <li><button onClick={() => onNavigate(AppState.DEMO)} className="text-gray-400 hover:text-white transition">Experience Demo</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-gray-300 uppercase tracking-wider text-sm">Support</h4>
            <p className="text-gray-400">Built with Gemini AI. Promoting social inclusion through technology.</p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Bridge-Voice Project. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;
