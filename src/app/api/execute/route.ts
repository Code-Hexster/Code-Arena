import { NextResponse } from "next/server";

const JUDGE0_API_URL =
  process.env.JUDGE0_API_URL || "https://judge0-ce.p.rapidapi.com";
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY || "";

// Python 3 language ID in Judge0
const PYTHON3_LANGUAGE_ID = 71;

// Rate limiting: simple in-memory tracker (use Redis in production)
const rateLimits = new Map<string, { count: number; resetAt: number }>();
const MAX_REQUESTS_PER_MINUTE = 10;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const record = rateLimits.get(userId);

  if (!record || now > record.resetAt) {
    rateLimits.set(userId, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, input = "" } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    if (code.length > 10000) {
      return NextResponse.json(
        { error: "Code is too long (max 10,000 characters)" },
        { status: 400 }
      );
    }

    // Simple rate limit by IP
    const clientId =
      request.headers.get("x-forwarded-for") || "anonymous";
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 }
      );
    }

    // If no Judge0 API key configured, use mock execution for development
    if (!JUDGE0_API_KEY) {
      return NextResponse.json(await mockExecute(code, input));
    }

    // Submit to Judge0
    const submitResponse = await fetch(
      `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=true&fields=stdout,stderr,status,time,memory,compile_output`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": JUDGE0_API_KEY,
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
        },
        body: JSON.stringify({
          source_code: Buffer.from(code).toString("base64"),
          language_id: PYTHON3_LANGUAGE_ID,
          stdin: input ? Buffer.from(input).toString("base64") : "",
          cpu_time_limit: 5,
          memory_limit: 128000,
        }),
      }
    );

    if (!submitResponse.ok) {
      console.error("Judge0 error:", await submitResponse.text());
      return NextResponse.json(
        { error: "Code execution service unavailable" },
        { status: 503 }
      );
    }

    const result = await submitResponse.json();

    return NextResponse.json({
      stdout: result.stdout
        ? Buffer.from(result.stdout, "base64").toString("utf-8")
        : "",
      stderr: result.stderr
        ? Buffer.from(result.stderr, "base64").toString("utf-8")
        : "",
      compile_output: result.compile_output
        ? Buffer.from(result.compile_output, "base64").toString("utf-8")
        : "",
      status: result.status,
      time: result.time,
      memory: result.memory,
    });
  } catch (error) {
    console.error("Execute error:", error);
    return NextResponse.json(
      { error: "Failed to execute code" },
      { status: 500 }
    );
  }
}

/**
 * Mock Python execution for development without Judge0
 * This is a VERY basic simulator — only handles print statements
 */
async function mockExecute(code: string, _input: string) {
  try {
    // Extract simple print statements
    const printRegex = /print\s*\(\s*(.*?)\s*\)/g;
    const outputs: string[] = [];
    let match;

    // Very basic variable resolution
    const variables: Record<string, string> = {};
    const lines = code.split("\n");

    for (const line of lines) {
      const trimmed = line.trim();

      // Simple variable assignment: var = "value" or var = number
      const assignMatch = trimmed.match(
        /^(\w+)\s*=\s*(?:"([^"]*?)"|'([^']*?)'|(\d+(?:\.\d+)?))\s*$/
      );
      if (assignMatch) {
        const [, varName, strVal1, strVal2, numVal] = assignMatch;
        variables[varName] = strVal1 ?? strVal2 ?? numVal ?? "";
      }
    }

    // Reset regex
    printRegex.lastIndex = 0;
    while ((match = printRegex.exec(code)) !== null) {
      let arg = match[1].trim();

      // Handle string concatenation (check BEFORE string literals
      // because `"Hi, " + name + "!"` starts and ends with quotes too)
      if (arg.includes("+")) {
        const parts = arg.split("+").map((p) => {
          p = p.trim();
          if (
            (p.startsWith('"') && p.endsWith('"')) ||
            (p.startsWith("'") && p.endsWith("'"))
          ) {
            return p.slice(1, -1);
          }
          // Handle str() wrapper: str(variable)
          const strMatch = p.match(/^str\((\w+)\)$/);
          if (strMatch) {
            return variables[strMatch[1]] ?? p;
          }
          return variables[p] ?? p;
        });
        outputs.push(parts.join(""));
      }
      // Handle f-strings (basic)
      else if (arg.startsWith('f"') || arg.startsWith("f'")) {
        let fstr = arg.slice(2, -1);
        fstr = fstr.replace(/\{(\w+)\}/g, (_, varName) => variables[varName] ?? `{${varName}}`);
        outputs.push(fstr);
      }
      // Handle string literals
      else if (
        (arg.startsWith('"') && arg.endsWith('"')) ||
        (arg.startsWith("'") && arg.endsWith("'"))
      ) {
        outputs.push(arg.slice(1, -1));
      }
      // Handle variable reference
      else if (variables[arg] !== undefined) {
        outputs.push(variables[arg]);
      } else {
        outputs.push(arg);
      }
    }

    return {
      stdout: outputs.join("\n") + (outputs.length > 0 ? "\n" : ""),
      stderr: "",
      compile_output: "",
      status: { id: 3, description: "Accepted" },
      time: "0.001",
      memory: 1024,
    };
  } catch {
    return {
      stdout: "",
      stderr: "Mock execution error",
      compile_output: "",
      status: { id: 11, description: "Runtime Error" },
      time: "0",
      memory: 0,
    };
  }
}
