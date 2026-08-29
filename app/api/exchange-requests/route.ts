import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

/*
=========================================================
GET /api/exchange-requests?userId=1

Gets:
- requests received by the user
- requests sent by the user
=========================================================
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

    /*
    -------------------------------------------------------
    RECEIVED REQUESTS
    -------------------------------------------------------
    */

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

          receiver: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },

          skill: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    /*
    -------------------------------------------------------
    SENT REQUESTS
    -------------------------------------------------------
    */

    const sent =
      await prisma.exchangeRequest.findMany({
        where: {
          senderId: userId,
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
              bio: true,
              avatar: true,

              skills: true,
            },
          },

          skill: true,
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
        error:
          "Failed to load exchange requests",
      },
      { status: 500 }
    );
  }
}


/*
=========================================================
POST /api/exchange-requests

Create a new exchange request.

Body:

{
  senderId: 1,
  receiverId: 2,
  skillId: 5
}
=========================================================
*/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const senderId = Number(body.senderId);
    const receiverId = Number(body.receiverId);

    const skillId =
      body.skillId === null ||
      body.skillId === undefined ||
      body.skillId === ""
        ? null
        : Number(body.skillId);

    /*
    -------------------------------------------------------
    VALIDATION
    -------------------------------------------------------
    */

    if (!Number.isInteger(senderId)) {
      return NextResponse.json(
        {
          error: "Invalid sender ID",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(receiverId)) {
      return NextResponse.json(
        {
          error: "Invalid receiver ID",
        },
        { status: 400 }
      );
    }

    if (
      skillId !== null &&
      !Number.isInteger(skillId)
    ) {
      return NextResponse.json(
        {
          error: "Invalid skill ID",
        },
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

    /*
    -------------------------------------------------------
    CHECK USERS
    -------------------------------------------------------
    */

    const sender =
      await prisma.user.findUnique({
        where: {
          id: senderId,
        },
      });

    const receiver =
      await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
      });

    if (!sender || !receiver) {
      return NextResponse.json(
        {
          error: "User not found",
        },
        { status: 404 }
      );
    }

    /*
    -------------------------------------------------------
    CHECK SELECTED SKILL
    -------------------------------------------------------
    
    The skill must belong to the person
    receiving the request and must be a
    skill they can teach.
    */

    if (skillId !== null) {
      const skill =
        await prisma.skill.findFirst({
          where: {
            id: skillId,
            userId: receiverId,
            type: "teach",
          },
        });

      if (!skill) {
        return NextResponse.json(
          {
            error:
              "Selected teaching skill was not found",
          },
          { status: 404 }
        );
      }
    }

    /*
    -------------------------------------------------------
    CHECK EXISTING REQUEST
    -------------------------------------------------------

    Check BOTH directions.

    A -> B

    and

    B -> A
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

        orderBy: {
          createdAt: "desc",
        },
      });

    if (existingRequest) {
      /*
      Pending request
      */

      if (
        existingRequest.status ===
        "pending"
      ) {
        return NextResponse.json(
          {
            error:
              "An exchange request is already pending",
            request: existingRequest,
          },
          { status: 409 }
        );
      }

      /*
      Accepted request
      */

      if (
        existingRequest.status ===
        "accepted"
      ) {
        return NextResponse.json(
          {
            error:
              "You are already connected with this user",
            request: existingRequest,
          },
          { status: 409 }
        );
      }

      /*
      Completed request
      */

      if (
        existingRequest.status ===
        "completed"
      ) {
        return NextResponse.json(
          {
            error:
              "You have already completed an exchange with this user",
            request: existingRequest,
          },
          { status: 409 }
        );
      }

      /*
      Rejected request

      Allow a new request.
      */

      if (
        existingRequest.status ===
        "rejected"
      ) {
        const newRequest =
          await prisma.exchangeRequest.create({
            data: {
              senderId,
              receiverId,
              skillId,
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

              skill: true,
            },
          });

        return NextResponse.json(
          {
            success: true,
            request: newRequest,
          },
          { status: 201 }
        );
      }
    }

    /*
    -------------------------------------------------------
    CREATE NEW REQUEST
    -------------------------------------------------------
    */

    const newRequest =
      await prisma.exchangeRequest.create({
        data: {
          senderId,
          receiverId,
          skillId,
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

          skill: true,
        },
      });

    return NextResponse.json(
      {
        success: true,
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
        error:
          "Failed to send exchange request",
      },
      { status: 500 }
    );
  }
}


