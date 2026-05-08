import { NextResponse } from "next/server";

type GenerateImageRequest = {
  prompt?: unknown;
};

type OpenAIImageGenerationResponse = {
  data?: {
    url?: string;
  }[];
  error?: {
    message?: string;
  };
};

function getPrompt(body: GenerateImageRequest) {
  return typeof body.prompt === "string" ? body.prompt.trim() : "";
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured." }, { status: 503 });
    }

    const prompt = getPrompt((await request.json()) as GenerateImageRequest);
    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required." }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-2",
        prompt: `High quality professional food photography of: ${prompt}`,
        size: "256x256",
        n: 1,
      }),
    });

    const payload = (await response.json()) as OpenAIImageGenerationResponse;
    if (!response.ok) {
      return NextResponse.json(
        { error: payload.error?.message ?? "Image generation failed." },
        { status: response.status },
      );
    }

    const imageUrl = payload.data?.[0]?.url;
    if (!imageUrl) {
      return NextResponse.json({ error: "OpenAI did not return an image URL." }, { status: 502 });
    }

    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json({ error: "Unable to generate image." }, { status: 500 });
  }
}
