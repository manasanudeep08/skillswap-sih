import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

type SkillData = {
  id: number;
  name: string;
  type: string;
  verified: boolean;
};

function normalizeSkill(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function findMatches(
  myTeach: SkillData[],
  myLearn: SkillData[],
  theirSkills: SkillData[]
) {
  const theirTeach = theirSkills.filter(
    (skill) => skill.type.toLowerCase() === "teach"
  );

  const theirLearn = theirSkills.filter(
    (skill) => skill.type.toLowerCase() === "learn"
  );

  /*
   * Direction 1:
   * I want to learn something
   * They can teach it
   */
  const learnFromThem = myLearn
    .map((mySkill) => {
      const match = theirTeach.find(
        (theirSkill) =>
          normalizeSkill(theirSkill.name) ===
          normalizeSkill(mySkill.name)
      );

      return match
        ? {
            mine: mySkill.name,
            theirs: match.name,
            verified: match.verified,
          }
        : null;
    })
    .filter(Boolean) as {
    mine: string;
    theirs: string;
    verified: boolean;
  }[];

  /*
   * Direction 2:
   * I can teach something
   * They want to learn it
   */
  const learnFromMe = myTeach
    .map((mySkill) => {
      const match = theirLearn.find(
        (theirSkill) =>
          normalizeSkill(theirSkill.name) ===
          normalizeSkill(mySkill.name)
      );

      return match
        ? {
            mine: mySkill.name,
            theirs: match.name,
            verified: mySkill.verified,
          }
        : null;
    })
    .filter(Boolean) as {
    mine: string;
    theirs: string;
    verified: boolean;
  }[];

  if (learnFromThem.length === 0 && learnFromMe.length === 0) {
    return null;
  }

  /*
   * Calculate compatibility.
   *
   * 90% of the score comes from skill compatibility.
   * 10% comes from verification of matching teaching skills.
   */

  const learnRatio =
    myLearn.length > 0
      ? learnFromThem.length / myLearn.length
      : 0;

  const teachRatio =
    myTeach.length > 0
      ? learnFromMe.length / myTeach.length
      : 0;

  const compatibility =
    ((learnRatio + teachRatio) / 2) * 90;

  const allMatchingSkills = [
    ...learnFromThem,
    ...learnFromMe,
  ];

  const verifiedMatches = allMatchingSkills.filter(
    (match) => match.verified
  ).length;

  const verificationRatio =
    allMatchingSkills.length > 0
      ? verifiedMatches / allMatchingSkills.length
      : 0;

  const verificationBonus = verificationRatio * 10;

  const score = Math.min(
    100,
    Math.round(compatibility + verificationBonus)
  );

  return {
    score,
    learnFromThem,
    learnFromMe,
    totalMatches:
      learnFromThem.length + learnFromMe.length,
  };
}


/* =========================================================
   GET /api/matches?userId=1
   ========================================================= */

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

    const currentUser = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        skills: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const myTeach = currentUser.skills.filter(
      (skill) => skill.type.toLowerCase() === "teach"
    );

    const myLearn = currentUser.skills.filter(
      (skill) => skill.type.toLowerCase() === "learn"
    );

    /*
     * If the user hasn't added any skills yet,
     * there is nothing to match.
     */
    if (myTeach.length === 0 && myLearn.length === 0) {
      return NextResponse.json({
        matches: [],
        message:
          "Add skills you can teach or want to learn to find matches.",
      });
    }

    /*
     * Load all other users and their skills.
     */
    const otherUsers = await prisma.user.findMany({
      where: {
        id: {
          not: userId,
        },
      },
      include: {
        skills: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const matches = otherUsers
      .map((otherUser) => {
        const result = findMatches(
          myTeach,
          myLearn,
          otherUser.skills
        );

        if (!result) {
          return null;
        }

        return {
          user: {
            id: otherUser.id,
            name: otherUser.name,
            username: otherUser.username,
            bio: otherUser.bio,
            avatar: otherUser.avatar,
          },

          score: result.score,

          learnFromThem: result.learnFromThem,

          learnFromMe: result.learnFromMe,

          totalMatches: result.totalMatches,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        return (b?.score ?? 0) - (a?.score ?? 0);
      });

    return NextResponse.json({
      matches,
    });
  } catch (error) {
    console.error("GET /api/matches error:", error);

    return NextResponse.json(
      {
        error: "Failed to find matches",
      },
      {
        status: 500,
      }
    );
  }
}