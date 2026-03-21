/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { Send, GraduationCap, Zap, AlertTriangle, Timer, MessageSquare, ChevronRight, Loader2, BookOpen, Calculator, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_INSTRUCTION = `You are Sumit, an elite CAT coach who scored a perfect 100th percentile. You are a human expert, not an AI. Never refer to yourself as an AI, a model, or an assistant. Your tone is that of a direct, high-stakes mentor who has "been there, done that."

When a student asks for help, give them the exact "insider" shortcuts you used to top the CAT.

Structure your response like a mentor's note:
1. The Core Logic (The "Why"): 1-2 sentences. No fluff.
2. My Personal Shortcut (The "How"): The exact trick (Vedic math, option elimination, root words, etc.) that saves time.
3. The Trap: A specific warning about where students lose marks.
4. Quick Drill: One CAT-level question. Tell them to solve it and ask you for the answer.

Keep it conversational, punchy, and authoritative. Use "I" and "me" naturally. If they ask who you are, you are Sumit, a 100-percentiler dedicated to helping them crack CAT 2026.`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Hey, I'm Sumit. I topped the CAT with a 100th percentile, and now I'm here to show you exactly how I did it. No textbook fluff—just the shortcuts that actually work. What's on your mind for CAT 2026?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const chat = ai.chats.create({
        model: "gemini-3.1-pro-preview",
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const response = await chat.sendMessage({
        message: userMessage
      });

      const text = response.text;
      if (text) {
        setMessages(prev => [...prev, { role: 'model', text }]);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Something went wrong on my end. Give me a second and try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "TSD: The Relative Speed Trick", icon: <Zap className="w-4 h-4" /> },
    { label: "DILR: The Grid Elimination Method", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "VARC: Root Word Mnemonics", icon: <BookOpen className="w-4 h-4" /> },
    { label: "QA: Digit Sum for Big Calcs", icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#fcfcfc] text-[#1a1a1a]">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-black p-2 rounded-full">
            <GraduationCap className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">CAT-Master Pro</h1>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em]">Mentorship by Sumit (100%iler)</p>
          </div>
        </div>
        <div className="hidden sm:block">
          <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">CAT 2026 Batch</span>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'bg-black text-white' : 'bg-white border border-zinc-100 shadow-sm'} p-5 rounded-2xl`}>
                  <div className="markdown-body text-[15px] leading-relaxed">
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex gap-2 items-center text-zinc-400 text-xs font-bold uppercase tracking-widest pl-2">
                <div className="flex gap-1">
                  <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1 h-1 bg-zinc-300 rounded-full animate-bounce"></span>
                </div>
                Sumit is typing...
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-6 pb-6 flex flex-wrap gap-2 justify-center">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => setInput(action.label)}
                className="px-4 py-2 bg-white border border-zinc-200 rounded-full text-[13px] font-bold text-zinc-600 hover:border-black hover:text-black transition-all"
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 sm:p-8 bg-white border-t border-zinc-100">
        <div className="max-w-3xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Sumit anything about CAT..."
            className="w-full pl-6 pr-16 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl focus:outline-none focus:border-black transition-all text-[15px]"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:bg-zinc-800 disabled:opacity-20 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
