"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const ratings = [
  { value: 1, label: "Terrible" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Okay" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

export default function FeedbackPage() {
  const router = useRouter();
  const [rating, setRating] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!rating) return;

    setIsSubmitting(true);
    window.setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      window.setTimeout(() => router.push("/journey"), 1200);
    }, 700);
  };

  return (
    <main className="min-h-full bg-slate-50 px-4 pb-8 pt-6">
      <section className="mb-6">
        <p className="mb-3 w-max rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
          Daily Feedback
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">How was your day?</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Tell the system how today&apos;s protocol felt so tomorrow&apos;s plan can adapt.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {isSuccess ? (
          <div className="py-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl font-black text-emerald-700">
              OK
            </div>
            <h2 className="text-2xl font-extrabold text-slate-950">Thank you</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your feedback has been saved to the mock flow.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-5 gap-2">
              {ratings.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRating(item.value)}
                  className={`rounded-2xl border px-2 py-3 text-center transition ${
                    rating === item.value
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}
                >
                  <span className="block text-xl font-black">{item.value}</span>
                  <span className="mt-1 block truncate text-[10px] font-bold">{item.label}</span>
                </button>
              ))}
            </div>

            <label htmlFor="comments" className="mt-6 block">
              <span className="text-sm font-bold text-slate-700">
                Any details you&apos;d like to share?
              </span>
              <textarea
                id="comments"
                rows={5}
                value={comments}
                onChange={(event) => setComments(event.target.value)}
                placeholder="e.g., I slept better, but felt hungry in the afternoon..."
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <button
              type="submit"
              disabled={!rating || isSubmitting}
              className="mt-6 w-full rounded-full bg-teal-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-teal-700 disabled:bg-slate-200 disabled:text-slate-400"
            >
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}
      </section>
    </main>
  );
}
