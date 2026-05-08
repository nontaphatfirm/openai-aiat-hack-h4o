import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "mock",
    plan: {
      title: "Daily recovery plan",
      focus: "Sleep quality, stress balance, and clean air exposure",
      actions: [
        "Hydrate after waking",
        "Take a 10-minute walk before lunch",
        "Avoid high UV hours when possible",
      ],
    },
  });
}
