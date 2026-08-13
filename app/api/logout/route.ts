import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (sessionId) {
      cookieStore.delete("session");
    }

    return NextResponse.json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      { error: "Unable to log out." },
      { status: 500 }
    );
  }
}