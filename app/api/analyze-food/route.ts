import { requestOpenAIJson, OpenAIRequestError } from "@/lib/openai-responses";
import { NextResponse } from "next/server";

type AnalyzeFoodJsonBody = {
  image?: string;
  imageBase64?: string;
  imageDataUrl?: string;
  mimeType?: string;
};

type FoodAnalysis = {
  foodName: string;
  estimatedCalories: number;
};

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeImageDataUrl(body: AnalyzeFoodJsonBody) {
  const image = body.imageDataUrl ?? body.image ?? body.imageBase64;

  if (!image || typeof image !== "string") {
    throw new Error("Image is required.");
  }

  if (image.startsWith("data:image/")) {
    return image;
  }

  const mimeType = body.mimeType?.startsWith("image/") ? body.mimeType : "image/jpeg";
  return `data:${mimeType};base64,${image}`;
}

async function getImageDataUrl(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      throw new Error("FormData field 'image' must be a file.");
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    return `data:${image.type || "image/jpeg"};base64,${buffer.toString("base64")}`;
  }

  const body = (await request.json()) as unknown;
  if (!isJsonObject(body)) {
    throw new Error("Request body must be a JSON object.");
  }

  return normalizeImageDataUrl(body as AnalyzeFoodJsonBody);
}

function sanitizeFoodAnalysis(value: FoodAnalysis): FoodAnalysis {
  if (typeof value.foodName !== "string" || !Number.isFinite(value.estimatedCalories)) {
    throw new Error("Food analysis response is invalid.");
  }

  return {
    foodName: value.foodName.trim() || "Unknown food",
    estimatedCalories: Math.max(0, Math.round(value.estimatedCalories)),
  };
}

export async function POST(request: Request) {
  try {
    const imageDataUrl = await getImageDataUrl(request);
    const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

    const analysis = await requestOpenAIJson<FoodAnalysis>({
      model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analyze this food image. Return ONLY a valid JSON object with 'foodName' (string) and 'estimatedCalories' (number).",
            },
            {
              type: "input_image",
              image_url: imageDataUrl,
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "food_calorie_analysis",
          strict: true,
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              foodName: { type: "string" },
              estimatedCalories: { type: "number" },
            },
            required: ["foodName", "estimatedCalories"],
          },
        },
      },
      max_output_tokens: 200,
      temperature: 0.2,
    });

    return NextResponse.json(sanitizeFoodAnalysis(analysis));
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Unable to analyze food image.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
