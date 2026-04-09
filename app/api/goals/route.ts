import { NextResponse } from "next/server";
import { createItem, getDashboardData } from "@/lib/server-data";
import type { Goal } from "@/lib/types";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ items: data.goals });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Goal;
    if (!payload.id || !payload.title || !payload.target || !payload.category) {
      return NextResponse.json({ error: "Goal id, title, target, and category are required." }, { status: 400 });
    }
    return NextResponse.json({ item: await createItem("goals", payload) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create goal." }, { status: 400 });
  }
}
