import type { Metadata } from "next";
import Link from "next/link";
import BottomNav from "./components/BottomNav";
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
          {/* Top bar — brand only */}
          <header className="sticky top-0 z-50 shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur-md">
            <div className="flex h-12 items-center px-4">
              <Link href="/" className="flex min-w-0 items-center gap-2">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-black text-white">
                  W
                </span>
                <span className="truncate text-sm font-extrabold tracking-tight text-slate-800">
                  WellnessApp
                </span>
              </Link>
            </div>
          </header>

          {/* Scrollable content */}
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </div>

          {/* Bottom tab navigation */}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
