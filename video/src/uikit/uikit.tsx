import React from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const UIFONT = '"Helvetica Neue", Helvetica, Arial, "DejaVu Sans", sans-serif';
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// ---------------------------------------------------------------------------
// Morphing blob geometry (Catmull-Rom smoothed closed path)
// ---------------------------------------------------------------------------
const smoothClosedPath = (pts: [number, number][]): string => {
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} `;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += `C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)} `;
  }
  return d + "Z";
};

export const MorphBlob: React.FC<{
  cx: number;
  cy: number;
  r: number;
  color: string;
  seed?: number;
  amp?: number;
  speed?: number;
  opacity?: number;
  blur?: number;
}> = ({ cx, cy, r, color, seed = 0, amp = 60, speed = 0.04, opacity = 0.55, blur = 70 }) => {
  const frame = useCurrentFrame();
  const points = 8;
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const ang = (i / points) * Math.PI * 2;
    const rr =
      r +
      Math.sin(frame * speed + i * 1.7 + seed) * amp +
      Math.cos(frame * speed * 0.7 + i * 2.3 + seed) * amp * 0.6;
    pts.push([cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr]);
  }
  return (
    <svg width="1080" height="1920" style={{ position: "absolute", inset: 0, filter: `blur(${blur}px)`, opacity }}>
      <path d={smoothClosedPath(pts)} fill={color} />
    </svg>
  );
};

// ---------------------------------------------------------------------------
// Animated mesh-gradient background with morphing blobs + grain + vignette
// ---------------------------------------------------------------------------
export const AnimatedBackground: React.FC<{ hueBase?: number }> = ({ hueBase = 250 }) => {
  const frame = useCurrentFrame();
  const h = (hueBase + frame * 0.25) % 360;
  const c = (deg: number, l = 55, s = 85) => `hsl(${(h + deg) % 360}, ${s}%, ${l}%)`;
  return (
    <AbsoluteFill style={{ backgroundColor: "#070710", overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(60% 50% at 25% 20%, ${c(0, 22)} 0%, transparent 60%),
            radial-gradient(55% 45% at 80% 30%, ${c(60, 20)} 0%, transparent 60%),
            radial-gradient(70% 60% at 50% 95%, ${c(300, 18)} 0%, transparent 65%)`,
        }}
      />
      <MorphBlob cx={300} cy={520} r={320} color={c(0, 50)} seed={0} amp={70} opacity={0.5} />
      <MorphBlob cx={820} cy={760} r={300} color={c(70, 52)} seed={3} amp={60} opacity={0.45} />
      <MorphBlob cx={540} cy={1500} r={360} color={c(300, 48)} seed={6} amp={80} opacity={0.4} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.65) 100%)" }} />
      <Grain />
    </AbsoluteFill>
  );
};

export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id="uigrain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 10} />
        </filter>
        <rect width="100%" height="100%" filter="url(#uigrain)" />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Entrance helper
// ---------------------------------------------------------------------------
export const Reveal: React.FC<{ delay?: number; y?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0,
  y = 40,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200, mass: 0.6 } });
  return (
    <div style={{ opacity: p, transform: `translateY(${interpolate(p, [0, 1], [y, 0])}px)`, ...style }}>
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Phone frame
// ---------------------------------------------------------------------------
export const PhoneFrame: React.FC<{ children: React.ReactNode; screenBg: string }> = ({ children, screenBg }) => {
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          width: 760,
          height: 1560,
          borderRadius: 80,
          background: "linear-gradient(145deg, #2a2a33, #0e0e14)",
          padding: 16,
          boxShadow: "0 60px 120px rgba(0,0,0,0.6), inset 0 0 4px rgba(255,255,255,0.2)",
          position: "relative",
        }}
      >
        <div style={{ width: "100%", height: "100%", borderRadius: 66, overflow: "hidden", background: screenBg, position: "relative" }}>
          {children}
          {/* notch / dynamic island */}
          <div style={{ position: "absolute", top: 22, left: "50%", transform: "translateX(-50%)", width: 150, height: 36, borderRadius: 20, background: "#000", zIndex: 50 }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const StatusBar: React.FC<{ color?: string }> = ({ color = "#fff" }) => (
  <div style={{ position: "absolute", top: 26, left: 0, right: 0, padding: "0 54px", display: "flex", justifyContent: "space-between", alignItems: "center", color, fontFamily: UIFONT, fontWeight: 700, fontSize: 26, zIndex: 40 }}>
    <span>9:41</span>
    <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <span style={{ fontSize: 20 }}>●●●</span>
      <span style={{ width: 34, height: 16, border: `2px solid ${color}`, borderRadius: 4, display: "inline-block" }} />
    </span>
  </div>
);

export const HomeIndicator: React.FC<{ color?: string }> = ({ color = "rgba(0,0,0,0.5)" }) => (
  <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", width: 200, height: 8, borderRadius: 4, background: color, zIndex: 40 }} />
);

// ---------------------------------------------------------------------------
// Reusable UI atoms
// ---------------------------------------------------------------------------
export const Card: React.FC<{ children?: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ borderRadius: 32, padding: 30, background: "rgba(255,255,255,0.08)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 20px 50px rgba(0,0,0,0.25)", ...style }}>
    {children}
  </div>
);

