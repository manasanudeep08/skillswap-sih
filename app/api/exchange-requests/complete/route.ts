import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

export async function PATCH(
  request: Request
) {
  try {
    const body = await request.json();

    const requestId = Number(body.requestId);
    const userId = Number(body.userId);

    if (
      !Number.isInteger(requestId) ||
      !Number.isInteger(userId)
    ) {
      return NextResponse.json(
        {
          error: "Invalid request."
        },
        { status: 400 }
      );
    }

    const exchangeRequest =
      await prisma.exchangeRequest.findUnique({
        where: {
          id: requestId,
        },
      });

    if (!exchangeRequest) {
      return NextResponse.json(
        {
          error: "Exchange request not found."
        },
        { status: 404 }
      );
    }

    const isParticipant =
      exchangeRequest.senderId === userId ||
      exchangeRequest.receiverId === userId;

    if (!isParticipant) {
      return NextResponse.json(
        {
          error:
            "You are not part of this exchange."
        },
        { status: 403 }
      );
    }

    if (exchangeRequest.status !== "accepted") {
      return NextResponse.json(
        {
          error:
            "Only accepted exchanges can be completed."
        },
        { status: 400 }
      );
    }

    const updated =
      await prisma.exchangeRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status: "completed",
        },
      });

    return NextResponse.json({
      success: true,
      request: updated,
    });
  } catch (error) {
    console.error(
      "Complete exchange error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to complete the exchange."
      },
      { status: 500 }
    );
  }
}