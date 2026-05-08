import { NextResponse } from "next/server";

type SearchImageRequest = {
  query?: unknown;
};

type TavilyImageItem = string | { url?: string };

type TavilySearchResponse = {
  images?: TavilyImageItem[];
  results?: {
    images?: TavilyImageItem[];
  }[];
};

function getQuery(body: SearchImageRequest) {
  return typeof body.query === "string" ? body.query.trim() : "";
}

function getTavilyImageUrl(image: TavilyImageItem | undefined) {
  if (typeof image === "string") return image;
  return typeof image?.url === "string" ? image.url : null;
}

function isUsableImageUrl(value: string | null): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function extractTavilyImages(payload: TavilySearchResponse) {
  const seen = new Set<string>();
  const images = [
    ...(payload.images ?? []),
    ...(payload.results ?? []).flatMap((result) => result.images ?? []),
  ];

  return images
    .map(getTavilyImageUrl)
    .filter(isUsableImageUrl)
    .filter((imageUrl) => {
      if (seen.has(imageUrl)) return false;
      seen.add(imageUrl);
      return true;
    });
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "TAVILY_API_KEY is not configured." }, { status: 503 });
    }

    const query = getQuery((await request.json()) as SearchImageRequest);
    if (!query) {
      return NextResponse.json({ error: "Query is required." }, { status: 400 });
    }

    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `real food photo ${query}`,
        topic: "general",
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
        include_images: true,
        include_image_descriptions: false,
        max_results: 6,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Tavily image search failed." }, { status: response.status });
    }

    const imageUrls = extractTavilyImages((await response.json()) as TavilySearchResponse);
    if (!imageUrls.length) {
      return NextResponse.json({ error: "No usable images found." }, { status: 404 });
    }

    return NextResponse.json({ imageUrls });
  } catch {
    return NextResponse.json({ error: "Unable to search images." }, { status: 500 });
  }
}
