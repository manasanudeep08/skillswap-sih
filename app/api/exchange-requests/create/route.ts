import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const senderId = Number(body.senderId);
    const receiverId = Number(body.receiverId);
    const message =
      typeof body.message === "string"
        ? body.message.trim()
        : null;

    if (
      !Number.isInteger(senderId) ||
      !Number.isInteger(receiverId)
    ) {
      return NextResponse.json(
        {
          error: "Invalid user information.",
        },
        {
          status: 400,
        }
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        {
          error:
            "You cannot send an exchange request to yourself.",
        },
        {
          status: 400,
        }
      );
    }

    const sender = await prisma.user.findUnique({
      where: {
        id: senderId,
      },
    });

    const receiver = await prisma.user.findUnique({
      where: {
        id: receiverId,
      },
    });

    if (!sender || !receiver) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * IMPORTANT:
     *
     * Check BOTH directions.
     *
     * Example:
     *
     * A -> B pending
     *
     * B should not be able to create:
     *
     * B -> A
     *
     * while the first request is still active.
     */

    const existingRequest =
      await prisma.exchangeRequest.findFirst({
        where: {
          OR: [
            {
              senderId,
              receiverId,
            },
            {
              senderId: receiverId,
              receiverId: senderId,
            },
          ],

          status: {
            in: ["pending", "accepted"],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (existingRequest) {
      if (existingRequest.status === "accepted") {
        return NextResponse.json(
          {
            error:
              "You already have an accepted exchange with this person.",
            request: existingRequest,
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          error:
            "You already have a pending request with this person.",
          request: existingRequest,
        },
        {
          status: 409,
        }
      );
    }

    /*
     * Optional message length protection.
     */

    const safeMessage =
      message && message.length > 500
        ? message.slice(0, 500)
        : message;

    const exchangeRequest =
      await prisma.exchangeRequest.create({
        data: {
          senderId,
          receiverId,
          message: safeMessage,
          status: "pending",
        },

        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },

          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
      });

    return NextResponse.json(
      {
        success: true,
        request: exchangeRequest,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create exchange request error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while creating the exchange request.",
      },
      {
        status: 500,
      }
    );
  }
}