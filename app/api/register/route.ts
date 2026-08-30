import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const name = body.name?.trim();
    const username = body.username?.trim().toLowerCase();
    const email = body.email?.trim().toLowerCase();
    const phone = body.phone?.trim();
    const password = body.password;
    const bio = body.bio?.trim() || null;
    const avatar = body.avatar || "avatar1";

    /*
     * ============================================================
     * BASIC VALIDATION
     * ============================================================
     */

    if (!name || !username || !email || !password || !phone) {
      return NextResponse.json(
        {
          error:
            "Name, username, email, phone and password are required.",
        },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        {
          error: "Username must be at least 3 characters.",
        },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username can only contain lowercase letters, numbers and underscores.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          error: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    if (!/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json(
        {
          error: "Please provide a valid Indian phone number.",
        },
        { status: 400 }
      );
    }

    /*
     * ============================================================
     * DEMO OTP MODE
     * ============================================================
     *
     * MSG91 sends the actual OTP from the frontend.
     *
     * The OTP entered by the user is NOT checked here.
     *
     * This is intentionally only for the demo version.
     */

    console.log("Registration using DEMO OTP verification.");

    /*
     * ============================================================
     * CHECK EMAIL
     * ============================================================
     */

    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * ============================================================
     * CHECK USERNAME
     * ============================================================
     */

    const existingUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          error: "That username is already taken.",
        },
        { status: 409 }
      );
    }

    /*
     * ============================================================
     * CHECK PHONE
     * ============================================================
     */

    const existingPhone = await prisma.user.findFirst({
      where: {
        phone,
      },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          error: "An account with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * ============================================================
     * HASH PASSWORD
     * ============================================================
     */

    const hashedPassword = await hash(password, 12);

    /*
     * ============================================================
     * CREATE USER
     * ============================================================
     */

    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        bio,
        avatar,
        phone,
      },
    });

    /*
     * ============================================================
     * SUCCESS
     * ============================================================
     */

    return NextResponse.json(
      {
        message: "Account created successfully.",

        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          phone: user.phone,
          bio: user.bio,
          avatar: user.avatar,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while creating your account.",
      },
      { status: 500 }
    );
  }
}