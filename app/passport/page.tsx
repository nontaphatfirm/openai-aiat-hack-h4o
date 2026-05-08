"use client";

import {
  Activity,
  AirVent,
  Calendar,
  Camera,
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
  Plus,
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
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

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

type ChatSession = {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
};

type PassportData = {
  profile: Profile;
  dynamicHealth: DynamicHealth;
  environment: Environment;
  interaction: Interaction;
  chatSessions: ChatSession[];
  mealPhotoStatus: string;
  foodLog: FoodEntry[];
};

type FoodEntry = {
  id: string;
  name: string;
  date: string;
  time: string;
  calories: number;
  carbs: number;
  protein: number;
  fat: number;
  sodium: number;
  source: "golden_spoon" | "photo" | "manual";
  photoDataUrl?: string;
};


type ApiErrorResponse = {
  error: string;
};

type FoodAnalysis = {
  foodName: string;
  estimatedCalories: number;
  carbsG: number;
  proteinG: number;
  fatG: number;
  sodiumMg: number;
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

const defaultFoodLog: FoodEntry[] = [
  { id: "m-0201", name: "Oatmeal with banana", date: "2026-05-02", time: "08:00", calories: 320, carbs: 58, protein: 9, fat: 6, sodium: 85, source: "golden_spoon" },
  { id: "m-0202", name: "Chicken Caesar salad", date: "2026-05-02", time: "12:30", calories: 450, carbs: 20, protein: 38, fat: 22, sodium: 520, source: "photo" },
  { id: "m-0203", name: "Spaghetti Bolognese", date: "2026-05-02", time: "19:00", calories: 610, carbs: 72, protein: 28, fat: 18, sodium: 740, source: "golden_spoon" },
  { id: "m-0301", name: "Berry smoothie bowl", date: "2026-05-03", time: "07:45", calories: 290, carbs: 52, protein: 8, fat: 5, sodium: 60, source: "golden_spoon" },
  { id: "m-0302", name: "Tuna sandwich", date: "2026-05-03", time: "13:00", calories: 380, carbs: 40, protein: 25, fat: 12, sodium: 630, source: "manual" },
  { id: "m-0303", name: "Grilled sea bass", date: "2026-05-03", time: "19:30", calories: 420, carbs: 8, protein: 45, fat: 18, sodium: 410, source: "golden_spoon" },
  { id: "m-0304", name: "Greek yogurt", date: "2026-05-03", time: "22:00", calories: 140, carbs: 12, protein: 15, fat: 4, sodium: 55, source: "manual" },
  { id: "m-0401", name: "Scrambled eggs & toast", date: "2026-05-04", time: "08:15", calories: 380, carbs: 32, protein: 22, fat: 16, sodium: 480, source: "golden_spoon" },
  { id: "m-0402", name: "Tom Yum soup", date: "2026-05-04", time: "12:00", calories: 260, carbs: 18, protein: 20, fat: 8, sodium: 920, source: "photo" },
  { id: "m-0403", name: "Brown rice bowl", date: "2026-05-04", time: "18:45", calories: 530, carbs: 75, protein: 22, fat: 10, sodium: 520, source: "golden_spoon" },
  { id: "m-0501", name: "Avocado toast", date: "2026-05-05", time: "09:00", calories: 340, carbs: 38, protein: 9, fat: 18, sodium: 290, source: "golden_spoon" },
  { id: "m-0502", name: "Margherita pizza slice", date: "2026-05-05", time: "13:30", calories: 480, carbs: 55, protein: 18, fat: 20, sodium: 780, source: "photo" },
  { id: "m-0504", name: "Almond snack bar", date: "2026-05-05", time: "15:30", calories: 180, carbs: 22, protein: 5, fat: 9, sodium: 110, source: "manual" },
  { id: "m-0503", name: "Vegetable stir-fry", date: "2026-05-05", time: "19:00", calories: 420, carbs: 45, protein: 16, fat: 14, sodium: 660, source: "golden_spoon" },
  { id: "m-0601", name: "Banana pancakes", date: "2026-05-06", time: "08:30", calories: 430, carbs: 65, protein: 12, fat: 14, sodium: 310, source: "golden_spoon" },
  { id: "m-0602", name: "Mixed green salad", date: "2026-05-06", time: "12:30", calories: 280, carbs: 22, protein: 12, fat: 15, sodium: 380, source: "photo" },
  { id: "m-0603", name: "Thai green curry", date: "2026-05-06", time: "19:30", calories: 560, carbs: 48, protein: 28, fat: 24, sodium: 830, source: "golden_spoon" },
  { id: "m-0701", name: "Coconut yogurt parfait", date: "2026-05-07", time: "07:30", calories: 310, carbs: 42, protein: 10, fat: 10, sodium: 90, source: "golden_spoon" },
  { id: "m-0702", name: "Beef burger", date: "2026-05-07", time: "13:00", calories: 650, carbs: 50, protein: 35, fat: 32, sodium: 980, source: "photo" },
  { id: "m-0703", name: "Pan-seared salmon", date: "2026-05-07", time: "19:00", calories: 490, carbs: 12, protein: 42, fat: 22, sodium: 460, source: "golden_spoon" },
  { id: "m-0801", name: "Granola bowl", date: "2026-05-08", time: "08:00", calories: 350, carbs: 55, protein: 11, fat: 9, sodium: 120, source: "golden_spoon" },
  { id: "m-0802", name: "Grilled salmon bowl, miso soup", date: "2026-05-08", time: "12:30", calories: 610, carbs: 42, protein: 38, fat: 20, sodium: 680, source: "photo" },
];

const defaultChatSessions: ChatSession[] = [
  {
    id: "session-prev-2",
    title: "Sleep & recovery tips",
    createdAt: "2026-05-06",
    messages: [
      { id: "b1", role: "bot", text: "Hi Maya! How can I help with your wellness today?" },
      { id: "u1", role: "user", text: "I've been having trouble sleeping lately." },
      { id: "b2", role: "bot", text: "Try limiting screen time 1 hour before bed and keep your room cool around 18–20°C. Your HRV data suggests your body recovers best on 7.5–8h nights." },
    ],
  },
  {
    id: "session-prev-1",
    title: "Stress management",
    createdAt: "2026-05-07",
    messages: [
      { id: "b3", role: "bot", text: "Good morning Maya! Your stress score looks elevated today." },
      { id: "u2", role: "user", text: "Yeah, big presentation at work today." },
      { id: "b4", role: "bot", text: "Box breathing (4s in, 4s hold, 4s out) for 5 minutes before your presentation can lower cortisol quickly. You've got this!" },
    ],
  },
  {
    id: "session-today",
    title: "Today's check-in",
    createdAt: "2026-05-08",
    messages: [
      { id: "bot-welcome", role: "bot", text: "Hi Maya, I can keep notes for today's wellness context. What changed today?" },
    ],
  },
];

const formatNumber = new Intl.NumberFormat("en-US");

function calculateBmi(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  if (!heightM || !weightKg) return 0;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getActiveFoodLogDate(foodLog: FoodEntry[]) {
  const today = getLocalDateKey();
  if (foodLog.some((entry) => entry.date === today)) return today;

  return [...foodLog]
    .map((entry) => entry.date)
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))[0] ?? today;
}

function calculateFoodLogCalories(foodLog: FoodEntry[], date = getActiveFoodLogDate(foodLog)) {
  return foodLog
    .filter((entry) => entry.date === date)
    .reduce((sum, entry) => sum + entry.calories, 0);
}

function syncCalorieIntakeWithFoodLog(data: PassportData): PassportData {
  return {
    ...data,
    dynamicHealth: {
      ...data.dynamicHealth,
      calories: {
        ...data.dynamicHealth.calories,
        intake: calculateFoodLogCalories(data.foodLog),
      },
    },
  };
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
  return syncCalorieIntakeWithFoodLog({
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
    chatSessions: defaultChatSessions.map((s) => ({ ...s, messages: [...s.messages] })),
    mealPhotoStatus: "Ready for meal photo analysis",
    foodLog: [...defaultFoodLog],
  });
}

function mergeStoredPassportData(storedData: Partial<PassportData> & { chatMessages?: ChatMessage[] }): PassportData {
  const initialData = createInitialPassportData();
  // Migrate legacy chatMessages to chatSessions if needed
  let chatSessions = storedData.chatSessions?.length
    ? storedData.chatSessions
    : initialData.chatSessions;
  if (!storedData.chatSessions?.length && storedData.chatMessages?.length) {
    chatSessions = [
      ...initialData.chatSessions.slice(0, -1),
      { id: "session-today", title: "Today's check-in", createdAt: "2026-05-08", messages: storedData.chatMessages },
    ];
  }
  return syncCalorieIntakeWithFoodLog({
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
    chatSessions,
    mealPhotoStatus: storedData.mealPhotoStatus ?? initialData.mealPhotoStatus,
    foodLog: storedData.foodLog ?? initialData.foodLog,
  });
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
            <div className="flex shrink-0 justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
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
            <div className="overflow-y-auto px-5 pb-8 flex-1">{children}</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PassportPage() {
  const goldenSpoonCameraRef = useRef<HTMLInputElement>(null);
  const goldenSpoonUploadRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [passportData, setPassportData] = useState<PassportData>(() => createInitialPassportData());
  const [profileDraft, setProfileDraft] = useState<Profile>(() => ({ ...defaultProfile }));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isLoadingEnvironment, setIsLoadingEnvironment] = useState(false);
  const [environmentError, setEnvironmentError] = useState<string | null>(null);

  const [chatInput, setChatInput] = useState("");
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<"sleep" | "stress" | "pai" | "calories" | "environment" | "food-history" | null>(null);
  const [goldenSpoonPhoto, setGoldenSpoonPhoto] = useState<string | null>(null);
  const [goldenSpoonFoodName, setGoldenSpoonFoodName] = useState("");
  const [goldenSpoonAnalysis, setGoldenSpoonAnalysis] = useState<FoodAnalysis | null>(null);
  const [isGoldenSpoonAnalyzing, setIsGoldenSpoonAnalyzing] = useState(false);
  const [goldenSpoonError, setGoldenSpoonError] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatVoiceActive, setIsChatVoiceActive] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-today");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const restored = mergeStoredPassportData(JSON.parse(stored) as Partial<PassportData>);
          setPassportData(restored);
          setProfileDraft(restored.profile);
          if (restored.chatSessions.length > 0) {
            setActiveSessionId(restored.chatSessions[restored.chatSessions.length - 1].id);
          }
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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(syncCalorieIntakeWithFoodLog(passportData)));
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
  }, [passportData.chatSessions, isChatOpen, isBotTyping, activeSessionId]);

  const { dynamicHealth, environment, profile } = passportData;
  const visibleProfile = isEditingProfile ? profileDraft : profile;
  const environmentLocation = environment.locationName ?? environment.location;
  const activeFoodLogDate = getActiveFoodLogDate(passportData.foodLog);
  const effectiveCalorieIntake = calculateFoodLogCalories(passportData.foodLog, activeFoodLogDate);
  const calorieBalance = effectiveCalorieIntake - dynamicHealth.calories.output;
  const paiProgress = Math.min(100, (dynamicHealth.pai.score / dynamicHealth.pai.weeklyTarget) * 100);

  const draftBmi = useMemo(
    () => calculateBmi(profileDraft.heightCm, profileDraft.weightKg),
    [profileDraft.heightCm, profileDraft.weightKg],
  );

  const activeSession = passportData.chatSessions.find((s) => s.id === activeSessionId) ?? passportData.chatSessions[passportData.chatSessions.length - 1];

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

  const handleGoldenSpoonStart = () => {
    if (!goldenSpoonPhoto || !goldenSpoonAnalysis) return;
    const name = goldenSpoonAnalysis.foodName.trim() || "Unknown food";
    const carbs = goldenSpoonAnalysis.carbsG;
    const protein = goldenSpoonAnalysis.proteinG;
    const fat = goldenSpoonAnalysis.fatG;
    const sodium = goldenSpoonAnalysis.sodiumMg;
    const kcal = goldenSpoonAnalysis.estimatedCalories;
    const now = new Date();
    const entry: FoodEntry = {
      id: `spoon-${Date.now()}`,
      name,
      date: getLocalDateKey(now),
      time: now.toTimeString().slice(0, 5),
      calories: kcal,
      carbs,
      protein,
      fat,
      sodium,
      source: "golden_spoon",
      photoDataUrl: goldenSpoonPhoto,
    };
    updatePassportData((c) => ({
      ...syncCalorieIntakeWithFoodLog({
        ...c,
        foodLog: [...c.foodLog, entry],
        dynamicHealth: { ...c.dynamicHealth, calories: { ...c.dynamicHealth.calories, mealEstimate: name, lastMealKcal: kcal } },
      }),
      mealPhotoStatus: `Golden Spoon: ${name}, ${kcal} kcal logged`,
    }));
    setGoldenSpoonPhoto(null);
    setGoldenSpoonFoodName("");
    setGoldenSpoonAnalysis(null);
    setGoldenSpoonError(null);
  };

  const handleGoldenSpoonPhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/")) return;
    setGoldenSpoonAnalysis(null);
    setGoldenSpoonFoodName("");
    setGoldenSpoonError(null);
    setIsGoldenSpoonAnalyzing(true);

    void readFileAsDataUrl(file)
      .then(async (dataUrl) => {
        setGoldenSpoonPhoto(dataUrl);
        const analysis = await readJsonResponse<FoodAnalysis>(
          await fetch("/api/analyze-food", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageDataUrl: dataUrl }),
          }),
        );
        setGoldenSpoonAnalysis(analysis);
        setGoldenSpoonFoodName(analysis.foodName);
      })
      .catch((error) => {
        setGoldenSpoonError(error instanceof Error ? error.message : "Unable to identify this food.");
      })
      .finally(() => setIsGoldenSpoonAnalyzing(false));
  };

  const appendMessageToSession = (sessionId: string, msg: ChatMessage) => {
    updatePassportData((c) => ({
      ...c,
      chatSessions: c.chatSessions.map((s) =>
        s.id === sessionId ? { ...s, messages: [...s.messages, msg] } : s,
      ),
    }));
  };

  const handleChatSubmit = () => {
    const text = chatInput.trim();
    if (!text || isBotTyping || !activeSession) return;
    appendMessageToSession(activeSession.id, { id: `user-${Date.now()}`, role: "user", text });
    setChatInput("");
    setIsBotTyping(true);
    window.setTimeout(() => {
      appendMessageToSession(activeSession.id, { id: `bot-${Date.now()}`, role: "bot", text: "Noted! I have updated your daily context. How else can I help?" });
      setIsBotTyping(false);
    }, 1000);
  };

  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New conversation",
      createdAt: new Date().toISOString().slice(0, 10),
      messages: [{ id: `bot-${Date.now()}`, role: "bot", text: "Hi Maya! What would you like to discuss today?" }],
    };
    updatePassportData((c) => ({ ...c, chatSessions: [...c.chatSessions, newSession] }));
    setActiveSessionId(newId);
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
      {/* Sticky header */}
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
              <h2 className="text-sm font-extrabold text-slate-700">Dynamic Profile</h2>
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

        {/* 4. Calorie Intelligence */}
        <section>
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            {/* Header */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">Calorie Intelligence</p>
                <h2 className="mt-0.5 text-base font-extrabold text-slate-950">Food tracker</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal("food-history")}
                  className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  7-day log
                </button>
              </div>
            </div>

            {/* Last 3 meals */}
            {(() => {
              const last3 = [...passportData.foodLog].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)).slice(0, 3);
              return (
                <div className="mb-4">
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Recent meals — tap to view history</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {last3.map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setActiveModal("food-history")}
                        className="flex min-w-[120px] max-w-[150px] items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-teal-200 hover:bg-teal-50 shrink-0"
                      >
                        {entry.source === "golden_spoon" ? (
                          <Zap className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        ) : (
                          <Camera className="h-3.5 w-3.5 shrink-0 text-teal-500" />
                        )}
                        <p className="truncate text-xs font-bold text-slate-800">{entry.name}</p>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <input ref={goldenSpoonCameraRef} type="file" accept="image/*" capture="environment" onChange={handleGoldenSpoonPhotoChange} className="hidden" />
            <input ref={goldenSpoonUploadRef} type="file" accept="image/*" onChange={handleGoldenSpoonPhotoChange} className="hidden" />

            {/* Golden Spoon panel */}
            <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-600" />
                <p className="text-xs font-extrabold text-amber-900">Golden Spoon</p>
              </div>
              {!goldenSpoonPhoto ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-semibold text-amber-700">Take a photo of your food to get started</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => goldenSpoonCameraRef.current?.click()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-700 active:scale-95"
                    >
                      <Camera className="h-4 w-4" />
                      Take photo
                    </button>
                    <button
                      type="button"
                      onClick={() => goldenSpoonUploadRef.current?.click()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300 bg-white px-4 py-3 text-sm font-bold text-amber-700 transition hover:bg-amber-100 active:scale-95"
                    >
                      <Upload className="h-4 w-4" />
                      Upload
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={goldenSpoonPhoto} alt="Food preview" className="h-40 w-full rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setGoldenSpoonPhoto(null);
                        setGoldenSpoonFoodName("");
                        setGoldenSpoonAnalysis(null);
                        setGoldenSpoonError(null);
                        setIsGoldenSpoonAnalyzing(false);
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition hover:bg-black/70"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-white px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500">Detected food</p>
                    {isGoldenSpoonAnalyzing ? (
                      <span className="mt-1 flex items-center gap-2 text-sm font-bold text-slate-700">
                        <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                        Analyzing meal photo...
                      </span>
                    ) : goldenSpoonError ? (
                      <p className="mt-1 text-sm font-bold text-rose-700">{goldenSpoonError}</p>
                    ) : (
                      <p className="mt-1 text-sm font-extrabold text-slate-900">{goldenSpoonFoodName || "Waiting for analysis"}</p>
                    )}
                    {goldenSpoonAnalysis && (
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {formatNumber.format(goldenSpoonAnalysis.estimatedCalories)} kcal | C {goldenSpoonAnalysis.carbsG}g | P {goldenSpoonAnalysis.proteinG}g | F {goldenSpoonAnalysis.fatG}g
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleGoldenSpoonStart}
                    disabled={isGoldenSpoonAnalyzing || !goldenSpoonAnalysis}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-amber-200"
                  >
                    {isGoldenSpoonAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                    Add to Food History
                  </button>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="font-semibold text-slate-400">Intake</p>
                <p className="mt-1 text-base font-extrabold text-slate-950">{formatNumber.format(effectiveCalorieIntake)}</p>
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

        {/* 5. Generate Diet Plan */}
        <section>
          <div className="flex flex-col gap-4 rounded-2xl border border-teal-100 bg-teal-50 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-700">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-700">AI Nutrition</p>
                <h2 className="text-base font-extrabold text-teal-950">Generate Diet Plan</h2>
              </div>
            </div>

            <p className="text-xs leading-5 text-teal-700">
              Your passport data — health metrics, environment, and calorie intake — will be used to generate a personalised diet plan.
            </p>
            <Link
              href="/diet?generate=1"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-800"
            >
              Generate Diet Plan
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      {/* FAB — portalled into the phone shell so it moves with the layout */}
      {hasHydrated && !isChatOpen && (() => {
        const root = document.getElementById("fab-root");
        if (!root) return null;
        return createPortal(
          <button
            type="button"
            aria-label="Open AI consultation"
            onClick={() => setIsChatOpen(true)}
            className="absolute bottom-[74px] right-4 z-[9998] flex h-14 w-14 items-center justify-center rounded-full bg-teal-700 shadow-xl text-white transition hover:bg-teal-800 active:scale-95"
          >
            <MessageCircle className="h-6 w-6" />
          </button>,
          root,
        );
      })()}

      {/* Chat popup — fits inside the 430px mobile shell, below the app header */}
      {isChatOpen && (
        <div className="fixed inset-x-0 bottom-0 top-12 z-[9999] flex justify-center">
          <div className="flex w-full max-w-[430px] flex-col overflow-hidden bg-white shadow-2xl">
            {/* Chat header */}
            <div className="flex shrink-0 items-center justify-between bg-slate-950 px-4 py-4">
              <span className="flex items-center gap-2 text-base font-bold text-white">
                <Sparkles className="h-5 w-5 text-teal-300" />
                AI Consultation
              </span>
              <button
                type="button"
                onClick={() => setIsChatOpen(false)}
                className="rounded-full p-2 hover:bg-white/10 transition"
                aria-label="Close chat"
              >
                <X className="h-5 w-5 text-slate-300" />
              </button>
            </div>

            {/* Two-panel layout */}
            <div className="flex flex-1 overflow-hidden">
              {/* Left sidebar — chat history */}
              <div className="flex w-[140px] shrink-0 flex-col border-r border-slate-100 bg-slate-50">
                <div className="flex shrink-0 items-center justify-between px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">History</p>
                  <button
                    type="button"
                    onClick={handleNewSession}
                    className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white transition hover:bg-teal-700"
                    aria-label="New conversation"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
                  {passportData.chatSessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setActiveSessionId(session.id)}
                      className={`w-full rounded-xl px-3 py-2.5 text-left transition ${session.id === activeSessionId
                          ? "bg-teal-700 text-white"
                          : "bg-white text-slate-700 hover:bg-slate-100"
                        }`}
                    >
                      <p className={`truncate text-[11px] font-bold leading-tight ${session.id === activeSessionId ? "text-white" : "text-slate-700"}`}>
                        {session.title}
                      </p>
                      <p className={`mt-0.5 text-[10px] font-medium ${session.id === activeSessionId ? "text-teal-200" : "text-slate-400"}`}>
                        {session.createdAt}
                      </p>
                      <p className={`mt-1 truncate text-[10px] leading-tight ${session.id === activeSessionId ? "text-teal-100" : "text-slate-400"}`}>
                        {session.messages[session.messages.length - 1]?.text ?? ""}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right panel — active chat */}
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Session title bar */}
                <div className="shrink-0 border-b border-slate-100 bg-white px-4 py-2.5">
                  <p className="text-sm font-bold text-slate-800">{activeSession?.title ?? "Conversation"}</p>
                  <p className="text-[10px] font-semibold text-slate-400">{activeSession?.createdAt}</p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 bg-slate-50 p-4">
                  {(activeSession?.messages ?? []).map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-medium leading-5 ${msg.role === "user" ? "bg-teal-700 text-white" : "border border-slate-200 bg-white text-slate-700"
                          }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isBotTyping && (
                    <div className="flex justify-start">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold text-slate-500">
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-600" />
                        AI is typing…
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input form */}
                <form
                  onSubmit={(e) => { e.preventDefault(); handleChatSubmit(); }}
                  className="flex shrink-0 gap-2 border-t border-slate-100 bg-white p-3"
                >
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type a message…"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-teal-400 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleChatVoice}
                    disabled={isChatVoiceActive}
                    className={`flex-shrink-0 rounded-xl px-3 py-2.5 transition ${isChatVoiceActive ? "bg-rose-100 text-rose-600" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                    aria-label="Voice input"
                  >
                    {isChatVoiceActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isBotTyping}
                    className="flex-shrink-0 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-200"
                  >
                    Send
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <p className="mt-1 text-2xl font-extrabold text-amber-900">{formatNumber.format(effectiveCalorieIntake)}</p>
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

      {activeModal === "food-history" && (
        <Modal title="Food History — 7 Days" onClose={() => setActiveModal(null)}>
          {(() => {
            const sorted = [...passportData.foodLog].sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`));
            const byDate = sorted.reduce<Record<string, FoodEntry[]>>((acc, entry) => {
              (acc[entry.date] ??= []).push(entry);
              return acc;
            }, {});
            const dates = Object.keys(byDate).sort((a, b) => b.localeCompare(a));
            return (
              <div className="space-y-5">
                {dates.map((date) => {
                  const entries = byDate[date];
                  const dayTotal = entries.reduce((s, e) => s + e.calories, 0);
                  const dayCarbs = entries.reduce((s, e) => s + e.carbs, 0);
                  const dayProtein = entries.reduce((s, e) => s + e.protein, 0);
                  const dayFat = entries.reduce((s, e) => s + e.fat, 0);
                  const label = date === activeFoodLogDate ? "Today" : date.slice(5).replace("-", "/");
                  return (
                    <div key={date}>
                      <div className="mb-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-3.5">
                        <div className="flex items-center justify-between mb-2.5">
                          <p className="text-sm font-extrabold text-slate-800">{label}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold text-slate-400">{entries.length} {entries.length === 1 ? "meal" : "meals"}</span>
                            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-xs font-extrabold text-white shadow-sm">{formatNumber.format(dayTotal)} kcal</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-xl bg-blue-50 px-3 py-2 text-center">
                            <p className="text-[10px] font-semibold text-blue-400 mb-0.5">Carbs</p>
                            <p className="text-sm font-extrabold text-blue-700">{dayCarbs}<span className="text-[10px] font-semibold ml-0.5">g</span></p>
                          </div>
                          <div className="rounded-xl bg-emerald-50 px-3 py-2 text-center">
                            <p className="text-[10px] font-semibold text-emerald-400 mb-0.5">Protein</p>
                            <p className="text-sm font-extrabold text-emerald-700">{dayProtein}<span className="text-[10px] font-semibold ml-0.5">g</span></p>
                          </div>
                          <div className="rounded-xl bg-orange-50 px-3 py-2 text-center">
                            <p className="text-[10px] font-semibold text-orange-400 mb-0.5">Fat</p>
                            <p className="text-sm font-extrabold text-orange-700">{dayFat}<span className="text-[10px] font-semibold ml-0.5">g</span></p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {entries.map((entry) => (
                          <div key={entry.id} className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
                            {entry.photoDataUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={entry.photoDataUrl} alt={entry.name} className="h-32 w-full object-cover" />
                            )}
                            <div className="p-3">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 mb-0.5">
                                    <span className="text-[10px] font-semibold text-slate-400">{entry.time}</span>
                                  </div>
                                  <p className="text-sm font-extrabold text-slate-800 leading-snug">{entry.name}</p>
                                </div>
                                <span className="shrink-0 text-sm font-extrabold text-amber-700">{formatNumber.format(entry.calories)}<span className="text-[10px] font-semibold text-slate-400 ml-0.5">kcal</span></span>
                              </div>
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                {entry.source === "golden_spoon" || entry.carbs > 0 ? (
                                  <>
                                    <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">Carbs {entry.carbs}g</span>
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Protein {entry.protein}g</span>
                                    <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold text-orange-700">Fat {entry.fat}g</span>
                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">Na {entry.sodium}mg</span>
                                  </>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Macro data not available</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
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
