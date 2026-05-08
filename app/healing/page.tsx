"use client";

import {
  Activity,
  AlertTriangle,
  Brain,
  CalendarClock,
  CheckCircle2,
  HeartPulse,
  MessageSquareText,
  Plus,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

const PASSPORT_STORAGE_KEY = "wellness_passport_data";
const HEALING_STORAGE_KEY = "wellness_healing_feedback";

type PassportData = {
  profile?: {
    name?: string;
    age?: number;
    bmi?: number;
    medicationAllergies?: string;
    foodAllergies?: string;
    chronicConditions?: string;
  };
  dynamicHealth?: {
    sleep?: { durationHours?: number; quality?: number };
    stress?: { level?: string; hrvMs?: number; score?: number };
    calories?: { intake?: number; output?: number; steps?: number };
  };
  interaction?: {
    goal?: string;
    diet?: string;
    feeling?: string;
    notes?: string;
  };
};

type HealingPassport = {
  profile: {
    name: string;
    age: number;
    bmi: number;
    medicationAllergies: string;
    foodAllergies: string;
    chronicConditions: string;
  };
  dynamicHealth: {
    sleep: { durationHours: number; quality: number };
    stress: { level: string; hrvMs: number; score: number };
    calories: { intake: number; output: number; steps: number };
  };
  interaction: {
    goal: string;
    diet: string;
    feeling: string;
    notes: string;
  };
};

type HealingType = "physical" | "mentality";

type FeedbackEntry = {
  id: string;
  type: HealingType;
  rating: number;
  symptom: string;
  note: string;
  createdAt: string;
};

type HealingPlan = {
  title: string;
  subtitle: string;
  riskSignals: string[];
  services: { name: string; detail: string }[];
  dailyActions: string[];
};

type HealingAdvice = {
  tone: "urgent" | "watch" | "steady";
  title: string;
  detail: string;
};

type HealingApiResponse = {
  plan: HealingPlan;
  advice: HealingAdvice;
  source: "openai" | "fallback";
  warning?: string;
};

const defaultPassport: HealingPassport = {
  profile: {
    name: "Maya Chen",
    age: 32,
    bmi: 22,
    medicationAllergies: "Penicillin",
    foodAllergies: "Shellfish, peanuts",
    chronicConditions: "Mild asthma, seasonal allergies",
  },
  dynamicHealth: {
    sleep: { durationHours: 7.4, quality: 84 },
    stress: { level: "Balanced", hrvMs: 58, score: 32 },
    calories: { intake: 1840, output: 2260, steps: 8420 },
  },
  interaction: {
    goal: "Improve sleep quality and reduce stress",
    diet: "High-protein, low added sugar, no shellfish",
    feeling: "A little tired after work, but mentally calmer than last week.",
    notes: "Prefers quick meals and evening stretching routines.",
  },
};

const symptomOptions: Record<HealingType, string[]> = {
  physical: ["Fatigue", "Pain", "Digestive discomfort", "Sleep disruption", "Low stamina"],
  mentality: ["Stress", "Anxiety", "Low mood", "Poor focus", "Irritability"],
};

function mergePassportData(value: unknown): HealingPassport {
  if (!value || typeof value !== "object") return defaultPassport;
  const data = value as PassportData;
  return {
    profile: { ...defaultPassport.profile, ...data.profile },
    dynamicHealth: {
      sleep: { ...defaultPassport.dynamicHealth.sleep, ...data.dynamicHealth?.sleep },
      stress: { ...defaultPassport.dynamicHealth.stress, ...data.dynamicHealth?.stress },
      calories: { ...defaultPassport.dynamicHealth.calories, ...data.dynamicHealth?.calories },
    },
    interaction: { ...defaultPassport.interaction, ...data.interaction },
  };
}

function readStoredPassport() {
  if (typeof window === "undefined") return defaultPassport;
  const storedPassport = window.localStorage.getItem(PASSPORT_STORAGE_KEY);
  if (!storedPassport) return defaultPassport;
  try {
    return mergePassportData(JSON.parse(storedPassport) as unknown);
  } catch {
    return defaultPassport;
  }
}

function readStoredFeedback() {
  if (typeof window === "undefined") return [];
  const storedFeedback = window.localStorage.getItem(HEALING_STORAGE_KEY);
  if (!storedFeedback) return [];
  try {
    const parsed = JSON.parse(storedFeedback) as FeedbackEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function createFallbackPlan(passport: HealingPassport, type: HealingType): HealingPlan {
  const sleepHours = passport.dynamicHealth.sleep.durationHours;
  const sleepQuality = passport.dynamicHealth.sleep.quality;
  const stressScore = passport.dynamicHealth.stress.score;
  const steps = passport.dynamicHealth.calories.steps;
  const diet = passport.interaction.diet || "Balanced meals";
  const goal = passport.interaction.goal || "Improve overall wellbeing";

  if (type === "physical") {
    return {
      title: "Physical Recovery Plan",
      subtitle: `Built around ${goal.toLowerCase()} and current activity signals.`,
      riskSignals: [
        sleepHours < 7 ? "Sleep duration is below the recovery target." : "Sleep duration supports recovery.",
        steps < 7000 ? "Daily movement may be too low for stamina building." : "Movement baseline is active.",
        passport.profile.chronicConditions ? `Known condition: ${passport.profile.chronicConditions}` : "No chronic condition recorded.",
      ],
      services: [
        { name: "Recovery assessment", detail: "Review pain, fatigue, sleep, activity, allergies, and meal pattern before selecting care." },
        { name: "Movement therapy", detail: "Start with low-impact mobility, 10-minute walks, and progressive strengthening 3 times per week." },
        { name: "Food-as-medicine support", detail: `Use ${diet.toLowerCase()} while avoiding ${passport.profile.foodAllergies || "recorded allergens"}.` },
        { name: "Sleep repair protocol", detail: "Keep a fixed wake time, morning sunlight, and a 45-minute low-light wind-down." },
      ],
      dailyActions: ["Log pain and energy", "Walk after one meal", "Stretch hips, neck, and back", "Hydrate before caffeine"],
    };
  }

  return {
    title: "Mentality Support Plan",
    subtitle: `Designed from current mood: ${passport.interaction.feeling || "not provided"}.`,
    riskSignals: [
      stressScore > 45 ? "Stress score is elevated and needs close tracking." : "Stress score is currently manageable.",
      sleepQuality < 80 ? "Sleep quality may be affecting mood and focus." : "Sleep quality is supporting mental resilience.",
      passport.interaction.notes ? `User note: ${passport.interaction.notes}` : "No extra mental-health context recorded.",
    ],
    services: [
      { name: "Stress pattern review", detail: "Identify peak stress windows and plan breathing or pause routines before they escalate." },
      { name: "Guided mental reset", detail: "Use 5-minute box breathing, grounding, or journaling twice per day." },
      { name: "Sleep and screen boundary", detail: "Protect the last 60 minutes before bed to improve emotional regulation." },
      { name: "Support escalation", detail: "If mood, anxiety, or daily function worsens, prioritize professional consultation." },
    ],
    dailyActions: ["Rate mood twice daily", "Write one trigger", "Do one breathing session", "Message support if symptoms spike"],
  };
}

function createFallbackAdvice(feedback: FeedbackEntry[], activeType: HealingType): HealingAdvice {
  const entries = feedback.filter((item) => item.type === activeType);
  const latest = entries.slice(-3);
  const hasLongNoImprovement = entries.length >= 5 && latest.every((item) => item.rating <= 2);
  const average = entries.length
    ? entries.reduce((sum, item) => sum + item.rating, 0) / entries.length
    : 0;

  if (hasLongNoImprovement) {
    return {
      tone: "urgent",
      title: "Medical review recommended",
      detail:
        "Symptoms have not improved after repeated updates. Please meet a doctor or qualified clinician for proper assessment.",
    };
  }

  if (entries.length >= 3 && average < 3) {
    return {
      tone: "watch",
      title: "Needs closer monitoring",
      detail: "The plan is not trending strongly yet. Reduce intensity and continue daily symptom tracking.",
    };
  }

  return {
    tone: "steady",
    title: "Plan can continue",
    detail: "Keep following the plan and update symptoms regularly so the service recommendations stay adaptive.",
  };
}

export default function HealingPage() {
  const [passport] = useState<HealingPassport>(() => readStoredPassport());
  const [activeType, setActiveType] = useState<HealingType>("physical");
  const [feedback, setFeedback] = useState<FeedbackEntry[]>(() => readStoredFeedback());
  const [rating, setRating] = useState(3);
  const [symptom, setSymptom] = useState(symptomOptions.physical[0]);
  const [note, setNote] = useState("");
  const [apiResult, setApiResult] = useState<HealingApiResponse>(() => ({
    plan: createFallbackPlan(readStoredPassport(), "physical"),
    advice: createFallbackAdvice(readStoredFeedback(), "physical"),
    source: "fallback",
  }));
  const [isLoadingPlan, setIsLoadingPlan] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(HEALING_STORAGE_KEY, JSON.stringify(feedback));
  }, [feedback]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHealingPlan() {
      setIsLoadingPlan(true);
      setApiError(null);

      try {
        const response = await fetch("/api/healing", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passport, activeType, feedback }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Unable to load healing plan from API.");
        }

        const data = (await response.json()) as HealingApiResponse;
        setApiResult(data);
      } catch (error) {
        if (controller.signal.aborted) return;
        setApiError(error instanceof Error ? error.message : "Unable to load healing plan from API.");
        setApiResult({
          plan: createFallbackPlan(passport, activeType),
          advice: createFallbackAdvice(feedback, activeType),
          source: "fallback",
          warning: "The local fallback plan is being shown because the API request failed.",
        });
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingPlan(false);
        }
      }
    }

    loadHealingPlan();

    return () => controller.abort();
  }, [activeType, feedback, passport]);

  const plan = apiResult.plan;
  const advice = apiResult.advice;
  const typeFeedback = feedback.filter((item) => item.type === activeType);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFeedback((current) => [
      ...current,
      {
        id: `${Date.now()}`,
        type: activeType,
        rating,
        symptom,
        note: note.trim(),
        createdAt: new Date().toISOString(),
      },
    ]);
    setRating(3);
    setNote("");
  };

  return (
    <main className="min-h-full bg-slate-50 px-4 pb-8 pt-6">
      <section className="rounded-3xl bg-gradient-to-br from-teal-700 to-slate-950 p-6 text-white shadow-sm">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-black">
          <Sparkles className="h-3.5 w-3.5" />
          Adaptive Healing
        </p>
        <h1 className="text-3xl font-extrabold tracking-tight">Healing Plan</h1>
        <p className="mt-3 text-sm leading-6 text-teal-50/90">
          Service plans are generated from the Passport profile, daily health signals, and symptom feedback.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-black">
          <span className="rounded-full bg-white/15 px-3 py-1">
            {isLoadingPlan ? "Loading API plan" : apiResult.source === "openai" ? "OpenAI API" : "Fallback plan"}
          </span>
          {(apiError || apiResult.warning) && (
            <span className="rounded-full bg-amber-300/20 px-3 py-1 text-amber-50">
              {apiError ?? apiResult.warning}
            </span>
          )}
        </div>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        {(["physical", "mentality"] as const).map((type) => {
          const isActive = activeType === type;
          const Icon = type === "physical" ? Activity : Brain;
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                setActiveType(type);
                setSymptom(symptomOptions[type][0]);
              }}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-extrabold capitalize transition ${
                isActive ? "bg-teal-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {type}
            </button>
          );
        })}
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
            {activeType === "physical" ? <HeartPulse className="h-5 w-5" /> : <Brain className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950">{plan.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{plan.subtitle}</p>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {plan.services.map((service) => (
            <article key={service.name} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <h3 className="text-sm font-extrabold text-slate-900">{service.name}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">{service.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <CalendarClock className="h-5 w-5 text-teal-700" />
          Daily actions
        </h2>
        <div className="mt-4 grid gap-2">
          {plan.dailyActions.map((action) => (
            <div key={action} className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              {action}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <ShieldAlert className="h-5 w-5 text-amber-600" />
          Risk signals
        </h2>
        <div className="mt-4 space-y-2">
          {plan.riskSignals.map((signal) => (
            <p key={signal} className="rounded-xl bg-amber-50 px-3 py-2 text-sm font-semibold leading-6 text-amber-800">
              {signal}
            </p>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${
              advice.tone === "urgent"
                ? "bg-rose-50 text-rose-700"
                : advice.tone === "watch"
                  ? "bg-amber-50 text-amber-700"
                  : "bg-teal-50 text-teal-700"
            }`}
          >
            {advice.tone === "urgent" ? <AlertTriangle className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">{advice.title}</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">{advice.detail}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-950">
          <MessageSquareText className="h-5 w-5 text-teal-700" />
          Update symptoms
        </h2>
        <form onSubmit={handleSubmit} className="mt-4">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">Symptom</span>
            <select
              value={symptom}
              onChange={(event) => setSymptom(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            >
              {symptomOptions[activeType].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">Today&apos;s condition</span>
            <div className="mt-2 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`rounded-2xl border px-2 py-3 text-center text-sm font-black transition ${
                    rating === value
                      ? "border-teal-500 bg-teal-50 text-teal-700"
                      : "border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <span className="mt-2 block text-xs font-semibold text-slate-400">1 = worse, 5 = much better</span>
          </label>

          <label className="mt-4 block">
            <span className="text-xs font-black uppercase tracking-wide text-slate-400">Notes</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              placeholder="Describe what changed today, what helped, or what felt worse..."
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-700 outline-none focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            />
          </label>

          <button
            type="submit"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-teal-600 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Save symptom update
          </button>
        </form>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-lg font-extrabold text-slate-950">Recent feedback</h2>
        {typeFeedback.length ? (
          <div className="space-y-3">
            {typeFeedback.slice(-5).reverse().map((entry) => (
              <article key={entry.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-extrabold text-slate-900">{entry.symptom}</p>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
                    {entry.rating}/5
                  </span>
                </div>
                {entry.note && <p className="mt-2 text-sm leading-6 text-slate-500">{entry.note}</p>}
                <p className="mt-2 text-[11px] font-bold text-slate-400">
                  {new Date(entry.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-center text-sm font-semibold text-slate-400">
            No symptom updates yet.
          </div>
        )}
      </section>
    </main>
  );
}
