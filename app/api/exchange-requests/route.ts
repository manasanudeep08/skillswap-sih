import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/*
  GET

  Get exchange requests involving a user.

  /api/exchange-requests?userId=1
*/

export async function GET(request: NextRequest) {
  try {
    const userIdParam =
      request.nextUrl.searchParams.get("userId");

    if (!userIdParam) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userId = Number(userIdParam);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const received =
      await prisma.exchangeRequest.findMany({
        where: {
          receiverId: userId,
        },
        include: {
          sender: {
            select: {
              id: true,
              name: true,
              username: true,
              bio: true,
              avatar: true,
              skills: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const sent =
      await prisma.exchangeRequest.findMany({
        where: {
          senderId: userId,
        },
        include: {
          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              bio: true,
              avatar: true,
              skills: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json({
      received,
      sent,
    });
  } catch (error) {
    console.error(
      "GET /api/exchange-requests error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load exchange requests",
      },
      { status: 500 }
    );
  }
}


/*
  POST

  Send a new exchange request.

  Body:
  {
    senderId: 1,
    receiverId: 2
  }
*/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const senderId = Number(body.senderId);
    const receiverId = Number(body.receiverId);

    if (!Number.isInteger(senderId)) {
      return NextResponse.json(
        { error: "Invalid sender ID" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(receiverId)) {
      return NextResponse.json(
        { error: "Invalid receiver ID" },
        { status: 400 }
      );
    }

    if (senderId === receiverId) {
      return NextResponse.json(
        {
          error:
            "You cannot send an exchange request to yourself",
        },
        { status: 400 }
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    /*
      Check whether a request already exists
      in either direction.
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
        },
      });

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        return NextResponse.json(
          {
            error:
              "An exchange request is already pending",
          },
          { status: 409 }
        );
      }

      if (existingRequest.status === "accepted") {
        return NextResponse.json(
          {
            error:
              "You are already connected with this user",
          },
          { status: 409 }
        );
      }

      /*
        If the old request was rejected,
        allow the sender to create another one.
      */

      const newRequest =
        await prisma.exchangeRequest.create({
          data: {
            senderId,
            receiverId,
            status: "pending",
          },
        });

      return NextResponse.json(
        {
          request: newRequest,
        },
        { status: 201 }
      );
    }

    const newRequest =
      await prisma.exchangeRequest.create({
        data: {
          senderId,
          receiverId,
          status: "pending",
        },
      });

    return NextResponse.json(
      {
        request: newRequest,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/exchange-requests error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to send exchange request",
      },
      { status: 500 }
    );
  }
}


/*
  PATCH

  Accept or reject a request.

  Body:
  {
    requestId: 1,
    userId: 2,
    status: "accepted"
  }
*/

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const requestId = Number(body.requestId);
    const userId = Number(body.userId);

    const status = String(body.status || "")
      .trim()
      .toLowerCase();

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        { error: "Invalid request ID" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    if (
      status !== "accepted" &&
      status !== "rejected"
    ) {
      return NextResponse.json(
        {
          error:
            "Status must be accepted or rejected",
        },
        { status: 400 }
      );
    }

    /*
      Only the receiver can accept/reject
      the request.
    */

    const exchangeRequest =
      await prisma.exchangeRequest.findFirst({
        where: {
          id: requestId,
          receiverId: userId,
        },
      });

    if (!exchangeRequest) {
      return NextResponse.json(
        {
          error: "Exchange request not found",
        },
        { status: 404 }
      );
    }

    if (exchangeRequest.status !== "pending") {
      return NextResponse.json(
        {
          error:
            "This request has already been processed",
        },
        { status: 409 }
      );
    }

    const updatedRequest =
      await prisma.exchangeRequest.update({
        where: {
          id: requestId,
        },
        data: {
          status,
        },
      });

    return NextResponse.json({
      request: updatedRequest,
    });
  } catch (error) {
    console.error(
      "PATCH /api/exchange-requests error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update exchange request",
      },
      { status: 500 }
    );
  }
}