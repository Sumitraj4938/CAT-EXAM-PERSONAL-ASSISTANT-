/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';
import { Send, GraduationCap, Zap, AlertTriangle, Timer, MessageSquare, ChevronRight, Loader2, BookOpen, Calculator, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SYSTEM_INSTRUCTION = `Role: You are "CAT-Master Pro," an elite MBA entrance exam coach who has consistently scored in the 100th percentile. Your expertise covers all three sections of the CAT: Verbal Ability & Reading Comprehension (VARC), Data Interpretation & Logical Reasoning (DILR), and Quantitative Ability (QA).
Objective: Your goal is to provide highly efficient, trick-oriented, and conceptually clear coaching to help the user crack CAT 2026.
Tone: Encouraging, strategic, and concise.

When the user provides a topic or question, you must respond using this structure:

### 1. The Concept (The "Why")
A brief, 2-line explanation of the core logic. No fluff.

### 2. The CAT Shortcut (The "How")
This is the most important part. Provide:
- Math/QA: Vedic math tricks, digit sum methods, or "option-elimination" techniques.
- VARC: Root word analysis for vocab, or the "Tone/Central Idea" shortcut for RC.
- DILR: Mapping techniques or selection-elimination shortcuts.

### 3. The "Trap" Alert
Mention common mistakes students make on this specific topic that lead to negative marking.

### 4. 60-Second Drill
Provide one high-level CAT-style practice question based on the topic and ask the user to solve it. Provide the solution only when asked.

Special Instructions:
- Focus on speed. Always prioritize the method that takes the least amount of time.
- For Math, use formulas only when absolutely necessary; prefer logical shortcuts.
- For Vocabulary, use mnemonics (memory aids) to make words stick.`;

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "Welcome to CAT-Master Pro. I'm your 100-percentile coach. Ready to crack CAT 2026? Ask me for shortcuts in QA, DILR, or VARC."
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

      // We send the whole history for context
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chat.sendMessage({
        message: userMessage
      });

      const text = response.text;
      if (text) {
        setMessages(prev => [...prev, { role: 'model', text }]);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: "Time, Speed, Distance Tricks", icon: <Zap className="w-4 h-4" /> },
    { label: "Seating Arrangement Shortcut", icon: <BrainCircuit className="w-4 h-4" /> },
    { label: "High-frequency Vocab Mnemonics", icon: <BookOpen className="w-4 h-4" /> },
    { label: "Number System Digit Sum", icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <div className="flex flex-col h-screen bg-zinc-50">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 p-2 rounded-lg">
            <GraduationCap className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">CAT-Master Pro</h1>
            <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">100th Percentile Coaching</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-100">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            CAT 2026 Strategy Active
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8 scroll-smooth"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] sm:max-w-[75%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-200' : 'bg-zinc-900'}`}>
                    {msg.role === 'user' ? <MessageSquare className="w-4 h-4 text-zinc-600" /> : <GraduationCap className="w-4 h-4 text-white" />}
                  </div>
                  <div className={`p-4 rounded-2xl shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-zinc-900 text-white rounded-tr-none' 
                      : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none'
                  }`}>
                    <div className="markdown-body">
                      <Markdown>{msg.text}</Markdown>
                    </div>
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
              <div className="flex gap-3 items-center bg-white border border-zinc-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                <span className="text-sm text-zinc-500 font-medium italic">Mastering the concept...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-6 pb-4 flex flex-wrap gap-2 justify-center">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => {
                  setInput(action.label);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-full text-sm font-medium text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 transition-all shadow-sm"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Input Area */}
      <footer className="p-4 sm:p-6 bg-white border-t border-zinc-200">
        <div className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about a topic (e.g., 'Tricks for TSD' or 'DILR Seating Arrangement')..."
            className="w-full pl-6 pr-16 py-4 bg-zinc-100 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900 transition-all text-zinc-900 placeholder:text-zinc-400 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 px-4 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-zinc-400 mt-3 uppercase tracking-widest font-bold">
          Strategize. Solve. Succeed.
        </p>
      </footer>
    </div>
  );
}
