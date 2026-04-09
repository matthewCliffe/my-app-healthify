import { NextResponse } from "next/server";
import { removeItem, updateItem } from "@/lib/server-data";
import type { Workout } from "@/lib/types";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payload = (await request.json()) as Workout;
    return NextResponse.json({ item: await updateItem("workouts", id, payload) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to update workout." }, { status: 400 });
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await removeItem("workouts", id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to delete workout." }, { status: 400 });
  }
}
