import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    status: "mock",
    message: "Feedback received for the mock frontend.",
  });
}
