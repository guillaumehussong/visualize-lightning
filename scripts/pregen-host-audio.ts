/**
 * Pre-generates Watt's guided-tour audio for every piece into
 * public/audio/host/en/<piece>.mp3, using the same OpenAI-compatible TTS env
 * as /api/tts (TTS_BASE_URL, TTS_API_KEY, TTS_MODEL, TTS_VOICE).
 * Pre-generated audio means zero TTS cost per visitor.
 *
 * Usage: npm run pregen:audio
 */
import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";
import { PIECE_CONTENT_LIST } from "../content/pieces";

async function main() {
  const baseUrl = process.env.TTS_BASE_URL;
  const apiKey = process.env.TTS_API_KEY;
  const model = process.env.TTS_MODEL ?? "tts-1";
  const voice = process.env.TTS_VOICE ?? "alloy";
  if (!baseUrl || !apiKey) {
    console.error("TTS_BASE_URL / TTS_API_KEY not set, nothing generated.");
    process.exit(1);
  }

  const outDir = path.join(process.cwd(), "public", "audio", "host", "en");
  await mkdir(outDir, { recursive: true });

  for (const piece of PIECE_CONTENT_LIST) {
    const out = path.join(outDir, `${piece.id}.mp3`);
    try {
      await access(out);
      console.log(`${piece.id}: exists, skipped`);
      continue;
    } catch {}
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/audio/speech`, {
      method: "POST",
      signal: AbortSignal.timeout(60_000),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model, voice, input: piece.narration }),
    });
    if (!res.ok) {
      console.error(`${piece.id}: HTTP ${res.status}, skipped`);
      continue;
    }
    await writeFile(out, Buffer.from(await res.arrayBuffer()));
    console.log(`${piece.id}: written`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
