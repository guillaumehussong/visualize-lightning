/**
 * Locale-aware copy. Single source of truth: messages/<locale>.json
 * (next-intl contract). getCopy/getPieceContent run server-side; client
 * components use the hooks in lib/useCopy.ts.
 */
import en from "@/messages/en.json";
import es from "@/messages/es.json";
import fr from "@/messages/fr.json";
import type { PieceContent } from "@/content/pieces";

export type Locale = "en" | "es" | "fr";

const dictionaries: Record<Locale, typeof en> = { en, es, fr };

function pick(locale: string): typeof en {
  return dictionaries[locale as Locale] ?? en;
}

/** Shape kept identical to the pre-i18n static copy object. */
export function getCopy(locale: string) {
  const m = pick(locale);
  return {
    siteTitle: m.site.title,
    tagline: m.site.tagline,
    stats: m.stats,
    nav: m.nav,
    about: m.about,
    github: m.github,
  };
}

export function getPieceContent(locale: string): Record<string, PieceContent> {
  const m = pick(locale);
  return Object.fromEntries(
    Object.entries(m.pieces).map(([id, p]) => [id, { id, ...p }]),
  );
}
