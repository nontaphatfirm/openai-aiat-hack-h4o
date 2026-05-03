import Link from "next/link";

export default function ProvidersPage() {
  // Mock Data: รอเปลี่ยนเป็นการดึงข้อมูลจาก LLM Recommendations ผ่าน API
  const pageInfo = {
    title: "Your Trusted Providers",
    matchReason: "Based on your goal to boost energy and your personalized nutrition plan, we've matched you with these highly-rated local specialists and markets.",
  };

  const providers = [
    {
      id: 1,
      name: "Green Roots Organic Market",
      type: "Market & Grocery",
      rating: 4.8,
      reviews: 124,
      distance: "2.5 km",
      icon: "🛒",
      matchHighlight: "Has ingredients for your menu",
      description: "Everything you need for your Matcha Chia Pudding and Quinoa Salmon Bowl. 100% organic and locally sourced.",
      tags: ["Organic", "Fresh Produce", "Superfoods"],
    },
    {
      id: 2,
      name: "Zenith Holistic Clinic",
      type: "Wellness Center",
      rating: 4.9,
      reviews: 89,
      distance: "4.0 km",
      icon: "🏥",
      matchHighlight: "Energy & Gut Therapy",
      description: "Specializes in personalized IV drip therapy, acupuncture, and gut microbiome testing to tackle chronic fatigue.",
      tags: ["IV Therapy", "Acupuncture", "Diagnostics"],
    },
    {
      id: 3,
      name: "The Quiet Space Sanctuary",
      type: "Spa & Recovery",
      rating: 4.7,
      reviews: 210,
      distance: "5.2 km",
      icon: "🧘‍♀️",
      matchHighlight: "Perfect for Digital Sunset",
      description: "An offline zone featuring float tanks and sound bath therapy to help you reset your circadian rhythm and improve sleep.",
      tags: ["Float Tanks", "Sound Healing", "Meditation"],
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      
      {/* Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/journey" className="text-slate-400 hover:text-teal-600 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">Back to Journey</span>
          </Link>
          <div className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <span className="text-teal-600">📍</span> Providers
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Page Intro */}
        <div className="mb-10 text-center md:text-left max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {pageInfo.title}
          </h1>
          <p className="text-slate-500 text-lg leading-relaxed">
            {pageInfo.matchReason}
          </p>
        </div>

        {/* Provider Cards List */}
        <div className="space-y-6">
          {providers.map((provider) => (
            <div 
              key={provider.id} 
              className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-teal-100/40 transition-all duration-300 flex flex-col md:flex-row gap-6 md:gap-8 group"
            >
              
              {/* Icon / Image Placeholder */}
              <div className="w-20 h-20 md:w-32 md:h-32 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center text-4xl md:text-6xl border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                {provider.icon}
              </div>

              {/* Content */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex flex-col md:flex-row md:items-start justify-between mb-2 gap-2">
                  <div>
                    <div className="text-xs font-bold text-teal-600 tracking-wider uppercase mb-1">
                      {provider.type} • {provider.distance}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{provider.name}</h2>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full w-max">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold text-slate-800">{provider.rating}</span>
                    <span className="text-xs text-slate-500">({provider.reviews})</span>
                  </div>
                </div>

                {/* AI Match Highlight */}
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-md w-max mb-3 border border-emerald-100">
                  <span>✨</span> {provider.matchHighlight}
                </div>

                <p className="text-slate-500 leading-relaxed mb-4">
                  {provider.description}
                </p>

                {/* Tags & Action */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-auto">
                  <div className="flex flex-wrap gap-2">
                    {provider.tags.map((tag, i) => (
                      <span key={i} className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="w-full md:w-auto px-6 py-2.5 bg-slate-900 hover:bg-teal-600 text-white font-semibold rounded-full transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
              
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}