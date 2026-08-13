import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Not logged in." },
        { status: 401 }
      );
    }

    const session = await prisma.session.findUnique({
      where: {
        id: sessionId,
      },
      include: {
        user: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found." },
        { status: 401 }
      );
    }

    if (session.expiresAt < new Date()) {
      await prisma.session.delete({
        where: {
          id: session.id,
        },
      });

      return NextResponse.json(
        { error: "Session expired." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        name: session.user.name,
        username: session.user.username,
        email: session.user.email,
        bio: session.user.bio,
        avatar: session.user.avatar,
      },
    });
  } catch (error) {
    console.error("Session error:", error);

    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}