import { NextResponse } from "next/server";
import { firebaseAuthRequest, getDemoUser, hasFirebaseConfig, setSessionCookies, upsertDocument } from "@/lib/firebase";
import { getDefaultProfileFor, seedUserData } from "@/lib/server-data";

export async function POST(request: Request) {
  try {
    const { name, email, password, currentWeight, goalCalories } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const role = String(email).toLowerCase() === String(process.env.HEALTHIFY_ADMIN_EMAIL || "admin@healthify.app").toLowerCase() ? "admin" : "user";
    const profile = {
      ...getDefaultProfileFor(String(email), role),
      name: name || (role === "admin" ? "Admin Coach" : "Healthify User"),
      currentWeight: Number(currentWeight || 180),
      goalCalories: Number(goalCalories || 2200),
    };

    if (!hasFirebaseConfig()) {
      const demoUser = getDemoUser(String(email));
      await setSessionCookies({
        idToken: `demo-${demoUser.role}`,
        localId: demoUser.role === "admin" ? "demo-admin" : "demo-user",
        role: demoUser.role,
        email: String(email),
      });
      return NextResponse.json({ ok: true, demo: true, role: demoUser.role });
    }

    const signup = await firebaseAuthRequest("accounts:signUp", {
      email,
      password,
      returnSecureToken: true,
    });

    await upsertDocument(`users/${signup.localId}/profile/main`, profile, signup.idToken);
    await seedUserData(profile, signup.localId, signup.idToken);
    await setSessionCookies({ idToken: signup.idToken, localId: signup.localId, role, email });

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not register." }, { status: 400 });
  }
}
