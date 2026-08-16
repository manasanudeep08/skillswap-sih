import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/*
 * GET
 *
 * Returns ratings for a user or checks
 * whether a particular exchange has already
 * been rated by a user.
 */

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const userIdParam =
      searchParams.get("userId");

    const requestIdParam =
      searchParams.get("requestId");

    /*
     * Check one exchange.
     */

    if (requestIdParam) {
      const requestId =
        Number(requestIdParam);

      const ratings =
        await prisma.rating.findMany({
          where: {
            requestId,
          },
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
            reviewee: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });

      return NextResponse.json({
        ratings,
      });
    }

    /*
     * Get ratings received by a user.
     */

    if (!userIdParam) {
      return NextResponse.json(
        {
          error:
            "userId or requestId is required."
        },
        { status: 400 }
      );
    }

    const userId =
      Number(userIdParam);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          error: "Invalid userId."
        },
        { status: 400 }
      );
    }

    const ratings =
      await prisma.rating.findMany({
        where: {
          revieweeId: userId,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const total = ratings.length;

    const average =
      total === 0
        ? 0
        : Number(
            (
              ratings.reduce(
                (sum, rating) =>
                  sum + rating.stars,
                0
              ) / total
            ).toFixed(1)
          );

    return NextResponse.json({
      ratings,
      average,
      total,
    });
  } catch (error) {
    console.error(
      "Get ratings error:",
      error
    );

    return NextResponse.json(
      {
        error: "Unable to load ratings."
      },
      { status: 500 }
    );
  }
}


/*
 * POST
 *
 * Creates a rating for a completed exchange.
 */

export async function POST(
  request: Request
) {
  try {
    const body = await request.json();

    const requestId =
      Number(body.requestId);

    const reviewerId =
      Number(body.reviewerId);

    const stars =
      Number(body.stars);

    const comment =
      typeof body.comment === "string"
        ? body.comment.trim()
        : null;

    if (
      !Number.isInteger(requestId) ||
      !Number.isInteger(reviewerId)
    ) {
      return NextResponse.json(
        {
          error: "Invalid request."
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(stars) ||
      stars < 1 ||
      stars > 5
    ) {
      return NextResponse.json(
        {
          error:
            "Rating must be between 1 and 5 stars."
        },
        { status: 400 }
      );
    }

    if (
      comment &&
      comment.length > 500
    ) {
      return NextResponse.json(
        {
          error:
            "Review must be 500 characters or less."
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
          error:
            "Exchange request not found."
        },
        { status: 404 }
      );
    }

    /*
     * Ratings are only allowed after
     * the exchange is completed.
     */

    if (
      exchangeRequest.status !== "completed"
    ) {
      return NextResponse.json(
        {
          error:
            "You can only rate a completed exchange."
        },
        { status: 400 }
      );
    }

    /*
     * Make sure the reviewer actually
     * participated in the exchange.
     */

    const isSender =
      exchangeRequest.senderId === reviewerId;

    const isReceiver =
      exchangeRequest.receiverId === reviewerId;

    if (!isSender && !isReceiver) {
      return NextResponse.json(
        {
          error:
            "You were not part of this exchange."
        },
        { status: 403 }
      );
    }

    const revieweeId = isSender
      ? exchangeRequest.receiverId
      : exchangeRequest.senderId;

    /*
     * Prevent duplicate ratings.
     */

    const existing =
      await prisma.rating.findUnique({
        where: {
          requestId_reviewerId: {
            requestId,
            reviewerId,
          },
        },
      });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "You have already rated this exchange."
        },
        { status: 409 }
      );
    }

    const rating =
      await prisma.rating.create({
        data: {
          requestId,
          reviewerId,
          revieweeId,
          stars,
          comment:
            comment || null,
        },
        include: {
          reviewer: {
            select: {
              id: true,
              name: true,
              username: true,
              avatar: true,
            },
          },
          reviewee: {
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
        rating,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create rating error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to submit rating."
      },
      { status: 500 }
    );
  }
}