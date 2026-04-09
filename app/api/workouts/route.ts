import { NextResponse } from "next/server";
import { createItem, getDashboardData } from "@/lib/server-data";
import type { Workout } from "@/lib/types";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ items: data.workouts });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Workout;
    if (!payload.id || !payload.exercise) {
      return NextResponse.json({ error: "Workout id and exercise are required." }, { status: 400 });
    }
    return NextResponse.json({ item: await createItem("workouts", payload) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create workout." }, { status: 400 });
  }
}