/*
=========================================================
PATCH /api/exchange-requests

Accept or reject a request.

Body:

{
  requestId: 1,
  userId: 2,
  status: "accepted"
}

OR

{
  requestId: 1,
  userId: 2,
  status: "rejected"
}
=========================================================
*/

export async function PATCH(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const requestId = Number(
      body.requestId
    );

    const userId = Number(
      body.userId
    );

    const status = String(
      body.status || ""
    )
      .trim()
      .toLowerCase();

    /*
    -------------------------------------------------------
    VALIDATION
    -------------------------------------------------------
    */

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        {
          error:
            "Invalid request ID",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          error:
            "Invalid user ID",
        },
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
    -------------------------------------------------------
    FIND REQUEST
    -------------------------------------------------------

    Only the RECEIVER can accept or reject.
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
          error:
            "Exchange request not found",
        },
        { status: 404 }
      );
    }

    /*
    -------------------------------------------------------
    REQUEST MUST BE PENDING
    -------------------------------------------------------
    */

    if (
      exchangeRequest.status !==
      "pending"
    ) {
      return NextResponse.json(
        {
          error:
            "This request has already been processed",
        },
        { status: 409 }
      );
    }

    /*
    -------------------------------------------------------
    UPDATE REQUEST
    -------------------------------------------------------
    */

    const updatedRequest =
      await prisma.exchangeRequest.update({
        where: {
          id: requestId,
        },

        data: {
          status,
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

          skill: true,
        },
      });

    return NextResponse.json({
      success: true,
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


/*
=========================================================
DELETE /api/exchange-requests

Delete / dismiss an old request.

Body:

{
  requestId: 1,
  userId: 2
}

Allowed:

- rejected
- completed

Not allowed:

- pending
- accepted

The user must first deal with an active request.
=========================================================
*/

export async function DELETE(
  request: NextRequest
) {
  try {
    const body = await request.json();

    const requestId = Number(
      body.requestId
    );

    const userId = Number(
      body.userId
    );

    /*
    -------------------------------------------------------
    VALIDATION
    -------------------------------------------------------
    */

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        {
          error:
            "Invalid request ID",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          error:
            "Invalid user ID",
        },
        { status: 400 }
      );
    }

    /*
    -------------------------------------------------------
    FIND REQUEST
    -------------------------------------------------------
    
    User must be either:
    
    sender OR receiver
    */

    const exchangeRequest =
      await prisma.exchangeRequest.findFirst({
        where: {
          id: requestId,

          OR: [
            {
              senderId: userId,
            },
            {
              receiverId: userId,
            },
          ],
        },
      });

    if (!exchangeRequest) {
      return NextResponse.json(
        {
          error:
            "Exchange request not found",
        },
        { status: 404 }
      );
    }

    /*
    -------------------------------------------------------
    DON'T DELETE ACTIVE REQUESTS
    -------------------------------------------------------
    */

    if (
      exchangeRequest.status ===
      "pending"
    ) {
      return NextResponse.json(
        {
          error:
            "Pending requests cannot be deleted. Decline the request first.",
        },
        { status: 409 }
      );
    }

    if (
      exchangeRequest.status ===
      "accepted"
    ) {
      return NextResponse.json(
        {
          error:
            "Accepted exchanges cannot be deleted until the exchange is completed.",
        },
        { status: 409 }
      );
    }

    /*
    -------------------------------------------------------
    DELETE
    -------------------------------------------------------
    */

    await prisma.exchangeRequest.delete({
      where: {
        id: requestId,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Request deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE /api/exchange-requests error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete exchange request",
      },
      { status: 500 }
    );
  }
}