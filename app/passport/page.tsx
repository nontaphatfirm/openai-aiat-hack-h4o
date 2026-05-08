"use client";

import {
  Activity,
  AirVent,
  Camera,
  Check,
  ChevronRight,
  CloudSun,
  Dumbbell,
  Edit3,
  HeartPulse,
  MapPin,
  MessageCircle,
  Mic,
  Moon,
  Save,
  ShieldAlert,
  Sparkles,
  Sun,
  Thermometer,
  Utensils,
  Watch,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Profile = {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  medicationAllergies: string;
  foodAllergies: string;
  chronicConditions: string;
};

type Interaction = {
  goal: string;
  diet: string;
  feeling: string;
  notes: string;
};

const dynamicHealth = {
  sleep: {
    durationHours: 7.4,
    quality: 84,
    bedTime: "11:12 PM",
    wakeTime: "6:38 AM",
    history: [
      { day: "Mon", duration: 6.2, quality: 72 },
      { day: "Tue", duration: 7.1, quality: 80 },
      { day: "Wed", duration: 6.8, quality: 76 },
      { day: "Thu", duration: 7.9, quality: 88 },
      { day: "Fri", duration: 7.4, quality: 84 },
      { day: "Sat", duration: 8.1, quality: 91 },
      { day: "Sun", duration: 7.6, quality: 86 },
    ],
  },
  stress: {
    level: "Balanced",
    hrvMs: 58,
    score: 32,
    expression: "Calm",
    trend: [
      { day: "Mon", value: 46 },
      { day: "Tue", value: 39 },
      { day: "Wed", value: 55 },
      { day: "Thu", value: 34 },
      { day: "Fri", value: 32 },
      { day: "Sat", value: 26 },
      { day: "Sun", value: 29 },
    ],
  },
  pai: {
    score: 78,
    range: "Active",
    weeklyTarget: 100,
    history: [
      { day: "Mon", value: 42 },
      { day: "Tue", value: 49 },
      { day: "Wed", value: 54 },
      { day: "Thu", value: 61 },
      { day: "Fri", value: 68 },
      { day: "Sat", value: 72 },
      { day: "Sun", value: 78 },
    ],
  },
  calories: {
    intake: 1840,
    output: 2260,
    steps: 8420,
    averageHeartRate: 76,
    mealEstimate: "Grilled salmon bowl, miso soup, berries",
  },
};

const environment = {
  location: "Pathum Wan, Bangkok",
  pm25: 18,
  uv: 7,
  temperature: 32,
  humidity: 64,
  condition: "Partly cloudy",
  forecast: [
    { time: "09:00", temp: 30, condition: "Clear" },
    { time: "12:00", temp: 33, condition: "High UV" },
    { time: "15:00", temp: 34, condition: "Humid" },
    { time: "18:00", temp: 31, condition: "Breezy" },
  ],
};

const prompts = [
  "What is your primary healing goal?",
  "Any dietary preferences?",
  "How are you feeling lately?",
  "Any symptoms that changed today?",
];

const formatNumber = new Intl.NumberFormat("en-US");

function getBmiStatus(bmi: number) {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 23) return "Healthy";
  if (bmi < 25) return "Monitor";
  return "High";
}

function getPmLabel(pm25: number) {
  if (pm25 <= 15) return "Good";
  if (pm25 <= 25) return "Moderate";
  return "Unhealthy";
}

function getUvLabel(uv: number) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  return "Very high";
}

