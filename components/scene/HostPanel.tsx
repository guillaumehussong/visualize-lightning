"use client";

import { useEffect, useRef, useState } from "react";
import { PIECE_CONTENT } from "@/content/pieces";
import { useMachineStore } from "@/lib/store";

type AskState =
  | { status: "idle" }
  | { status: "asking" }
  | { status: "answered"; answer: string; remaining: number | null }
  | { status: "error"; message: string };

/**
 * Watt's panel, bottom right. Play the guided tour (pre-generated audio per
 * piece, zero marginal cost), or ask Watt a question (live LLM, card-bound,
 * quota-limited, optional voice if TTS is configured server-side).
 */
export function HostPanel() {
  const activePiece = useMachineStore((s) => s.activePiece);
  const setSpeaking = useMachineStore((s) => s.setSpeaking);
  const [playing, setPlaying] = useState(false);
  const [audioOk, setAudioOk] = useState(true);
  const [question, setQuestion] = useState("");
  const [ask, setAsk] = useState<AskState>({ status: "idle" });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const content = activePiece ? PIECE_CONTENT[activePiece] : null;

  // stop audio when switching pieces
  useEffect(() => {
    stopAudio();
    setAsk({ status: "idle" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePiece]);

  function stopAudio() {
    audioRef.current?.pause();
    audioRef.current = null;
    setPlaying(false);
    setSpeaking(false);
  }

  function toggleTour() {
    if (!content) return;
    if (playing) {
      stopAudio();
      return;
    }
    const audio = new Audio(`/audio/host/en/${content.id}.mp3`);
    audioRef.current = audio;
    audio.onended = () => {
      setPlaying(false);
      setSpeaking(false);
    };
    audio.onerror = () => {
      setPlaying(false);
      setSpeaking(false);
      setAudioOk(false);
    };
    setSpeaking(true);
    setPlaying(true);
    audio.play().catch(() => {
      setPlaying(false);
      setSpeaking(false);
      setAudioOk(false);
    });
  }

  async function askWatt() {
    if (!content || !question.trim() || ask.status === "asking") return;
    stopAudio();
    setAsk({ status: "asking" });
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ piece: content.id, question: question.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setAsk({
          status: "error",
          message: json.message ?? json.error ?? "Watt is off duty.",
        });
        return;
      }
      setAsk({ status: "answered", answer: json.answer, remaining: json.remaining ?? null });
      // optional voice reply; stays silent if TTS is not configured
      const tts = await fetch("/api/tts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: json.answer }),
      });
      if (tts.ok) {
        const blob = await tts.blob();
        const audio = new Audio(URL.createObjectURL(blob));
        audioRef.current = audio;
        setSpeaking(true);
        audio.onended = () => setSpeaking(false);
        audio.play().catch(() => setSpeaking(false));
      }
    } catch {
      setAsk({ status: "error", message: "Watt is off duty." });
    }
  }

  if (!content) return null;

  return (
    <div className="fixed bottom-12 right-4 left-4 z-20 rounded-lg border border-border bg-panel/90 p-3 backdrop-blur sm:left-auto sm:w-80">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-xs text-accent-soft">Watt, the mechanic</span>
        {audioOk && (
          <button
            onClick={toggleTour}
            className="rounded border border-accent px-2 py-0.5 font-mono text-[11px] text-accent-soft hover:bg-accent hover:text-black"
          >
            {playing ? "stop" : "play tour"}
          </button>
        )}
      </div>

      {ask.status === "answered" && (
        <p className="mb-2 text-sm leading-snug">{ask.answer}</p>
      )}
      {ask.status === "error" && (
        <p className="mb-2 text-sm text-amber-500">{ask.message}</p>
      )}

      <div className="hidden gap-2 sm:flex">
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askWatt()}
          placeholder={`Ask Watt about ${content.title.toLowerCase()}...`}
          maxLength={300}
          className="min-w-0 flex-1 rounded border border-border bg-background px-2 py-1 text-sm outline-none placeholder:text-muted focus:border-accent"
        />
        <button
          onClick={askWatt}
          disabled={ask.status === "asking"}
          className="rounded bg-accent px-2 py-1 text-sm font-medium text-black disabled:opacity-50"
        >
          {ask.status === "asking" ? "..." : "ask"}
        </button>
      </div>
      {ask.status === "answered" && ask.remaining !== null && (
        <p className="mt-1 text-right font-mono text-[10px] text-muted">
          {ask.remaining} questions left this hour
        </p>
      )}
    </div>
  );
}
