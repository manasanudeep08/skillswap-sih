import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";

async function verifyMSG91AccessToken(accessToken: string) {
  const authKey = process.env.MSG91_AUTH_KEY;

  if (!authKey) {
    console.error("❌ MSG91_AUTH_KEY is missing");

    throw new Error("MSG91_AUTH_KEY is not configured");
  }

  console.log("========================================");
  console.log("MSG91 ACCESS TOKEN VERIFICATION");
  console.log("========================================");

  console.log("Token received:", Boolean(accessToken));
  console.log("Token length:", accessToken?.length || 0);
  console.log(
    "Looks like JWT:",
    accessToken?.split(".").length === 3
  );

  /*
   * IMPORTANT:
   * Never print the actual access token.
   */

  const response = await fetch(
    "https://control.msg91.com/api/v5/widget/verifyAccessToken",
    {
      method: "POST",

      headers: {
        "Content-Type":
          "application/x-www-form-urlencoded",
      },

      body: new URLSearchParams({
        authkey: authKey,
        "access-token": accessToken,
      }).toString(),

      cache: "no-store",
    }
  );

  const responseText = await response.text();

  console.log(
    "MSG91 verification HTTP status:",
    response.status
  );

  console.log(
    "MSG91 verification raw response:",
    responseText
  );

  let data: any;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {
      raw: responseText,
    };
  }

  console.log(
    "MSG91 verification parsed response:",
    data
  );

  /*
   * MSG91 itself rejected the token.
   */
  if (!response.ok) {
    console.error(
      "❌ MSG91 REJECTED ACCESS TOKEN"
    );

    return {
      verified: false,
      data,
      httpStatus: response.status,
    };
  }

  /*
   * Explicit failure response.
   */
  const status = String(
    data?.type ??
      data?.status ??
      data?.data?.type ??
      data?.data?.status ??
      ""
  ).toLowerCase();

  if (
    status === "error" ||
    status === "failed" ||
    status === "failure" ||
    data?.success === false ||
    data?.data?.success === false
  ) {
    console.error(
      "❌ MSG91 RESPONSE SAYS VERIFICATION FAILED"
    );

    return {
      verified: false,
      data,
      httpStatus: response.status,
    };
  }

  console.log(
    "✅ MSG91 ACCESS TOKEN ACCEPTED"
  );

  return {
    verified: true,
    data,
    httpStatus: response.status,
  };
}

export async function POST(request: Request) {
  try {
    console.log("");
    console.log("========================================");
    console.log("REGISTRATION REQUEST");
    console.log("========================================");

    const body = await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const username =
      typeof body.username === "string"
        ? body.username.trim().toLowerCase()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const phone =
      typeof body.phone === "string"
        ? body.phone.trim()
        : "";

    const password =
      typeof body.password === "string"
        ? body.password
        : "";

    const bio =
      typeof body.bio === "string"
        ? body.bio.trim() || null
        : null;

    const avatar =
      typeof body.avatar === "string" &&
      body.avatar.trim()
        ? body.avatar.trim()
        : "avatar1";

    const msg91AccessToken =
      typeof body.msg91AccessToken === "string"
        ? body.msg91AccessToken.trim()
        : "";

    console.log("Registration data:");
    console.log("Name:", name);
    console.log("Username:", username);
    console.log("Email:", email);
    console.log("Phone:", phone);
    console.log(
      "MSG91 token received:",
      Boolean(msg91AccessToken)
    );
    console.log(
      "MSG91 token length:",
      msg91AccessToken.length
    );

    /*
     * ========================================
     * REQUIRED FIELDS
     * ========================================
     */

    if (
      !name ||
      !username ||
      !email ||
      !password ||
      !phone
    ) {
      return NextResponse.json(
        {
          error:
            "Name, username, email, phone and password are required.",
        },
        { status: 400 }
      );
    }

    /*
     * ========================================
     * MSG91 TOKEN REQUIRED
     * ========================================
     */

    if (!msg91AccessToken) {
      console.error(
        "❌ No MSG91 access token received"
      );

      return NextResponse.json(
        {
          error:
            "Please verify your phone number first.",
        },
        { status: 400 }
      );
    }

    /*
     * ========================================
     * USERNAME
     * ========================================
     */

    if (username.length < 3) {
      return NextResponse.json(
        {
          error:
            "Username must be at least 3 characters.",
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

    /*
     * ========================================
     * PASSWORD
     * ========================================
     */

    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    /*
     * ========================================
     * PHONE
     * ========================================
     */

    if (!/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid Indian phone number.",
        },
        { status: 400 }
      );
    }

    /*
     * ========================================
     * VERIFY MSG91
     * ========================================
     */

    console.log(
      "🔐 Verifying MSG91 access token..."
    );

    const verification =
      await verifyMSG91AccessToken(
        msg91AccessToken
      );

    if (!verification.verified) {
      console.error(
        "❌ PHONE VERIFICATION FAILED"
      );

      console.error(
        "MSG91 response:",
        verification.data
      );

      return NextResponse.json(
        {
          error:
            "Phone verification failed. Please verify your OTP again.",
          msg91: verification.data,
        },
        { status: 401 }
      );
    }

    console.log(
      "✅ PHONE VERIFICATION SUCCESSFUL"
    );

    /*
     * ========================================
     * CHECK EMAIL
     * ========================================
     */

    const existingEmail =
      await prisma.user.findUnique({
        where: {
          email,
        },
      });

    if (existingEmail) {
      return NextResponse.json(
        {
          error:
            "An account with this email already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * ========================================
     * CHECK USERNAME
     * ========================================
     */

    const existingUsername =
      await prisma.user.findUnique({
        where: {
          username,
        },
      });

    if (existingUsername) {
      return NextResponse.json(
        {
          error:
            "That username is already taken.",
        },
        { status: 409 }
      );
    }

    /*
     * ========================================
     * CHECK PHONE
     * ========================================
     */

    const existingPhone =
      await prisma.user.findFirst({
        where: {
          phone,
        },
      });

    if (existingPhone) {
      return NextResponse.json(
        {
          error:
            "An account with this phone number already exists.",
        },
        { status: 409 }
      );
    }

    /*
     * ========================================
     * HASH PASSWORD
     * ========================================
     */

    const hashedPassword =
      await hash(password, 12);

    /*
     * ========================================
     * CREATE USER
     * ========================================
     */

    const user =
      await prisma.user.create({
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

    console.log(
      "✅ USER CREATED:",
      user.id
    );

    /*
     * ========================================
     * SUCCESS
     * ========================================
     */

    return NextResponse.json(
      {
        message:
          "Account created successfully.",

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
    console.error(
      "❌ REGISTRATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating your account.",
      },
      { status: 500 }
    );
  }
}