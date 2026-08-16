import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type Visibility =
  | "private"
  | "matches"
  | "accepted";

function validVisibility(
  value: unknown
): Visibility {
  if (
    value === "private" ||
    value === "matches" ||
    value === "accepted"
  ) {
    return value;
  }

  return "accepted";
}

function cleanUrl(
  value: unknown
): string | null {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  const url = value.trim();

  /*
   * Only allow web links.
   */

  try {
    const parsed = new URL(
      url.startsWith("http")
        ? url
        : `https://${url}`
    );

    if (
      parsed.protocol !== "http:" &&
      parsed.protocol !== "https:"
    ) {
      return null;
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

async function getRelationship(
  viewerId: number,
  profileId: number
) {
  if (viewerId === profileId) {
    return {
      isOwner: true,
      isMatch: false,
      isAccepted: false,
    };
  }

  /*
   * For "match" visibility, we use the
   * existence of a pending OR accepted request.
   *
   * This keeps profile visibility aligned
   * with the Matches/request system.
   */

  const request =
    await prisma.exchangeRequest.findFirst({
      where: {
        OR: [
          {
            senderId: viewerId,
            receiverId: profileId,
          },
          {
            senderId: profileId,
            receiverId: viewerId,
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

  return {
    isOwner: false,
    isMatch: !!request,
    isAccepted:
      request?.status === "accepted",
  };
}

function canSee(
  visibility: string,
  relationship: {
    isOwner: boolean;
    isMatch: boolean;
    isAccepted: boolean;
  }
) {
  if (relationship.isOwner) {
    return true;
  }

  if (visibility === "private") {
    return false;
  }

  if (
    visibility === "matches" &&
    relationship.isMatch
  ) {
    return true;
  }

  if (
    visibility === "accepted" &&
    relationship.isAccepted
  ) {
    return true;
  }

  return false;
}

function getQuizLevel(
  quizScore: number | null
) {
  if (quizScore === null) {
    return null;
  }

  if (quizScore >= 100) {
    return "Professional";
  }

  if (quizScore >= 80) {
    return "Advanced";
  }

  if (quizScore >= 40) {
    return "Intermediate";
  }

  return "Beginner";
}

function formatSkill(skill: {
  id: number;
  name: string;
  type: string;
  verified: boolean;
  verificationMethod: string | null;
  certificateUrl: string | null;
  quizScore: number | null;
}) {
  return {
    id: skill.id,
    name: skill.name,
    type: skill.type,
    verified: skill.verified,
    verificationMethod:
      skill.verificationMethod,
    certificateUrl:
      skill.certificateUrl,
    quizScore: skill.quizScore,
    experienceLevel:
      skill.verificationMethod === "quiz"
        ? getQuizLevel(skill.quizScore)
        : null,
  };
}


/* =========================================================
   GET PROFILE
   ========================================================= */

export async function GET(
  request: Request
) {
  try {
    const { searchParams } =
      new URL(request.url);

    const profileId = Number(
      searchParams.get("userId")
    );

    const viewerId = Number(
      searchParams.get("viewerId")
    );

    if (!Number.isInteger(profileId)) {
      return NextResponse.json(
        {
          error: "Invalid profile ID.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isInteger(viewerId)) {
      return NextResponse.json(
        {
          error: "Invalid viewer ID.",
        },
        {
          status: 400,
        }
      );
    }

    const profile =
      await prisma.user.findUnique({
        where: {
          id: profileId,
        },

        include: {
          skills: {
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });

    if (!profile) {
      return NextResponse.json(
        {
          error: "Profile not found.",
        },
        {
          status: 404,
        }
      );
    }

    const relationship =
      await getRelationship(
        viewerId,
        profileId
      );

    const emailVisible = canSee(
      profile.emailVisibility,
      relationship
    );

    const phoneVisible = canSee(
      profile.phoneVisibility,
      relationship
    );

    const socialVisible = canSee(
      profile.socialVisibility,
      relationship
    );

    const response = {
      user: {
        id: profile.id,
        name: profile.name,
        username: profile.username,
        bio: profile.bio,
        avatar: profile.avatar,

        email: emailVisible
          ? profile.email
          : null,

        phone: phoneVisible
          ? profile.phone
          : null,

        githubUrl: socialVisible
          ? profile.githubUrl
          : null,

        linkedinUrl: socialVisible
          ? profile.linkedinUrl
          : null,

        instagramUrl: socialVisible
          ? profile.instagramUrl
          : null,

        portfolioUrl: socialVisible
          ? profile.portfolioUrl
          : null,

        otherUrl: socialVisible
          ? profile.otherUrl
          : null,

        privacy: relationship.isOwner
          ? {
              emailVisibility:
                profile.emailVisibility,
              phoneVisibility:
                profile.phoneVisibility,
              socialVisibility:
                profile.socialVisibility,
            }
          : null,

        skills: profile.skills.map(
          formatSkill
        ),
      },

      relationship,
    };

    return NextResponse.json(
      response
    );
  } catch (error) {
    console.error(
      "Profile GET error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to load profile.",
      },
      {
        status: 500,
      }
    );
  }
}


/* =========================================================
   PATCH PROFILE
   ========================================================= */

export async function PATCH(
  request: Request
) {
  try {
    const body = await request.json();

    const userId = Number(
      body.userId
    );

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          error: "Invalid user ID.",
        },
        {
          status: 400,
        }
      );
    }

    const existingUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!existingUser) {
      return NextResponse.json(
        {
          error: "User not found.",
        },
        {
          status: 404,
        }
      );
    }

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : existingUser.name;

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : existingUser.username;

    const bio =
      typeof body.bio === "string"
        ? body.bio.trim()
        : existingUser.bio;

    const avatar =
      typeof body.avatar === "string" &&
      body.avatar.trim()
        ? body.avatar.trim()
        : existingUser.avatar;

    if (!name) {
      return NextResponse.json(
        {
          error: "Name cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    if (!username) {
      return NextResponse.json(
        {
          error:
            "Username cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Username uniqueness.
     */

    const usernameTaken =
      await prisma.user.findFirst({
        where: {
          username,
          NOT: {
            id: userId,
          },
        },
      });

    if (usernameTaken) {
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

    const emailVisibility =
      validVisibility(
        body.emailVisibility ??
          existingUser.emailVisibility
      );

    const phoneVisibility =
      validVisibility(
        body.phoneVisibility ??
          existingUser.phoneVisibility
      );

    const socialVisibility =
      validVisibility(
        body.socialVisibility ??
          existingUser.socialVisibility
      );

    const updatedUser =
      await prisma.user.update({
        where: {
          id: userId,
        },

        data: {
          name,
          username,
          bio: bio || null,
          avatar,

          phone:
            typeof body.phone === "string"
              ? body.phone.trim() || null
              : existingUser.phone,

          githubUrl:
            body.githubUrl !== undefined
              ? cleanUrl(body.githubUrl)
              : existingUser.githubUrl,

          linkedinUrl:
            body.linkedinUrl !== undefined
              ? cleanUrl(body.linkedinUrl)
              : existingUser.linkedinUrl,

          instagramUrl:
            body.instagramUrl !== undefined
              ? cleanUrl(body.instagramUrl)
              : existingUser.instagramUrl,

          portfolioUrl:
            body.portfolioUrl !== undefined
              ? cleanUrl(body.portfolioUrl)
              : existingUser.portfolioUrl,

          otherUrl:
            body.otherUrl !== undefined
              ? cleanUrl(body.otherUrl)
              : existingUser.otherUrl,

          emailVisibility,
          phoneVisibility,
          socialVisibility,
        },

        select: {
          id: true,
          name: true,
          username: true,
          email: true,
          bio: true,
          avatar: true,
          phone: true,
          githubUrl: true,
          linkedinUrl: true,
          instagramUrl: true,
          portfolioUrl: true,
          otherUrl: true,
          emailVisibility: true,
          phoneVisibility: true,
          socialVisibility: true,
        },
      });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error(
      "Profile PATCH error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to update your profile.",
      },
      {
        status: 500,
      }
    );
  }
}