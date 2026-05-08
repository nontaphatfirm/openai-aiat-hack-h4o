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
    if (imageUrl || hasTriedAi) return;

    async function generateMissingImage() {
      setIsGenerating(true);
      setHasTriedAi(true);

      try {
        setImageUrl(await requestGeneratedImage(prompt));
      } catch {
        setHasFailedAi(true);
        setImageUrl("/placeholder-food.jpg");
      } finally {
        setIsGenerating(false);
      }
    }

    void generateMissingImage();
  }, [hasTriedAi, imageUrl, prompt]);

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
      setImageUrl(await requestGeneratedImage(prompt));
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
