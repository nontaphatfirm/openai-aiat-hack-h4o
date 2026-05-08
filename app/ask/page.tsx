"use client";

import { useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "ai" | "user";
  content: string;
  citations: { id: string; title: string; source: string; year: string }[];
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "ai",
    content:
      "Hello. I am your AI Wellness Advisor. Based on your profile, you are working on energy, sleep, and gut health. How can I help today?",
    citations: [],
  },
  {
    id: 2,
    role: "user",
    content: "Can I drink coffee if I am trying to improve gut health?",
    citations: [],
  },
  {
    id: 3,
    role: "ai",
    content:
      "Coffee can be fine for some people, but too much caffeine may worsen reflux, anxiety, or sleep quality. Try keeping it to 1 cup after food, then compare your symptoms for a few days.",
    citations: [
      {
        id: "c1",
        title: "Caffeine and the gastrointestinal tract",
        source: "Journal of Gastroenterology",
        year: "2022",
      },
    ],
  },
];

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (event: React.FormEvent) => {
    event.preventDefault();
    if (!inputValue.trim()) return;

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        role: "user",
        content: inputValue,
        citations: [],
      },
    ]);
    setInputValue("");
    setIsTyping(true);

    window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "ai",
          content:
            "A good next step is to pair fermented foods with enough protein and fiber. For your passport profile, I would start with yogurt or kefir at breakfast and track bloating, energy, and sleep for 3 days.",
          citations: [
            {
              id: "c2",
              title: "Fermented-food diet and microbiome diversity",
              source: "Cell",
              year: "2021",
            },
          ],
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  return (
    <main className="flex h-full min-h-0 flex-col bg-slate-50">
      <section className="shrink-0 border-b border-slate-200 bg-white px-4 py-4">
        <p className="text-xs font-black uppercase tracking-wide text-teal-700">AI Advisor</p>
        <h1 className="mt-1 text-xl font-extrabold text-slate-950">Ask OmniWell-TH</h1>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Evidence-informed guidance for your health passport. Always verify medical decisions
          with a qualified professional.
        </p>
      </section>

      <section className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="space-y-4">
          <div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm leading-6 text-teal-900">
            I can use your mock passport, wearable metrics, environment, and food preferences to
            answer questions.
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${
                  message.role === "ai" ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {message.role === "ai" ? "AI" : "U"}
              </div>

              <div className="max-w-[82%]">
                <div
                  className={`rounded-2xl p-4 text-sm leading-6 ${
                    message.role === "user"
                      ? "rounded-tr-sm bg-slate-950 text-white"
                      : "rounded-tl-sm border border-slate-200 bg-white text-slate-800 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === "ai" && message.citations.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.citations.map((citation) => (
                      <div
                        key={citation.id}
                        className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold leading-5 text-slate-600"
                      >
                        {citation.title} ({citation.source}, {citation.year})
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-black text-white">
                AI
              </div>
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-slate-200 bg-white p-4 shadow-sm">
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal-400 [animation-delay:300ms]" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </section>

      <footer className="shrink-0 border-t border-slate-200 bg-white p-3">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            placeholder="Ask about diet, sleep, stress..."
            className="min-w-0 flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isTyping}
            className="h-11 w-11 shrink-0 rounded-full bg-teal-600 text-sm font-black text-white transition hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400"
          >
            Go
          </button>
        </form>
      </footer>
    </main>
  );
}
