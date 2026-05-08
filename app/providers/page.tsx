const providers = [
  {
    id: 1,
    name: "Green Roots Organic Market",
    type: "Market & Grocery",
    rating: 4.8,
    reviews: 124,
    distance: "2.5 km",
    matchHighlight: "Has ingredients for your menu",
    description:
      "Organic produce, matcha, chia seeds, quinoa, and fresh seafood options for your meal plan.",
    tags: ["Organic", "Fresh produce", "Superfoods"],
  },
  {
    id: 2,
    name: "Zenith Holistic Clinic",
    type: "Wellness Center",
    rating: 4.9,
    reviews: 89,
    distance: "4.0 km",
    matchHighlight: "Energy and gut therapy",
    description:
      "Supports chronic fatigue with diagnostics, nutrition coaching, acupuncture, and recovery care.",
    tags: ["Diagnostics", "Acupuncture", "Nutrition"],
  },
  {
    id: 3,
    name: "The Quiet Space Sanctuary",
    type: "Spa & Recovery",
    rating: 4.7,
    reviews: 210,
    distance: "5.2 km",
    matchHighlight: "Perfect for digital sunset",
    description:
      "A quiet recovery space for sound therapy, breathwork, sleep reset, and guided relaxation.",
    tags: ["Sleep", "Recovery", "Stress"],
  },
];

export default function ProvidersPage() {
  return (
    <main className="min-h-full bg-slate-50 px-4 pb-8 pt-6">
      <section className="mb-6">
        <p className="mb-3 w-max rounded-full bg-teal-50 px-3 py-1 text-xs font-black text-teal-700">
          Provider Match
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">Your Trusted Providers</h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Based on your passport and nutrition plan, these local options fit your goals, dietary
          needs, and recovery habits.
        </p>
      </section>

      <section className="space-y-4">
        {providers.map((provider) => (
          <article key={provider.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-wide text-teal-700">
                  {provider.type} • {provider.distance}
                </p>
                <h2 className="mt-2 text-xl font-extrabold text-slate-950">{provider.name}</h2>
              </div>
              <div className="shrink-0 rounded-full bg-yellow-50 px-3 py-1 text-sm font-black text-slate-800">
                {provider.rating}
              </div>
            </div>

            <p className="mt-3 w-max max-w-full rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
              {provider.matchHighlight}
            </p>
            <p className="mt-3 text-sm leading-6 text-slate-500">{provider.description}</p>
            <p className="mt-2 text-xs font-semibold text-slate-400">{provider.reviews} reviews</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {provider.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>

            <button className="mt-5 w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-teal-700">
              View Details
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