function MiniBars({
  data,
  max,
  colorClass,
}: {
  data: { day: string; value?: number; duration?: number; quality?: number }[];
  max: number;
  colorClass: string;
}) {
  return (
    <div className="flex h-24 items-end gap-2">
      {data.map((point) => {
        const value = point.value ?? point.quality ?? point.duration ?? 0;
        return (
          <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex h-16 w-full items-end rounded-full bg-slate-100">
              <div
                className={`w-full rounded-full ${colorClass}`}
                style={{ height: `${Math.max(12, (value / max) * 100)}%` }}
                title={`${point.day}: ${value}`}
              />
            </div>
            <span className="text-[11px] font-medium text-slate-400">{point.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function MetricCard({
  title,
  value,
  detail,
  icon,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${tone}`}>{icon}</div>
      </div>
      <p className="text-sm leading-6 text-slate-500">{detail}</p>
    </div>
  );
}

export default function PassportPage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [mealPhotoStatus, setMealPhotoStatus] = useState("Ready for meal photo analysis");
  const [profile, setProfile] = useState<Profile>({
    name: "Maya Chen",
    age: 32,
    heightCm: 168,
    weightKg: 62,
    medicationAllergies: "Penicillin",
    foodAllergies: "Shellfish, peanuts",
    chronicConditions: "Mild asthma, seasonal allergies",
  });
  const [interaction, setInteraction] = useState<Interaction>({
    goal: "Improve sleep quality and reduce stress",
    diet: "High-protein, low added sugar, no shellfish",
    feeling: "A little tired after work, but mentally calmer than last week.",
    notes: "Prefers quick meals and evening stretching routines.",
  });

  const bmi = useMemo(() => {
    const heightM = profile.heightCm / 100;
    return profile.weightKg / (heightM * heightM);
  }, [profile.heightCm, profile.weightKg]);

  const calorieBalance = dynamicHealth.calories.intake - dynamicHealth.calories.output;
  const paiProgress = Math.min(100, (dynamicHealth.pai.score / dynamicHealth.pai.weeklyTarget) * 100);

  const handleProfileChange = (key: keyof Profile, value: string) => {
    setProfile((current) => ({
      ...current,
      [key]: key === "age" || key === "heightCm" || key === "weightKg" ? Number(value) : value,
    }));
  };

  const handleInteractionChange = (key: keyof Interaction, value: string) => {
    setInteraction((current) => ({ ...current, [key]: value }));
  };

  const analyzeMealPhoto = () => {
    setMealPhotoStatus("Analyzing meal photo with LLM vision...");
    window.setTimeout(() => {
      setMealPhotoStatus("Estimated 610 kcal: salmon, rice, avocado, greens");
    }, 900);
  };

  return (
    <main className="min-h-full bg-slate-50 pb-8 font-sans">
      <section className="border-b border-slate-200 bg-white">
        <div className="grid gap-6 px-4 py-6">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-3 text-sm font-semibold text-slate-500">
              <Link href="/" className="inline-flex items-center gap-2 text-teal-700 hover:text-teal-800">
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              Health Passport
            </div>
            <div className="max-w-3xl">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-700">
                <Sparkles className="h-4 w-4" />
                Mock data today, API-ready structure later
              </p>
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">
                Health Passport
              </h1>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                A single user health profile that combines baseline medical context, wearable signals,
                location environment, and conversational check-ins.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-teal-200">Readiness Snapshot</p>
                <p className="mt-1 text-3xl font-extrabold">82%</p>
              </div>
              <HeartPulse className="h-10 w-10 text-teal-300" />
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-300">Recovery</span>
                  <span className="font-semibold">Strong</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div className="h-2 w-[82%] rounded-full bg-teal-400" />
                </div>
              </div>
              <p className="text-sm leading-6 text-slate-300">
                Sleep and HRV are trending better. PM2.5 and UV are the main environment risks today.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 px-4 pt-6">
        <section>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                  Static Profile
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Baseline health</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Filled once during onboarding, then editable whenever the user needs to update it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingProfile((value) => !value)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                aria-label={isEditingProfile ? "Save profile" : "Edit profile"}
              >
                {isEditingProfile ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Name</span>
                <input
                  value={profile.name}
                  disabled={!isEditingProfile}
                  onChange={(event) => handleProfileChange("name", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
                />
              </label>

              <div className="grid grid-cols-3 gap-3">
                {[
                  ["Age", "age", "years"],
                  ["Height", "heightCm", "cm"],
                  ["Weight", "weightKg", "kg"],
                ].map(([label, key, unit]) => (
                  <label key={key} className="block">
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</span>
                    <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
                      <input
                        type="number"
                        value={profile[key as keyof Profile]}
                        disabled={!isEditingProfile}
                        onChange={(event) => handleProfileChange(key as keyof Profile, event.target.value)}
                        className="w-full bg-transparent text-lg font-extrabold text-slate-900 outline-none disabled:opacity-100"
                      />
                      <span className="text-xs font-semibold text-slate-400">{unit}</span>
                    </div>
                  </label>
                ))}
              </div>

              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">BMI</p>
                    <p className="mt-1 text-2xl font-extrabold text-emerald-950">{bmi.toFixed(1)}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-emerald-700">
                    {getBmiStatus(bmi)}
                  </span>
                </div>
              </div>

              {[
                ["Medication allergies", "medicationAllergies", ShieldAlert],
                ["Food allergies", "foodAllergies", Utensils],
                ["Chronic conditions", "chronicConditions", Activity],
              ].map(([label, key, Icon]) => (
                <label key={key as string} className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <Icon className="h-4 w-4" />
                    {label as string}
                  </span>
                  <textarea
                    value={profile[key as keyof Profile]}
                    disabled={!isEditingProfile}
                    onChange={(event) => handleProfileChange(key as keyof Profile, event.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white disabled:opacity-100"
                  />
                </label>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="grid gap-4">
            <MetricCard
              title="Sleep"
              value={`${dynamicHealth.sleep.durationHours}h`}
              detail={`${dynamicHealth.sleep.quality}% quality from ${dynamicHealth.sleep.bedTime} to ${dynamicHealth.sleep.wakeTime}.`}
              icon={<Moon className="h-5 w-5 text-indigo-700" />}
              tone="bg-indigo-50"
            />
            <MetricCard
              title="Stress"
              value={dynamicHealth.stress.level}
              detail={`HRV ${dynamicHealth.stress.hrvMs} ms, stress score ${dynamicHealth.stress.score}. Mood: ${dynamicHealth.stress.expression}.`}
              icon={<HeartPulse className="h-5 w-5 text-rose-700" />}
              tone="bg-rose-50"
            />
            <MetricCard
              title="PAI Score"
              value={`${dynamicHealth.pai.score}`}
              detail={`${dynamicHealth.pai.range} range toward a weekly target of ${dynamicHealth.pai.weeklyTarget}.`}
              icon={<Dumbbell className="h-5 w-5 text-emerald-700" />}
              tone="bg-emerald-50"
            />
            <MetricCard
              title="Calories"
              value={`${calorieBalance > 0 ? "+" : ""}${formatNumber.format(calorieBalance)}`}
              detail={`${formatNumber.format(dynamicHealth.calories.intake)} kcal in, ${formatNumber.format(dynamicHealth.calories.output)} kcal out.`}
              icon={<Utensils className="h-5 w-5 text-amber-700" />}
              tone="bg-amber-50"
            />
          </div>

          <div className="grid gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Sleep History</p>
                  <h3 className="text-xl font-extrabold text-slate-950">Quality trend</h3>
                </div>
                <Watch className="h-5 w-5 text-slate-400" />
              </div>
              <MiniBars data={dynamicHealth.sleep.history} max={100} colorClass="bg-indigo-500" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Stress History</p>
                  <h3 className="text-xl font-extrabold text-slate-950">HRV-based score</h3>
                </div>
                <Activity className="h-5 w-5 text-slate-400" />
              </div>
              <MiniBars data={dynamicHealth.stress.trend} max={70} colorClass="bg-rose-500" />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">PAI History</p>
                  <h3 className="text-xl font-extrabold text-slate-950">Weekly range</h3>
                </div>
                <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                  {Math.round(paiProgress)}%
                </div>
              </div>
              <MiniBars data={dynamicHealth.pai.history} max={100} colorClass="bg-emerald-500" />
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                    Calorie Intelligence
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Meal photo estimate</h2>
                </div>
                <Camera className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm leading-6 text-slate-500">
                Later this will upload a meal photo to an LLM vision endpoint. For now it uses a mock result.
              </p>
              <button
                type="button"
                onClick={analyzeMealPhoto}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-teal-700"
              >
                <Camera className="h-4 w-4" />
                Analyze Meal Photo
              </button>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                {mealPhotoStatus}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-500">Steps</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {formatNumber.format(dynamicHealth.calories.steps)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-500">Avg Heart Rate</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {dynamicHealth.calories.averageHeartRate} bpm
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                    Environment
                  </p>
                  <h2 className="mt-2 text-2xl font-extrabold text-slate-950">Current surroundings</h2>
                </div>
                <MapPin className="h-6 w-6 text-slate-400" />
              </div>

              <div className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-600">
                <MapPin className="h-4 w-4 text-teal-700" />
                {environment.location}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Wind className="h-4 w-4" />
                    PM 2.5
                  </div>
                  <p className="text-2xl font-extrabold text-slate-950">{environment.pm25}</p>
                  <p className="text-sm font-semibold text-emerald-700">{getPmLabel(environment.pm25)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Sun className="h-4 w-4" />
                    UV Index
                  </div>
                  <p className="text-2xl font-extrabold text-slate-950">{environment.uv}</p>
                  <p className="text-sm font-semibold text-amber-700">{getUvLabel(environment.uv)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Thermometer className="h-4 w-4" />
                    Temperature
                  </div>
                  <p className="text-2xl font-extrabold text-slate-950">{environment.temperature} C</p>
                  <p className="text-sm font-semibold text-slate-500">{environment.condition}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <AirVent className="h-4 w-4" />
                    Humidity
                  </div>
                  <p className="text-2xl font-extrabold text-slate-950">{environment.humidity}%</p>
                  <p className="text-sm font-semibold text-slate-500">Hydrate often</p>
                </div>
              </div>

              <div className="mt-5 divide-y divide-slate-100 rounded-xl border border-slate-200">
                {environment.forecast.map((item) => (
                  <div key={item.time} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-sm font-bold text-slate-500">{item.time}</span>
                    <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <CloudSun className="h-4 w-4 text-teal-700" />
                      {item.condition}
                    </span>
                    <span className="text-sm font-extrabold text-slate-950">{item.temp} C</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                  Interaction Intake
                </p>
                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">AI check-in prompts</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This is the future chat and voice collection layer. Values are stored locally for the mockup.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsVoiceActive((value) => !value)}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isVoiceActive
                    ? "bg-rose-600 text-white hover:bg-rose-700"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                <Mic className="h-4 w-4" />
                {isVoiceActive ? "Voice Listening" : "Start Voice"}
              </button>
            </div>

            <div className="grid gap-4">
              {[
                ["Primary healing goal", "goal", prompts[0]],
                ["Dietary preferences", "diet", prompts[1]],
                ["Recent mood", "feeling", prompts[2]],
                ["Extra notes", "notes", prompts[3]],
              ].map(([label, key, prompt]) => (
                <label key={key} className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700">
                    <MessageCircle className="h-4 w-4 text-teal-700" />
                    {label}
                  </span>
                  <p className="mb-2 text-xs font-semibold text-slate-400">{prompt}</p>
                  <textarea
                    value={interaction[key as keyof Interaction]}
                    onChange={(event) => handleInteractionChange(key as keyof Interaction, event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white"
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
              <span className="flex items-center gap-2 font-semibold">
                <Check className="h-4 w-4" />
                Ready to sync with user profile, wearable APIs, environment APIs, and chat history.
              </span>
              <Link
                href="/journey"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2 font-bold text-white transition hover:bg-teal-800"
              >
                Generate Journey
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
