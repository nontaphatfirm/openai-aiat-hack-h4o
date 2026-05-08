import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "mock",
    profile: {
      name: "Maya Chen",
      age: 32,
      heightCm: 168,
      weightKg: 62,
      allergies: ["Penicillin", "Shellfish", "Peanuts"],
      chronicConditions: ["Mild asthma", "Seasonal allergies"],
    },
  });
}
