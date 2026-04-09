import { NextResponse } from "next/server";
import { defaultProfile } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json({ items: defaultProfile.achievements });
}
