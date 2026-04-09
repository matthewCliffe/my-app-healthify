import { NextResponse } from "next/server";
import { getProfileServer, updateProfile } from "@/lib/server-data";

export async function GET() {
  try {
    return NextResponse.json({ item: await getProfileServer() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}

export async function PATCH(request: Request) {
  try {
    const payload = await request.json();
    return NextResponse.json({ item: await updateProfile(payload) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update profile." }, { status: 400 });
  }
}
