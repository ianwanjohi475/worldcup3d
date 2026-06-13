import React from "react";
import {
  AbsoluteFill,
  interpolate,
  random,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
export const COLORS = {
  bg: "#070a12",
  bg2: "#0d1424",
  red: "#E10600",
  redDeep: "#8d0a1c",
  green: "#0A8A4A",
  gold: "#FFC83D",
  white: "#F5F7FF",
  dim: "#9aa3b8",
};

export const FONT = 'Helvetica, Arial, "DejaVu Sans", sans-serif';

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------------------------------------------------------------------
// Atmosphere: grain, vignette, light sweep, cinematic background
// ---------------------------------------------------------------------------
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.07 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        opacity,
        mixBlendMode: "overlay",
        pointerEvents: "none",
      }}
    >
      <svg width="100%" height="100%">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="2"
            seed={frame % 12}
          />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

export const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.75 }) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,${strength}) 100%)`,
      pointerEvents: "none",
    }}
  />
);

export const LightSweep: React.FC<{ delay?: number; color?: string }> = ({
  delay = 0,
  color = "rgba(255,255,255,0.10)",
}) => {
  const frame = useCurrentFrame();
  const x = interpolate(frame - delay, [0, 90], [-60, 160], clamp);
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "-30%",
          left: `${x}%`,
          width: "30%",
          height: "160%",
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          transform: "rotate(12deg)",
          filter: "blur(8px)",
        }}
      />
    </AbsoluteFill>
  );
};

export const CinematicBackground: React.FC<{
  from: string;
  to: string;
  accent?: string;
  zoom?: boolean;
}> = ({ from, to, accent = COLORS.red, zoom = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = zoom
    ? interpolate(frame, [0, durationInFrames], [1.08, 1.18])
    : 1;
  const drift = interpolate(frame, [0, durationInFrames], [0, -4]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          transform: `scale(${scale}) translateY(${drift}%)`,
          background: `radial-gradient(120% 90% at 50% 10%, ${to} 0%, ${from} 55%, ${COLORS.bg} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at 80% 90%, ${accent}55 0%, transparent 60%)`,
          mixBlendMode: "screen",
          transform: `scale(${scale})`,
        }}
      />
      <LightSweep />
      <Grain />
      <Vignette />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------
export const Kicker: React.FC<{ text: string; delay?: number; color?: string }> = ({
  text,
  delay = 0,
  color = COLORS.gold,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 12], [0, 1], clamp);
  const tr = interpolate(frame - delay, [0, 12], [12, 0], clamp);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 34,
        letterSpacing: 10,
        textTransform: "uppercase",
        color,
        opacity: o,
        transform: `translateY(${tr}px)`,
        display: "flex",
        alignItems: "center",
        gap: 18,
      }}
    >
      <span style={{ width: 46, height: 4, background: color, display: "inline-block" }} />
      {text}
    </div>
  );
};

export const Headline: React.FC<{
  lines: string[];
  delay?: number;
  size?: number;
  color?: string;
  stagger?: number;
}> = ({ lines, delay = 0, size = 110, color = COLORS.white, stagger = 4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  let wordIndex = 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      {lines.map((line, li) => (
        <div
          key={li}
          style={{ display: "flex", flexWrap: "wrap", gap: "0 22px", justifyContent: "center" }}
        >
          {line.split(" ").map((word, wi) => {
            const d = delay + wordIndex * stagger;
            wordIndex += 1;
            const p = spring({ frame: frame - d, fps, config: { damping: 200, mass: 0.6 } });
            const y = interpolate(p, [0, 1], [80, 0]);
            const o = interpolate(p, [0, 1], [0, 1]);
            const blur = interpolate(p, [0, 1], [10, 0]);
            return (
              <span
                key={wi}
                style={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: size,
                  lineHeight: 1.02,
                  letterSpacing: -2,
                  textTransform: "uppercase",
                  color,
                  opacity: o,
                  transform: `translateY(${y}px)`,
                  filter: `blur(${blur}px)`,
                  textShadow: "0 18px 50px rgba(0,0,0,0.55)",
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const Subtext: React.FC<{ text: string; delay?: number; color?: string }> = ({
  text,
  delay = 0,
  color = COLORS.dim,
}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 14], [0, 1], clamp);
  const tr = interpolate(frame - delay, [0, 14], [16, 0], clamp);
  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 600,
        fontSize: 38,
        letterSpacing: 2,
        color,
        opacity: o,
        transform: `translateY(${tr}px)`,
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Stat counter
// ---------------------------------------------------------------------------
export const StatCounter: React.FC<{
  to: number;
  label: string;
  prefix?: string;
  suffix?: string;
  delay?: number;
  accent?: string;
}> = ({ to, label, prefix = "", suffix = "", delay = 0, accent = COLORS.gold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const val = Math.round(interpolate(p, [0, 1], [0, to]));
  const o = interpolate(frame - delay, [0, 10], [0, 1], clamp);
  const y = interpolate(p, [0, 1], [40, 0]);
  return (
    <div
      style={{
        opacity: o,
        transform: `translateY(${y}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        minWidth: 360,
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 150,
          color: COLORS.white,
          letterSpacing: -4,
          lineHeight: 1,
        }}
      >
        {prefix}
        {val}
        <span style={{ color: accent }}>{suffix}</span>
      </div>
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 28,
          letterSpacing: 4,
          textTransform: "uppercase",
          color: COLORS.dim,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Captions (the "cc" track) — bottom safe area
