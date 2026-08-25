/**
 * UI copy, EN only at launch. Every string lives here so extraction to
 * next-intl messages files (phase 6) is a mechanical move, not a rewrite.
 */
export const copy = {
  siteTitle: "Visualize Lightning",
  tagline: "The Lightning Network explained as a live 3D machine",
  stats: {
    nodes: "nodes",
    channels: "channels",
    capacity: "capacity",
    avgFee: "avg fee",
    block: "block",
    dataAsOf: "data as of",
    staleBadge: "data frozen, showing last known snapshot",
    liveError: "live data unavailable",
  },
  nav: {
    title: "The machine",
    overview: "Overview",
    hint: "click a piece, or use arrow keys",
  },
  about: "About",
  github: "Code",
} as const;
