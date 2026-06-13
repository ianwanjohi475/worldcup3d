import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { INTRO, PER_REVEAL, RANKING, formatValue, rankingDuration } from "./ranking.config";
import "./fonts";
import { ANTON, BEBAS } from "./fonts";

export const rankingDurationInFrames = rankingDuration;
export { rankingDuration };

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const GOLD = "#FFC83D";
const n = RANKING.items.length;
const maxValue = Math.max(...RANKING.items.map((i) => i.value));
const revealFrameFor = (rank: number) => INTRO + (n - rank) * PER_REVEAL;

// ---- cinematic stadium-night background ----
const StadiumBackground: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "radial-gradient(125% 80% at 50% 20%, #0c4636 0%, #08182e 45%, #03060d 100%)" }}>
      <div style={{ position: "absolute", top: -240, left: -120, width: 720, height: 1700, background: "linear-gradient(180deg, rgba(255,255,255,0.18), transparent 58%)", transform: `rotate(${22 + Math.sin(frame * 0.01) * 2}deg)`, transformOrigin: "top center", filter: "blur(50px)" }} />
      <div style={{ position: "absolute", top: -240, right: -120, width: 720, height: 1700, background: "linear-gradient(180deg, rgba(255,255,255,0.15), transparent 58%)", transform: `rotate(${-22 + Math.cos(frame * 0.01) * 2}deg)`, transformOrigin: "top center", filter: "blur(50px)" }} />
      {Array.from({ length: 30 }).map((_, i) => {
        const x = random(`bx${i}`) * 1080;
        const baseY = random(`by${i}`) * 2200;
        const sp = 0.15 + random(`bs${i}`) * 0.5;
        const y = (((baseY - frame * sp) % 2100) + 2100) % 2100 - 100;
        const size = 8 + random(`bz${i}`) * 34;
        const tw = 0.12 + (Math.sin(frame * 0.05 + i) * 0.5 + 0.5) * 0.35;
        const gold = random(`bc${i}`) > 0.5;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", background: gold ? "rgba(255,200,80,1)" : "rgba(180,220,255,1)", opacity: tw, filter: `blur(${2 + size / 8}px)` }} />;
      })}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.72) 100%)" }} />
    </AbsoluteFill>
  );
};

const Confetti: React.FC<{ startFrame: number; x: number; y: number }> = ({ startFrame, x, y }) => {
  const frame = useCurrentFrame();
  const t = frame - startFrame;
  if (t < 0) return null;
  const colors = ["#FFC83D", "#10b981", "#ffffff", "#4DA6FF", "#ff4d6d"];
  return (
    <>
      {Array.from({ length: 48 }).map((_, i) => {
        const ang = random(`ca${i}`) * Math.PI * 2;
        const spd = 9 + random(`cs${i}`) * 17;
        const vx = Math.cos(ang) * spd;
        const vy = -Math.abs(Math.sin(ang) * spd) - 7;
        const px = x + vx * t;
        const py = y + vy * t + 0.5 * 0.55 * t * t;
        const rot = t * (4 + random(`cr${i}`) * 11);
        const op = interpolate(t, [0, 42, 72], [1, 1, 0], clamp);
        const w = 12 + random(`cw${i}`) * 16;
        const h = 6 + random(`ch${i}`) * 10;
        return <div key={i} style={{ position: "absolute", left: px, top: py, width: w, height: h, background: colors[i % colors.length], opacity: op, transform: `rotate(${rot}deg)`, borderRadius: 3 }} />;
      })}
    </>
  );
};

