import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";

async function verifyMSG91AccessToken(accessToken: string) {
  const authKey = process.env.MSG91_AUTH_KEY;

  if (!authKey) {
    console.error("MSG91_AUTH_KEY is missing.");
    throw new Error("MSG91_AUTH_KEY is not configured.");
  }

  const response = await fetch(
    "https://control.msg91.com/api/v5/widget/verifyAccessToken",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        authkey: authKey,
        "access-token": accessToken,
      }),
      cache: "no-store",
    }
  );

  const text = await response.text();

  console.log("MSG91 verify HTTP status:", response.status);
  console.log("MSG91 verify raw response:", text);

  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    return {
      verified: false,
      data,
    };
  }

  const status = String(
    data?.type ||
      data?.status ||
      data?.data?.type ||
      data?.data?.status ||
      ""
  ).toLowerCase();

  if (
    status === "error" ||
    status === "failed" ||
    status === "failure" ||
    data?.success === false ||
    data?.data?.success === false
  ) {
    return {
      verified: false,
      data,
    };
  }

  return {
    verified: true,
    data,
  };
}

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
    const msg91AccessToken = body.msg91AccessToken;

    if (!name || !username || !email || !password || !phone) {
      return NextResponse.json(
        {
          error:
            "Name, username, email, phone and password are required.",
        },
        { status: 400 }
      );
    }

    if (!msg91AccessToken) {
      return NextResponse.json(
        {
          error: "Please verify your phone number first.",
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

    console.log("Verifying MSG91 access token...");

    const msg91Verification =
      await verifyMSG91AccessToken(msg91AccessToken);

    console.log(
      "MSG91 verification result:",
      msg91Verification
    );

    if (!msg91Verification.verified) {
      return NextResponse.json(
        {
          error:
            "Phone verification failed. Please verify your OTP again.",
          msg91: msg91Verification.data,
        },
        { status: 401 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          error: "That username is already taken.",
        },
        { status: 409 }
      );
    }

    const existingPhone = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingPhone) {
      return NextResponse.json(
        {
          error: "An account with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 12);

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
        error:
          "Something went wrong while creating your account.",
      },
      { status: 500 }
    );
  }
}