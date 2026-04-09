import { NextResponse } from "next/server";
import { samplePosts } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ items: samplePosts });
}
