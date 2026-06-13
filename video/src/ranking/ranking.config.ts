// ---------------------------------------------------------------------------
// RANKING EPISODE CONFIG — this is the only file you edit per video.
// Swap the title + items, render, post. Items are ordered #1 (top) -> #10.
// `value` is the raw number; `format` controls how it's displayed.
// `emoji` shows a flag/icon (renders natively, no image downloads).
// ---------------------------------------------------------------------------

export interface RankItem {
  name: string;
  value: number;
  emoji: string;
  color: string;
}

export interface RankingConfig {
  title: string;
  highlight: string; // emphasized word in the title
  subtitle: string;
  source: string;
  format: "population" | "money" | "plain";
  items: RankItem[]; // index 0 = rank #1
}

export const RANKING: RankingConfig = {
  title: "MOST POPULOUS",
  highlight: "COUNTRIES",
  subtitle: "2026 estimate",
  source: "Source: UN population estimates",
  format: "population", // value in millions
  items: [
    { name: "India", value: 1463, emoji: "🇮🇳", color: "#FF9933" },
    { name: "China", value: 1416, emoji: "🇨🇳", color: "#DE2910" },
    { name: "United States", value: 346, emoji: "🇺🇸", color: "#3C7DC4" },
    { name: "Indonesia", value: 284, emoji: "🇮🇩", color: "#E70011" },
    { name: "Pakistan", value: 251, emoji: "🇵🇰", color: "#01411C" },
    { name: "Nigeria", value: 232, emoji: "🇳🇬", color: "#008751" },
    { name: "Brazil", value: 218, emoji: "🇧🇷", color: "#009C3B" },
    { name: "Bangladesh", value: 175, emoji: "🇧🇩", color: "#006A4E" },
    { name: "Russia", value: 144, emoji: "🇷🇺", color: "#4666B0" },
    { name: "Mexico", value: 131, emoji: "🇲🇽", color: "#006847" },
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
  return v.toLocaleString("en-US");
};
