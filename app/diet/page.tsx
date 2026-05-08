"use client";

import {
  AlertTriangle,
  Bike,
  BookOpen,
  ChefHat,
  Leaf,
  Loader2,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Utensils,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Profile = {
  name?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  medicationAllergies?: string;
  foodAllergies?: string;
  chronicConditions?: string;
};

type PassportData = {
  profile?: Profile;
  dynamicHealth?: {
    sleep?: {
      durationHours?: number;
      quality?: number;
    };
    stress?: {
      level?: string;
      score?: number;
    };
    pai?: {
      score?: number;
      range?: string;
    };
    calories?: {
      intake?: number;
      output?: number;
      steps?: number;
      averageHeartRate?: number;
    };
  };
  environment?: {
    location?: string;
    locationName?: string;
    pm25?: number;
    uv?: number;
    temperature?: number;
    humidity?: number;
    condition?: string;
  };
  interaction?: {
    goal?: string;
    diet?: string;
    feeling?: string;
    notes?: string;
  };
};

type ResearchPaper = {
  title: string;
  url: string;
  year: number | null;
};

type MenuRecommendation = {
  name: string;
  ingredients: string[];
  estimatedCalories: number;
  reason: string;
  keyIngredientForResearch: string;
  research: ResearchPaper | null;
};

type RecommendationResponse = {
  menus: MenuRecommendation[];
  disclaimer: string;
  source: "openai" | "fallback";
  warning?: string;
};

type ApiErrorResponse = {
  error: string;
};

const PRIMARY_STORAGE_KEY = "mock_passport_data";
const LEGACY_STORAGE_KEY = "wellness_passport_data";
const ENGLISH_DISCLAIMER =
  "This system provides preliminary wellness suggestions only and does not replace medical diagnosis or advice from a physician, dietitian, or pharmacist.";
const FOOD_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&w=900&q=80",
];

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof (value as ApiErrorResponse).error === "string"
  );
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    throw new Error(isApiErrorResponse(payload) ? payload.error : "Unable to load recommendations.");
  }

  return payload as T;
}

function readPassportData() {
  if (typeof window === "undefined") return null;

  const storedValue = window.localStorage.getItem(PRIMARY_STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!storedValue) return null;

  try {
    return JSON.parse(storedValue) as PassportData;
  } catch {
    return null;
  }
}

function formatCalories(value: number) {
  return `${Math.round(value).toLocaleString("en-US")} kcal`;
}

function hashText(value: string) {
  return value.split("").reduce((total, character) => total + character.charCodeAt(0), 0);
}

function getFoodImageUrl(value: string, index = 0) {
  return FOOD_IMAGE_URLS[(hashText(value) + index) % FOOD_IMAGE_URLS.length];
}

