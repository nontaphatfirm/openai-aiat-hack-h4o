"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PassportPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // State สำหรับเก็บข้อมูลฟอร์ม
  const [formData, setFormData] = useState({
    goal: "",
    diet: "",
    condition: "",
  });

  // ตัวเลือกต่างๆ
  const goals = [
    { id: "energy", icon: "⚡", label: "Boost Energy", desc: "Reduce fatigue and feel more active" },
    { id: "sleep", icon: "🌙", label: "Better Sleep", desc: "Improve sleep quality and recovery" },
    { id: "digestion", icon: "🥗", label: "Gut Health", desc: "Soothe digestion and bloating" },
    { id: "immunity", icon: "🛡️", label: "Immunity", desc: "Strengthen your immune system" },
  ];

  const diets = [
    { id: "none", label: "No Restrictions" },
    { id: "vegetarian", label: "Vegetarian" },
    { id: "vegan", label: "Vegan" },
    { id: "keto", label: "Keto" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // จำลองการโหลดข้อมูลส่ง API (ในของจริงเชื่อมต่อ Database ตรงนี้)
    setTimeout(() => {
      // ไปยังหน้า Journey หลังจากบันทึกข้อมูลเสร็จ
      router.push("/journey");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Simple Header */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back</span>
          </Link>
          <div className="text-sm font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            Step 1 of 1
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-10">
        <div className="mb-10 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3 tracking-tight">
            Create Your Wellness Passport
          </h1>
          <p className="text-slate-500 text-lg">
            Help our AI understand your body to curate the perfect healing journey for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Section 1: Goals */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">1</span>
              What is your primary healing goal?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goals.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, goal: item.id })}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-200 flex items-start gap-4 ${
                    formData.goal === item.id
                      ? "border-teal-500 bg-teal-50 shadow-md shadow-teal-100/50"
                      : "border-slate-200 bg-white hover:border-teal-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="text-3xl">{item.icon}</span>
                  <div>
                    <h3 className={`font-bold ${formData.goal === item.id ? "text-teal-900" : "text-slate-700"}`}>
                      {item.label}
                    </h3>
                    <p className={`text-sm mt-1 ${formData.goal === item.id ? "text-teal-700" : "text-slate-500"}`}>
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Section 2: Diet */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">2</span>
              Any dietary preferences?
            </h2>
            <div className="flex flex-wrap gap-3">
              {diets.map((diet) => (
                <button
                  key={diet.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, diet: diet.id })}
                  className={`px-6 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                    formData.diet === diet.id
                      ? "border-teal-500 bg-teal-500 text-white shadow-md shadow-teal-200"
                      : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-slate-50"
                  }`}
                >
                  {diet.label}
                </button>
              ))}
            </div>
          </section>

          {/* Section 3: Condition Textbox */}
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">3</span>
              How are you feeling lately?
            </h2>
            <textarea
              className="w-full p-5 rounded-2xl border-2 border-slate-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 outline-none text-slate-700 resize-none"
              rows={4}
              placeholder="e.g., I've been feeling stressed from work and having trouble sleeping..."
              value={formData.condition}
              onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
            ></textarea>
          </section>

          {/* Submit Area */}
          <div className="pt-6 border-t border-slate-200 flex items-center justify-between">
            <p className="text-sm text-slate-400 hidden md:block">
              Your data is secure and used only for personalization.
            </p>
            <button
              type="submit"
              disabled={!formData.goal || !formData.diet || isLoading}
              className={`w-full md:w-auto px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                !formData.goal || !formData.diet
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-teal-600 text-white hover:bg-teal-700 hover:scale-105 shadow-lg shadow-teal-600/30"
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing Profile...
                </>
              ) : (
                "Generate My Journey"
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}