import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

type SkillData = {
  id: number;
  name: string;
  type: string;
  verified: boolean;
};

type SkillMatch = {
  mine: string;
  theirs: string;
  verified: boolean;
  theirsId: number;
  mineId: number;
};

function normalizeSkill(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function findMatches(
  myTeach: SkillData[],
  myLearn: SkillData[],
  theirSkills: SkillData[]
) {
  const theirTeach = theirSkills.filter(
    (skill) =>
      skill.type.toLowerCase() === "teach"
  );

  const theirLearn = theirSkills.filter(
    (skill) =>
      skill.type.toLowerCase() === "learn"
  );

  /*
   * I WANT TO LEARN
   * They can TEACH
   */
  const learnFromThem = myLearn
    .map((mySkill) => {
      const match = theirTeach.find(
        (theirSkill) =>
          normalizeSkill(theirSkill.name) ===
          normalizeSkill(mySkill.name)
      );

      if (!match) {
        return null;
      }

      return {
        mine: mySkill.name,
        theirs: match.name,
        verified: match.verified,

        // IMPORTANT:
        // ID of THEIR skill that I want to learn
        theirsId: match.id,

        // ID of MY skill
        mineId: mySkill.id,
      };
    })
    .filter(Boolean) as SkillMatch[];

  /*
   * I CAN TEACH
   * They want to LEARN
   */
  const learnFromMe = myTeach
    .map((mySkill) => {
      const match = theirLearn.find(
        (theirSkill) =>
          normalizeSkill(theirSkill.name) ===
          normalizeSkill(mySkill.name)
      );

      if (!match) {
        return null;
      }

      return {
        mine: mySkill.name,
        theirs: match.name,
        verified: mySkill.verified,

        // ID of MY skill that I teach
        mineId: mySkill.id,

        // ID of THEIR learning skill
        theirsId: match.id,
      };
    })
    .filter(Boolean) as SkillMatch[];

  /*
   * No match
   */
  if (
    learnFromThem.length === 0 &&
    learnFromMe.length === 0
  ) {
    return null;
  }

  /*
   * =====================================================
   * COMPATIBILITY SCORE
   * =====================================================
   *
   * Perfect two-way exchange = 100%
   *
   * Example:
   *
   * Me:
   *   Teach Video Editing
   *   Learn C++
   *
   * Them:
   *   Teach C++
   *   Learn Video Editing
   *
   * = 100%
   *
   * Verification does NOT affect compatibility.
   */

  let score = 0;

  /*
   * If both users have Teach + Learn skills,
   * calculate both directions.
   */
  if (
    myTeach.length > 0 &&
    myLearn.length > 0
  ) {
    const learnRatio =
      learnFromThem.length /
      myLearn.length;

    const teachRatio =
      learnFromMe.length /
      myTeach.length;

    score =
      ((learnRatio + teachRatio) / 2) * 100;
  }

  /*
   * Only learning skills
   */
  else if (myLearn.length > 0) {
    score =
      (learnFromThem.length /
        myLearn.length) *
      100;
  }

  /*
   * Only teaching skills
   */
  else if (myTeach.length > 0) {
    score =
      (learnFromMe.length /
        myTeach.length) *
      100;
  }

  score = Math.min(
    100,
    Math.max(0, Math.round(score))
  );

  /*
   * SPECIAL CASE:
   *
   * If there is at least one match in BOTH
   * directions, make sure a complete reciprocal
   * exchange is displayed as 100%.
   *
   * This prevents unrelated extra skills from
   * making a perfect exchange look weaker.
   */

  if (
    learnFromThem.length > 0 &&
    learnFromMe.length > 0
  ) {
    const matchedLearnSkills =
      new Set(
        learnFromThem.map((skill) =>
          normalizeSkill(skill.theirs)
        )
      );

    const matchedTeachSkills =
      new Set(
        learnFromMe.map((skill) =>
          normalizeSkill(skill.mine)
        )
      );

    const allMyLearnSkillsMatch =
      myLearn.every((skill) =>
        matchedLearnSkills.has(
          normalizeSkill(skill.name)
        )
      );

    const allMyTeachSkillsMatch =
      myTeach.every((skill) =>
        matchedTeachSkills.has(
          normalizeSkill(skill.name)
        )
      );

    if (
      allMyLearnSkillsMatch &&
      allMyTeachSkillsMatch
    ) {
      score = 100;
    }
  }

  return {
    score,

    learnFromThem,

    learnFromMe,

    totalMatches:
      learnFromThem.length +
      learnFromMe.length,
  };
}


/* =========================================================
   GET /api/matches?userId=1
   ========================================================= */

export async function GET(
  request: NextRequest
) {
  try {
    const userIdParam =
      request.nextUrl.searchParams.get(
        "userId"
      );

    if (!userIdParam) {
      return NextResponse.json(
        {
          error:
            "User ID is required",
        },
        {
          status: 400,
        }
      );
    }

    const userId =
      Number(userIdParam);

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          error:
            "Invalid user ID",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * Load current user
     */
    const currentUser =
      await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          skills: true,
        },
      });

    if (!currentUser) {
      return NextResponse.json(
        {
          error:
            "User not found",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * Separate my skills
     */
    const myTeach =
      currentUser.skills.filter(
        (skill) =>
          skill.type.toLowerCase() ===
          "teach"
      );

    const myLearn =
      currentUser.skills.filter(
        (skill) =>
          skill.type.toLowerCase() ===
          "learn"
      );

    /*
     * No skills
     */
    if (
      myTeach.length === 0 &&
      myLearn.length === 0
    ) {
      return NextResponse.json({
        matches: [],
        message:
          "Add skills you can teach or want to learn to find matches.",
      });
    }

    /*
     * Load all other users
     */
    const otherUsers =
      await prisma.user.findMany({
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

    /*
     * Calculate matches
     */
    const matches = otherUsers
      .map((otherUser) => {
        const result =
          findMatches(
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
            username:
              otherUser.username,
            bio: otherUser.bio,
            avatar:
              otherUser.avatar,
          },

          score: result.score,

          learnFromThem:
            result.learnFromThem,

          learnFromMe:
            result.learnFromMe,

          totalMatches:
            result.totalMatches,
        };
      })
      .filter(
        (
          match
        ): match is NonNullable<
          typeof match
        > => match !== null
      )
      .sort(
        (a, b) =>
          b.score - a.score
      );

    return NextResponse.json({
      matches,
    });
  } catch (error) {
    console.error(
      "GET /api/matches error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to find matches",
      },
      {
        status: 500,
      }
    );
  }
}