import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

/* =========================================================
   GET /api/skills?userId=1
   Load all skills belonging to a user
   ========================================================= */

export async function GET(request: NextRequest) {
  try {
    const userIdParam = request.nextUrl.searchParams.get("userId");

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

    const skills = await prisma.skill.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      skills,
    });
  } catch (error) {
    console.error("GET /api/skills error:", error);

    return NextResponse.json(
      { error: "Failed to load skills" },
      { status: 500 }
    );
  }
}


/* =========================================================
   POST /api/skills
   Add a new skill
   ========================================================= */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, type, userId } = body;

    if (!name || !type || !userId) {
      return NextResponse.json(
        {
          error: "Name, type and userId are required",
        },
        { status: 400 }
      );
    }

    const numericUserId = Number(userId);

    if (!Number.isInteger(numericUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanType = String(type).trim().toLowerCase();

    if (!cleanName) {
      return NextResponse.json(
        { error: "Skill name cannot be empty" },
        { status: 400 }
      );
    }

    if (cleanType !== "teach" && cleanType !== "learn") {
      return NextResponse.json(
        {
          error: "Skill type must be teach or learn",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: numericUserId,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const existingSkill = await prisma.skill.findFirst({
      where: {
        userId: numericUserId,
        name: {
          equals: cleanName,
        },
        type: cleanType,
      },
    });

    if (existingSkill) {
      return NextResponse.json(
        {
          error: "You already added this skill",
        },
        { status: 409 }
      );
    }

    const skill = await prisma.skill.create({
      data: {
        name: cleanName,
        type: cleanType,
        userId: numericUserId,
      },
    });

    return NextResponse.json(
      {
        skill,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/skills error:", error);

    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}


/* =========================================================
   DELETE /api/skills
   Delete a skill
   ========================================================= */

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const skillId = Number(body.skillId ?? body.id);
    const userId = Number(body.userId);

    if (!Number.isInteger(skillId)) {
      return NextResponse.json(
        { error: "Invalid skill ID" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.findFirst({
      where: {
        id: skillId,
        userId,
      },
    });

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    await prisma.skill.delete({
      where: {
        id: skillId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE /api/skills error:", error);

    return NextResponse.json(
      { error: "Failed to delete skill" },
      { status: 500 }
    );
  }
}


/* =========================================================
   PATCH /api/skills
   Update verification information
   ========================================================= */

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      skillId,
      userId,
      verified,
      verificationMethod,
      certificateUrl,
      quizScore,
    } = body;

    const numericSkillId = Number(skillId);
    const numericUserId = Number(userId);

    if (!Number.isInteger(numericSkillId)) {
      return NextResponse.json(
        { error: "Invalid skill ID" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(numericUserId)) {
      return NextResponse.json(
        { error: "Invalid user ID" },
        { status: 400 }
      );
    }

    const skill = await prisma.skill.findFirst({
      where: {
        id: numericSkillId,
        userId: numericUserId,
      },
    });

    if (!skill) {
      return NextResponse.json(
        { error: "Skill not found" },
        { status: 404 }
      );
    }

    const updateData: {
      verified?: boolean;
      verificationMethod?: string | null;
      certificateUrl?: string | null;
      quizScore?: number | null;
    } = {};

    if (typeof verified === "boolean") {
      updateData.verified = verified;
    }

    if (verificationMethod !== undefined) {
      updateData.verificationMethod =
        verificationMethod || null;
    }

    if (certificateUrl !== undefined) {
      updateData.certificateUrl =
        certificateUrl || null;
    }

    if (quizScore !== undefined) {
      updateData.quizScore =
        quizScore === null ? null : Number(quizScore);
    }

    const updatedSkill = await prisma.skill.update({
      where: {
        id: numericSkillId,
      },
      data: updateData,
    });

    return NextResponse.json({
      skill: updatedSkill,
    });
  } catch (error) {
    console.error("PATCH /api/skills error:", error);

    return NextResponse.json(
      { error: "Failed to update skill" },
      { status: 500 }
    );
  }
}