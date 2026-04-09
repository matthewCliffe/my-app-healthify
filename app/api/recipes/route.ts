import { NextResponse } from "next/server";
import { createItem, getDashboardData } from "@/lib/server-data";
import type { Recipe } from "@/lib/types";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ items: data.recipes });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Recipe;
    if (!payload.id || !payload.name) {
      return NextResponse.json({ error: "Recipe id and name are required." }, { status: 400 });
    }
    return NextResponse.json({ item: await createItem("recipes", payload) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to create recipe." }, { status: 400 });
  }
}
