import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        
        {/* Global Navbar (แสดงทุกหน้า) */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="font-extrabold text-xl flex items-center gap-2 tracking-tight">
              <span className="text-teal-600">🌿</span> 
              <span className="text-slate-800">WellnessApp</span>
            </Link>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600">
              <Link href="/passport" className="hover:text-teal-600 transition-colors">Passport</Link>
              <Link href="/journey" className="hover:text-teal-600 transition-colors">Journey</Link>
              <Link href="/providers" className="hover:text-teal-600 transition-colors">Providers</Link>
              <Link href="/ask" className="hover:text-teal-600 transition-colors">Q&A</Link>
            </div>

            {/* Mobile Menu Button (Hamburger) */}
            <button className="md:hidden p-2 text-slate-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* เนื้อหาของแต่ละหน้าจะมาแทรกตรงนี้ */}
        {children}
        
      </body>
    </html>
  );
}