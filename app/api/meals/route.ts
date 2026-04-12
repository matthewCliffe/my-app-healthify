import { NextResponse } from "next/server";
import { createItem, getDashboardData, syncAchievements } from "@/lib/server-data";
import type { Meal } from "@/lib/types";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ items: data.meals });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Meal;
    if (!payload.id || !payload.name) {
      return NextResponse.json({ error: "Meal id and name are required." }, { status: 400 });
    }
    const item = await createItem("meals", payload);
    const synced = await syncAchievements();
    return NextResponse.json({ item, profile: synced.profile, notification: synced.notification }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create meal." }, { status: 400 });
  }
}