function getIngredientPool(menus: MenuRecommendation[]) {
  const seen = new Set<string>();
  const ingredients: string[] = [];

  for (const menu of menus) {
    for (const ingredient of menu.ingredients) {
      const normalized = ingredient.trim().toLowerCase();
      if (!normalized || seen.has(normalized)) continue;

      seen.add(normalized);
      ingredients.push(ingredient);
    }
  }

  return ingredients.slice(0, 12);
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 h-36 animate-pulse rounded-xl bg-slate-200" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="h-4 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" />
        </div>
        <div className="h-7 w-20 animate-pulse rounded-full bg-amber-100" />
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-100" />
        <div className="h-3 w-2/3 animate-pulse rounded-full bg-slate-100" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
        <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

function IngredientPool({ ingredients }: { ingredients: string[] }) {
  return (
    <section className="mt-6">
      <div className="mb-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Validated Ingredients</p>
        <h2 className="text-2xl font-extrabold text-slate-950">Ingredient Pool</h2>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {ingredients.map((ingredient, index) => (
          <div key={ingredient} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative h-24 w-full">
              <Image
                src={getFoodImageUrl(ingredient, index)}
                alt={ingredient}
                fill
                sizes="(max-width: 430px) 50vw, 190px"
                className="object-cover"
              />
            </div>
            <div className="flex min-h-16 items-start gap-2 p-3">
              <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
              <p className="text-sm font-extrabold leading-5 text-slate-800">{ingredient}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MenuCard({ menu }: { menu: MenuRecommendation }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-44 w-full">
        <Image src={getFoodImageUrl(menu.name)} alt={menu.name} fill sizes="430px" className="object-cover" />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-teal-700">
            <Sparkles className="h-3.5 w-3.5" />
            Personalized menu
          </p>
          <h2 className="mt-2 text-lg font-extrabold leading-snug text-slate-950">{menu.name}</h2>
        </div>
        <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-800">
          {formatCalories(menu.estimatedCalories)}
        </span>
        </div>

        <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm font-medium leading-6 text-slate-600">{menu.reason}</p>

        {menu.research ? (
          <a
            href={menu.research.url}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold leading-5 text-emerald-900 transition hover:border-emerald-300 hover:bg-emerald-100"
          >
            <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Backed by Science: {menu.research.title}
              {menu.research.year ? ` (${menu.research.year})` : ""}
            </span>
          </a>
        ) : null}

        <div className="mt-5 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => window.alert("Searching nearby restaurants via Google Places...")}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-xs font-extrabold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
        >
          <Utensils className="h-4 w-4" />
          Dine-in
        </button>
        <button
          type="button"
          onClick={() => window.alert("Redirecting to Delivery App...")}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 text-xs font-extrabold text-slate-700 transition hover:border-sky-200 hover:bg-sky-50 hover:text-sky-800"
        >
          <Bike className="h-4 w-4" />
          Delivery
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded((current) => !current)}
          className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-slate-950 px-2 text-xs font-extrabold text-white transition hover:bg-teal-700"
        >
          <ChefHat className="h-4 w-4" />
          Cook it
        </button>
        </div>

        {isExpanded ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-extrabold text-slate-900">Ingredients</p>
            <ul className="mt-3 space-y-2 text-sm font-medium leading-5 text-slate-600">
              {menu.ingredients.map((ingredient) => (
                <li key={ingredient} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-600" />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 rounded-lg bg-white p-3 text-sm font-semibold leading-6 text-slate-700">
              Step 1: Prep ingredients. Step 2: Cook with minimal added oil and sodium. Step 3: Plate one balanced serving.
            </div>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function DietPage() {
  const router = useRouter();
  const [passportData, setPassportData] = useState<PassportData | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = useCallback(async (data: PassportData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/agent/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      const payload = await readJsonResponse<RecommendationResponse>(response);
      setRecommendations(payload);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load recommendations.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hydrationTimer = window.setTimeout(() => {
      const storedPassportData = readPassportData();
      if (!storedPassportData?.profile) {
        router.replace("/passport");
        return;
      }

      setPassportData(storedPassportData);
      void loadRecommendations(storedPassportData);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, [loadRecommendations, router]);

  const profile = passportData?.profile;
  const environment = passportData?.environment;
  const ingredientPool = recommendations ? getIngredientPool(recommendations.menus) : [];

  return (
    <main className="min-h-full bg-slate-50 px-4 pb-8 pt-5">
      <section className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-teal-200">Personalized Health Consultant</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Nutrition Plan</h1>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <ShieldCheck className="h-6 w-6 text-teal-200" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs font-semibold text-slate-300">BMI</p>
            <p className="mt-1 text-lg font-black">{profile?.bmi ?? "..."}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs font-semibold text-slate-300">PM 2.5</p>
            <p className="mt-1 text-lg font-black">{environment?.pm25 ?? "..."}</p>
          </div>
          <div className="col-span-2 rounded-xl bg-white/10 p-3">
            <p className="text-xs font-semibold text-slate-300">Location</p>
            <p className="mt-1 truncate text-sm font-bold">{environment?.locationName ?? environment?.location ?? "Unknown"}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
        <div className="flex gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{recommendations?.disclaimer ?? ENGLISH_DISCLAIMER}</span>
        </div>
      </section>

      {recommendations?.warning ? (
        <section className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm font-semibold leading-6 text-sky-900">
          Demo fallback active: {recommendations.warning}
        </section>
      ) : null}

      {isLoading ? (
        <section className="mt-6">
          <div className="mb-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Validated Ingredients</p>
            <h2 className="text-2xl font-extrabold text-slate-950">Ingredient Pool</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="h-24 animate-pulse bg-slate-200" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-24 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-3 w-16 animate-pulse rounded-full bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!isLoading && ingredientPool.length ? <IngredientPool ingredients={ingredientPool} /> : null}

      <section className="mt-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Top 10</p>
            <h2 className="text-2xl font-extrabold text-slate-950">Recommended Menus</h2>
          </div>
          {isLoading ? (
            <div className="rounded-full bg-white p-2 text-teal-700 shadow-sm">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <p className="text-sm font-bold leading-6 text-rose-800">{error}</p>
            <button
              type="button"
              onClick={() => passportData && void loadRecommendations(passportData)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-rose-700 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-rose-800"
            >
              <RotateCcw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-4">
            {[0, 1, 2, 3].map((item) => (
              <SkeletonCard key={item} />
            ))}
          </div>
        ) : null}

        {!isLoading && recommendations?.menus.length ? (
          <div className="space-y-4">
            {recommendations.menus.map((menu) => (
              <MenuCard key={`${menu.name}-${menu.keyIngredientForResearch}`} menu={menu} />
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