const Row: React.FC<{ rank: number }> = ({ rank }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const item = RANKING.items[rank - 1];
  const reveal = revealFrameFor(rank);
  const local = frame - reveal;
  const p = spring({ frame: local, fps, config: { damping: 12, stiffness: 120, mass: 0.8 } });
  const op = interpolate(local, [0, 8], [0, 1], clamp);
  const x = interpolate(p, [0, 1], [200, 0]);
  const sc = interpolate(p, [0, 1], [0.92, 1]);
  const blur = interpolate(local, [0, 12], [12, 0], clamp);
  const barPct = (item.value / maxValue) * 100 * interpolate(local, [2, 30], [0, 1], clamp);
  const cur = item.value * interpolate(local, [2, 32], [0, 1], clamp);
  const isTop = rank === 1;
  const landGlow = interpolate(local, [4, 12, 26], [0, 1, 0], clamp);
  const shimmer = isTop ? 0.5 + 0.5 * Math.sin(Math.max(0, local) / 8) : 0;
  const crown = isTop ? interpolate(spring({ frame: local - 4, fps, config: { damping: 8 } }), [0, 1], [0, 1]) : 0;
  const shineX = ((frame * 6) % 760) - 200;
  const top = 356 + (rank - 1) * 134;
  return (
    <div style={{ position: "absolute", left: 46, right: 46, top, height: 118, opacity: op, transform: `translateX(${x}px) scale(${sc})`, filter: `blur(${blur}px)` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 28, background: "linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0.04))", border: `1px solid ${isTop ? "rgba(255,200,61,0.9)" : "rgba(255,255,255,0.18)"}`, boxShadow: `0 14px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.3)${isTop ? `, 0 0 ${28 + shimmer * 34}px rgba(255,200,61,0.6)` : ""}`, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${barPct}%`, minWidth: 130, background: `linear-gradient(90deg, ${item.color}, ${item.color}bb)`, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, bottom: 0, left: shineX, width: 90, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent)", transform: "skewX(-20deg)" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.5)", opacity: landGlow * 0.4 }} />
      </div>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", padding: "0 22px", gap: 18 }}>
        <div style={{ width: 72, height: 72, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", background: isTop ? "linear-gradient(135deg,#FFD76A,#E8A200)" : "rgba(0,0,0,0.4)", color: isTop ? "#3a2600" : "#fff", fontFamily: ANTON, fontSize: 40, flexShrink: 0, boxShadow: isTop ? "0 0 22px rgba(255,200,61,0.7)" : "none" }}>{rank}</div>
        <div style={{ width: 84, height: 84, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 6px 16px rgba(0,0,0,0.4)", overflow: "hidden", flexShrink: 0, fontSize: 54 }}>{item.emoji}</div>
        <div style={{ flex: 1, fontFamily: BEBAS, fontSize: 62, letterSpacing: 2, color: "#fff", textShadow: "0 3px 10px rgba(0,0,0,0.7)", display: "flex", alignItems: "center", gap: 14 }}>
          {isTop ? <span style={{ fontSize: 48, transform: `scale(${crown})`, display: "inline-block" }}>👑</span> : null}
          {item.name}
        </div>
        <div style={{ fontFamily: ANTON, fontSize: 54, color: isTop ? GOLD : "#fff", textShadow: "0 3px 10px rgba(0,0,0,0.8)" }}>{formatValue(cur, RANKING.format)}</div>
      </div>
    </div>
  );
};

export const RankingVideo: React.FC = () => {
  const frame = useCurrentFrame();
  const introOut = interpolate(frame, [80, 98], [1, 0], clamp);
  const i1 = spring({ frame, fps: 30, config: { damping: 13 } });
  const headerIn = interpolate(frame, [84, 104], [0, 1], clamp);
  const reveal1 = revealFrameFor(1);
  const flash = interpolate(frame, [reveal1, reveal1 + 3, reveal1 + 16], [0, 0.55, 0], clamp);
  return (
    <AbsoluteFill style={{ backgroundColor: "#03060d" }}>
      <Audio src={staticFile("ranking-soundtrack.wav")} />
      <StadiumBackground />

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", opacity: introOut, padding: 60 }}>
        <div style={{ fontFamily: BEBAS, fontSize: 56, letterSpacing: 12, color: GOLD, opacity: i1, transform: `translateY(${interpolate(i1, [0, 1], [40, 0])}px)` }}>{RANKING.kicker}</div>
        <div style={{ fontFamily: ANTON, fontSize: 150, color: "#fff", lineHeight: 0.92, textAlign: "center", textShadow: "0 12px 44px rgba(0,0,0,0.6)", transform: `scale(${interpolate(i1, [0, 1], [0.7, 1])})`, filter: `blur(${interpolate(i1, [0, 1], [14, 0])}px)` }}>
          {RANKING.title}<br /><span style={{ color: GOLD }}>{RANKING.highlight}</span>
        </div>
        <div style={{ fontFamily: BEBAS, fontSize: 44, letterSpacing: 3, color: "rgba(255,255,255,0.72)", marginTop: 18, opacity: interpolate(frame, [22, 42], [0, 1], clamp) }}>{RANKING.subtitle}</div>
      </AbsoluteFill>

      <div style={{ position: "absolute", top: 116, left: 0, right: 0, textAlign: "center", opacity: headerIn }}>
        <div style={{ fontFamily: BEBAS, fontSize: 38, letterSpacing: 8, color: GOLD }}>{RANKING.kicker}</div>
        <div style={{ fontFamily: ANTON, fontSize: 74, color: "#fff", textShadow: "0 6px 22px rgba(0,0,0,0.6)" }}>{RANKING.title} {RANKING.highlight}</div>
      </div>

      {RANKING.items.map((_, i) => <Row key={i} rank={i + 1} />)}

      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, rgba(255,210,90,0.9), transparent 60%)", opacity: flash, pointerEvents: "none" }} />
      <Confetti startFrame={reveal1} x={540} y={400} />
    </AbsoluteFill>
  );
};
