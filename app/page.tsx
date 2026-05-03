import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col relative overflow-hidden font-sans">
      {/* Subtle Background Glow - เพิ่มแสงเงาสีเขียวอ่อนๆ ด้านหลังให้หน้าเว็บไม่ดูแบนจนเกินไป */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-teal-50/60 rounded-full blur-3xl pointer-events-none -z-10" />

      <main className="flex-1 flex flex-col items-center justify-center max-w-6xl mx-auto px-6 py-20 w-full">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-semibold mb-8 border border-teal-100 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
            AI-Powered Nutrition Advisor
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
            Your personalized <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">
              healing journey
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Discover the power of food as medicine. We analyze your health profile to provide evidence-backed menus and connect you with trusted wellness providers.
          </p>
        </div>

        {/* How it works / Benefits - Responsive Grid (1 คอลัมน์ในมือถือ, 3 คอลัมน์ในคอม) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mb-16 mt-4">
          
          {/* Step 1 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-6 border border-teal-100">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Assess Your Condition</h3>
            <p className="text-slate-500 leading-relaxed">
              Tell us about your daily condition, dietary needs, and healing preferences to create your unique wellness passport.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-6 border border-teal-100">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Get Evidence-Backed Menus</h3>
            <p className="text-slate-500 leading-relaxed">
              Receive personalized nutrition plans and learn about active compounds that support your specific healing goals.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-100/50 transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-400 to-emerald-400 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center font-bold text-xl mb-6 border border-teal-100">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">Connect with Providers</h3>
            <p className="text-slate-500 leading-relaxed">
              Match seamlessly with trusted local wellness providers, clinics, and organic markets tailored to your journey.
            </p>
          </div>

        </div>

        {/* Call to Action Button */}
        <div className="flex flex-col items-center">
          <Link 
            href="/passport" 
            className="group relative inline-flex items-center justify-center px-10 py-5 text-lg font-semibold text-white bg-teal-600 rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(13,148,136,0.6)]"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all opacity-100"></div>
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all opacity-0 group-hover:opacity-100"></div>
            <span className="relative flex items-center gap-3">
              Start Your Journey
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </Link>
          <p className="mt-4 text-sm text-slate-400 font-medium">Takes only 2 minutes to set up your profile.</p>
        </div>

      </main>
    </div>
  );
}