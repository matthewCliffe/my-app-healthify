import { NextResponse } from "next/server";
import { getSession, hasFirebaseConfig, lookupUser } from "@/lib/firebase";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ user: null }, { status: 401 });

  if (!hasFirebaseConfig()) {
    return NextResponse.json({ user: { email: session.email, role: session.role, localId: session.localId } });
  }

  try {
    const user = await lookupUser(session.idToken);
    return NextResponse.json({ user: { ...user, role: session.role } });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