export const Chip: React.FC<{ label: string; active?: boolean; accent: string }> = ({ label, active, accent }) => (
  <div style={{ padding: "14px 28px", borderRadius: 100, fontFamily: UIFONT, fontWeight: 700, fontSize: 28, whiteSpace: "nowrap", background: active ? accent : "rgba(255,255,255,0.1)", color: active ? "#0b0b12" : "rgba(255,255,255,0.7)" }}>
    {label}
  </div>
);

export const PrimaryButton: React.FC<{ label: string; accent: string; textColor?: string }> = ({ label, accent, textColor = "#0b0b12" }) => (
  <div style={{ padding: "30px 0", borderRadius: 28, textAlign: "center", fontFamily: UIFONT, fontWeight: 800, fontSize: 34, background: accent, color: textColor, boxShadow: `0 16px 40px ${accent}66` }}>
    {label}
  </div>
);

export const Avatar: React.FC<{ a: string; b: string; size?: number }> = ({ a, b, size = 96 }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg, ${a}, ${b})`, flexShrink: 0 }} />
);

export const ActivityRing: React.FC<{ progress: number; color: string; size?: number; track?: string }> = ({ progress, color, size = 120, track = "rgba(255,255,255,0.12)" }) => {
  const r = size / 2 - 14;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={20} fill="none" />
      <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={20} fill="none" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - Math.max(0, Math.min(1, progress)))} />
    </svg>
  );
};

export const BarChart: React.FC<{ values: number[]; accent: string; height?: number; delay?: number }> = ({ values, accent, height = 220, delay = 0 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const max = Math.max(...values);
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height }}>
      {values.map((v, i) => {
        const p = spring({ frame: frame - delay - i * 3, fps, config: { damping: 200 } });
        return <div key={i} style={{ flex: 1, height: `${(v / max) * 100 * p}%`, background: i === values.length - 2 ? accent : "rgba(255,255,255,0.25)", borderRadius: 12 }} />;
      })}
    </div>
  );
};

export const Sparkline: React.FC<{ accent: string; width?: number; height?: number; delay?: number }> = ({ accent, width = 600, height = 180, delay = 0 }) => {
  const frame = useCurrentFrame();
  const pts = [0, 40, 20, 70, 45, 90, 65, 100];
  const path = pts.map((v, i) => `${(i / (pts.length - 1)) * width},${height - (v / 100) * height}`).join(" L ");
  const draw = interpolate(frame - delay, [0, 30], [0, 1], clamp);
  return (
    <svg width={width} height={height}>
      <polyline points={pts.map((v, i) => `${(i / (pts.length - 1)) * width},${height - (v / 100) * height}`).join(" ")} fill="none" stroke={accent} strokeWidth={8} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={2000} strokeDashoffset={2000 * (1 - draw)} />
      <path d={`M ${path} L ${width},${height} L 0,${height} Z`} fill={`${accent}22`} opacity={draw} />
    </svg>
  );
};

export const Waveform: React.FC<{ accent: string; bars?: number }> = ({ accent, bars = 40 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, height: 90 }}>
      {Array.from({ length: bars }).map((_, i) => {
        const hgt = 20 + (Math.sin(i * 0.6 + frame * 0.15) * 0.5 + 0.5) * 70;
        const played = i / bars < ((frame % 120) / 120);
        return <div key={i} style={{ flex: 1, height: hgt, borderRadius: 6, background: played ? accent : "rgba(255,255,255,0.25)" }} />;
      })}
    </div>
  );
};

export const Toggle: React.FC<{ on: boolean; accent: string }> = ({ on, accent }) => (
  <div style={{ width: 90, height: 52, borderRadius: 30, background: on ? accent : "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", padding: 6, justifyContent: on ? "flex-end" : "flex-start" }}>
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#fff" }} />
  </div>
);

export const Tile: React.FC<{ a: string; b: string; h?: number; radius?: number }> = ({ a, b, h = 200, radius = 28 }) => (
  <div style={{ height: h, borderRadius: radius, background: `linear-gradient(135deg, ${a}, ${b})`, flex: 1 }} />
);
