import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY is missing from .env",
        },
        { status: 500 }
      );
    }

    // Read request
    const body = await request.json();
    const skill = String(body.skill || "").trim();

    if (!skill) {
      return NextResponse.json(
        {
          error: "Skill name is required.",
        },
        { status: 400 }
      );
    }

    // Generate quiz
    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",

      messages: [
        {
          role: "system",
          content: `
You are the SkillSwap skill assessment engine.

Generate a skill verification quiz.

The response MUST be valid JSON and NOTHING else.

Use exactly this structure:

{
  "questions": [
    {
      "question": "question text",
      "options": [
        "option A",
        "option B",
        "option C",
        "option D"
      ],
      "answer": 0
    }
  ]
}

Rules:

- Generate EXACTLY 5 questions.
- Every question must have EXACTLY 4 options.
- Only one option is correct.
- "answer" must be 0, 1, 2, or 3.
- Question 1 should test basic knowledge.
- Question 2 should test basic practical knowledge.
- Question 3 should test intermediate knowledge.
- Question 4 should test advanced knowledge.
- Question 5 should test advanced/professional knowledge.
- Questions must be specific to the requested skill.
- Include practical/application questions where appropriate.
- Do not ask opinion-based questions.
- Do not ask vague questions.
- Do not repeat the same concept.
- Keep questions and options reasonably short.
- Do not include explanations.
- Do not include markdown.
- Do not include anything outside the JSON object.
          `,
        },

        {
          role: "user",
          content: `Create the quiz for this skill: ${skill}`,
        },
      ],

      // Simpler and more reliable than strict JSON schema
      response_format: {
        type: "json_object",
      },

      // Reduce reasoning usage so we don't hit
      // Groq's 8000 TPM limit as easily.
      reasoning_format: "hidden",
      reasoning_effort: "low",

      temperature: 0.3,

      // Keep this below the remaining TPM budget.
      max_completion_tokens: 1800,
    });

    // Get AI response
    const content =
      completion.choices[0]?.message?.content;

    if (!content) {
      throw new Error(
        "AI returned an empty response."
      );
    }

    console.log("AI quiz response:", content);

    // Parse JSON
    let quiz;

    try {
      quiz = JSON.parse(content);
    } catch {
      throw new Error(
        "AI returned invalid JSON."
      );
    }

    // Validate questions
    if (
      !quiz ||
      !Array.isArray(quiz.questions)
    ) {
      throw new Error(
        "AI response does not contain questions."
      );
    }

    // Must have exactly 5
    if (quiz.questions.length !== 5) {
      throw new Error(
        `AI returned ${quiz.questions.length} questions instead of 5.`
      );
    }

    // Validate every question
    for (
      let i = 0;
      i < quiz.questions.length;
      i++
    ) {
      const question = quiz.questions[i];

      if (
        !question ||
        typeof question.question !== "string" ||
        question.question.trim() === ""
      ) {
        throw new Error(
          `Question ${i + 1} is invalid.`
        );
      }

      if (
        !Array.isArray(question.options) ||
        question.options.length !== 4
      ) {
        throw new Error(
          `Question ${i + 1} must have exactly 4 options.`
        );
      }

      if (
        typeof question.answer !== "number" ||
        !Number.isInteger(question.answer) ||
        question.answer < 0 ||
        question.answer > 3
      ) {
        throw new Error(
          `Question ${i + 1} has an invalid answer index.`
        );
      }

      for (
        const option of question.options
      ) {
        if (
          typeof option !== "string" ||
          option.trim() === ""
        ) {
          throw new Error(
            `Question ${i + 1} contains an invalid option.`
          );
        }
      }
    }

    // Return valid quiz
    return NextResponse.json({
      questions: quiz.questions,
    });

  } catch (error) {
    console.error(
      "AI quiz generation error:",
      error
    );

    // Special handling for Groq rate limits
    if (
      error &&
      typeof error === "object" &&
      "status" in error &&
      error.status === 429
    ) {
      return NextResponse.json(
        {
          error:
            "AI is temporarily busy. Please wait about 20 seconds and try again.",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : String(error),
      },
      { status: 500 }
    );
  }
}