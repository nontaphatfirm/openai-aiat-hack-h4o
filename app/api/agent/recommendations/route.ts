import { NextResponse } from "next/server";
import { OpenAIRequestError, requestOpenAIJson } from "@/lib/openai-responses";

type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
type JsonRecord = Record<string, JsonValue>;

type PassportProfile = {
  name?: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  medicationAllergies?: string;
  foodAllergies?: string;
  chronicConditions?: string;
  allergies?: string[] | string;
  underlyingConditions?: string[] | string;
};

type PassportData = {
  profile?: PassportProfile;
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

type RecommendationRequest = PassportData & {
  allergies?: string[] | string;
  underlyingConditions?: string[] | string;
  currentLocation?: string;
  pm25?: number;
  stressLevel?: string | number;
};

type MenuRecommendation = {
  name: string;
  ingredients: string[];
  estimatedCalories: number;
  reason: string;
  keyIngredientForResearch: string;
};

type ResearchPaper = {
  title: string;
  url: string;
  year: number | null;
};

type MenuWithResearch = MenuRecommendation & {
  research: ResearchPaper | null;
};

type RecommendationResponse = {
  menus: MenuWithResearch[];
  disclaimer: string;
  source: "openai" | "fallback";
  warning?: string;
};

type LlmRecommendationResponse = {
  menus: MenuRecommendation[];
};

type SemanticScholarResponse = {
  data?: {
    title?: string;
    url?: string;
    year?: number | null;
  }[];
};

const DISCLAIMER =
  "This system provides preliminary wellness suggestions only and does not replace medical diagnosis or advice from a physician, dietitian, or pharmacist.";

const MODEL = process.env.OPENAI_MODEL ?? "gpt-4o";

const fallbackMenus: MenuRecommendation[] = [
  {
    name: "Ginger Chicken Brown Rice Congee",
    ingredients: ["chicken breast", "brown rice", "ginger", "spring onion", "carrot"],
    estimatedCalories: 420,
    reason: "Lean protein and slow-release carbohydrates support steady energy while ginger keeps the dish light.",
    keyIngredientForResearch: "Zingiber officinale",
  },
  {
    name: "Turmeric Tofu and Pumpkin Bowl",
    ingredients: ["firm tofu", "pumpkin", "turmeric", "cucumber", "brown rice"],
    estimatedCalories: 460,
    reason: "Plant protein, fiber, and turmeric fit an anti-inflammatory pattern without added sugar.",
    keyIngredientForResearch: "Curcuma longa",
  },
  {
    name: "Moringa Egg White Soup",
    ingredients: ["egg white", "moringa leaves", "winter melon", "garlic", "black pepper"],
    estimatedCalories: 310,
    reason: "A lighter protein-forward soup with leafy micronutrients for recovery and satiety.",
    keyIngredientForResearch: "Moringa oleifera",
  },
  {
    name: "Centella Chicken Salad",
    ingredients: ["chicken breast", "Centella asiatica", "cucumber", "tomato", "lime"],
    estimatedCalories: 340,
    reason: "Fresh herbs and lean protein make this suitable for a clean, antioxidant-rich lunch.",
    keyIngredientForResearch: "Centella asiatica",
  },
  {
    name: "Butterfly Pea Oat Porridge",
    ingredients: ["rolled oats", "butterfly pea flower", "chia seeds", "guava", "low-fat milk"],
    estimatedCalories: 390,
    reason: "Oats and chia add fiber for glucose steadiness, with fruit chosen for vitamin C.",
    keyIngredientForResearch: "Clitoria ternatea",
  },
  {
    name: "Holy Basil Turkey Lettuce Rice",
    ingredients: ["lean turkey", "holy basil", "lettuce", "brown rice", "long bean"],
    estimatedCalories: 450,
    reason: "High protein and herbs support satiety and focus without relying on heavy sauces.",
    keyIngredientForResearch: "Ocimum tenuiflorum",
  },
  {
    name: "Lemongrass Fish Rice Soup",
    ingredients: ["white fish", "lemongrass", "brown rice", "ginger", "coriander"],
    estimatedCalories: 400,
    reason: "Gentle protein and aromatics are easy to digest and suitable after a stressful day.",
    keyIngredientForResearch: "Cymbopogon citratus",
  },
  {
    name: "Amla Guava Yogurt Bowl",
    ingredients: ["plain yogurt", "amla", "guava", "rolled oats", "sunflower seeds"],
    estimatedCalories: 360,
    reason: "Vitamin C-rich fruits and protein support antioxidant needs, especially on hazy days.",
    keyIngredientForResearch: "Phyllanthus emblica",
  },
  {
    name: "Broccoli Chicken Soba",
    ingredients: ["chicken breast", "broccoli", "soba noodles", "sesame seeds", "lime"],
    estimatedCalories: 480,
    reason: "Balanced protein, fiber, and cruciferous vegetables make it filling without excess sugar.",
    keyIngredientForResearch: "Brassica oleracea",
  },
  {
    name: "Gynostemma Clear Soup with Tofu",
    ingredients: ["firm tofu", "gynostemma leaves", "winter melon", "carrot", "garlic"],
    estimatedCalories: 300,
    reason: "A low-calorie botanical soup for lighter meals while keeping protein present.",
    keyIngredientForResearch: "Gynostemma pentaphyllum",
  },
  {
    name: "Thai Green Papaya Chicken Plate",
    ingredients: ["chicken breast", "green papaya", "long bean", "tomato", "lime"],
    estimatedCalories: 380,
    reason: "Crunchy vegetables and lean protein create a high-fiber meal with no added sugar.",
    keyIngredientForResearch: "Carica papaya",
  },
  {
    name: "Riceberry Egg and Cucumber Bowl",
    ingredients: ["egg", "riceberry rice", "cucumber", "carrot", "ginger"],
    estimatedCalories: 430,
    reason: "Riceberry and egg provide a practical nutrient-dense base for stable energy.",
    keyIngredientForResearch: "Oryza sativa",
  },
];

function isJsonRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function splitTerms(value: string[] | string | undefined): string[] {
  if (Array.isArray(value)) return value.map((item) => item.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  return value
    .split(/[,;/\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, " ").trim();
}

function termVariants(value: string) {
  const normalized = normalizeText(value);
  const terms = new Set([normalized]);
  if (normalized.endsWith("s")) terms.add(normalized.slice(0, -1));
  return Array.from(terms).filter((term) => term.length > 1);
}

function containsTerm(text: string, term: string) {
  const normalizedText = ` ${normalizeText(text)} `;
  return normalizedText.includes(` ${term} `) || normalizedText.includes(term);
}

function getContraindicatedTerms(conditions: string[]) {
  const joinedConditions = normalizeText(conditions.join(" "));
  const terms: string[] = [];

  if (/kidney|renal|ckd|ไต/.test(joinedConditions)) {
    terms.push("banana", "spinach", "coconut water", "salted", "fish sauce", "soy sauce", "seaweed", "processed meat");
  }

  if (/diabetes|glucose|เบาหวาน/.test(joinedConditions)) {
    terms.push("sugar", "sweetened", "syrup", "honey", "juice", "white rice");
  }

  if (/hypertension|blood pressure|ความดัน/.test(joinedConditions)) {
    terms.push("salted", "fish sauce", "soy sauce", "processed meat", "sausage", "ham");
  }

  if (/gout|uric|เกาต์/.test(joinedConditions)) {
    terms.push("organ meat", "sardine", "anchovy", "beer");
  }

  return terms;
}

function normalizeRequest(input: unknown): RecommendationRequest {
  if (!isJsonRecord(input)) return {};
  return input as RecommendationRequest;
}

function getProfileSummary(requestBody: RecommendationRequest) {
  const profile = requestBody.profile ?? {};
  const dynamicHealth = requestBody.dynamicHealth ?? {};
  const environment = requestBody.environment ?? {};
  const interaction = requestBody.interaction ?? {};
  const allergies = [
    ...splitTerms(requestBody.allergies),
    ...splitTerms(profile.allergies),
    ...splitTerms(profile.foodAllergies),
    ...splitTerms(profile.medicationAllergies),
  ];
  const underlyingConditions = [
    ...splitTerms(requestBody.underlyingConditions),
    ...splitTerms(profile.underlyingConditions),
    ...splitTerms(profile.chronicConditions),
  ];

  return {
    name: profile.name,
    age: asNumber(profile.age),
    heightCm: asNumber(profile.heightCm),
    weightKg: asNumber(profile.weightKg),
    bmi: asNumber(profile.bmi),
    allergies: Array.from(new Set(allergies)),
    underlyingConditions: Array.from(new Set(underlyingConditions)),
    currentLocation: requestBody.currentLocation ?? environment.locationName ?? environment.location,
    pm25: asNumber(requestBody.pm25) ?? asNumber(environment.pm25),
    stressLevel: requestBody.stressLevel ?? dynamicHealth.stress?.level ?? dynamicHealth.stress?.score,
    sleepHours: asNumber(dynamicHealth.sleep?.durationHours),
    sleepQuality: asNumber(dynamicHealth.sleep?.quality),
    activityLevel: dynamicHealth.pai?.range ?? dynamicHealth.pai?.score,
    calories: dynamicHealth.calories,
    goal: interaction.goal,
    dietaryPreference: interaction.diet,
    feeling: interaction.feeling,
    notes: interaction.notes,
  };
}

function isMenuSafe(menu: MenuRecommendation, allergies: string[], conditions: string[]) {
  const ingredientText = menu.ingredients.join(" ");
  const allergenTerms = allergies.flatMap(termVariants);
  const contraindicatedTerms = getContraindicatedTerms(conditions).flatMap(termVariants);

  return ![...allergenTerms, ...contraindicatedTerms].some((term) => containsTerm(ingredientText, term));
}

function sanitizeMenus(menus: MenuRecommendation[], allergies: string[], conditions: string[]) {
  const seen = new Set<string>();
  const safeMenus: MenuRecommendation[] = [];

  for (const menu of [...menus, ...fallbackMenus]) {
    if (!menu.name || !Array.isArray(menu.ingredients) || !menu.reason || !menu.keyIngredientForResearch) continue;

    const normalizedName = normalizeText(menu.name);
    if (seen.has(normalizedName)) continue;
    if (!isMenuSafe(menu, allergies, conditions)) continue;

    seen.add(normalizedName);
    safeMenus.push({
      name: menu.name,
      ingredients: menu.ingredients.map(String).filter(Boolean),
      estimatedCalories: Math.max(0, Math.round(Number(menu.estimatedCalories) || 0)),
      reason: menu.reason,
      keyIngredientForResearch: menu.keyIngredientForResearch,
    });

    if (safeMenus.length === 10) break;
  }

  return safeMenus;
}

async function generateMenus(profileSummary: ReturnType<typeof getProfileSummary>) {
  const schema = {
    type: "object",
    additionalProperties: false,
    required: ["menus"],
    properties: {
      menus: {
        type: "array",
        minItems: 10,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          required: ["name", "ingredients", "estimatedCalories", "reason", "keyIngredientForResearch"],
          properties: {
            name: { type: "string" },
            ingredients: {
              type: "array",
              minItems: 3,
              items: { type: "string" },
            },
            estimatedCalories: { type: "number" },
            reason: { type: "string" },
            keyIngredientForResearch: { type: "string" },
          },
        },
      },
    },
  };

  return requestOpenAIJson<LlmRecommendationResponse>({
    model: MODEL,
    input: [
      {
        role: "system",
        content:
          "You are a personalized nutrition consultant for a Thai food-as-medicine demo. Return only valid JSON that matches the schema. Write all user-facing text in English. Make 10 realistic meals using local ingredients when possible. Safety is critical: never include any ingredient related to the user's allergies. Adapt meals for underlying conditions such as diabetes, kidney disease, hypertension, gout, asthma, pregnancy, or medication interactions. Keep explanations concise and non-diagnostic.",
      },
      {
        role: "user",
        content: `Create 10 personalized menu recommendations for this profile. Profile JSON: ${JSON.stringify(profileSummary)}. Include one English botanical, herb, or main ingredient name in keyIngredientForResearch for Semantic Scholar lookup.`,
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "nutrition_recommendations",
        strict: true,
        schema,
      },
    },
    max_output_tokens: 3000,
    temperature: 0.4,
  });
}

async function fetchResearch(keyword: string): Promise<ResearchPaper | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);

  try {
    const params = new URLSearchParams({
      query: keyword,
      limit: "1",
      fields: "title,url,year",
    });
    const response = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?${params.toString()}`, {
      signal: controller.signal,
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as SemanticScholarResponse;
    const paper = payload.data?.[0];
    if (!paper?.title || !paper.url) return null;

    return {
      title: paper.title,
      url: paper.url,
      year: typeof paper.year === "number" ? paper.year : null,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function attachResearch(menus: MenuRecommendation[]) {
  return Promise.all(
    menus.map(async (menu) => ({
      ...menu,
      research: await fetchResearch(menu.keyIngredientForResearch),
    })),
  );
}

export async function GET() {
  return NextResponse.json({
    status: "ready",
    endpoint: "POST /api/agent/recommendations",
  });
}

export async function POST(request: Request) {
  try {
    const requestBody = normalizeRequest(await request.json());
    const profileSummary = getProfileSummary(requestBody);
    let source: RecommendationResponse["source"] = "openai";
    let warning: string | undefined;
    let generatedMenus: MenuRecommendation[] = [];

    try {
      const llmResponse = await generateMenus(profileSummary);
      generatedMenus = llmResponse.menus;
    } catch (error) {
      source = "fallback";
      warning =
        error instanceof OpenAIRequestError
          ? error.message
          : "Unable to generate AI menus, so demo-safe fallback menus were used.";
    }

    const safeMenus = sanitizeMenus(generatedMenus, profileSummary.allergies, profileSummary.underlyingConditions);
    const menus = await attachResearch(safeMenus);

    return NextResponse.json<RecommendationResponse>({
      menus,
      disclaimer: DISCLAIMER,
      source,
      warning,
    });
  } catch {
    return NextResponse.json({ error: "Unable to process recommendation request." }, { status: 400 });
  }
}
