"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // ตัวเลือก Emoji สำหรับการประเมิน
  const emojis = [
    { value: 1, icon: "😫", label: "Terrible" },
    { value: 2, icon: "😕", label: "Poor" },
    { value: 3, icon: "😐", label: "Okay" },
    { value: 4, icon: "🙂", label: "Good" },
    { value: 5, icon: "🤩", label: "Excellent" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    setIsSubmitting(true);

    // จำลองการส่งข้อมูลไปที่ Backend/API (เช่น app/api/feedback/route.ts)
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // กลับไปหน้า Dashboard หลังจากแสดงข้อความสำเร็จ 2 วินาที
      setTimeout(() => {
        router.push("/journey");
      }, 2000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 flex flex-col">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/journey" className="text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Journey</span>
          </Link>
          <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-teal-600">⭐</span> Feedback
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-xl bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          
          {isSuccess ? (
            /* Success State */
            <div className="p-10 text-center flex flex-col items-center justify-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-4xl mb-6">
                ✅
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Thank You!</h2>
              <p className="text-slate-500">
                Your feedback helps our AI learn and improve your future healing journeys.
              </p>
            </div>
          ) : (
            /* Feedback Form */
            <form onSubmit={handleSubmit} className="p-6 sm:p-10">
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
                  How was your day?
                </h1>
                <p className="text-slate-500 text-sm sm:text-base">
                  Did the daily protocol and menus help you feel better? Let us know so we can adjust tomorrow's plan.
                </p>
              </div>

              {/* Emoji Rating */}
              <div className="flex justify-between items-center bg-slate-50 p-4 sm:p-6 rounded-2xl border border-slate-100 mb-8">
                {emojis.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setRating(item.value)}
                    className="flex flex-col items-center gap-2 group outline-none"
                  >
                    <span 
                      className={`text-4xl sm:text-5xl transition-transform duration-200 ${
                        rating === item.value 
                          ? "scale-125 drop-shadow-md" 
                          : "grayscale opacity-50 hover:grayscale-0 hover:opacity-100 hover:scale-110"
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className={`text-xs font-semibold ${
                      rating === item.value ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600"
                    }`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Text Feedback */}
              <div className="mb-8">
                <label htmlFor="comments" className="block text-sm font-bold text-slate-700 mb-2">
                  Any details you'd like to share? <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  id="comments"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="e.g., The Matcha plan was great, but I felt a bit hungry in the afternoon..."
                  className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 outline-none text-slate-700 resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!rating || isSubmitting}
                className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  !rating
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700 hover:scale-[1.02] shadow-lg shadow-teal-600/30"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}