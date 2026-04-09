import { NextResponse } from "next/server";
import { sampleExercises } from "@/lib/mock-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").toLowerCase().trim();
  const apiKey = process.env.EXERCISE_DB_API_KEY;

  try {
    if (apiKey) {
      const query = q || "push up";
      const response = await fetch(`https://exercisedb.p.rapidapi.com/exercises/name/${encodeURIComponent(query)}`, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "exercisedb.p.rapidapi.com",
        },
        cache: "no-store",
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({ items: Array.isArray(data) ? data.slice(0, 8) : [] });
      }
    }
  } catch {
    // fall back to mock data below
  }

  const items = sampleExercises.filter((item) => {
    return !q || item.name.toLowerCase().includes(q) || item.bodyPart.toLowerCase().includes(q) || item.target.toLowerCase().includes(q);
  });

  return NextResponse.json({ items });
}
