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

type SearchImageResponse = {
  imageUrls?: string[];
  error?: string;
};

const TAVILY_IMAGE_CACHE_KEY = "tavily_food_images";
const MAX_CACHED_IMAGE_SEARCHES = 32;
const PLACEHOLDER_IMAGE = "/placeholder-food.jpg";

function getPromptCacheKey(prompt: string) {
  return prompt.trim().toLowerCase().replace(/\s+/g, " ");
}

function readImageCache() {
  if (typeof window === "undefined") return {};

  try {
    const storedValue = window.localStorage.getItem(TAVILY_IMAGE_CACHE_KEY);
    if (!storedValue) return {};

    const parsed = JSON.parse(storedValue) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

function readCachedImages(prompt: string) {
  const cacheKey = getPromptCacheKey(prompt);
  if (!cacheKey) return [];

  const cachedImages = readImageCache()[cacheKey];
  return Array.isArray(cachedImages) ? cachedImages.filter((url) => typeof url === "string" && url) : [];
}

function writeCachedImages(prompt: string, imageUrls: string[]) {
  if (typeof window === "undefined" || !imageUrls.length) return;

  const cacheKey = getPromptCacheKey(prompt);
  if (!cacheKey) return;

  try {
    const cache = readImageCache();
    const entries = Object.entries({ ...cache, [cacheKey]: imageUrls }).slice(-MAX_CACHED_IMAGE_SEARCHES);
    window.localStorage.setItem(TAVILY_IMAGE_CACHE_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {
    // Ignore storage pressure; the in-memory result still renders.
  }
}

async function requestTavilyImages(prompt: string) {
  const response = await fetch("/api/search-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: prompt }),
  });

  const payload = (await response.json()) as SearchImageResponse;
  if (!response.ok || !payload.imageUrls?.length) {
    throw new Error(payload.error ?? "Unable to search images.");
  }

  return payload.imageUrls;
}

export function SelfHealingFoodImage({ src, prompt, alt, className = "" }: SelfHealingFoodImageProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(() => (src ? [src] : []));
  const [imageIndex, setImageIndex] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    async function syncImages() {
      if (src || imageUrls.length || hasSearched) return;

      const cachedImages = readCachedImages(prompt);
      if (cachedImages.length) {
        setImageUrls(cachedImages);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const searchedImages = await requestTavilyImages(prompt);
        writeCachedImages(prompt, searchedImages);
        setImageUrls(searchedImages);
        setImageIndex(0);
      } catch {
        setHasFailed(true);
        setImageUrls([PLACEHOLDER_IMAGE]);
      } finally {
        setIsSearching(false);
      }
    }

    void syncImages();
  }, [hasSearched, imageUrls.length, prompt, src]);

  async function searchFallbackImages() {
    setIsSearching(true);
    setHasSearched(true);

    try {
      const searchedImages = await requestTavilyImages(prompt);
      writeCachedImages(prompt, searchedImages);
      setImageUrls(searchedImages);
      setImageIndex(0);
    } catch {
      setHasFailed(true);
      setImageUrls([PLACEHOLDER_IMAGE]);
      setImageIndex(0);
    } finally {
      setIsSearching(false);
    }
  }

  function handleImageError() {
    if (imageIndex < imageUrls.length - 1) {
      setImageIndex((current) => current + 1);
      return;
    }

    if (!hasSearched) {
      void searchFallbackImages();
      return;
    }

    if (hasFailed && imageUrls[imageIndex] === PLACEHOLDER_IMAGE) return;
    setHasFailed(true);
    setImageUrls([PLACEHOLDER_IMAGE]);
    setImageIndex(0);
  }

  const imageUrl = imageUrls[imageIndex] ?? "";

  if (isSearching || !imageUrl) {
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
      onError={handleImageError}
    />
  );
}
