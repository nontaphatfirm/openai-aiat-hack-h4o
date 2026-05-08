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
  Loader2,
  MapPin,
  MessageCircle,
  Mic,
  Moon,
  Save,
  ShieldAlert,
  Sparkles,
  Sun,
  Thermometer,
  Upload,
  Utensils,
  Watch,
  Wind,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";

type Profile = {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
  medicationAllergies: string;
  foodAllergies: string;
  chronicConditions: string;
};

type DynamicHealth = {
  sleep: {
    durationHours: number;
    quality: number;
    bedTime: string;
    wakeTime: string;
    history: { day: string; duration: number; quality: number }[];
  };
  stress: {
    level: string;
    hrvMs: number;
    score: number;
    expression: string;
    trend: { day: string; value: number }[];
  };
  pai: {
    score: number;
    range: string;
    weeklyTarget: number;
    history: { day: string; value: number }[];
  };
  calories: {
    intake: number;
    output: number;
    steps: number;
    averageHeartRate: number;
    mealEstimate: string;
    lastMealKcal: number;
  };
};

type Environment = {
  location: string;
  locationName?: string;
  pm25: number;
  uv: number;
  temperature: number;
  humidity: number;
  condition: string;
  source: string;
  forecast: { time: string; temp: number; condition: string }[];
};

type Interaction = {
  goal: string;
  diet: string;
  feeling: string;
  notes: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "bot";
  text: string;
};

type PassportData = {
  profile: Profile;
  dynamicHealth: DynamicHealth;
  environment: Environment;
  interaction: Interaction;
  chatMessages: ChatMessage[];
  mealPhotoStatus: string;
};

type FoodAnalysis = {
  foodName: string;
  estimatedCalories: number;
};

type ApiErrorResponse = {
  error: string;
};

type ExtractProfileResponse = {
  profile: Profile;
};

