import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "WellnessApp | AI Nutrition Advisor",
  description: "Your personalized AI food-as-medicine advisor.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-slate-200 text-slate-900">
        <div className="mobile-app-shell mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-slate-50 shadow-2xl shadow-slate-950/20 sm:my-6 sm:min-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-3rem)] sm:overflow-hidden sm:rounded-[2rem] sm:border sm:border-slate-300">
          <nav className="sticky top-0 z-50 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md">
            <div className="flex h-14 items-center justify-between px-4">
              <Link href="/" className="flex min-w-0 items-center gap-2 text-lg font-extrabold tracking-tight">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-sm font-black text-white">
                  W
                </span>
                <span className="truncate text-slate-800">WellnessApp</span>
              </Link>
            </div>

            <div className="flex gap-2 overflow-x-auto px-3 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {[
                ["Passport", "/passport"],
                ["Journey", "/journey"],
                ["Providers", "/providers"],
                ["Q&A", "/ask"],
              ].map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                >
                  {label}
                </Link>
              ))}
            </div>
          </nav>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">{children}</div>
        </div>
      </body>
    </html>
  );
}
