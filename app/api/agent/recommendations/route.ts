import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "mock",
    recommendations: [
      "Prioritize magnesium-rich foods tonight",
      "Keep dinner lighter if sleep quality drops",
      "Use a mask outdoors if PM 2.5 rises above moderate",
    ],
  });
}
