import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { AnimatedBackground, UIFONT } from "../uikit/uikit";
import { INTRO, PER_REVEAL, RANKING, formatValue, rankingDuration } from "./ranking.config";

export const rankingDurationInFrames = rankingDuration;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GOLD = "#FFC83D";

const n = RANKING.items.length;
const maxValue = Math.max(...RANKING.items.map((i) => i.value));
const revealFrameFor = (rank: number) => INTRO + (n - rank) * PER_REVEAL; // rank n reveals first

const Row: React.FC<{ rank: number }> = ({ rank }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const item = RANKING.items[rank - 1];
  const reveal = revealFrameFor(rank);
  const local = frame - reveal;
  const p = spring({ frame: local, fps, config: { damping: 200, mass: 0.6 } });
  const x = interpolate(p, [0, 1], [160, 0]);
  const barPct = (item.value / maxValue) * 100 * interpolate(local, [0, 28], [0, 1], clamp);
  const cur = item.value * interpolate(local, [0, 30], [0, 1], clamp);
  const isTop = rank === 1;
  const pop = isTop ? interpolate(Math.sin(Math.max(0, local) / 7), [-1, 1], [1, 1.03]) : 1;
  const top = 330 + (rank - 1) * 136;
  return (
    <div style={{ position: "absolute", left: 46, right: 46, top, height: 120, transform: `translateX(${x}px) scale(${pop})`, opacity: p, fontFamily: UIFONT }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: "rgba(255,255,255,0.06)", border: isTop ? `3px solid ${GOLD}` : "1px solid rgba(255,255,255,0.1)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barPct}%`, minWidth: 120, borderRadius: 26, background: `linear-gradient(90deg, ${item.color}, ${item.color}aa)`, boxShadow: isTop ? `0 0 40px ${GOLD}88` : "none" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 28px", gap: 22 }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: isTop ? GOLD : "rgba(0,0,0,0.35)", color: isTop ? "#1a1205" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, fontWeight: 900, flexShrink: 0 }}>
          {rank}
        </div>
        <div style={{ fontSize: 66 }}>{item.emoji}</div>
        <div style={{ flex: 1, fontSize: 46, fontWeight: 800, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}>
          {isTop ? "👑 " : ""}{item.name}
        </div>
        <div style={{ fontSize: 50, fontWeight: 900, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
          {formatValue(cur, RANKING.format)}
        </div>
      </div>
    </div>
  );
};

export const RankingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const introOut = interpolate(frame, [78, 95], [1, 0], clamp);
  const headerIn = interpolate(frame, [82, 100], [0, 1], clamp);
  const ctaStart = INTRO + n * PER_REVEAL;
  const ctaIn = interpolate(frame, [ctaStart, ctaStart + 18], [0, 1], clamp);
  const ctaPulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.98, 1.04]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#070710", fontFamily: UIFONT }}>
      <Audio src={staticFile("ranking-soundtrack.wav")} />
      <AnimatedBackground hueBase={210} />

      {/* Big intro title */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", opacity: introOut, padding: 70 }}>
        <div style={{ fontSize: 40, letterSpacing: 8, color: GOLD, fontWeight: 800 }}>{RANKING.kicker}</div>
        <div style={{ fontSize: 120, fontWeight: 900, color: "#fff", textAlign: "center", lineHeight: 0.95, letterSpacing: -3, marginTop: 10 }}>
          {RANKING.title}<br /><span style={{ color: GOLD }}>{RANKING.highlight}</span>
        </div>
        <div style={{ fontSize: 40, color: "rgba(255,255,255,0.7)", marginTop: 24 }}>{RANKING.subtitle}</div>
      </AbsoluteFill>

      {/* Compact header during reveals */}
      <div style={{ position: "absolute", top: 110, left: 0, right: 0, textAlign: "center", opacity: headerIn }}>
        <div style={{ fontSize: 30, letterSpacing: 6, color: GOLD, fontWeight: 800 }}>{RANKING.kicker}</div>
        <div style={{ fontSize: 58, fontWeight: 900, color: "#fff", letterSpacing: -1 }}>
          {RANKING.title} {RANKING.highlight}
        </div>
        <div style={{ fontSize: 28, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{RANKING.subtitle}</div>
      </div>

      {/* Rows */}
      {RANKING.items.map((_, i) => <Row key={i} rank={i + 1} />)}

      {/* CTA */}
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 60, opacity: ctaIn }}>
        <div style={{ transform: `scale(${ctaPulse})`, background: "rgba(0,0,0,0.55)", borderRadius: 22, padding: "22px 40px", textAlign: "center", border: `2px solid ${GOLD}` }}>
          <div style={{ fontSize: 44, fontWeight: 900, color: "#fff" }}>Which surprised you? 👇</div>
          <div style={{ fontSize: 30, color: GOLD, fontWeight: 700, marginTop: 6 }}>Follow for a new Top 10 every day</div>
        </div>
      </AbsoluteFill>

      {/* source watermark */}
      <div style={{ position: "absolute", bottom: 24, left: 0, right: 0, textAlign: "center", fontSize: 22, color: "rgba(255,255,255,0.4)" }}>
        {RANKING.source}
      </div>

      {/* channel watermark */}
      <div style={{ position: "absolute", top: 56, right: 46, fontSize: 32, fontWeight: 800, color: "rgba(255,255,255,0.85)", textShadow: "0 2px 10px rgba(0,0,0,0.9)" }}>
        {RANKING.handle}
      </div>
    </AbsoluteFill>
  );
};

export { rankingDuration };
