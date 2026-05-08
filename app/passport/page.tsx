"use client";

import {
  Activity,
  AirVent,
  Camera,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
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
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";

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
    [index: number]: { transcript: string };
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
  location: "Khu Khot, Pathum Thani",
  locationName: "Khu Khot, Pathum Thani",
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
  if (pm25 <= 15) return "text-emerald-600";
  if (pm25 <= 50) return "text-amber-600";
  return "text-rose-600";
}

function getPmBg(pm25: number) {
  if (pm25 <= 15) return "bg-emerald-50 border-emerald-200";
  if (pm25 <= 50) return "bg-amber-50 border-amber-200";
  return "bg-rose-50 border-rose-200";
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
    location: "Khu Khot, Pathum Thani",
    locationName: "Khu Khot, Pathum Thani",
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
      sleep: { ...defaultDynamicHealth.sleep, history: [...defaultDynamicHealth.sleep.history] },
      stress: { ...defaultDynamicHealth.stress, trend: [...defaultDynamicHealth.stress.trend] },
      pai: { ...defaultDynamicHealth.pai, history: [...defaultDynamicHealth.pai.history] },
      calories: { ...defaultDynamicHealth.calories },
    },
    environment: { ...defaultEnvironment, forecast: [...defaultEnvironment.forecast] },
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
      calories: { ...initialData.dynamicHealth.calories, ...storedData.dynamicHealth?.calories },
    },
    environment: {
      ...initialData.environment,
      ...storedData.environment,
      forecast: storedData.environment?.forecast ?? initialData.environment.forecast,
    },
    interaction: { ...initialData.interaction, ...storedData.interaction },
    chatMessages: storedData.chatMessages?.length ? storedData.chatMessages : initialData.chatMessages,
    mealPhotoStatus: storedData.mealPhotoStatus ?? initialData.mealPhotoStatus,
  };
}

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return typeof value === "object" && value !== null && "error" in value && typeof (value as ApiErrorResponse).error === "string";
}

async function readJsonResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as unknown;
  if (!response.ok) {
    if (isApiErrorResponse(payload)) throw new Error(payload.error);
    throw new Error("Request failed.");
  }
  return payload as T;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") { resolve(reader.result); return; }
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

