import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const userId = Number(body.userId);
    const name = String(body.name || "").trim();
    const username = String(
      body.username || ""
    ).trim();
    const bio = String(body.bio || "").trim();
    const avatar = String(
      body.avatar || "avatar1"
    ).trim();

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required.",
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        {
          error: "Name is required.",
        },
        { status: 400 }
      );
    }

    if (!username) {
      return NextResponse.json(
        {
          error: "Username is required.",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          error:
            "Username must contain at least 3 characters.",
        },
        { status: 400 }
      );
    }

    if (bio.length > 250) {
      return NextResponse.json(
        {
          error:
            "Bio cannot be longer than 250 characters.",
        },
        { status: 400 }
      );
    }

    const existingUser =
      await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            id: userId,
          },
        },
      });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
            "That username is already taken.",
        },
        { status: 409 }
      );
    }

    const user =
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          name,
          username,
          bio: bio || null,
          avatar,
        },
        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          bio: true,
          avatar: true,
        },
      });

    return NextResponse.json({
      user,
    });

  } catch (error) {
    console.error(
      "Profile update error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update your profile.",
      },
      { status: 500 }
    );
  }
}