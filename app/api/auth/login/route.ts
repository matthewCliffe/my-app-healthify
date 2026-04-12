import { NextResponse } from "next/server";
import { firebaseAuthRequest, getDemoUser, hasFirebaseConfig, setSessionCookies } from "@/lib/firebase";
import { recordLogin } from "@/lib/server-data";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (!hasFirebaseConfig()) {
      if (password !== "password123") {
        return NextResponse.json({ error: "In demo mode, use password123." }, { status: 401 });
      }
      const demoUser = getDemoUser(String(email));
      await setSessionCookies({
        idToken: `demo-${demoUser.role}`,
        localId: demoUser.role === "admin" ? "demo-admin" : "demo-user",
        role: demoUser.role,
        email: demoUser.email,
      });
      return NextResponse.json({ ok: true, demo: true, role: demoUser.role });
    }

    const signin = await firebaseAuthRequest("accounts:signInWithPassword", {
      email,
      password,
      returnSecureToken: true,
    });

    const role = String(email).toLowerCase() === String(process.env.HEALTHIFY_ADMIN_EMAIL || "admin@healthify.app").toLowerCase() ? "admin" : "user";

    await recordLogin(signin.localId, signin.idToken, String(email), role);
    await setSessionCookies({
      idToken: signin.idToken,
      localId: signin.localId,
      role,
      email,
    });

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not sign in." }, { status: 400 });
  }
}