// ---------------------------------------------------------------------------
export const Caption: React.FC<{ text: string; inFrame?: number; outFrame?: number }> = ({
  text,
  inFrame = 6,
  outFrame,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const out = outFrame ?? durationInFrames - 6;
  const o = interpolate(
    frame,
    [inFrame, inFrame + 8, out, out + 8],
    [0, 1, 1, 0],
    clamp,
  );
  return (
    <AbsoluteFill
      style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 70 }}
    >
      <div
        style={{
          opacity: o,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 40,
          letterSpacing: 1,
          color: COLORS.white,
          background: "rgba(0,0,0,0.55)",
          padding: "12px 28px",
          borderRadius: 10,
          border: `2px solid ${COLORS.red}`,
          textShadow: "0 2px 8px rgba(0,0,0,0.8)",
          maxWidth: 1500,
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Portugal accent stripe
// ---------------------------------------------------------------------------
export const PortugalStripe: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame - delay, [0, 18], [0, 100], clamp);
  return (
    <div style={{ display: "flex", width: `${w}%`, height: 8, overflow: "hidden", borderRadius: 4 }}>
      <div style={{ flex: 2, background: COLORS.green }} />
      <div style={{ flex: 3, background: COLORS.red }} />
      <div style={{ flex: 1, background: COLORS.gold }} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Football pitch + player chips
// ---------------------------------------------------------------------------
export const Pitch: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 20], [0, 0.5], clamp);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: o }}>
      <svg width="1500" height="760" viewBox="0 0 1500 760" fill="none">
        <rect x="2" y="2" width="1496" height="756" rx="14" stroke={COLORS.green} strokeWidth="3" />
        <line x1="750" y1="2" x2="750" y2="758" stroke={COLORS.green} strokeWidth="3" />
        <circle cx="750" cy="380" r="110" stroke={COLORS.green} strokeWidth="3" />
        <rect x="2" y="210" width="190" height="340" stroke={COLORS.green} strokeWidth="3" />
        <rect x="1308" y="210" width="190" height="340" stroke={COLORS.green} strokeWidth="3" />
      </svg>
    </AbsoluteFill>
  );
};

export const PlayerChip: React.FC<{
  name: string;
  x: number;
  y: number;
  delay?: number;
}> = ({ name, x, y, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const s = interpolate(p, [0, 1], [0.4, 1]);
  const o = interpolate(p, [0, 1], [0, 1]);
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%,-50%) scale(${s})`,
        opacity: o,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
      }}
    >
      <div
        style={{
          width: 70,
          height: 70,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redDeep})`,
          border: `3px solid ${COLORS.gold}`,
          boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        }}
      />
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 26,
          letterSpacing: 1,
          color: COLORS.white,
          textTransform: "uppercase",
          background: "rgba(0,0,0,0.5)",
          padding: "4px 12px",
          borderRadius: 6,
          whiteSpace: "nowrap",
        }}
      >
        {name}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Trophy (stylized, generic)
// ---------------------------------------------------------------------------
export const Trophy: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const s = interpolate(p, [0, 1], [0.6, 1]);
  const o = interpolate(p, [0, 1], [0, 1]);
  const glow = interpolate(Math.sin(frame / 12), [-1, 1], [0.4, 0.9]);
  return (
    <div style={{ transform: `scale(${s})`, opacity: o, filter: `drop-shadow(0 0 ${glow * 40}px ${COLORS.gold})` }}>
      <svg width="320" height="380" viewBox="0 0 320 380" fill="none">
        <ellipse cx="160" cy="120" rx="100" ry="120" fill={COLORS.gold} />
        <ellipse cx="160" cy="110" rx="70" ry="86" fill="#fff" opacity="0.18" />
        <path d="M60 120 C20 120 20 70 70 80" stroke={COLORS.gold} strokeWidth="16" fill="none" />
        <path d="M260 120 C300 120 300 70 250 80" stroke={COLORS.gold} strokeWidth="16" fill="none" />
        <rect x="135" y="220" width="50" height="60" fill={COLORS.gold} />
        <rect x="95" y="280" width="130" height="26" rx="6" fill={COLORS.gold} />
        <rect x="80" y="306" width="160" height="34" rx="8" fill="#caa033" />
      </svg>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Branding + CTA
// ---------------------------------------------------------------------------
export const BrandLogo: React.FC<{ name: string; delay?: number }> = ({ name, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const s = interpolate(p, [0, 1], [0.7, 1]);
  const o = interpolate(p, [0, 1], [0, 1]);
  return (
    <div
      style={{
        transform: `scale(${s})`,
        opacity: o,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 130,
        letterSpacing: 6,
        color: COLORS.white,
        textTransform: "uppercase",
        textShadow: `0 0 40px ${COLORS.red}`,
      }}
    >
      {name}
    </div>
  );
};

export const SubscribeCTA: React.FC<{ delay?: number }> = ({ delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  const pulse = interpolate(Math.sin(frame / 6), [-1, 1], [0.97, 1.05]);
  const o = interpolate(p, [0, 1], [0, 1]);
  return (
    <div
      style={{
        opacity: o,
        transform: `scale(${pulse})`,
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 46,
        letterSpacing: 4,
        color: COLORS.white,
        background: COLORS.red,
        padding: "18px 48px",
        borderRadius: 14,
        textTransform: "uppercase",
        boxShadow: "0 12px 40px rgba(225,6,0,0.5)",
      }}
    >
      ▶ Subscribe
    </div>
  );
};
