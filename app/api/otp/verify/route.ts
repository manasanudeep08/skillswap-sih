import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: "MSG91 access token is required." },
        { status: 400 }
      );
    }

    const authKey = process.env.MSG91_AUTH_KEY;

    if (!authKey) {
      console.error("MSG91_AUTH_KEY is missing.");
      return NextResponse.json(
        { error: "MSG91 server configuration is missing." },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://api.msg91.com/api/v5/widget/verifyAccessToken",
      {
        method: "POST",
        headers: {
          authkey: authKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: accessToken,
        }),
      }
    );

    const data = await response.json();

    console.log("MSG91 ACCESS TOKEN RESPONSE:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "MSG91 access token verification failed.",
          details: data,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("MSG91 access token verification error:", error);

    return NextResponse.json(
      { error: "Unable to verify MSG91 access token." },
      { status: 500 }
    );
  }
}