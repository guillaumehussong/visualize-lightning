"use client";

/**
 * Client-side access to the current locale's copy, served by
 * NextIntlClientProvider from app/[locale]/layout.tsx. Shapes mirror
 * lib/copy.ts so components keep their existing field access.
 */
import { useMessages } from "next-intl";
import type { PieceContent } from "@/content/pieces";

interface PieceMessage {
  title: string;
  tagline: string;
  facts: string[];
  narration: string;
}

interface SiteMessages {
  site: { title: string; tagline: string };
  stats: {
    nodes: string;
    channels: string;
    capacity: string;
    avgFee: string;
    block: string;
    dataAsOf: string;
    staleBadge: string;
    liveError: string;
  };
  nav: { title: string; overview: string; hint: string };
  about: string;
  github: string;
  pieces: Record<string, PieceMessage>;
}

function useSiteMessages(): SiteMessages {
  return useMessages() as unknown as SiteMessages;
}

export function useCopy() {
  const m = useSiteMessages();
  return {
    siteTitle: m.site.title,
    tagline: m.site.tagline,
    stats: m.stats,
    nav: m.nav,
    about: m.about,
    github: m.github,
  };
}

export function usePieceContent(): Record<string, PieceContent> {
  const m = useSiteMessages();
  const out: Record<string, PieceContent> = {};
  for (const [id, p] of Object.entries(m.pieces)) {
    out[id] = {
      id,
      title: p.title,
      tagline: p.tagline,
      facts: p.facts,
      narration: p.narration,
    };
  }
  return out;
}
