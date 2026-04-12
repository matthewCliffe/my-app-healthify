import { NextResponse } from "next/server";
import { ACHIEVEMENTS } from "@/lib/mock-data";
import { getProfileServer } from "@/lib/server-data";

export async function GET() {
  try {
    const profile = await getProfileServer();
    return NextResponse.json({ items: ACHIEVEMENTS, completed: profile.achievements || [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}
