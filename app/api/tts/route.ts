import { createHash } from "node:crypto";

/**
 * TTS for Watt's live answers. OpenAI-compatible /audio/speech endpoint,
 * configured by env (works with OpenAI, ElevenLabs-compatible bridges, or a
 * local server). Without env, returns 503 and the UI stays text-only.
 * In-memory cache by text hash: repeated questions cost nothing.
 */
const cache = new Map<string, Buffer>();
const CACHE_MAX = 50;

export async function POST(request: Request) {
  let body: { text?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid JSON" }, { status: 400 });
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 600) {
    return Response.json(
      { error: "text required, max 600 chars" },
      { status: 400 },
    );
  }

  const baseUrl = process.env.TTS_BASE_URL;
  const apiKey = process.env.TTS_API_KEY;
  const model = process.env.TTS_MODEL ?? "tts-1";
  const voice = process.env.TTS_VOICE ?? "alloy";
  if (!baseUrl || !apiKey) {
    return Response.json({ error: "unconfigured" }, { status: 503 });
  }

  const hash = createHash("sha256")
    .update(`${model}:${voice}:${text}`)
    .digest("hex");
  const hit = cache.get(hash);
  if (hit) {
    return new Response(new Uint8Array(hit), {
      headers: { "content-type": "audio/mpeg", "x-cache": "hit" },
    });
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/audio/speech`, {
      method: "POST",
      signal: AbortSignal.timeout(30_000),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, voice, input: text }),
    });
    if (!res.ok) throw new Error(`TTS HTTP ${res.status}`);
    const audio = Buffer.from(await res.arrayBuffer());
    if (cache.size >= CACHE_MAX) {
      cache.delete(cache.keys().next().value as string);
    }
    cache.set(hash, audio);
    return new Response(new Uint8Array(audio), {
      headers: { "content-type": "audio/mpeg", "x-cache": "miss" },
    });
  } catch (err) {
    return Response.json(
      { error: "upstream unavailable", detail: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
