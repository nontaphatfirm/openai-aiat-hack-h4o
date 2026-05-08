"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CloudSun,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
  UserRound,
} from "lucide-react";

type TodaySignals = {
  pm25Exposure: string;
  sleepHours: string;
  sleepQuality: number;
  workload: number;
  energy: number;
  foodPreferenceToday: string;
  voiceMoodNote: string;
};

type PassportForm = {
  name: string;
  age: string;
  city: string;
  district: string;
  dietStyle: string;
  conditions: string;
  medications: string;
  foodAllergies: string;
  todaySignals: TodaySignals;
};

const emptyForm: PassportForm = {
  name: "",
  age: "",
  city: "",
  district: "",
  dietStyle: "",
  conditions: "",
  medications: "",
  foodAllergies: "",
  todaySignals: {
    pm25Exposure: "",
    sleepHours: "",
    sleepQuality: 3,
    workload: 3,
    energy: 3,
    foodPreferenceToday: "",
    voiceMoodNote: "",
  },
};

const ratingLabels = {
  sleepQuality: ["Poor", "Light", "Okay", "Good", "Deep"],
  workload: ["Very low", "Low", "Moderate", "High", "Heavy"],
  energy: ["Drained", "Low", "Steady", "Good", "High"],
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "number";
  inputMode?: "text" | "numeric" | "decimal";
  required?: boolean;
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  inputMode = "text",
  required = false,
}: FieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <input
        type={type}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-12 w-full rounded-lg border border-slate-200 bg-white px-4 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
      />
    </label>
  );
}

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
};

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      <textarea
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
      />
    </label>
  );
}

type RatingFieldProps = {
  label: string;
  value: number;
  labels: string[];
  onChange: (value: number) => void;
};

function RatingField({ label, value, labels, onChange }: RatingFieldProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <span className="text-sm font-semibold text-slate-700">{label}</span>
        <span className="text-sm font-semibold text-teal-700">
          {value}/5 {labels[value - 1]}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="5"
        step="1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-teal-600"
      />
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>1</span>
        <span>3</span>
        <span>5</span>
      </div>
    </div>
  );
}

