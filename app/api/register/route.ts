import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { hash } from "bcryptjs";

/*
 * ============================================================
 * MSG91 ACCESS TOKEN VERIFICATION
 * ============================================================
 *
 * MSG91 expects:
 *
 * POST
 * https://control.msg91.com/api/v5/widget/verifyAccessToken
 *
 * with:
 *
 * authkey
 * access-token
 *
 * as form-urlencoded parameters.
 */

async function verifyMSG91AccessToken(accessToken: string) {
  const authKey = process.env.MSG91_AUTH_KEY;

  if (!authKey) {
    console.error("MSG91_AUTH_KEY is missing.");

    throw new Error(
      "MSG91_AUTH_KEY is not configured."
    );
  }

  if (!accessToken) {
    return {
      verified: false,
      data: {
        error: "No MSG91 access token provided.",
      },
    };
  }

  console.log("MSG91: verifying access token on server.");

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

  let data: any;

  try {
    data = await response.json();
  } catch {
    data = {
      error: "MSG91 returned a non-JSON response.",
    };
  }

  console.log(
    "MSG91 ACCESS TOKEN VERIFICATION RESPONSE:",
    data
  );

  if (!response.ok) {
    return {
      verified: false,
      data,
    };
  }

  /*
   * Look for explicit failure states.
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
    return {
      verified: false,
      data,
    };
  }

  /*
   * A successful HTTP response without an explicit failure
   * is considered a successful token verification.
   */
  return {
    verified: true,
    data,
  };
}

/*
 * ============================================================
 * POST /api/register
 * ============================================================
 */

export async function POST(request: Request) {
  try {
    const body = await request.json();

    /*
     * ========================================================
     * GET INPUT
     * ========================================================
     */

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

    /*
     * ========================================================
     * BASIC VALIDATION
     * ========================================================
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
        {
          status: 400,
        }
      );
    }

    /*
     * OTP verification is mandatory.
     */
    if (!msg91AccessToken) {
      return NextResponse.json(
        {
          error:
            "Please verify your phone number first.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Username validation.
     */
    if (username.length < 3) {
      return NextResponse.json(
        {
          error:
            "Username must be at least 3 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (!/^[a-z0-9_]+$/.test(username)) {
      return NextResponse.json(
        {
          error:
            "Username can only contain lowercase letters, numbers and underscores.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Password validation.
     */
    if (password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 6 characters.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Phone validation.
     *
     * Client sends:
     *
     * +919701254151
     *
     */
    if (!/^\+91\d{10}$/.test(phone)) {
      return NextResponse.json(
        {
          error:
            "Please provide a valid Indian phone number.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ========================================================
     * VERIFY MSG91 BEFORE DATABASE CREATION
     * ========================================================
     */

    const msg91Verification =
      await verifyMSG91AccessToken(
        msg91AccessToken
      );

    if (!msg91Verification.verified) {
      console.error(
        "MSG91 access token verification failed:",
        msg91Verification.data
      );

      return NextResponse.json(
        {
          error:
            "Phone verification failed. Please verify your OTP again.",
        },
        {
          status: 401,
        }
      );
    }

    console.log(
      "MSG91: phone verification successful."
    );

    /*
     * ========================================================
     * CHECK EMAIL
     * ========================================================
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
        {
          status: 409,
        }
      );
    }

    /*
     * ========================================================
     * CHECK USERNAME
     * ========================================================
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
        {
          status: 409,
        }
      );
    }

    /*
     * ========================================================
     * CHECK PHONE
     * ========================================================
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
        {
          status: 409,
        }
      );
    }

    /*
     * ========================================================
     * HASH PASSWORD
     * ========================================================
     */

    const hashedPassword = await hash(
      password,
      12
    );

    /*
     * ========================================================
     * CREATE USER
     * ========================================================
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

    /*
     * ========================================================
     * SUCCESS
     * ========================================================
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
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Registration error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating your account.",
      },
      {
        status: 500,
      }
    );
  }
}