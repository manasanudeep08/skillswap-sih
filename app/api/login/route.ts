import { NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { compare } from "bcryptjs";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    const sessionId = crypto.randomUUID();

    await prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({
      message: "Login successful!",
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatar: user.avatar,
      },
    });

    response.cookies.set("session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      { error: "Something went wrong while logging in." },
      { status: 500 }
    );
  }
}