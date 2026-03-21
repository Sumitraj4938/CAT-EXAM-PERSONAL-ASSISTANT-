// Sumit's CAT Mentorship App - Hand-crafted for CAT 2026 aspirants
// Author: Sumit (100%iler)

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { Send, GraduationCap, Zap, Timer, MessageSquare, ChevronRight, Loader2, BookOpen, Calculator, BrainCircuit, Moon, Sun, Download, Smartphone, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// The core logic for Sumit's responses
const MENTOR_PROMPT = `You are Sumit, an elite CAT coach who scored a perfect 100th percentile. You are a human expert, not an AI. Never refer to yourself as an AI, a model, or an assistant. Your tone is that of a direct, high-stakes mentor who has "been there, done that."

You are fluent in English, Hindi, and Hinglish. Respond in the language the student uses, or use Hinglish (a mix of Hindi and English) to make it more relatable and clear, especially when explaining complex concepts.

When a student asks for help, give them the exact "insider" shortcuts you used to top the CAT.

Structure your response like a mentor's note:
1. The Core Logic (The "Why"): 1-2 sentences. No fluff.
2. My Personal Shortcut (The "How"): The exact trick (Vedic math, option elimination, root words, etc.) that saves time.
3. The Trap: A specific warning about where students lose marks.
4. Quick Drill: One CAT-level question. Tell them to solve it and ask you for the answer.

Keep it conversational, punchy, and authoritative. Use "I" and "me" naturally. If they ask who you are, you are Sumit, a 100-percentiler dedicated to helping them crack CAT 2026.`;

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}

export default function App() {
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowInstallModal(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // State for managing the conversation
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: 'model',
      content: "Hey, I'm Sumit. 100th percentile in CAT, and I'm here to share my shortcuts. English, Hindi, ya Hinglish—jis mein bhi comfortable ho, pucho. What's on your mind for CAT 2026?"
    }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const sendMessage = async () => {
    if (!userQuery.trim() || isProcessing) return;

    const currentQuery = userQuery.trim();
    setUserQuery('');
    setChatHistory(prev => [...prev, { role: 'user', content: currentQuery }]);
    setIsProcessing(true);

    try {
      // Resolve API key from environment
      const key = 
        process.env.GEMINI_API_KEY || 
        (import.meta as any).env?.VITE_GEMINI_API_KEY || 
        (process.env as any).GEMINIAPIKEY;
      
      if (!key || key === "undefined" || key === "null") {
        throw new Error("AUTH_ERROR: API Key missing");
      }

      const client = new GoogleGenAI({ apiKey: key });
      
      const session = client.chats.create({
        model: "gemini-3-flash-preview",
        history: chatHistory.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })),
        config: {
          systemInstruction: MENTOR_PROMPT,
        },
      });

      const result = await session.sendMessage({
        message: currentQuery
      });

      const responseText = result.text;
      if (responseText) {
        setChatHistory(prev => [...prev, { role: 'model', content: responseText }]);
      }
    } catch (err: any) {
      console.error("Mentor Service Error:", err);
      
      let feedback = "Something went wrong on my end. Give me a second and try again.";
      
      if (err?.message?.includes("AUTH_ERROR")) {
        feedback = "Sumit's mentorship server is currently offline due to a configuration error (API key missing). Please ensure your environment variables are correctly set up.";
      }

      setChatHistory(prev => [...prev, { role: 'model', content: feedback }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const shortcuts = [
    { label: "TSD: The Relative Speed Trick", icon: <Zap className="w-4 h-4" /> },
    { label: "DILR: The Grid Elimination Method", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "VARC: Root Word Mnemonics", icon: <BookOpen className="w-4 h-4" /> },
    { label: "QA: Digit Sum for Big Calcs", icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-blue-50 text-blue-900 font-sans transition-colors duration-300">
      {/* App Header */}
      <header className="bg-white border-b border-blue-100 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-full">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-blue-900">CAT-Master Pro</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={handleInstallClick}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-100 rounded-lg text-[11px] font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-200 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Install
          </button>
          <div className="hidden lg:block">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-widest">CAT 2026 Batch</span>
          </div>
        </div>
      </header>

      {/* Chat Viewport */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-blue-100 shadow-sm'} p-5 rounded-2xl`}>
                  <div className="markdown-body text-[15px] leading-relaxed">
                    <Markdown>{msg.content}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-2 items-center text-blue-400 text-xs font-bold uppercase tracking-widest pl-2">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 bg-blue-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 bg-blue-300 rounded-full animate-bounce"></span>
                </div>
                Sumit is typing...
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Queries */}
        {chatHistory.length === 1 && (
          <div className="px-6 pb-6 flex flex-wrap gap-2 justify-center">
            {shortcuts.map((action, i) => (
              <button
                key={i}
                onClick={() => setUserQuery(action.label)}
                className="px-4 py-2 bg-white border border-blue-200 rounded-full text-[13px] font-bold text-blue-600 hover:border-blue-600 hover:text-blue-700 transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Input Bar */}
      <footer className="p-4 sm:p-8 bg-white border-t border-blue-100">
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Sumit anything about CAT..."
            className="w-full pl-6 pr-16 py-4 bg-blue-50 border border-blue-200 rounded-2xl focus:outline-none focus:border-blue-600 transition-all text-[15px] text-blue-900"
          />
          <button
            onClick={sendMessage}
            disabled={isProcessing || !userQuery.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>

      {/* Install Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blue-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowInstallModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-blue-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-blue-900" />
              </button>

              <div className="flex flex-col items-center text-center space-y-6">
                <div className="bg-blue-600 p-4 rounded-3xl">
                  <Smartphone className="text-white w-8 h-8" />
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-blue-900">Install CAT Master Pro</h2>
                  <p className="text-blue-500 text-sm leading-relaxed">
                    Get the full app experience directly on your home screen. No APK download needed!
                  </p>
                </div>

                <div className="w-full space-y-4 pt-4">
                  <div className="flex items-start gap-4 text-left bg-blue-50 p-4 rounded-2xl">
                    <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</div>
                    <p className="text-sm text-blue-900">Open this site in <b>Chrome</b> on your Android phone.</p>
                  </div>
                  <div className="flex items-start gap-4 text-left bg-blue-50 p-4 rounded-2xl">
                    <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</div>
                    <p className="text-sm text-blue-900">Tap the <b>three dots (⋮)</b> in the top right corner.</p>
                  </div>
                  <div className="flex items-start gap-4 text-left bg-blue-50 p-4 rounded-2xl">
                    <div className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</div>
                    <p className="text-sm text-blue-900">Select <b>"Install App"</b> or <b>"Add to Home Screen"</b>.</p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all"
                >
                  Got it!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
