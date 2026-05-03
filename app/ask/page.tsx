"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function AskPage() {
  // จำลองข้อมูลแชท (Mock Messages)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      content: "Hello! I'm your AI Wellness Advisor. Based on your profile, you're looking to boost energy and improve gut health. How can I help you today?",
      citations: [],
    },
    {
      id: 2,
      role: "user",
      content: "Can I drink coffee if I'm trying to improve my gut health?",
      citations: [],
    },
    {
      id: 3,
      role: "ai",
      content: "While coffee isn't inherently bad, excessive caffeine can irritate the gut lining and increase acid production, which might trigger acid reflux or bloating in sensitive individuals. \n\nFor your specific goal of improving gut health, it's often recommended to limit coffee to 1-2 cups per day, ideally not on an empty stomach. Consider alternatives like Matcha, which provides energy with less acidity, or herbal teas like Peppermint or Ginger for digestion.",
      citations: [
        { id: "c1", title: "Caffeine and the gastrointestinal tract", source: "Journal of Gastroenterology", year: "2022" },
        { id: "c2", title: "Effects of Green Tea on Gut Microbiota", source: "Nutrients", year: "2023" }
      ],
    }
  ]);

  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // เลื่อนจอลงอัตโนมัติเวลามีข้อความใหม่
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // เพิ่มข้อความผู้ใช้
    const newUserMsg = {
      id: Date.now(),
      role: "user",
      content: inputValue,
      citations: [],
    };
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");
    setIsTyping(true);

    // จำลอง AI กำลังตอบกลับ (ในของจริงคือการยิง API)
    setTimeout(() => {
      const newAiMsg = {
        id: Date.now() + 1,
        role: "ai",
        content: "That's a great question! Based on current research, incorporating fermented foods like kimchi, kefir, or kombucha can significantly increase microbiome diversity, which directly supports immune function and energy levels.",
        citations: [
          { id: "c3", title: "Fermented-food diet increases microbiome diversity", source: "Cell", year: "2021" }
        ],
      };
      setMessages(prev => [...prev, newAiMsg]);
      setIsTyping(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans">
      
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 shrink-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/journey" className="text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium hidden sm:inline">Back</span>
          </Link>
          <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-teal-600">💬</span> Ask AI Advisor
          </div>
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
            You
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="max-w-4xl mx-auto space-y-6 pb-4">
          
          {/* Introduction Alert */}
          <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 text-sm text-teal-800 flex gap-3 items-start">
            <span className="text-xl">ℹ️</span>
            <p>
              I use scientific evidence to answer your questions. While I provide guidance, please consult a healthcare provider for medical diagnoses.
            </p>
          </div>

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              
              {/* Avatar */}
              <div className={`shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-sm sm:text-base ${
                msg.role === "ai" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-600"
              }`}>
                {msg.role === "ai" ? "🌿" : "U"}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[85%] sm:max-w-[75%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`p-4 rounded-2xl ${
                  msg.role === "user" 
                    ? "bg-slate-900 text-white rounded-tr-sm" 
                    : "bg-white border border-slate-200 text-slate-800 shadow-sm rounded-tl-sm"
                }`}>
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Citations (Only for AI) */}
                {msg.role === "ai" && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-2 flex flex-col gap-1.5">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">References:</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.citations.map((cite) => (
                        <div key={cite.id} className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 text-slate-600 text-xs px-2.5 py-1.5 rounded-lg max-w-full hover:bg-slate-200 cursor-pointer transition-colors group">
                          <span className="text-teal-600">📚</span>
                          <span className="truncate" title={`${cite.title} - ${cite.source}`}>
                            <span className="font-medium group-hover:text-teal-700">{cite.title}</span> 
                            <span className="opacity-70 ml-1">({cite.source}, {cite.year})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-4">
              <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-teal-600 text-white flex items-center justify-center">
                🌿
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          )}
          
          {/* Invisible div for scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-slate-200 p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSend} className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about your health or diet..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-full pl-6 pr-14 py-3.5 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`absolute right-2 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                !inputValue.trim() || isTyping
                  ? "bg-slate-200 text-slate-400"
                  : "bg-teal-600 text-white hover:bg-teal-700"
              }`}
            >
              <svg className="w-5 h-5 -mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-slate-400">
              AI can make mistakes. Always verify medical information.
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}