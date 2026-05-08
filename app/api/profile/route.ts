import { NextResponse } from "next/server";

const profile = {
  name: "Nara",
  age: "32",
  city: "Bangkok",
  district: "Pathum Wan",
  dietStyle: "Balanced Thai, low sugar, high fiber",
  conditions: "fatigue, mild acid reflux, seasonal allergy",
  medications: "",
  foodAllergies: "",
  todaySignals: {
    pm25Exposure: "Moderate, 34 ug/m3",
    sleepHours: "6.5",
    sleepQuality: 3,
    workload: 4,
    energy: 2,
    foodPreferenceToday: "",
    voiceMoodNote: "",
  },
};

export async function GET() {
  return NextResponse.json(profile);
}

export async function POST(request: Request) {
  const body = await request.json();

  return NextResponse.json({
    ok: true,
    profile: body,
  });
}
