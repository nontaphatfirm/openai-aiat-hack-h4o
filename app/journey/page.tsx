"use client";

import { SelfHealingFoodImage } from "@/app/components/SelfHealingFoodImage";
import { ExternalLink, Leaf } from "lucide-react";
import Link from "next/link";

type JourneyIngredient = {
  name: string;
  reason: string;
  researchKeyword: string;
  imageUrl?: string | null;
  research?: {
    title: string;
    url: string;
    year: number | null;
  } | null;
};

const journeyPlan = {
  goal: "Boost Energy & Reduce Fatigue",
  summary:
    "Your fatigue pattern may come from uneven blood sugar, limited morning light, and late screen exposure. Today focuses on steady meals and a calmer evening.",
  schedule: [
    {
      time: "07:00",
      activity: "Morning hydration",
      description: "Drink 500ml water and get 10 minutes of daylight.",
    },
    {
      time: "08:30",
      activity: "Protein breakfast",
      description: "Stabilize blood sugar before work starts.",
    },
    {
      time: "12:30",
      activity: "Nutrient-dense lunch",
      description: "Choose complex carbs, greens, and healthy fats.",
    },
    {
      time: "15:00",
      activity: "Movement break",
      description: "Take a 10-minute walk instead of another coffee.",
    },
    {
      time: "20:00",
      activity: "Digital sunset",
      description: "Dim lights and reduce screens before sleep.",
    },
  ],
  menus: [
    {
      meal: "Breakfast",
      name: "Matcha chia seed pudding",
      benefits: "L-theanine and fiber support calm energy and satiety.",
      tags: ["Vegan", "Energy"],
      imageUrl: null,
    },
    {
      meal: "Lunch",
      name: "Quinoa salmon bowl",
      benefits: "B-vitamins, omega-3 fats, and protein support focus.",
      tags: ["High protein", "Focus"],
      imageUrl: null,
    },
  ],
  ingredientPool: [
    {
      name: "Ginger",
      reason: "Supports a lighter, warming meal pattern and helps keep low-sodium dishes flavorful.",
      researchKeyword: "Zingiber officinale",
      research: {
        title: "Zingiber officinale and human health evidence",
        url: "https://www.semanticscholar.org/search?q=Zingiber%20officinale&sort=relevance",
        year: null,
      },
      imageUrl: null,
    },
    {
      name: "Chia seeds",
      reason: "Adds fiber and healthy fats that can help steady energy between meals.",
      researchKeyword: "Salvia hispanica",
      research: {
        title: "Salvia hispanica nutrition research",
        url: "https://www.semanticscholar.org/search?q=Salvia%20hispanica&sort=relevance",
        year: null,
      },
      imageUrl: null,
    },
    {
      name: "Turmeric",
      reason: "Fits an anti-inflammatory food pattern and pairs well with protein-rich meals.",
      researchKeyword: "Curcuma longa curcumin",
      research: {
        title: "Curcuma longa curcumin evidence",
        url: "https://www.semanticscholar.org/search?q=Curcuma%20longa%20curcumin&sort=relevance",
        year: null,
      },
      imageUrl: null,
    },
    {
      name: "Broccoli",
      reason: "Adds fiber and micronutrients while keeping the meal filling without excess calories.",
      researchKeyword: "Brassica oleracea broccoli",
      research: null,
      imageUrl: null,
    },
  ] satisfies JourneyIngredient[],
};

function MenuImage({ menu }: { menu: (typeof journeyPlan.menus)[number] }) {
  return (
    <SelfHealingFoodImage
      key={`${menu.name}-${menu.imageUrl ?? "missing"}`}
      src={menu.imageUrl}
      prompt={menu.name}
      alt={menu.name}
      className="h-full w-full rounded-lg object-cover"
    />
  );
}

function IngredientImage({ ingredient }: { ingredient: JourneyIngredient }) {
  return (
    <SelfHealingFoodImage
      key={`${ingredient.name}-${ingredient.imageUrl ?? "missing"}`}
      src={ingredient.imageUrl}
      prompt={ingredient.name}
      alt={ingredient.name}
      className="h-full w-full rounded-lg object-cover"
    />
  );
}

export default function JourneyPage() {
  return (
    <main className="min-h-full bg-slate-50 px-4 pb-8 pt-6">
      <section className="rounded-3xl bg-gradient-to-br from-teal-600 to-emerald-700 p-6 text-white shadow-sm">
        <p className="mb-3 w-max rounded-full bg-white/20 px-3 py-1 text-xs font-bold">
          AI-Generated Plan
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">Your Healing Journey</h1>
        <p className="mt-3 text-sm font-semibold text-teal-50">Target: {journeyPlan.goal}</p>
        <p className="mt-3 text-sm leading-6 text-teal-50/90">{journeyPlan.summary}</p>
      </section>

      <section className="mt-6">
        <h2 className="mb-4 text-xl font-extrabold text-slate-950">Daily Protocol</h2>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-5 border-l-2 border-teal-100 pl-5">
            {journeyPlan.schedule.map((item) => (
              <div key={item.time} className="relative">
                <div className="absolute -left-[29px] top-1 h-4 w-4 rounded-full border-4 border-white bg-teal-500" />
                <p className="w-max rounded-md bg-teal-50 px-2 py-1 text-xs font-black text-teal-700">
                  {item.time}
                </p>
                <h3 className="mt-2 text-base font-extrabold text-slate-900">{item.activity}</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Validated Ingredients</p>
          <h2 className="text-2xl font-extrabold text-slate-950">Ingredient Pool</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {journeyPlan.ingredientPool.map((ingredient) => (
            <article
              key={`${ingredient.name}-${ingredient.researchKeyword}`}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="relative h-24 w-full">
                <IngredientImage ingredient={ingredient} />
              </div>
              <div className="min-h-36 p-3">
                <div className="flex items-start gap-2">
                  <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                  <h3 className="text-sm font-extrabold leading-5 text-slate-800">{ingredient.name}</h3>
                </div>
                <p className="mt-2 text-xs font-medium leading-5 text-slate-500">{ingredient.reason}</p>
                {ingredient.research?.url ? (
                  <a
                    href={ingredient.research.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-extrabold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Scientific Evidence
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="mb-4 text-xl font-extrabold text-slate-950">Healing Menus</h2>
        <div className="space-y-4">
          {journeyPlan.menus.map((menu) => (
            <article key={menu.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="h-40 w-full">
                <MenuImage menu={menu} />
              </div>
              <div className="p-5">
                <p className="text-xs font-black uppercase tracking-wide text-teal-700">{menu.meal}</p>
                <h3 className="mt-2 text-lg font-extrabold text-slate-950">{menu.name}</h3>
                <p className="mt-3 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
                  {menu.benefits}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {menu.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <Link
        href="/providers"
        className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-teal-700"
      >
        Find Local Providers
      </Link>
    </main>
  );
}
