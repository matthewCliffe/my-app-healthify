import { NextResponse } from "next/server";
import { clearSessionCookies } from "@/lib/firebase";

export async function POST() {
  await clearSessionCookies();
  return NextResponse.json({ ok: true });
}
