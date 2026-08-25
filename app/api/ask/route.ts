import { PIECE_CONTENT } from "@/content/pieces";
import { buildSystemPrompt, WATT_PERSONA } from "@/content/host-persona";
import { checkQuota } from "@/lib/quota";

const MAX_QUESTION_LEN = 300;
const MAX_ANSWER_TOKENS = 180;

function clientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: Request) {
  let body: { piece?: unknown; question?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }

  const piece = typeof body.piece === "string" ? body.piece : "";
  const question =
    typeof body.question === "string" ? body.question.trim() : "";
  const card = PIECE_CONTENT[piece];

  if (!card) {
    return Response.json({ error: "unknown piece" }, { status: 400 });
  }
  if (!question || question.length > MAX_QUESTION_LEN) {
    return Response.json(
      { error: `question required, max ${MAX_QUESTION_LEN} chars` },
      { status: 400 },
    );
  }

  const quota = checkQuota(clientIp(request));
  if (!quota.allowed) {
    return Response.json(
      { error: "quota", message: WATT_PERSONA.quotaReached },
      { status: 429 },
    );
  }

  const baseUrl = process.env.LLM_BASE_URL;
  const apiKey = process.env.LLM_API_KEY;
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
  if (!baseUrl || !apiKey) {
    return Response.json(
      { error: "unconfigured", message: WATT_PERSONA.offDuty },
      { status: 503 },
    );
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      signal: AbortSignal.timeout(20_000),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: MAX_ANSWER_TOKENS,
        messages: [
          { role: "system", content: buildSystemPrompt(card) },
          { role: "user", content: question },
        ],
      }),
    });
    if (!res.ok) {
      throw new Error(`LLM HTTP ${res.status}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const answer = json.choices?.[0]?.message?.content?.trim();
    if (!answer) throw new Error("empty LLM answer");
    return Response.json({ answer, remaining: quota.remaining });
  } catch (err) {
    return Response.json(
      {
        error: "upstream unavailable",
        message: WATT_PERSONA.offDuty,
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 502 },
    );
  }
}
