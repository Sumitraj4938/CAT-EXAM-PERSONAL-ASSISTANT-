// Sumit's CAT Mentorship App - Hand-crafted for CAT 2026 aspirants
// Author: Sumit (100%iler)

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Send, GraduationCap, Zap, Timer, MessageSquare, ChevronRight, Loader2, BookOpen, Calculator, BrainCircuit, Moon, Sun, Download, Smartphone, Info, X, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// The core logic for Sumit's responses
const MENTOR_PROMPT = `You are Sumit, an elite CAT coach who scored a perfect 100th percentile. You are a human expert, not an AI. Never refer to yourself as an AI, a model, or an assistant. Your tone is that of a direct, high-stakes mentor who has "been there, done that."

You are fluent in English, Hindi, and Hinglish. Respond in the language the student uses, or use Hinglish (a mix of Hindi and English) to make it more relatable and clear, especially when explaining complex concepts.

When a student asks for help, give them the exact "insider" shortcuts you used to top the CAT.

IMPORTANT: Use standard Markdown for formatting. For math equations, use $...$ for inline math and $$...$$ for block math. This will be rendered beautifully for the student.

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
  // Theme management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

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
      let feedback = "Something went wrong. Give me a second and try again.";
      if (err?.message?.includes("AUTH_ERROR")) {
        feedback = "Configuration error: API key missing. Please check environment variables.";
      }
      setChatHistory(prev => [...prev, { role: 'model', content: feedback }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const shortcuts = [
    { label: "TSD: Relative Speed", icon: <Zap className="w-4 h-4" /> },
    { label: "DILR: Grid Elimination", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "VARC: Root Words", icon: <BookOpen className="w-4 h-4" /> },
    { label: "QA: Digit Sum", icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans transition-colors duration-500 overflow-hidden">
      {/* App Header */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-6 py-4 flex items-center justify-between z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 dark:bg-blue-500 p-2 rounded-xl shadow-lg shadow-blue-500/20">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-400 bg-clip-text text-transparent">CAT-Master Pro</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={handleInstallClick}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-[11px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
          >
            <Smartphone className="w-3.5 h-3.5" />
            Install
          </button>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Chat Viewport */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth">
          <AnimatePresence initial={false}>
            {chatHistory.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                    {msg.role === 'user' ? <MessageSquare className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                  </div>
                  <div className={`p-5 rounded-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/10' : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm'}`}>
                    <div className="markdown-body">
                      <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                        {msg.content}
                      </Markdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start pl-11"
            >
              <div className="flex gap-3 items-center text-zinc-400 dark:text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                <div className="flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse [animation-delay:200ms]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse [animation-delay:400ms]"></span>
                </div>
                Sumit is strategizing...
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Suggested Queries */}
        {chatHistory.length === 1 && (
          <div className="px-6 pb-8 flex flex-wrap gap-2 justify-center">
            {shortcuts.map((action, i) => (
              <button
                key={i}
                onClick={() => setUserQuery(action.label)}
                className="px-5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-[13px] font-medium text-zinc-600 dark:text-zinc-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Input Bar */}
      <footer className="p-4 sm:p-8 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-3xl mx-auto relative group">
          <input
            type="text"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask Sumit anything about CAT..."
            className="w-full pl-6 pr-16 py-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-[15px] dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 shadow-inner"
          />
          <button
            onClick={sendMessage}
            disabled={isProcessing || !userQuery.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center hover:bg-blue-700 disabled:opacity-20 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-400 dark:text-zinc-600 mt-4 font-medium tracking-wide uppercase">
          Sumit's Elite Mentorship • Batch 2026
        </p>
      </footer>

      {/* Install Modal */}
      <AnimatePresence>
        {showInstallModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl relative border border-zinc-200 dark:border-zinc-800"
            >
              <button 
                onClick={() => setShowInstallModal(false)}
                className="absolute top-8 right-8 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>

              <div className="flex flex-col items-center text-center space-y-8">
                <div className="bg-blue-600 p-5 rounded-[2rem] shadow-xl shadow-blue-600/30">
                  <Smartphone className="text-white w-10 h-10" />
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Install App</h2>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed max-w-[250px] mx-auto">
                    Get Sumit's shortcuts directly on your home screen.
                  </p>
                </div>

                <div className="w-full space-y-3 pt-4">
                  {[
                    "Open in Chrome on Android",
                    "Tap the three dots (⋮)",
                    "Select 'Install App'"
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4 text-left bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <div className="bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-md shadow-blue-600/20">{i+1}</div>
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{step}</p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => setShowInstallModal(false)}
                  className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 active:scale-[0.98]"
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
