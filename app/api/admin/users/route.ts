import { NextResponse } from "next/server";
import { addSampleVisualizationDataForUser, getAllUsers, unlockAllAchievementsForUser } from "@/lib/server-data";
import { requireAdminSession } from "@/lib/firebase";

export async function GET() {
  try {
    await requireAdminSession();
    return NextResponse.json({ items: await getAllUsers() });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden." }, { status: 403 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const { action, userId } = await request.json();
    if (action === "unlock-achievements") {
      return NextResponse.json({ item: await unlockAllAchievementsForUser(userId) });
    }
    if (action === "add-sample-visualization-data") {
      return NextResponse.json({ item: await addSampleVisualizationDataForUser(userId) });
    }
    return NextResponse.json({ error: "Unsupported admin action." }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Forbidden." }, { status: 403 });
  }
}
