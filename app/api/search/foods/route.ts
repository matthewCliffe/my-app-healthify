import { NextResponse } from "next/server";
import { sampleFoods } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim().toLowerCase();

  const items = sampleFoods
    .filter((item) => !q || String(item.food_name).toLowerCase().includes(q))
    .slice(0, 12);

  return NextResponse.json({ items, source: "local" });
}
