import { NextResponse } from "next/server";
import { createItem, getDashboardData, getProfileServer } from "@/lib/server-data";
import type { SharePost } from "@/lib/types";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json({ items: data.posts });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as SharePost;
    if (!payload.id || !payload.text || !payload.kind) {
      return NextResponse.json({ error: "Post id, type, and text are required." }, { status: 400 });
    }
    const profile = await getProfileServer();
    const post = { ...payload, author: profile.name, authorEmail: profile.email };
    return NextResponse.json({ item: await createItem("posts", post) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to share item." }, { status: 400 });
  }
}
