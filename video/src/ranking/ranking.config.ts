// ---------------------------------------------------------------------------
// RANKING EPISODE CONFIG — the only file you edit per video.
// Swap title + items, render, post. Items are ordered #1 (top) -> #N.
// `emoji` shows a flag/icon (renders natively, no image downloads).
// ---------------------------------------------------------------------------

export interface RankItem {
  name: string;
  value: number;
  emoji: string;
  color: string;
}

export interface RankingConfig {
  kicker: string; // small label above the title (e.g. "TOP 10")
  title: string;
  highlight: string; // emphasized word in the title
  subtitle: string;
  source: string;
  handle: string; // channel watermark, e.g. "@lauraleigh69"
  format: "population" | "money" | "trophies" | "plain";
  items: RankItem[]; // index 0 = rank #1
}

export const RANKING: RankingConfig = {
  kicker: "🏆 WORLD CUP",
  title: "MOST",
  highlight: "TITLES",
  subtitle: "Every nation to win the World Cup",
  source: "FIFA World Cup · 1930–2022",
  handle: "@lauraleigh69",
  format: "trophies",
  items: [
    { name: "Brazil", value: 5, emoji: "🇧🇷", color: "#009C3B" },
    { name: "Germany", value: 4, emoji: "🇩🇪", color: "#C8A100" },
    { name: "Italy", value: 4, emoji: "🇮🇹", color: "#0066A1" },
    { name: "Argentina", value: 3, emoji: "🇦🇷", color: "#75AADB" },
    { name: "France", value: 2, emoji: "🇫🇷", color: "#0055A4" },
    { name: "Uruguay", value: 2, emoji: "🇺🇾", color: "#4f9ad6" },
    { name: "England", value: 1, emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", color: "#CF142B" },
    { name: "Spain", value: 1, emoji: "🇪🇸", color: "#C60B1E" },
  ],
};

// timing (frames @ 30fps)
export const INTRO = 90;
export const PER_REVEAL = 88;
export const OUTRO = 132;

export const rankingDuration = (cfg: RankingConfig = RANKING): number =>
  INTRO + cfg.items.length * PER_REVEAL + OUTRO;

export const formatValue = (v: number, format: RankingConfig["format"]): string => {
  if (format === "population") return v >= 1000 ? `${(v / 1000).toFixed(2)}B` : `${v}M`;
  if (format === "money") return v >= 1000 ? `$${(v / 1000).toFixed(1)}T` : `$${v}B`;
  if (format === "trophies") return `${Math.round(v)} 🏆`;
  return Math.round(v).toLocaleString("en-US");
};
