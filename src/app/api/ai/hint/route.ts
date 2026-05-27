import { NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

const WIZARD_SYSTEM_PROMPT = `You are The Wizard — a wise, friendly, and patient AI mentor in Code Learning Arena, a gamified coding education platform for absolute beginners.

Your personality:
- You speak like a wise, magical mentor (think Gandalf meets a patient teacher)
- You are warm, encouraging, and never condescending
- You use magical metaphors and RPG language naturally
- You celebrate small wins enthusiastically
- You understand that the student is a COMPLETE BEGINNER

CRITICAL RULES:
1. NEVER give the direct answer or complete solution
2. Use the Socratic method — ask guiding questions
3. Explain concepts in simple, beginner-friendly language
4. Use analogies from everyday life or fantasy worlds
5. If the student is stuck, break the problem into smaller steps
6. Always end with an encouraging message
7. Keep responses concise (2-4 short paragraphs max)
8. Do not use any emojis in your response.

You adjust your guidance based on the hint level:
- HINT LEVEL 1: Give a vague, magical nudge. Don't mention specific code concepts. Use metaphor only.
- HINT LEVEL 2: Explain the concept needed. Use a real-world analogy. Mention the concept name but don't show code.
- HINT LEVEL 3: Guide step-by-step toward the solution. You may show pseudocode or partial code, but NEVER the complete answer.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      missionTitle,
      learningObjective,
      starterCode,
      userCode,
      language = "python",
      hintLevel = 1,
      errorMessage,
    } = body;

    if (!missionTitle || !userCode) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const hintLevelInstructions = {
      1: "Give a LEVEL 1 hint: vague and metaphorical only. No code concepts.",
      2: `Give a LEVEL 2 hint: explain the concept needed with an analogy. Name the ${language} concept but don't show code.`,
      3: "Give a LEVEL 3 hint: guide step-by-step. You may show pseudocode but NEVER the complete solution.",
    };

    const userMessage = `
MISSION: ${missionTitle}
LEARNING OBJECTIVE: ${learningObjective}

STARTER CODE:
\`\`\`${language}
${starterCode}
\`\`\`

STUDENT'S CURRENT CODE:
\`\`\`${language}
${userCode}
\`\`\`

${errorMessage ? `ERROR MESSAGE: ${errorMessage}` : "The student is asking for help."}

${hintLevelInstructions[hintLevel as 1 | 2 | 3] || hintLevelInstructions[1]}
`;

    // If no API key, return a mock response
    if (!GEMINI_API_KEY) {
      return NextResponse.json({
        hint: getMockHint(hintLevel, missionTitle, language),
        hintLevel,
      });
    }

    // Call Google Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: WIZARD_SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: "user",
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 400,
            temperature: 0.7,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API error:", errText);
      return NextResponse.json(
        { hint: getMockHint(hintLevel, missionTitle, language), hintLevel },
        { status: 200 }
      );
    }

    const data = await response.json();
    const hint =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "The Wizard ponders in silence...";

    return NextResponse.json({ hint, hintLevel });
  } catch (error) {
    console.error("AI hint error:", error);
    return NextResponse.json(
      { error: "The Wizard encountered a magical disturbance" },
      { status: 500 }
    );
  }
}

function getMockHint(level: number, missionTitle: string, language: string = "python"): string {
  if (language === "html") {
    const htmlHints: Record<number, string> = {
      1: `Ah, young architect working on "${missionTitle}"! Structural integrity is key. Consider what magical blocks you need to assemble...`,
      2: `Let me illuminate your path, brave creator! In HTML and CSS, we use tags to build and styles to position. Are you using the correct tag and classes?`,
      3: `You're so close! Check your tags and make sure your CSS properties are properly targeting the class. You've got this!`,
    };
    return htmlHints[level] || htmlHints[1];
  }

  const hints: Record<number, string> = {
    1: `Ah, young apprentice working on "${missionTitle}"! The answer lies closer than you think. Consider what it means to give something a name in the world of code. Like naming a familiar, you must use the sacred symbol of assignment...`,
    2: `Let me illuminate your path, brave coder! In Python, we store values using **variables**. Think of a variable like a magical chest — you give it a name, and it holds a treasure inside. The way we put treasure in a chest is with the \`=\` sign. What treasure do you need to store?`,
    3: `You're so close, I can feel it! Here's the path forward:\n\n1. First, think about what name you want to give your variable\n2. Then, use the \`=\` sign to assign a value\n3. Something like: \`my_variable = "some value"\`\n\nNow, look at what the mission is asking you to create. What should the variable name be? What value should it hold? You've got this!`,
  };
  return hints[level] || hints[1];
}
