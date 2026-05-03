import Link from "next/link";

export default function JourneyPage() {
  // ข้อมูลจำลอง (Mock Data) ปกติจะได้มาจากการเรียก API ของ OpenAI/Claude
  const journeyPlan = {
    goal: "Boost Energy & Reduce Fatigue",
    summary: "Based on your passport, your fatigue might stem from fluctuating blood sugar and lack of early sunlight. Here is your personalized daily protocol.",
    schedule: [
      { time: "07:00 AM", activity: "Morning Sunlight & Hydration", desc: "Drink 500ml of room temp water and get 15 mins of direct sunlight to reset circadian rhythm.", icon: "🌅" },
      { time: "08:30 AM", activity: "High-Protein Breakfast", desc: "Stabilize blood sugar early to prevent afternoon energy crashes.", icon: "🍳" },
      { time: "12:30 PM", activity: "Nutrient-Dense Lunch", desc: "Focus on complex carbs and leafy greens for sustained afternoon energy.", icon: "🥗" },
      { time: "03:00 PM", activity: "Movement Snack", desc: "10-minute brisk walk or light stretching instead of reaching for coffee.", icon: "🚶" },
      { time: "08:00 PM", activity: "Digital Sunset", desc: "Dim lights and avoid screens 2 hours before bed to enhance melatonin production.", icon: "📵" },
    ],
    menus: [
      {
        meal: "Breakfast",
        name: "Matcha Chia Seed Pudding",
        ingredients: "Chia seeds, Almond milk, Ceremonial Matcha, Berries",
        benefits: "Matcha provides L-theanine for calm, sustained energy without the coffee jitters. Chia seeds offer Omega-3s for brain health.",
        tags: ["Vegan", "Energy Boost"],
        image: "🍵"
      },
      {
        meal: "Lunch",
        name: "Quinoa Salmon Bowl with Avocado",
        ingredients: "Wild-caught Salmon, Quinoa, Avocado, Edamame, Ginger Dressing",
        benefits: "Rich in B-vitamins from quinoa and healthy fats from salmon/avocado to keep your energy stable for hours.",
        tags: ["High Protein", "Focus"],
        image: "🍱"
      }
    ]
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans">
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-slate-800 flex items-center gap-2">
            <span className="text-teal-600">🌿</span> WellnessApp
          </Link>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm">
              You
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 rounded-3xl p-8 sm:p-10 text-white shadow-lg mb-8 relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-64 h-64 bg-emerald-400/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium mb-4">
              ✨ AI-Generated Plan
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Your Healing Journey</h1>
            <p className="text-teal-50 text-lg max-w-2xl opacity-90 leading-relaxed">
              Target: <span className="font-semibold text-white">{journeyPlan.goal}</span><br/>
              {journeyPlan.summary}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Daily Plan (Timeline) */}
          <div className="lg:col-span-5">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              ⏱️ Daily Protocol
            </h2>
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
              <div className="relative border-l-2 border-teal-100 ml-4 space-y-8">
                {journeyPlan.schedule.map((item, index) => (
                  <div key={index} className="relative pl-8">
                    {/* Timeline dot */}
                    <div className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-teal-100 border-4 border-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-teal-500"></div>
                    </div>
                    
                    <div className="mb-1">
                      <span className="text-xs font-bold text-teal-600 tracking-wider uppercase bg-teal-50 px-2 py-1 rounded-md">
                        {item.time}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mt-2">
                      <span className="text-xl">{item.icon}</span> {item.activity}
                    </h3>
                    <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Nutrition Menu */}
          <div className="lg:col-span-7">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                🥗 Healing Menus
              </h2>
            </div>
            
            <div className="space-y-6">
              {journeyPlan.menus.map((menu, index) => (
                <div key={index} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                        {menu.image}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-teal-600 mb-1">{menu.meal}</p>
                        <h3 className="text-xl font-bold text-slate-800">{menu.name}</h3>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-slate-500 font-medium mb-1">Key Ingredients:</p>
                    <p className="text-slate-700">{menu.ingredients}</p>
                  </div>
                  
                  <div className="bg-emerald-50 rounded-2xl p-4 mb-4">
                    <p className="text-sm font-semibold text-emerald-800 mb-1 flex items-center gap-1">
                      <span>💡</span> Why this works:
                    </p>
                    <p className="text-sm text-emerald-700 leading-relaxed">
                      {menu.benefits}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {menu.tags.map((tag, i) => (
                      <span key={i} className="text-xs font-medium bg-slate-100 text-slate-600 px-3 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Call to Action for Providers */}
            <div className="mt-8 bg-slate-800 rounded-3xl p-8 text-center sm:text-left sm:flex items-center justify-between shadow-lg">
              <div className="mb-6 sm:mb-0 sm:pr-8">
                <h3 className="text-xl font-bold text-white mb-2">Need these ingredients?</h3>
                <p className="text-slate-300 text-sm">
                  We can match you with local organic markets and wellness providers that have exactly what you need.
                </p>
              </div>
              <Link 
                href="/providers" 
                className="shrink-0 inline-flex items-center justify-center px-6 py-3 text-sm font-bold text-slate-900 bg-white rounded-full hover:bg-teal-50 transition-colors"
              >
                Find Local Providers
              </Link>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}