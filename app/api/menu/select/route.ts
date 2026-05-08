import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "mock",
    selectedMenu: {
      meal: "Dinner",
      name: "Ginger chicken rice bowl",
      estimatedCalories: 640,
    },
  });
}