// Taller bar chart with value labels
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
    <div className="flex h-44 items-end gap-1.5">
      {data.map((point) => {
        const value = point.value ?? point.quality ?? point.duration ?? 0;
        const pct = Math.max(6, (value / max) * 100);
        return (
          <div key={point.day} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[10px] font-bold text-slate-600">{value}</span>
            <div className="relative flex h-32 w-full items-end overflow-hidden rounded-xl bg-slate-100">
              <div
                className={`w-full rounded-xl transition-all duration-500 ${colorClass}`}
                style={{ height: `${pct}%` }}
                title={`${point.day}: ${value}`}
              />
            </div>
            <span className="text-[10px] font-medium text-slate-400">{point.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function HealthClickCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  accentBg,
  accentText,
  onClick,
}: {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: ReactNode;
  accentBg: string;
  accentText: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-start w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-left transition-all hover:shadow-md hover:border-slate-200 active:scale-[0.97]"
    >
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentBg} mb-3`}>
        {icon}
      </div>
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{title}</p>
      <p className={`mt-1 text-xl font-extrabold leading-tight ${accentText}`}>
        {value}
        {unit && <span className="text-sm font-semibold text-slate-400 ml-1">{unit}</span>}
      </p>
      {subtitle && (
        <p className="mt-1 text-[11px] text-slate-400 leading-tight line-clamp-1">{subtitle}</p>
      )}
      <div className="mt-3 flex items-center gap-1 text-[10px] font-semibold text-teal-600">
        <span>Details</span>
        <ChevronRight className="h-3 w-3" />
      </div>
    </button>
  );
}

// Bottom-sheet modal constrained to phone width
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px]">
          <div className="flex max-h-[82dvh] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl">
            {/* Pull indicator */}
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-5 pb-3 pt-1">
              <h3 className="text-lg font-extrabold text-slate-950">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-full p-2 hover:bg-slate-100 transition"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            {/* Scrollable body */}
            <div className="overflow-y-auto px-5 pb-8 flex-1">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PassportPage() {
  const mealCameraInputRef = useRef<HTMLInputElement>(null);
  const mealUploadInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"sleep" | "stress" | "pai" | "calories" | "environment" | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatVoiceActive, setIsChatVoiceActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const restored = mergeStoredPassportData(JSON.parse(stored) as Partial<PassportData>);
          setPassportData(restored);
          setProfileDraft(restored.profile);
        } catch {
          const fresh = createInitialPassportData();
          setPassportData(fresh);
          setProfileDraft(fresh.profile);
        }
      }
      setHasHydrated(true);
    }, 0);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(passportData));
  }, [hasHydrated, passportData]);

  useEffect(() => {
    if (!hasHydrated || typeof window === "undefined") return;
    let cancelled = false;

    const fallback = (msg: string) => {
      if (cancelled) return;
      setEnvironmentError(msg);
      setPassportData((c) => ({ ...c, environment: createFallbackEnvironment() }));
      setIsLoadingEnvironment(false);
    };

    const fetchEnv = async (pos: GeolocationPosition) => {
      try {
        const params = new URLSearchParams({ lat: String(pos.coords.latitude), lon: String(pos.coords.longitude) });
        const res = await fetch(`/api/environment?${params.toString()}`);
        const data = await readJsonResponse<Environment>(res);
        if (cancelled) return;
        setPassportData((c) => ({
          ...c,
          environment: { ...data, forecast: data.forecast.length ? data.forecast : createForecast(data.temperature) },
        }));
        setEnvironmentError(null);
        setIsLoadingEnvironment(false);
      } catch (err) {
        fallback(err instanceof Error ? err.message : "Unable to load environment data.");
      }
    };

    const t = window.setTimeout(() => {
      setIsLoadingEnvironment(true);
      if (!("geolocation" in navigator)) { fallback("Location not supported."); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => { void fetchEnv(pos); },
        (err) => { fallback(err.message || "Location permission denied."); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }, 0);

    return () => { cancelled = true; window.clearTimeout(t); };
  }, [hasHydrated]);

  useEffect(() => {
    if (isChatOpen) chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [passportData.chatMessages, isChatOpen, isBotTyping]);

  const { dynamicHealth, environment, interaction, profile } = passportData;
  const visibleProfile = isEditingProfile ? profileDraft : profile;
  const environmentLocation = environment.locationName ?? environment.location;
  const calorieBalance = dynamicHealth.calories.intake - dynamicHealth.calories.output;
  const paiProgress = Math.min(100, (dynamicHealth.pai.score / dynamicHealth.pai.weeklyTarget) * 100);

  const draftBmi = useMemo(
    () => calculateBmi(profileDraft.heightCm, profileDraft.weightKg),
    [profileDraft.heightCm, profileDraft.weightKg],
  );

  const updatePassportData = (updater: (c: PassportData) => PassportData) => setPassportData(updater);

  const handleProfileChange = (key: keyof Profile, value: string) => {
    setProfileDraft((c) => ({ ...c, [key]: key === "age" || key === "heightCm" || key === "weightKg" ? Number(value) : value }));
  };

  const handleProfileButtonClick = () => {
    if (!isEditingProfile) { setProfileDraft(profile); setIsEditingProfile(true); return; }
    const saved = { ...profileDraft, bmi: calculateBmi(profileDraft.heightCm, profileDraft.weightKg) };
    updatePassportData((c) => ({ ...c, profile: saved }));
    setProfileDraft(saved);
    setIsEditingProfile(false);
  };

  const handleInteractionChange = (key: keyof Interaction, value: string) => {
    updatePassportData((c) => ({ ...c, interaction: { ...c.interaction, [key]: value } }));
  };

  const triggerMealPicker = (mode: "camera" | "upload") => {
    if (isAnalyzingMeal) return;
    (mode === "camera" ? mealCameraInputRef : mealUploadInputRef).current?.click();
  };

  const analyzeMealPhoto = async (file: File) => {
    if (isAnalyzingMeal) return;
    setIsAnalyzingMeal(true);
    setMealPhotoError(null);
    updatePassportData((c) => ({ ...c, mealPhotoStatus: "AI is analyzing your meal photo..." }));
    try {
      const image = await readFileAsDataUrl(file);
      const res = await fetch("/api/analyze-food", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ image }) });
      const analysis = await readJsonResponse<FoodAnalysis>(res);
      const foodName = analysis.foodName.trim() || "Unknown food";
      const kcal = Math.max(0, Math.round(analysis.estimatedCalories));
      updatePassportData((c) => ({
        ...c,
        mealPhotoStatus: `Detected: ${foodName}, ${formatNumber.format(kcal)} kcal`,
        dynamicHealth: { ...c.dynamicHealth, calories: { ...c.dynamicHealth.calories, intake: kcal, mealEstimate: foodName, lastMealKcal: kcal } },
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unable to analyze this image.";
      setMealPhotoError(msg);
      updatePassportData((c) => ({ ...c, mealPhotoStatus: "Meal photo analysis failed. Try another image." }));
    } finally {
      setIsAnalyzingMeal(false);
    }
  };

  const handleMealPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) { setMealPhotoError("Please choose an image file."); return; }
    void analyzeMealPhoto(file);
  };

  const handleVoiceCommand = () => {
    if (isVoiceActive || isUpdatingProfileFromVoice) return;
    const SR = getSpeechRecognitionConstructor();
    if (!SR) { setVoiceError("Voice recognition is not supported in this browser."); return; }
    const r = new SR();
    r.lang = "en-US"; r.interimResults = false; r.continuous = false;
    r.onstart = () => { setIsVoiceActive(true); setVoiceError(null); setVoiceTranscript(""); };
    r.onerror = (e) => { setVoiceError(e.error === "not-allowed" ? "Microphone permission was denied." : "Voice recognition failed."); setIsVoiceActive(false); setIsUpdatingProfileFromVoice(false); };
    r.onend = () => setIsVoiceActive(false);
    r.onresult = (e) => {
      const parts: string[] = [];
      for (let i = 0; i < e.results.length; i++) for (let j = 0; j < e.results[i].length; j++) parts.push(e.results[i][j].transcript);
      const transcript = parts.join(" ").trim();
      setVoiceTranscript(transcript);
      if (!transcript) { setVoiceError("No speech detected."); return; }
      setIsUpdatingProfileFromVoice(true);
      void (async () => {
        try {
          const res = await fetch("/api/extract-profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: transcript, currentProfile: passportData.profile }) });
          const { profile: updated } = await readJsonResponse<ExtractProfileResponse>(res);
          const saved = { ...updated, bmi: calculateBmi(updated.heightCm, updated.weightKg) };
          updatePassportData((c) => ({ ...c, profile: saved }));
          setProfileDraft(saved); setIsEditingProfile(false); setVoiceError(null);
        } catch (err) {
          setVoiceError(err instanceof Error ? err.message : "Unable to update profile from voice.");
        } finally { setIsUpdatingProfileFromVoice(false); }
      })();
    };
    try { r.start(); } catch { setVoiceError("Unable to start microphone capture."); setIsVoiceActive(false); }
  };

  const appendChat = (msg: ChatMessage) => updatePassportData((c) => ({ ...c, chatMessages: [...c.chatMessages, msg] }));

  const handleChatSubmit = () => {
    const text = chatInput.trim();
    if (!text || isBotTyping) return;
    appendChat({ id: `user-${Date.now()}`, role: "user", text });
    setChatInput("");
    setIsBotTyping(true);
    window.setTimeout(() => {
      appendChat({ id: `bot-${Date.now()}`, role: "bot", text: "Noted! I have updated your daily context. How else can I help?" });
      setIsBotTyping(false);
    }, 1000);
  };

  const handleChatVoice = () => {
    if (isChatVoiceActive) return;
    const SR = getSpeechRecognitionConstructor();
    if (!SR) return;
    const r = new SR();
    r.lang = "en-US"; r.interimResults = false; r.continuous = false;
    r.onstart = () => setIsChatVoiceActive(true);
    r.onend = () => setIsChatVoiceActive(false);
    r.onerror = () => setIsChatVoiceActive(false);
    r.onresult = (e) => {
      const parts: string[] = [];
      for (let i = 0; i < e.results.length; i++) for (let j = 0; j < e.results[i].length; j++) parts.push(e.results[i][j].transcript);
      setChatInput(parts.join(" ").trim());
    };
    try { r.start(); } catch { setIsChatVoiceActive(false); }
  };

  return (
    <main className="min-h-full bg-slate-50 pb-24 font-sans">
      {/* Compact sticky header — replaces the old full header section */}
      <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Health Passport</p>
            <p className="text-base font-extrabold text-slate-950">{profile.name}</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-2xl bg-teal-50 px-3 py-1.5">
            <HeartPulse className="h-3.5 w-3.5 text-teal-700" />
            <span className="text-xs font-bold text-teal-700">82% Readiness</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 px-4 pt-4">
        {/* 1. Collapsible Static Profile */}
        <section>
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setIsProfileOpen((p) => !p)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">Static Profile</p>
                <p className="mt-0.5 text-base font-extrabold text-slate-950">Baseline health</p>
                {!isProfileOpen && (
                  <p className="mt-0.5 text-xs text-slate-400">
                    BMI {profile.bmi.toFixed(1)} · {getBmiStatus(profile.bmi)} · Age {profile.age}
                  </p>
                )}
              </div>
              <div className="flex-shrink-0 rounded-full bg-slate-100 p-1.5">
                {isProfileOpen ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-600" />}
              </div>
            </button>

            {isProfileOpen && (
              <div className="border-t border-slate-100 px-5 pb-5">
                <div className="mt-4 mb-5 flex items-center justify-between">
                  <p className="text-xs text-slate-400">Tap Edit to update your info</p>
                  <button
                    type="button"
                    onClick={handleProfileButtonClick}
                    className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-bold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                    aria-label={isEditingProfile ? "Save profile" : "Edit profile"}
                  >
                    {isEditingProfile ? <Save className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
                    {isEditingProfile ? "Save" : "Edit"}
                  </button>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Name</span>
                    {isEditingProfile ? (
                      <input
                        value={profileDraft.name}
                        onChange={(e) => handleProfileChange("name", e.target.value)}
                        className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900 outline-none transition focus:border-teal-400 focus:bg-white"
                      />
                    ) : (
                      <div className="mt-1 w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-900">
                        {profile.name}
                      </div>
                    )}
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {([["Age", "age", "yr"], ["Height", "heightCm", "cm"], ["Weight", "weightKg", "kg"]] as const).map(([label, key, unit]) => (
                      <label key={key} className="block">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
                        <div className="mt-1 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2">
                          <input
                            type="number"
                            value={visibleProfile[key]}
                            disabled={!isEditingProfile}
                            onChange={(e) => handleProfileChange(key, e.target.value)}
                            className="w-full bg-transparent text-base font-extrabold text-slate-900 outline-none disabled:opacity-100"
                          />
                          <span className="text-[10px] font-semibold text-slate-400">{unit}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">BMI</p>
                        <p className="mt-0.5 text-xl font-extrabold text-emerald-950">
                          {(isEditingProfile ? draftBmi : profile.bmi).toFixed(1)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                        {getBmiStatus(isEditingProfile ? draftBmi : profile.bmi)}
                      </span>
                    </div>
                  </div>

                  {([["Medication allergies", "medicationAllergies", ShieldAlert], ["Food allergies", "foodAllergies", Utensils], ["Underlying conditions", "chronicConditions", Activity]] as const).map(([label, key, Icon]) => (
                    <label key={key} className="block">
                      <span className="mb-1.5 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                      </span>
                      {isEditingProfile ? (
                        <textarea
                          value={profileDraft[key]}
                          onChange={(e) => handleProfileChange(key, e.target.value)}
                          rows={2}
                          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white"
                        />
                      ) : (
                        <div className="min-h-16 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-medium leading-6 text-slate-700">
                          {profile[key]}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 2. Smartwatch Health Card Widgets (2×2 grid) */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Watch className="h-4 w-4 text-teal-700" />
              <h2 className="text-sm font-extrabold text-slate-700">Smartwatch Data</h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Tap for details</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <HealthClickCard
              title="Sleep"
              value={`${dynamicHealth.sleep.durationHours}h`}
              subtitle={`${dynamicHealth.sleep.quality}% quality`}
              icon={<Moon className="h-4 w-4 text-indigo-600" />}
              accentBg="bg-indigo-50"
              accentText="text-indigo-900"
              onClick={() => setActiveModal("sleep")}
            />
            <HealthClickCard
              title="Stress"
              value={dynamicHealth.stress.level}
              subtitle={`HRV ${dynamicHealth.stress.hrvMs} ms`}
              icon={<HeartPulse className="h-4 w-4 text-rose-600" />}
              accentBg="bg-rose-50"
              accentText="text-rose-900"
              onClick={() => setActiveModal("stress")}
            />
            <HealthClickCard
              title="PAI Score"
              value={`${dynamicHealth.pai.score}`}
              subtitle={`${dynamicHealth.pai.range} · /${dynamicHealth.pai.weeklyTarget}`}
              icon={<Dumbbell className="h-4 w-4 text-emerald-600" />}
              accentBg="bg-emerald-50"
              accentText="text-emerald-900"
              onClick={() => setActiveModal("pai")}
            />
            <HealthClickCard
              title="Calories"
              value={`${calorieBalance > 0 ? "+" : ""}${formatNumber.format(calorieBalance)}`}
              unit="kcal"
              subtitle={`${formatNumber.format(dynamicHealth.calories.steps)} steps`}
              icon={<Utensils className="h-4 w-4 text-amber-600" />}
              accentBg="bg-amber-50"
              accentText="text-amber-900"
              onClick={() => setActiveModal("calories")}
            />
          </div>
        </section>

        {/* 3. Environment Block */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudSun className="h-4 w-4 text-teal-700" />
              <h2 className="text-sm font-extrabold text-slate-700">Environment</h2>
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Tap for forecast</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveModal("environment")}
            className="w-full rounded-2xl border border-slate-100 bg-white p-4 shadow-sm text-left transition-all hover:shadow-md hover:border-slate-200 active:scale-[0.97]"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                <MapPin className="h-3.5 w-3.5 text-teal-600" />
                {environmentLocation}
              </div>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                {isLoadingEnvironment ? "Loading…" : environment.source}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className={`rounded-xl border p-2.5 text-center ${getPmBg(environment.pm25)}`}>
                <Wind className="mx-auto mb-1 h-3.5 w-3.5 text-slate-400" />
                <p className="text-[10px] font-semibold text-slate-500">PM 2.5</p>
                <p className="text-base font-extrabold text-slate-950">{environment.pm25}</p>
                <p className={`text-[10px] font-bold ${getPmTone(environment.pm25)}`}>{getPmLabel(environment.pm25)}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50 p-2.5 text-center">
                <Sun className="mx-auto mb-1 h-3.5 w-3.5 text-amber-500" />
                <p className="text-[10px] font-semibold text-slate-500">UV Index</p>
                <p className="text-base font-extrabold text-slate-950">{environment.uv}</p>
                <p className="text-[10px] font-bold text-amber-600">{getUvLabel(environment.uv)}</p>
              </div>
              <div className="rounded-xl border border-orange-100 bg-orange-50 p-2.5 text-center">
                <Thermometer className="mx-auto mb-1 h-3.5 w-3.5 text-orange-500" />
                <p className="text-[10px] font-semibold text-slate-500">Temp</p>
                <p className="text-base font-extrabold text-slate-950">{environment.temperature}°</p>
                <p className="text-[10px] font-bold text-orange-600">{environment.condition}</p>
              </div>
            </div>
          </button>
          {environmentError && (
            <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
              {environmentError}
            </div>
          )}
        </section>

        {/* 4. Food Calorie Feature */}
        <section>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">Calorie Intelligence</p>
                <h2 className="mt-0.5 text-base font-extrabold text-slate-950">Meal photo estimate</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                <Camera className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="mb-4 text-xs leading-5 text-slate-400">
              Upload or capture a meal photo and the AI will estimate the dish and calories.
            </p>
            <input ref={mealCameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleMealPhotoChange} className="hidden" />
            <input ref={mealUploadInputRef} type="file" accept="image/*" onChange={handleMealPhotoChange} className="hidden" />
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => triggerMealPicker("camera")}
                disabled={isAnalyzingMeal}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isAnalyzingMeal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                Take a photo
              </button>
              <button
                type="button"
                onClick={() => triggerMealPicker("upload")}
                disabled={isAnalyzingMeal}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 disabled:cursor-not-allowed disabled:text-slate-300"
              >
                {isAnalyzingMeal ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Upload
              </button>
            </div>
            <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs font-semibold leading-5 text-amber-800">
              {passportData.mealPhotoStatus}
            </div>
            {mealPhotoError && (
              <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {mealPhotoError}
              </div>
            )}
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-semibold text-slate-400">Intake</p>
                <p className="mt-1 text-base font-extrabold text-slate-950">{formatNumber.format(dynamicHealth.calories.intake)}</p>
                <p className="text-[10px] text-slate-400">kcal</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-semibold text-slate-400">Steps</p>
                <p className="mt-1 text-base font-extrabold text-slate-950">{formatNumber.format(dynamicHealth.calories.steps)}</p>
                <p className="text-[10px] text-slate-400">today</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-semibold text-slate-400">Heart</p>
                <p className="mt-1 text-base font-extrabold text-slate-950">{dynamicHealth.calories.averageHeartRate}</p>
                <p className="text-[10px] text-slate-400">bpm avg</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Interaction Intake (chat moved to FAB) */}
        <section>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">Interaction Intake</p>
                <h2 className="mt-0.5 text-base font-extrabold text-slate-950">AI check-in prompts</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Voice commands update your profile through an LLM extraction endpoint.
                </p>
              </div>
              <button
                type="button"
                onClick={handleVoiceCommand}
                disabled={isVoiceActive || isUpdatingProfileFromVoice}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  isVoiceActive || isUpdatingProfileFromVoice
                    ? "bg-rose-500 text-white"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {isVoiceActive || isUpdatingProfileFromVoice ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                {isUpdatingProfileFromVoice ? "Updating Profile" : isVoiceActive ? "Voice Listening" : "Start Voice"}
              </button>
            </div>

            {(voiceTranscript || voiceError) && (
              <div className={`mb-4 rounded-xl border p-3 text-xs font-semibold ${voiceError ? "border-rose-200 bg-rose-50 text-rose-700" : "border-teal-200 bg-teal-50 text-teal-900"}`}>
                {voiceError ?? `Heard: ${voiceTranscript}`}
              </div>
            )}

            <div className="grid gap-3">
              {[
                ["Primary healing goal", "goal", prompts[0]],
                ["Dietary preferences", "diet", prompts[1]],
                ["Recent mood", "feeling", prompts[2]],
                ["Extra notes", "notes", prompts[3]],
              ].map(([label, key, prompt]) => (
                <label key={key} className="block">
                  <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-slate-600">
                    <MessageCircle className="h-3.5 w-3.5 text-teal-600" />
                    {label}
                  </span>
                  <p className="mb-1.5 text-[10px] font-semibold text-slate-400">{prompt}</p>
                  <textarea
                    value={interaction[key as keyof Interaction]}
                    onChange={(e) => handleInteractionChange(key as keyof Interaction, e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium leading-6 text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-2.5 rounded-xl border border-teal-100 bg-teal-50 p-4">
              <span className="flex items-center gap-2 text-xs font-semibold text-teal-800">
                <Check className="h-3.5 w-3.5" />
                Ready to sync with wearable APIs, environment, and chat history.
              </span>
              <Link
                href="/diet?generate=1"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-2 text-sm font-bold text-white transition hover:bg-teal-800"
              >
                Generate Diet Plan
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* Phone-scoped overlay — FAB + chat window stay within the 430 px shell */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 top-0 z-40 flex justify-center"
        aria-hidden="true"
      >
        <div className="pointer-events-none relative h-full w-full max-w-[430px]">
          {/* FAB */}
          {!isChatOpen && (
            <button
              type="button"
              aria-label="Open AI consultation"
              onClick={() => setIsChatOpen(true)}
              className="pointer-events-auto absolute bottom-20 right-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 shadow-xl text-white transition hover:bg-teal-800 active:scale-95"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
          )}

          {/* Chat window */}
          {isChatOpen && (
            <div
              className="pointer-events-auto absolute bottom-20 right-4 flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl"
              style={{ width: "calc(100% - 2rem)", maxWidth: "320px", maxHeight: "420px" }}
            >
              {/* Chat header */}
              <div className="flex shrink-0 items-center justify-between bg-slate-950 px-4 py-3">
                <span className="flex items-center gap-2 font-bold text-white">
                  <Sparkles className="h-4 w-4 text-teal-300" />
                  AI Consultation
                </span>
                <button
                  type="button"
                  onClick={() => setIsChatOpen(false)}
                  className="rounded-full p-1.5 hover:bg-white/10 transition"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4 text-slate-300" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 p-3">
                {passportData.chatMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-sm font-medium leading-5 ${
                        msg.role === "user" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-700"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                      AI is typing…
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input form */}
              <form onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }} className="flex shrink-0 gap-2 border-t border-slate-100 bg-white p-3">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Type a message…"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleChatVoice}
                  disabled={isChatVoiceActive}
                  className={`flex-shrink-0 rounded-xl px-2.5 py-2 transition ${isChatVoiceActive ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                  aria-label="Voice input"
                >
                  {isChatVoiceActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                </button>
                <button
                  type="submit"
                  disabled={!chatInput.trim() || isBotTyping}
                  className="flex-shrink-0 rounded-xl bg-teal-700 px-3 py-2 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-200"
                >
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals (bottom-sheet, phone-width) ─────────────────────────── */}

      {activeModal === "sleep" && (
        <Modal title="Sleep Details" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Duration</p>
                <p className="mt-1 text-3xl font-extrabold text-indigo-900">{dynamicHealth.sleep.durationHours}h</p>
              </div>
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Quality</p>
                <p className="mt-1 text-3xl font-extrabold text-indigo-900">{dynamicHealth.sleep.quality}%</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bed Time</p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{dynamicHealth.sleep.bedTime}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Wake Time</p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{dynamicHealth.sleep.wakeTime}</p>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold text-slate-600 uppercase tracking-widest">7-Day Quality Trend</p>
              <MiniBars data={dynamicHealth.sleep.history} max={100} colorClass="bg-indigo-500" />
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "stress" && (
        <Modal title="Stress & HRV" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">Level</p>
                <p className="mt-1 text-2xl font-extrabold text-rose-900">{dynamicHealth.stress.level}</p>
              </div>
              <div className="rounded-2xl bg-rose-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">HRV</p>
                <p className="mt-1 text-2xl font-extrabold text-rose-900">{dynamicHealth.stress.hrvMs} ms</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Score</p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{dynamicHealth.stress.score}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Mood</p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">{dynamicHealth.stress.expression}</p>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold text-slate-600 uppercase tracking-widest">7-Day Stress Trend</p>
              <MiniBars data={dynamicHealth.stress.trend} max={70} colorClass="bg-rose-500" />
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "pai" && (
        <Modal title="PAI Score" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500">Current Score</p>
              <p className="mt-1 text-5xl font-extrabold text-emerald-900">{dynamicHealth.pai.score}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-600">{dynamicHealth.pai.range} range</p>
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs font-bold text-emerald-700">
                  <span>Weekly progress</span>
                  <span>{Math.round(paiProgress)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-emerald-200">
                  <div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${paiProgress}%` }} />
                </div>
                <p className="mt-1 text-xs text-emerald-500">Target: {dynamicHealth.pai.weeklyTarget}</p>
              </div>
            </div>
            <div>
              <p className="mb-3 text-xs font-bold text-slate-600 uppercase tracking-widest">7-Day PAI History</p>
              <MiniBars data={dynamicHealth.pai.history} max={100} colorClass="bg-emerald-500" />
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "calories" && (
        <Modal title="Calorie & Activity" onClose={() => setActiveModal(null)}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-amber-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Intake</p>
                <p className="mt-1 text-2xl font-extrabold text-amber-900">{formatNumber.format(dynamicHealth.calories.intake)}</p>
                <p className="text-xs text-amber-600">kcal</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Output</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-900">{formatNumber.format(dynamicHealth.calories.output)}</p>
                <p className="text-xs text-slate-400">kcal</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Steps</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{formatNumber.format(dynamicHealth.calories.steps)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Avg HR</p>
                <p className="mt-1 text-xl font-extrabold text-slate-900">{dynamicHealth.calories.averageHeartRate} <span className="text-sm font-semibold text-slate-400">bpm</span></p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">Last Meal Estimate</p>
              <p className="text-sm font-semibold text-slate-700">{dynamicHealth.calories.mealEstimate}</p>
              <p className="mt-1 text-xl font-extrabold text-amber-800">{formatNumber.format(dynamicHealth.calories.lastMealKcal)} kcal</p>
            </div>
            <div className={`rounded-2xl border p-4 ${calorieBalance < 0 ? "border-emerald-100 bg-emerald-50" : "border-amber-100 bg-amber-50"}`}>
              <p className={`text-[10px] font-bold uppercase tracking-widest ${calorieBalance < 0 ? "text-emerald-500" : "text-amber-500"}`}>Net Balance</p>
              <p className={`mt-1 text-2xl font-extrabold ${calorieBalance < 0 ? "text-emerald-900" : "text-amber-900"}`}>
                {calorieBalance > 0 ? "+" : ""}{formatNumber.format(calorieBalance)} kcal
              </p>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === "environment" && (
        <Modal title="Environment Details" onClose={() => setActiveModal(null)}>
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-teal-600" />
              {environmentLocation}
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-400">
                {isLoadingEnvironment ? "Loading live data…" : environment.source}
              </span>
            </div>
            {environmentError && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">{environmentError}</div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className={`rounded-2xl border p-4 ${getPmBg(environment.pm25)}`}>
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Wind className="h-4 w-4" /> PM 2.5
                </div>
                <p className="text-2xl font-extrabold text-slate-950">{environment.pm25}</p>
                <p className={`text-xs font-bold ${getPmTone(environment.pm25)}`}>{getPmLabel(environment.pm25)}</p>
              </div>
              <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Sun className="h-4 w-4" /> UV Index
                </div>
                <p className="text-2xl font-extrabold text-slate-950">{environment.uv}</p>
                <p className="text-xs font-bold text-amber-600">{getUvLabel(environment.uv)}</p>
              </div>
              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <Thermometer className="h-4 w-4" /> Temp
                </div>
                <p className="text-2xl font-extrabold text-slate-950">{environment.temperature}°C</p>
                <p className="text-xs font-semibold text-slate-500">{environment.condition}</p>
              </div>
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                  <AirVent className="h-4 w-4" /> Humidity
                </div>
                <p className="text-2xl font-extrabold text-slate-950">{environment.humidity}%</p>
                <p className="text-xs font-semibold text-blue-600">Hydrate often</p>
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">Today&apos;s Forecast</p>
              <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100 overflow-hidden">
                {environment.forecast.map((item) => (
                  <div key={item.time} className="flex items-center justify-between px-4 py-3">
                    <span className="text-xs font-bold text-slate-500">{item.time}</span>
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                      <CloudSun className="h-3.5 w-3.5 text-teal-600" />
                      {item.condition}
                    </span>
                    <span className="text-sm font-extrabold text-slate-950">{item.temp}°C</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
}