type SpeechRecognitionResultListLike = {
  length: number;
  [index: number]: {
    length: number;
    [index: number]: {
      transcript: string;
    };
  };
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  start: () => void;
  stop: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onresult: ((event: { results: SpeechRecognitionResultListLike }) => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const STORAGE_KEY = "wellness_passport_data";

const defaultDynamicHealth: DynamicHealth = {
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
    lastMealKcal: 610,
  },
};

const defaultEnvironment: Environment = {
  location: "Pathum Wan, Bangkok",
  locationName: "Pathum Wan, Bangkok",
  pm25: 18,
  uv: 7,
  temperature: 32,
  humidity: 64,
  condition: "Partly cloudy",
  source: "Mock environment",
  forecast: [
    { time: "09:00", temp: 30, condition: "Clear" },
    { time: "12:00", temp: 33, condition: "High UV" },
    { time: "15:00", temp: 34, condition: "Humid" },
    { time: "18:00", temp: 31, condition: "Breezy" },
  ],
};

const defaultProfile: Profile = {
  name: "Maya Chen",
  age: 32,
  heightCm: 168,
  weightKg: 62,
  bmi: 22.0,
  medicationAllergies: "Penicillin",
  foodAllergies: "Shellfish, peanuts",
  chronicConditions: "Mild asthma, seasonal allergies",
};

const defaultInteraction: Interaction = {
  goal: "Improve sleep quality and reduce stress",
  diet: "High-protein, low added sugar, no shellfish",
  feeling: "A little tired after work, but mentally calmer than last week.",
  notes: "Prefers quick meals and evening stretching routines.",
};

const defaultChatMessages: ChatMessage[] = [
  {
    id: "bot-welcome",
    role: "bot",
    text: "Hi Maya, I can keep notes for today's wellness context. What changed today?",
  },
];

const prompts = [
  "What is your primary healing goal?",
  "Any dietary preferences?",
  "How are you feeling lately?",
  "Any symptoms that changed today?",
];

const formatNumber = new Intl.NumberFormat("en-US");

function calculateBmi(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  if (!heightM || !weightKg) return 0;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function getBmiStatus(bmi: number) {
  if (!bmi) return "Needs data";
  if (bmi < 18.5) return "Underweight";
  if (bmi < 23) return "Healthy";
  if (bmi < 25) return "Monitor";
  return "High";
}

function getPmLabel(pm25: number) {
  if (pm25 <= 15) return "Good";
  if (pm25 <= 50) return "Moderate";
  return "Unhealthy";
}

function getPmTone(pm25: number) {
  if (pm25 <= 15) return "text-emerald-700";
  if (pm25 <= 50) return "text-amber-700";
  return "text-rose-700";
}

function getUvLabel(uv: number) {
  if (uv <= 2) return "Low";
  if (uv <= 5) return "Moderate";
  if (uv <= 7) return "High";
  return "Very high";
}

function createForecast(baseTemp: number): Environment["forecast"] {
  return [
    { time: "09:00", temp: Math.max(26, baseTemp - 3), condition: "Clear" },
    { time: "12:00", temp: baseTemp, condition: "High UV" },
    { time: "15:00", temp: baseTemp + 1, condition: "Humid" },
    { time: "18:00", temp: Math.max(26, baseTemp - 2), condition: "Breezy" },
  ];
}

function createFallbackEnvironment(): Environment {
  return {
    ...defaultEnvironment,
    location: "Bangkok",
    locationName: "Bangkok",
    pm25: 45,
    uv: 7,
    temperature: 33,
    humidity: 66,
    condition: "Warm and hazy",
    source: "Fallback mock data",
    forecast: createForecast(33),
  };
}

function createInitialPassportData(): PassportData {
  return {
    profile: { ...defaultProfile },
    dynamicHealth: {
      ...defaultDynamicHealth,
      sleep: {
        ...defaultDynamicHealth.sleep,
        history: [...defaultDynamicHealth.sleep.history],
      },
      stress: {
        ...defaultDynamicHealth.stress,
        trend: [...defaultDynamicHealth.stress.trend],
      },
      pai: {
        ...defaultDynamicHealth.pai,
        history: [...defaultDynamicHealth.pai.history],
      },
      calories: { ...defaultDynamicHealth.calories },
    },
    environment: {
      ...defaultEnvironment,
      forecast: [...defaultEnvironment.forecast],
    },
    interaction: { ...defaultInteraction },
    chatMessages: [...defaultChatMessages],
    mealPhotoStatus: "Ready for meal photo analysis",
  };
}

function mergeStoredPassportData(storedData: Partial<PassportData>): PassportData {
  const initialData = createInitialPassportData();
  return {
    ...initialData,
    ...storedData,
    profile: {
      ...initialData.profile,
      ...storedData.profile,
      bmi: calculateBmi(
        storedData.profile?.heightCm ?? initialData.profile.heightCm,
        storedData.profile?.weightKg ?? initialData.profile.weightKg,
      ),
    },
    dynamicHealth: {
      ...initialData.dynamicHealth,
      ...storedData.dynamicHealth,
      sleep: {
        ...initialData.dynamicHealth.sleep,
        ...storedData.dynamicHealth?.sleep,
        history: storedData.dynamicHealth?.sleep?.history ?? initialData.dynamicHealth.sleep.history,
      },
      stress: {
        ...initialData.dynamicHealth.stress,
        ...storedData.dynamicHealth?.stress,
        trend: storedData.dynamicHealth?.stress?.trend ?? initialData.dynamicHealth.stress.trend,
      },
      pai: {
        ...initialData.dynamicHealth.pai,
        ...storedData.dynamicHealth?.pai,
        history: storedData.dynamicHealth?.pai?.history ?? initialData.dynamicHealth.pai.history,
      },
      calories: {
        ...initialData.dynamicHealth.calories,
        ...storedData.dynamicHealth?.calories,
      },
    },
    environment: {
      ...initialData.environment,
      ...storedData.environment,
      forecast: storedData.environment?.forecast ?? initialData.environment.forecast,
    },
    interaction: {
      ...initialData.interaction,
      ...storedData.interaction,
    },
    chatMessages: storedData.chatMessages?.length ? storedData.chatMessages : initialData.chatMessages,
    mealPhotoStatus: storedData.mealPhotoStatus ?? initialData.mealPhotoStatus,
  };
}

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
    if (isApiErrorResponse(payload)) {
      throw new Error(payload.error);
    }

    throw new Error("Request failed.");
  }

  return payload as T;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Unable to read image file."));
    };
    reader.onerror = () => reject(new Error("Unable to read image file."));
    reader.readAsDataURL(file);
  });
}

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;

  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
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
  icon: ReactNode;
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
  const mealCameraInputRef = useRef<HTMLInputElement>(null);
  const mealUploadInputRef = useRef<HTMLInputElement>(null);
  const [passportData, setPassportData] = useState<PassportData>(() => createInitialPassportData());
  const [profileDraft, setProfileDraft] = useState<Profile>(() => ({ ...defaultProfile }));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [isUpdatingProfileFromVoice, setIsUpdatingProfileFromVoice] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoadingEnvironment, setIsLoadingEnvironment] = useState(false);
  const [environmentError, setEnvironmentError] = useState<string | null>(null);
  const [isAnalyzingMeal, setIsAnalyzingMeal] = useState(false);
  const [mealPhotoError, setMealPhotoError] = useState<string | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hydrateTimer = window.setTimeout(() => {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);
      if (storedValue) {
        try {
          const restoredData = mergeStoredPassportData(JSON.parse(storedValue) as Partial<PassportData>);
          setPassportData(restoredData);
          setProfileDraft(restoredData.profile);
        } catch {
          const freshData = createInitialPassportData();
          setPassportData(freshData);
          setProfileDraft(freshData.profile);
        }
      }

      setHasHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrateTimer);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(passportData));
  }, [hasHydrated, passportData]);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;

    let isCancelled = false;

    const applyFallbackEnvironment = (message: string) => {
      if (isCancelled) return;

      setEnvironmentError(message);
      setPassportData((current) => ({
        ...current,
        environment: createFallbackEnvironment(),
      }));
      setIsLoadingEnvironment(false);
    };

    const fetchEnvironment = async (position: GeolocationPosition) => {
      try {
        const params = new URLSearchParams({
          lat: String(position.coords.latitude),
          lon: String(position.coords.longitude),
        });
        const response = await fetch(`/api/environment?${params.toString()}`);
        const environmentData = await readJsonResponse<Environment>(response);

        if (isCancelled) return;

        setPassportData((current) => ({
          ...current,
          environment: {
            ...environmentData,
            forecast: environmentData.forecast.length ? environmentData.forecast : createForecast(environmentData.temperature),
          },
        }));
        setEnvironmentError(null);
        setIsLoadingEnvironment(false);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unable to load environment data.";
        applyFallbackEnvironment(message);
      }
    };

    const environmentTimer = window.setTimeout(() => {
      setIsLoadingEnvironment(true);

      if (!("geolocation" in navigator)) {
        applyFallbackEnvironment("Location is not supported by this browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          void fetchEnvironment(position);
        },
        (error) => {
          applyFallbackEnvironment(error.message || "Location permission was denied.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(environmentTimer);
    };
  }, [hasHydrated]);

  const { dynamicHealth, environment, interaction, profile } = passportData;
  const visibleProfile = isEditingProfile ? profileDraft : profile;
  const currentLocationName = environment.locationName ?? environment.location;

  const calorieBalance = dynamicHealth.calories.intake - dynamicHealth.calories.output;
  const paiProgress = Math.min(100, (dynamicHealth.pai.score / dynamicHealth.pai.weeklyTarget) * 100);

  const draftBmi = useMemo(
    () => calculateBmi(profileDraft.heightCm, profileDraft.weightKg),
    [profileDraft.heightCm, profileDraft.weightKg],
  );

  const updatePassportData = (updater: (current: PassportData) => PassportData) => {
    setPassportData(updater);
  };

  const handleProfileChange = (key: keyof Profile, value: string) => {
    setProfileDraft((current) => ({
      ...current,
      [key]: key === "age" || key === "heightCm" || key === "weightKg" ? Number(value) : value,
    }));
  };

  const handleProfileButtonClick = () => {
    if (!isEditingProfile) {
      setProfileDraft(profile);
      setIsEditingProfile(true);
      return;
    }

    const savedProfile = {
      ...profileDraft,
      bmi: calculateBmi(profileDraft.heightCm, profileDraft.weightKg),
    };
    updatePassportData((current) => ({
      ...current,
      profile: savedProfile,
    }));
    setProfileDraft(savedProfile);
    setIsEditingProfile(false);
  };

  const handleInteractionChange = (key: keyof Interaction, value: string) => {
    updatePassportData((current) => ({
      ...current,
      interaction: {
        ...current.interaction,
        [key]: value,
      },
    }));
  };

  const triggerMealPicker = (mode: "camera" | "upload") => {
    if (isAnalyzingMeal) return;
    const input = mode === "camera" ? mealCameraInputRef.current : mealUploadInputRef.current;
    input?.click();
  };

  const analyzeMealPhoto = async (file: File) => {
    if (isAnalyzingMeal) return;

    setIsAnalyzingMeal(true);
    setMealPhotoError(null);
    updatePassportData((current) => ({
      ...current,
      mealPhotoStatus: "AI is analyzing your meal photo...",
    }));

    try {
      const image = await readFileAsDataUrl(file);
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image }),
      });
      const analysis = await readJsonResponse<FoodAnalysis>(response);
      const foodName = analysis.foodName.trim() || "Unknown food";
      const estimatedCalories = Math.max(0, Math.round(analysis.estimatedCalories));

      updatePassportData((current) => ({
        ...current,
        mealPhotoStatus: `Detected: ${foodName}, ${formatNumber.format(estimatedCalories)} kcal`,
        dynamicHealth: {
          ...current.dynamicHealth,
          calories: {
            ...current.dynamicHealth.calories,
            intake: estimatedCalories,
            mealEstimate: foodName,
            lastMealKcal: estimatedCalories,
          },
        },
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to analyze this image.";
      setMealPhotoError(message);
      updatePassportData((current) => ({
        ...current,
        mealPhotoStatus: "Meal photo analysis failed. Try another image.",
      }));
    } finally {
      setIsAnalyzingMeal(false);
    }
  };

  const handleMealPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMealPhotoError("Please choose an image file.");
      return;
    }

    void analyzeMealPhoto(file);
  };

  const handleVoiceCommand = () => {
    if (isVoiceActive || isUpdatingProfileFromVoice) return;

    const SpeechRecognition = getSpeechRecognitionConstructor();

    if (!SpeechRecognition) {
      setVoiceError("Voice recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsVoiceActive(true);
      setVoiceError(null);
      setVoiceTranscript("");
    };

    recognition.onerror = (event) => {
      setVoiceError(event.error === "not-allowed" ? "Microphone permission was denied." : "Voice recognition failed.");
      setIsVoiceActive(false);
      setIsUpdatingProfileFromVoice(false);
    };

    recognition.onend = () => {
      setIsVoiceActive(false);
    };

    recognition.onresult = (event) => {
      const transcriptParts: string[] = [];

      for (let resultIndex = 0; resultIndex < event.results.length; resultIndex += 1) {
        const result = event.results[resultIndex];
        for (let itemIndex = 0; itemIndex < result.length; itemIndex += 1) {
          transcriptParts.push(result[itemIndex].transcript);
        }
      }

      const transcript = transcriptParts.join(" ").trim();
      setVoiceTranscript(transcript);

      if (!transcript) {
        setVoiceError("No speech was detected.");
        return;
      }

      setIsUpdatingProfileFromVoice(true);

      void (async () => {
        try {
          const response = await fetch("/api/extract-profile", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: transcript,
              currentProfile: passportData.profile,
            }),
          });
          const { profile: updatedProfile } = await readJsonResponse<ExtractProfileResponse>(response);
          const savedProfile = {
            ...updatedProfile,
            bmi: calculateBmi(updatedProfile.heightCm, updatedProfile.weightKg),
          };

          updatePassportData((current) => ({
            ...current,
            profile: savedProfile,
          }));
          setProfileDraft(savedProfile);
          setIsEditingProfile(false);
          setVoiceError(null);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unable to update profile from voice.";
          setVoiceError(message);
        } finally {
          setIsUpdatingProfileFromVoice(false);
        }
      })();
    };

    try {
      recognition.start();
    } catch {
      setVoiceError("Unable to start microphone capture.");
      setIsVoiceActive(false);
    }
  };

  const appendChatMessage = (message: ChatMessage) => {
    updatePassportData((current) => ({
      ...current,
      chatMessages: [...current.chatMessages, message],
    }));
  };

  const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const messageText = chatInput.trim();
    if (!messageText || isBotTyping) return;

    appendChatMessage({
      id: `user-${Date.now()}`,
      role: "user",
      text: messageText,
    });
    setChatInput("");
    setIsBotTyping(true);

    window.setTimeout(() => {
      appendChatMessage({
        id: `bot-${Date.now()}`,
        role: "bot",
        text: "Noted! I have updated your daily context. How else can I help?",
      });
      setIsBotTyping(false);
    }, 1000);
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
                Live environment, LLM intake, local-first profile
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
                onClick={handleProfileButtonClick}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                aria-label={isEditingProfile ? "Save profile" : "Edit profile"}
              >
                {isEditingProfile ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                {isEditingProfile ? "Save" : "Edit"}
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Name</span>
                {isEditingProfile ? (
                  <input
                    value={profileDraft.name}
                    onChange={(event) => handleProfileChange("name", event.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
                  />
                ) : (
                  <div className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900">
                    {profile.name}
                  </div>
                )}
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
                        value={visibleProfile[key as keyof Profile]}
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
                    <p className="mt-1 text-2xl font-extrabold text-emerald-950">
                      {(isEditingProfile ? draftBmi : profile.bmi).toFixed(1)}
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-emerald-700">
                    {getBmiStatus(isEditingProfile ? draftBmi : profile.bmi)}
                  </span>
                </div>
              </div>

              {[
                ["Medication allergies", "medicationAllergies", ShieldAlert],
                ["Food allergies", "foodAllergies", Utensils],
                ["Underlying conditions", "chronicConditions", Activity],
              ].map(([label, key, Icon]) => (
                <label key={key as string} className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-400">
                    <Icon className="h-4 w-4" />
                    {label as string}
                  </span>
                  {isEditingProfile ? (
                    <textarea
                      value={profileDraft[key as keyof Profile]}
                      onChange={(event) => handleProfileChange(key as keyof Profile, event.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white"
                    />
                  ) : (
                    <div className="min-h-20 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium leading-6 text-slate-700">
                      {profile[key as keyof Profile]}
                    </div>
                  )}
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
                Upload or capture a meal photo and the LLM vision endpoint will estimate the dish and calories.
              </p>
              <input
                ref={mealCameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleMealPhotoChange}
                className="hidden"
              />
              <input
                ref={mealUploadInputRef}
                type="file"
                accept="image/*"
                onChange={handleMealPhotoChange}
                className="hidden"
              />
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => triggerMealPicker("camera")}
                  disabled={isAnalyzingMeal}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                >
                  {isAnalyzingMeal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  Take a photo
                </button>
                <button
                  type="button"
                  onClick={() => triggerMealPicker("upload")}
                  disabled={isAnalyzingMeal}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:text-slate-400"
                >
                  {isAnalyzingMeal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Upload
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                {passportData.mealPhotoStatus}
              </div>
              {mealPhotoError ? (
                <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
                  {mealPhotoError}
                </div>
              ) : null}
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-500">Intake</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {formatNumber.format(dynamicHealth.calories.intake)} kcal
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-500">Steps</p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {formatNumber.format(dynamicHealth.calories.steps)}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-4 sm:col-span-2">
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
                <span className="text-slate-700">{currentLocationName}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
                  {isLoadingEnvironment ? "Loading live data..." : environment.source}
                </span>
              </div>
              {environmentError ? (
                <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                  {environmentError}
                </div>
              ) : null}

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 p-4">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Wind className="h-4 w-4" />
                    PM 2.5
                  </div>
                  <p className="text-2xl font-extrabold text-slate-950">{environment.pm25}</p>
                  <p className={`text-sm font-semibold ${getPmTone(environment.pm25)}`}>
                    {getPmLabel(environment.pm25)}
                  </p>
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
                  <p className="text-2xl font-extrabold text-slate-950">{environment.temperature}&deg;C</p>
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
                    <span className="text-sm font-extrabold text-slate-950">{item.temp}&deg;C</span>
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
                  Voice commands update the local profile through an LLM extraction endpoint, while chat stays as-is.
                </p>
              </div>
              <button
                type="button"
                onClick={handleVoiceCommand}
                disabled={isVoiceActive || isUpdatingProfileFromVoice}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition ${
                  isVoiceActive || isUpdatingProfileFromVoice
                    ? "bg-rose-600 text-white disabled:cursor-not-allowed"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {isVoiceActive || isUpdatingProfileFromVoice ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
                {isUpdatingProfileFromVoice ? "Updating Profile" : isVoiceActive ? "Voice Listening" : "Start Voice"}
              </button>
            </div>
            {voiceTranscript || voiceError ? (
              <div
                className={`mb-5 rounded-xl border p-3 text-sm font-semibold ${
                  voiceError
                    ? "border-rose-200 bg-rose-50 text-rose-700"
                    : "border-teal-200 bg-teal-50 text-teal-900"
                }`}
              >
                {voiceError ?? `Heard: ${voiceTranscript}`}
              </div>
            ) : null}

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

            <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-700">
                <MessageCircle className="h-4 w-4 text-teal-700" />
                Mock chat
              </div>
              <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
                {passportData.chatMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-medium leading-6 ${
                        message.role === "user"
                          ? "bg-teal-700 text-white"
                          : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isBotTyping ? (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500">
                      <Loader2 className="h-4 w-4 animate-spin text-teal-700" />
                      AI is typing...
                    </div>
                  </div>
                ) : null}
              </div>
              <form onSubmit={handleChatSubmit} className="mt-4 flex gap-2">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  placeholder="Type a message..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isBotTyping}
                  className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  Send
                </button>
              </form>
            </div>

            <div className="mt-6 flex flex-col gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900">
              <span className="flex items-center gap-2 font-semibold">
                <Check className="h-4 w-4" />
                Ready to sync with user profile, wearable APIs, environment APIs, and chat history.
              </span>
              <Link
                href="/diet"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2 font-bold text-white transition hover:bg-teal-800"
              >
                Generate Diet Plan
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
