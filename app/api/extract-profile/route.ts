import { requestOpenAIJson, OpenAIRequestError } from "@/lib/openai-responses";
import { NextResponse } from "next/server";

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

type ExtractProfileBody = {
  text: string;
  currentProfile: Profile;
};

const profileSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    name: { type: "string" },
    age: { type: "number" },
    heightCm: { type: "number" },
    weightKg: { type: "number" },
    bmi: { type: "number" },
    medicationAllergies: { type: "string" },
    foodAllergies: { type: "string" },
    chronicConditions: { type: "string" },
  },
  required: [
    "name",
    "age",
    "heightCm",
    "weightKg",
    "bmi",
    "medicationAllergies",
    "foodAllergies",
    "chronicConditions",
  ],
};

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function calculateBmi(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  if (!heightM || !weightKg) return 0;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function readNumber(value: unknown, fallback: number) {
  return Number.isFinite(value) ? Number(value) : fallback;
}

function readString(value: unknown, fallback: string) {
  return typeof value === "string" ? value : fallback;
}

function sanitizeProfile(value: unknown, fallback: Profile): Profile {
  if (!isJsonObject(value)) {
    throw new Error("Profile response is invalid.");
  }

  const heightCm = readNumber(value.heightCm, fallback.heightCm);
  const weightKg = readNumber(value.weightKg, fallback.weightKg);

  return {
    name: readString(value.name, fallback.name).trim(),
    age: Math.max(0, Math.round(readNumber(value.age, fallback.age))),
    heightCm: Math.max(0, Math.round(heightCm)),
    weightKg: Math.max(0, Number(weightKg.toFixed(1))),
    bmi: calculateBmi(heightCm, weightKg),
    medicationAllergies: readString(value.medicationAllergies, fallback.medicationAllergies).trim(),
    foodAllergies: readString(value.foodAllergies, fallback.foodAllergies).trim(),
    chronicConditions: readString(value.chronicConditions, fallback.chronicConditions).trim(),
  };
}

function validateBody(body: unknown): ExtractProfileBody {
  if (!isJsonObject(body) || typeof body.text !== "string" || !isJsonObject(body.currentProfile)) {
    throw new Error("Body must include text and currentProfile.");
  }

  const currentProfile = sanitizeProfile(body.currentProfile, {
    name: "",
    age: 0,
    heightCm: 0,
    weightKg: 0,
    bmi: 0,
    medicationAllergies: "",
    foodAllergies: "",
    chronicConditions: "",
  });

  return {
    text: body.text,
    currentProfile,
  };
}

export async function POST(request: Request) {
  try {
    const body = validateBody((await request.json()) as unknown);
    const text = body.text.trim();

    if (!text) {
      return NextResponse.json({ profile: body.currentProfile });
    }

    const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

    const updatedProfile = await requestOpenAIJson<Profile>({
      model,
      input: [
        {
          role: "system",
          content:
            "You update a user's health profile from a short voice transcript. Preserve existing profile values unless the transcript explicitly changes them. Map food allergies like peanuts or shellfish to foodAllergies, medicine reactions to medicationAllergies, and diagnoses or long-term issues to chronicConditions. Recalculate BMI from heightCm and weightKg.",
        },
        {
          role: "user",
          content: JSON.stringify({
            currentProfile: body.currentProfile,
            transcript: text,
          }),
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "updated_health_profile",
          strict: true,
          schema: profileSchema,
        },
      },
      max_output_tokens: 450,
      temperature: 0,
    });

    return NextResponse.json({
      profile: sanitizeProfile(updatedProfile, body.currentProfile),
    });
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Unable to extract profile.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
