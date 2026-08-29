import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const requestId = Number(body.requestId);
    const userId = Number(body.userId);

    if (!Number.isInteger(requestId)) {
      return NextResponse.json(
        {
          error: "Invalid request ID.",
        },
        { status: 400 }
      );
    }

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        {
          error: "Invalid user ID.",
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
          error: "Exchange request not found.",
        },
        { status: 404 }
      );
    }

    if (
      exchangeRequest.senderId !== userId &&
      exchangeRequest.receiverId !== userId
    ) {
      return NextResponse.json(
        {
          error: "You are not part of this exchange.",
        },
        { status: 403 }
      );
    }

    if (exchangeRequest.status !== "accepted") {
      return NextResponse.json(
        {
          error:
            "Only accepted exchanges can be completed.",
        },
        { status: 409 }
      );
    }

    /*
     * -------------------------------------------------------
     * FIND THE SKILL BEING LEARNED
     * -------------------------------------------------------
     *
     * New requests have skillId saved already.
     *
     * Old requests may have skillId = null.
     * For those, we find the receiver's teaching skill
     * that matches the sender's learning skill.
     */

    let teachingSkill = null;

    if (exchangeRequest.skillId) {
      teachingSkill =
        await prisma.skill.findFirst({
          where: {
            id: exchangeRequest.skillId,
            userId: exchangeRequest.receiverId,
            type: "teach",
          },
        });
    }

    /*
     * -------------------------------------------------------
     * FALLBACK FOR OLD REQUESTS
     * -------------------------------------------------------
     */

    if (!teachingSkill) {
      const senderLearningSkills =
        await prisma.skill.findMany({
          where: {
            userId: exchangeRequest.senderId,
            type: "learn",
          },
        });

      const receiverTeachingSkills =
        await prisma.skill.findMany({
          where: {
            userId: exchangeRequest.receiverId,
            type: "teach",
          },
        });

      /*
       * First try to find an exact skill-name match.
       */

      teachingSkill =
        receiverTeachingSkills.find(
          (teacherSkill) =>
            senderLearningSkills.some(
              (learningSkill) =>
                learningSkill.name
                  .trim()
                  .toLowerCase() ===
                teacherSkill.name
                  .trim()
                  .toLowerCase()
            )
        ) || null;

      /*
       * If there is only one teaching skill,
       * safely use that as the fallback.
       *
       * This makes old requests created before the
       * skillId fix work as long as the teacher has
       * one teaching skill.
       */

      if (
        !teachingSkill &&
        receiverTeachingSkills.length === 1
      ) {
        teachingSkill =
          receiverTeachingSkills[0];
      }
    }

    if (!teachingSkill) {
      return NextResponse.json(
        {
          error:
            "Could not determine which skill was learned in this exchange. Please create a new exchange request.",
        },
        { status: 400 }
      );
    }

    /*
     * -------------------------------------------------------
     * COMPLETE EXCHANGE + CREATE LEARNED SKILL
     * -------------------------------------------------------
     */

    const result =
      await prisma.$transaction(
        async (tx) => {
          const updatedRequest =
            await tx.exchangeRequest.update({
              where: {
                id: requestId,
              },
              data: {
                status: "completed",

                /*
                 * If this was an old request,
                 * save the recovered skill ID now.
                 */
                skillId: teachingSkill!.id,
              },
            });

          /*
           * Check whether the learner already has
           * this skill in My Skills.
           */

          let learnedSkill =
            await tx.skill.findFirst({
              where: {
                userId:
                  exchangeRequest.senderId,
                type: "learn",
                name: teachingSkill!.name,
              },
            });

          /*
           * If not, create it automatically.
           */

          if (!learnedSkill) {
            learnedSkill =
              await tx.skill.create({
                data: {
                  userId:
                    exchangeRequest.senderId,

                  name: teachingSkill!.name,

                  type: "learn",

                  verified: false,

                  verificationMethod:
                    null,

                  certificateUrl:
                    null,

                  quizScore: null,
                },
              });
          }

          return {
            updatedRequest,
            learnedSkill,
          };
        }
      );

    return NextResponse.json({
      success: true,

      request:
        result.updatedRequest,

      learnedSkill:
        result.learnedSkill,

      message:
        "Exchange completed. The learned skill has been added to My Skills.",
    });
  } catch (error) {
    console.error(
      "Complete exchange error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to complete exchange.",
      },
      { status: 500 }
    );
  }
}