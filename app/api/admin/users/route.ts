import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/firebase";

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json({ items: [{ email: "admin@healthify.app", role: "admin" }, { email: "demo@healthify.app", role: "user" }] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden." }, { status: 403 });
  }
}
