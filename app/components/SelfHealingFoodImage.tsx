"use client";

/* eslint-disable @next/next/no-img-element */

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type SelfHealingFoodImageProps = {
  src?: string | null;
  prompt: string;
  alt: string;
  className?: string;
};

type GenerateImageResponse = {
  imageUrl?: string;
  error?: string;
};

const GENERATED_IMAGE_CACHE_KEY = "generated_food_images";
const MAX_CACHED_GENERATED_IMAGES = 24;

function getPromptCacheKey(prompt: string) {
  return prompt.trim().toLowerCase().replace(/\s+/g, " ");
}

function readGeneratedImageCache() {
  if (typeof window === "undefined") return {};

  try {
    const storedValue = window.localStorage.getItem(GENERATED_IMAGE_CACHE_KEY);
    if (!storedValue) return {};

    const parsed = JSON.parse(storedValue) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function readCachedGeneratedImage(prompt: string) {
  const cacheKey = getPromptCacheKey(prompt);
  if (!cacheKey) return "";

  const cachedImage = readGeneratedImageCache()[cacheKey];
  return typeof cachedImage === "string" ? cachedImage : "";
}

function writeCachedGeneratedImage(prompt: string, imageUrl: string) {
  if (typeof window === "undefined" || !imageUrl.startsWith("data:image/")) return;

  const cacheKey = getPromptCacheKey(prompt);
  if (!cacheKey) return;

  try {
    const cache = readGeneratedImageCache();
    let entries = Object.entries({ ...cache, [cacheKey]: imageUrl }).slice(-MAX_CACHED_GENERATED_IMAGES);

    while (entries.length) {
      try {
        window.localStorage.setItem(GENERATED_IMAGE_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
        return;
      } catch {
        entries = entries.slice(1);
      }
    }
  } catch {
    // Keep showing the generated image even when browser storage is full.
  }
}

async function requestGeneratedImage(prompt: string) {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  const payload = (await response.json()) as GenerateImageResponse;
  if (!response.ok || !payload.imageUrl) {
    throw new Error(payload.error ?? "Unable to generate image.");
  }

  return payload.imageUrl;
}

export function SelfHealingFoodImage({ src, prompt, alt, className = "" }: SelfHealingFoodImageProps) {
  const [imageUrl, setImageUrl] = useState(src ?? "");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasTriedAi, setHasTriedAi] = useState(false);
  const [hasFailedAi, setHasFailedAi] = useState(false);

  useEffect(() => {
    async function syncImage() {
      if (src) {
        if (imageUrl !== src) setImageUrl(src);
        return;
      }

      if (imageUrl || hasTriedAi) return;

      const cachedImage = readCachedGeneratedImage(prompt);
      if (cachedImage) {
        setImageUrl(cachedImage);
        return;
      }

      setIsGenerating(true);
      setHasTriedAi(true);

      try {
        const generatedImageUrl = await requestGeneratedImage(prompt);
        writeCachedGeneratedImage(prompt, generatedImageUrl);
        setImageUrl(generatedImageUrl);
      } catch {
        setHasFailedAi(true);
        setImageUrl("/placeholder-food.jpg");
      } finally {
        setIsGenerating(false);
      }
    }

    void syncImage();
  }, [hasTriedAi, imageUrl, prompt, src]);

  async function handleImageError() {
    if (hasTriedAi) {
      setHasFailedAi(true);
      setImageUrl("/placeholder-food.jpg");
      return;
    }

    setIsGenerating(true);
    setImageUrl("");
    setHasTriedAi(true);

    try {
      const generatedImageUrl = await requestGeneratedImage(prompt);
      writeCachedGeneratedImage(prompt, generatedImageUrl);
      setImageUrl(generatedImageUrl);
    } catch {
      setHasFailedAi(true);
      setImageUrl("/placeholder-food.jpg");
    } finally {
      setIsGenerating(false);
    }
  }

  if (isGenerating || !imageUrl) {
    return (
      <div className={`flex h-full w-full items-center justify-center rounded-lg bg-slate-200 ${className}`}>
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (hasFailedAi && imageUrl === "/placeholder-food.jpg") return;
        void handleImageError();
      }}
    />
  );
}