export default function PassportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PassportForm>(emptyForm);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const updateField = (field: keyof PassportForm, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const updateSignal = <Key extends keyof TodaySignals>(
    field: Key,
    value: TodaySignals[Key],
  ) => {
    setFormData((current) => ({
      ...current,
      todaySignals: {
        ...current.todaySignals,
        [field]: value,
      },
    }));
  };

  const loadProfile = async () => {
    setIsLoadingProfile(true);
    setError("");

    try {
      const response = await fetch("/api/profile", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("Unable to load profile");
      }

      const profile = (await response.json()) as PassportForm;
      setFormData(profile);
    } catch {
      setError("Could not auto-fill your passport. You can still fill it in manually.");
    } finally {
      setIsLoadingProfile(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    async function loadInitialProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });

        if (!response.ok) {
          throw new Error("Unable to load profile");
        }

        const profile = (await response.json()) as PassportForm;

        if (isActive) {
          setFormData(profile);
        }
      } catch {
        if (isActive) {
          setError(
            "Could not auto-fill your passport. You can still fill it in manually.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingProfile(false);
        }
      }
    }

    void loadInitialProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Unable to save profile");
      }

      localStorage.setItem("wellness-passport", JSON.stringify(formData));
      router.push("/journey");
    } catch {
      setError("Could not save the passport. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 font-sans sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-teal-200 hover:text-teal-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Link>

          <button
            type="button"
            onClick={loadProfile}
            disabled={isLoadingProfile}
            className="inline-flex items-center gap-2 rounded-lg border border-teal-200 bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-teal-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingProfile ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            )}
            Auto-fill from API
          </button>
        </div>

        <section className="mb-8 rounded-lg border border-teal-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Wellness Passport
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                Personalize today&apos;s nutrition plan
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-500">
                Core profile and daily signals are auto-filled from the profile
                API. You can edit anything before generating your journey.
              </p>
            </div>

            <div className="grid min-w-44 grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-sm">
              <div>
                <p className="font-bold text-slate-900">
                  {formData.todaySignals.energy}/5
                </p>
                <p className="text-slate-500">Energy</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">
                  {formData.todaySignals.sleepQuality}/5
                </p>
                <p className="text-slate-500">Sleep</p>
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                <UserRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Profile
                </h2>
                <p className="text-sm text-slate-500">
                  Auto-filled basics with editable health context.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField
                label="Name"
                value={formData.name}
                onChange={(value) => updateField("name", value)}
                placeholder="Your name"
                required
              />
              <TextField
                label="Age"
                type="number"
                inputMode="numeric"
                value={formData.age}
                onChange={(value) => updateField("age", value)}
                placeholder="32"
                required
              />
              <TextField
                label="City"
                value={formData.city}
                onChange={(value) => updateField("city", value)}
                placeholder="Bangkok"
              />
              <TextField
                label="District"
                value={formData.district}
                onChange={(value) => updateField("district", value)}
                placeholder="Pathum Wan"
              />
              <TextField
                label="Diet style"
                value={formData.dietStyle}
                onChange={(value) => updateField("dietStyle", value)}
                placeholder="Balanced, vegetarian, low sugar"
              />
              <TextField
                label="Conditions, comma separated"
                value={formData.conditions}
                onChange={(value) => updateField("conditions", value)}
                placeholder="fatigue, acid reflux, migraine"
              />
              <TextField
                label="Medications"
                value={formData.medications}
                onChange={(value) => updateField("medications", value)}
                placeholder="Type medications or none"
              />
              <TextField
                label="Food allergies"
                value={formData.foodAllergies}
                onChange={(value) => updateField("foodAllergies", value)}
                placeholder="Type allergies or none"
              />
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <CloudSun className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Today Signals
                </h2>
                <p className="text-sm text-slate-500">
                  Daily context for safer, more relevant food suggestions.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <TextField
                label="PM2.5 exposure"
                value={formData.todaySignals.pm25Exposure}
                onChange={(value) => updateSignal("pm25Exposure", value)}
                placeholder="Moderate, 34 ug/m3"
              />
              <TextField
                label="Sleep hours"
                type="number"
                inputMode="decimal"
                value={formData.todaySignals.sleepHours}
                onChange={(value) => updateSignal("sleepHours", value)}
                placeholder="7.5"
              />
              <RatingField
                label="Sleep quality"
                value={formData.todaySignals.sleepQuality}
                labels={ratingLabels.sleepQuality}
                onChange={(value) => updateSignal("sleepQuality", value)}
              />
              <RatingField
                label="Workload"
                value={formData.todaySignals.workload}
                labels={ratingLabels.workload}
                onChange={(value) => updateSignal("workload", value)}
              />
              <RatingField
                label="Energy"
                value={formData.todaySignals.energy}
                labels={ratingLabels.energy}
                onChange={(value) => updateSignal("energy", value)}
              />
              <TextField
                label="Food preference today"
                value={formData.todaySignals.foodPreferenceToday}
                onChange={(value) => updateSignal("foodPreferenceToday", value)}
                placeholder="Warm soup, spicy Thai, light meal"
              />
            </div>

            <div className="mt-5">
              <TextArea
                label="Voice/mood note"
                value={formData.todaySignals.voiceMoodNote}
                onChange={(value) => updateSignal("voiceMoodNote", value)}
                placeholder="Feeling tense from meetings, craving something comforting but not too heavy."
                rows={4}
              />
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              API-filled fields are suggestions only. Please review medical
              details before saving.
            </p>
            <button
              type="submit"
              disabled={isSaving || isLoadingProfile}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-teal-600 px-6 text-base font-bold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isSaving ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-5 w-5" aria-hidden="true" />
              )}
              Save Passport
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
