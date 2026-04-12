import { NextResponse } from "next/server";
import { addFriend, getAllUsers, getProfileServer, removeFriend } from "@/lib/server-data";

export async function GET() {
  try {
    const [profile, users] = await Promise.all([getProfileServer(), getAllUsers()]);
    return NextResponse.json({
      friends: users.filter((user) => profile.friends.includes(user.email)),
      available: users.filter((user) => user.email !== profile.email && !profile.friends.includes(user.email)),
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unauthorized." }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Friend email is required." }, { status: 400 });
    return NextResponse.json({ item: await addFriend(String(email)) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to add friend." }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: "Friend email is required." }, { status: 400 });
    return NextResponse.json({ item: await removeFriend(String(email)) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to remove friend." }, { status: 400 });
  }
}
