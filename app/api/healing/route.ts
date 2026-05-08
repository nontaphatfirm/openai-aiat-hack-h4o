import { NextResponse } from "next/server";
import { OpenAIRequestError, requestOpenAIJson } from "@/lib/openai-responses";

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

type HealingResponse = {
  plan: HealingPlan;
  advice: HealingAdvice;
  source: "openai" | "fallback";
  warning?: string;
};

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function mergePassportData(value: unknown): HealingPassport {
  if (!isRecord(value)) return defaultPassport;
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

function readHealingType(value: unknown): HealingType {
  return value === "mentality" ? "mentality" : "physical";
}

function readFeedback(value: unknown): FeedbackEntry[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is FeedbackEntry => {
    if (!isRecord(item)) return false;
    return (
      (item.type === "physical" || item.type === "mentality") &&
      typeof item.rating === "number" &&
      typeof item.symptom === "string" &&
      typeof item.createdAt === "string"
    );
  });
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

function createAdvice(feedback: FeedbackEntry[], activeType: HealingType): HealingAdvice {
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

function sanitizePlan(value: HealingPlan): HealingPlan {
  return {
    title: String(value.title || "Healing Plan"),
    subtitle: String(value.subtitle || "Personalized from the current health passport."),
    riskSignals: Array.isArray(value.riskSignals) ? value.riskSignals.map(String).slice(0, 4) : [],
    services: Array.isArray(value.services)
      ? value.services
          .map((service) => ({
            name: String(service.name || "Support service"),
            detail: String(service.detail || "Review with a qualified professional if symptoms change."),
          }))
          .slice(0, 4)
      : [],
    dailyActions: Array.isArray(value.dailyActions) ? value.dailyActions.map(String).slice(0, 4) : [],
  };
}

async function generateHealingPlan(passport: HealingPassport, activeType: HealingType, feedback: FeedbackEntry[]) {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["title", "subtitle", "riskSignals", "services", "dailyActions"],
    properties: {
      title: { type: "string" },
      subtitle: { type: "string" },
      riskSignals: { type: "array", minItems: 3, maxItems: 4, items: { type: "string" } },
      services: {
        type: "array",
        minItems: 4,
        maxItems: 4,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "detail"],
          properties: {
            name: { type: "string" },
            detail: { type: "string" },
          },
        },
      },
      dailyActions: { type: "array", minItems: 4, maxItems: 4, items: { type: "string" } },
    },
  };

  return requestOpenAIJson<HealingPlan>({
    model: MODEL,
    input: [
      {
        role: "system",
        content:
          "You are a wellness care-planning assistant for a hackathon demo. Create concise, non-diagnostic healing support plans. Do not claim to diagnose or treat disease. Mention professional consultation when symptoms are severe or not improving. Respect medication allergies, food allergies, chronic conditions, and feedback trends.",
      },
      {
        role: "user",
        content: JSON.stringify({
          healingType: activeType,
          passport,
          recentFeedback: feedback.filter((item) => item.type === activeType).slice(-6),
        }),
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "healing_plan",
        strict: true,
        schema,
      },
    },
    max_output_tokens: 900,
    temperature: 0.3,
  });
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    endpoint: "POST /api/healing",
    body: {
      passport: "Health passport object",
      activeType: "physical | mentality",
      feedback: "FeedbackEntry[]",
    },
  });
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const body = isRecord(payload) ? payload : {};
    const passport = mergePassportData(body.passport);
    const activeType = readHealingType(body.activeType);
    const feedback = readFeedback(body.feedback);
    const advice = createAdvice(feedback, activeType);
    let source: HealingResponse["source"] = "openai";
    let warning: string | undefined;
    let plan: HealingPlan;

    try {
      plan = sanitizePlan(await generateHealingPlan(passport, activeType, feedback));
    } catch (error) {
      source = "fallback";
      warning =
        error instanceof OpenAIRequestError
          ? error.message
          : "Unable to generate an AI healing plan, so the local fallback plan was used.";
      plan = createFallbackPlan(passport, activeType);
    }

    return NextResponse.json<HealingResponse>({ plan, advice, source, warning });
  } catch {
    return NextResponse.json({ error: "Unable to process healing request." }, { status: 400 });
  }
}
