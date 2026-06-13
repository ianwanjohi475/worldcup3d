import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  ActivityRing,
  Avatar,
  BarChart,
  Card,
  Chip,
  HomeIndicator,
  PrimaryButton,
  Reveal,
  Sparkline,
  StatusBar,
  Tile,
  UIFONT,
  Waveform,
} from "./uikit";

const ScreenShell: React.FC<{ bg: string; dark?: boolean; children: React.ReactNode }> = ({ bg, dark = true, children }) => (
  <AbsoluteFill style={{ background: bg, fontFamily: UIFONT }}>
    <StatusBar color={dark ? "#fff" : "#0b1b33"} />
    <div style={{ position: "absolute", top: 112, left: 0, right: 0, bottom: 70, padding: "0 50px", display: "flex", flexDirection: "column", color: dark ? "#fff" : "#0b1b33" }}>
      {children}
    </div>
    <HomeIndicator color={dark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)"} />
  </AbsoluteFill>
);

const useCount = (to: number, delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return to * p;
};

// 1 — FINANCE ----------------------------------------------------------------
export const ScreenFinance: React.FC = () => {
  const bal = useCount(12480, 8);
  return (
    <ScreenShell bg="linear-gradient(165deg,#241b4d,#0d0a22)">
      <Reveal delay={4} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ opacity: 0.6, fontSize: 28 }}>Welcome back</div>
          <div style={{ fontSize: 44, fontWeight: 800 }}>Alex Mensah</div>
        </div>
        <Avatar a="#7C5CFF" b="#36e0a4" />
      </Reveal>
      <Reveal delay={10} style={{ marginTop: 36 }}>
        <Card style={{ background: "linear-gradient(135deg,#7C5CFF,#5a3df0)", border: "none" }}>
          <div style={{ opacity: 0.85, fontSize: 28 }}>Total balance</div>
          <div style={{ fontSize: 86, fontWeight: 900, letterSpacing: -2 }}>${bal.toLocaleString("en-US", { maximumFractionDigits: 0 })}</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 8 }}>
            <span style={{ background: "#36e0a4", color: "#06301f", borderRadius: 100, padding: "6px 16px", fontWeight: 800, fontSize: 24 }}>▲ 8.2%</span>
            <span style={{ opacity: 0.8, fontSize: 26 }}>this month</span>
          </div>
        </Card>
      </Reveal>
      <Reveal delay={18} style={{ marginTop: 30, display: "flex", gap: 16 }}>
        <Chip label="＋ Add" active accent="#36e0a4" />
        <Chip label="↗ Send" accent="#36e0a4" />
        <Chip label="⤓ Request" accent="#36e0a4" />
      </Reveal>
      <Reveal delay={24} style={{ marginTop: 30 }}>
        <Card><Sparkline accent="#36e0a4" width={580} height={170} delay={28} /></Card>
      </Reveal>
      <Reveal delay={30} style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 18 }}>
        {[["Spotify", "-$9.99", "#FF4D8D"], ["Apple Store", "-$129.00", "#aaa"], ["Salary", "+$3,200", "#36e0a4"]].map(([n, v, c], i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Avatar a={c as string} b="#222" size={64} />
            <div style={{ flex: 1, fontSize: 32, fontWeight: 700 }}>{n}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: (v as string).startsWith("+") ? "#36e0a4" : "#fff" }}>{v}</div>
          </div>
        ))}
      </Reveal>
    </ScreenShell>
  );
};

// 2 — MUSIC ------------------------------------------------------------------
export const ScreenMusic: React.FC = () => {
  const frame = useCurrentFrame();
  const rot = frame * 0.4;
  return (
    <ScreenShell bg="linear-gradient(165deg,#2a0f3d,#120617)">
      <Reveal delay={4} style={{ textAlign: "center", fontSize: 30, opacity: 0.7, letterSpacing: 4 }}>NOW PLAYING</Reveal>
      <Reveal delay={8} style={{ marginTop: 40, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 480, height: 480, borderRadius: 40, overflow: "hidden", position: "relative", boxShadow: "0 40px 80px rgba(255,77,141,0.4)" }}>
          <div style={{ position: "absolute", inset: 0, background: `conic-gradient(from ${rot}deg, #FF4D8D, #ffa84d, #7C5CFF, #FF4D8D)` }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.4), transparent 55%)" }} />
        </div>
      </Reveal>
      <Reveal delay={16} style={{ textAlign: "center", marginTop: 40 }}>
        <div style={{ fontSize: 56, fontWeight: 900 }}>Midnight Drive</div>
        <div style={{ fontSize: 34, opacity: 0.65, marginTop: 6 }}>Neon Coast</div>
      </Reveal>
      <Reveal delay={22} style={{ marginTop: 40 }}><Waveform accent="#FF4D8D" /></Reveal>
      <Reveal delay={26} style={{ display: "flex", justifyContent: "space-between", opacity: 0.6, fontSize: 26, marginTop: 8 }}>
        <span>1:24</span><span>3:58</span>
      </Reveal>
      <Reveal delay={30} style={{ marginTop: 30, display: "flex", justifyContent: "center", alignItems: "center", gap: 60 }}>
        <span style={{ fontSize: 54 }}>⏮</span>
        <div style={{ width: 130, height: 130, borderRadius: "50%", background: "#FF4D8D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, color: "#180611", boxShadow: "0 16px 50px rgba(255,77,141,0.6)" }}>▶</div>
        <span style={{ fontSize: 54 }}>⏭</span>
      </Reveal>
    </ScreenShell>
  );
};

// 3 — FOOD -------------------------------------------------------------------
export const ScreenFood: React.FC = () => (
  <ScreenShell bg="#fff7f0" dark={false}>
    <Reveal delay={4}>
      <div style={{ fontSize: 30, opacity: 0.6 }}>Deliver to · Home</div>
      <div style={{ fontSize: 50, fontWeight: 900 }}>What's tasty today?</div>
    </Reveal>
    <Reveal delay={10} style={{ marginTop: 28 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "26px 30px", fontSize: 32, color: "#9a8f86", boxShadow: "0 14px 40px rgba(0,0,0,0.06)" }}>🔍 Search for food…</div>
    </Reveal>
    <Reveal delay={16} style={{ marginTop: 28, display: "flex", gap: 16 }}>
      <Chip label="🍔 Burgers" active accent="#FF6B4A" />
      <Chip label="🍕 Pizza" accent="#FF6B4A" />
      <Chip label="🍣 Sushi" accent="#FF6B4A" />
    </Reveal>
    <Reveal delay={22} style={{ marginTop: 30, display: "flex", gap: 24 }}>
      {[["Smash Burger", "$8.50", "#FF6B4A", "#FFC24A"], ["Pepperoni", "$11.00", "#FF8A4A", "#FF5A7A"]].map(([n, p, a, b], i) => (
        <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 30, padding: 22, boxShadow: "0 16px 44px rgba(0,0,0,0.08)" }}>
          <Tile a={a as string} b={b as string} h={210} radius={22} />
          <div style={{ fontSize: 34, fontWeight: 800, marginTop: 18 }}>{n}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 34, fontWeight: 900, color: "#FF6B4A" }}>{p}</span>
            <span style={{ fontSize: 28 }}>⭐ 4.9</span>
          </div>
        </div>
      ))}
    </Reveal>
    <Reveal delay={30} style={{ marginTop: 32 }}><PrimaryButton label="View cart · 2 items" accent="#FF6B4A" textColor="#fff" /></Reveal>
  </ScreenShell>
);

// 4 — FITNESS ----------------------------------------------------------------
export const ScreenFitness: React.FC = () => {
  const move = useCount(1, 8);
  return (
    <ScreenShell bg="#0a0a12">
      <Reveal delay={4}>
        <div style={{ fontSize: 30, opacity: 0.6 }}>Tuesday, June 13</div>
        <div style={{ fontSize: 52, fontWeight: 900 }}>Your activity</div>
      </Reveal>
      <Reveal delay={10} style={{ marginTop: 36, display: "flex", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "relative", width: 360, height: 360 }}>
          <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center" }}><ActivityRing progress={0.78 * move} color="#FF4D5E" size={360} /></div>
          <div style={{ position: "absolute", inset: 40, display: "flex", justifyContent: "center", alignItems: "center" }}><ActivityRing progress={0.62 * move} color="#4DFF9E" size={280} /></div>
          <div style={{ position: "absolute", inset: 80, display: "flex", justifyContent: "center", alignItems: "center" }}><ActivityRing progress={0.9 * move} color="#4DA6FF" size={200} /></div>
        </div>
      </Reveal>
      <Reveal delay={18} style={{ marginTop: 30, display: "flex", gap: 18 }}>
        {[["Move", "486", "kcal", "#FF4D5E"], ["Steps", "8.2k", "", "#4DFF9E"], ["Heart", "72", "bpm", "#4DA6FF"]].map(([l, v, u, c], i) => (
          <Card key={i} style={{ flex: 1, padding: 22, textAlign: "center", background: "rgba(255,255,255,0.06)" }}>
            <div style={{ color: c as string, fontSize: 44, fontWeight: 900 }}>{v}</div>
            <div style={{ opacity: 0.6, fontSize: 24 }}>{l} {u}</div>
          </Card>
        ))}
      </Reveal>
      <Reveal delay={26} style={{ marginTop: 30 }}>
        <Card style={{ background: "rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 30, fontWeight: 700, marginBottom: 18 }}>This week</div>
          <BarChart values={[40, 65, 50, 80, 60, 95, 70]} accent="#4DFF9E" delay={30} height={200} />
        </Card>
      </Reveal>
    </ScreenShell>
  );
};

// 5 — SOCIAL -----------------------------------------------------------------
export const ScreenSocial: React.FC = () => (
  <ScreenShell bg="#eef3ff" dark={false}>
    <Reveal delay={4} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div style={{ fontSize: 52, fontWeight: 900 }}>Feed</div>
      <Avatar a="#2E7BFF" b="#9b5cff" size={72} />
    </Reveal>
    <Reveal delay={9} style={{ marginTop: 26, display: "flex", gap: 22 }}>
      {["#FF6B4A", "#2E7BFF", "#36e0a4", "#9b5cff", "#FFC24A"].map((c, i) => (
        <div key={i} style={{ width: 96, height: 96, borderRadius: "50%", padding: 4, background: `linear-gradient(135deg,${c},#fff)` }}><Avatar a={c} b="#fff" size={88} /></div>
      ))}
    </Reveal>
    <Reveal delay={16} style={{ marginTop: 28 }}>
      <div style={{ background: "#fff", borderRadius: 30, padding: 24, boxShadow: "0 16px 44px rgba(0,0,0,0.06)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Avatar a="#2E7BFF" b="#36e0a4" size={70} /><div><div style={{ fontWeight: 800, fontSize: 32 }}>maya.codes</div><div style={{ opacity: 0.5, fontSize: 24 }}>2h ago</div></div></div>
        <Tile a="#2E7BFF" b="#9b5cff" h={300} radius={22} />
        <div style={{ display: "flex", gap: 30, marginTop: 18, fontSize: 34 }}><span>❤️ 2.4k</span><span>💬 188</span><span>↗</span></div>
      </div>
    </Reveal>
    <Reveal delay={24} style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ alignSelf: "flex-start", background: "#fff", padding: "20px 28px", borderRadius: "26px 26px 26px 6px", fontSize: 30, boxShadow: "0 8px 24px rgba(0,0,0,0.05)" }}>This UI is so clean 🔥</div>
      <div style={{ alignSelf: "flex-end", background: "#2E7BFF", color: "#fff", padding: "20px 28px", borderRadius: "26px 26px 6px 26px", fontSize: 30 }}>Built it in Remotion 😎</div>
    </Reveal>
  </ScreenShell>
);

// 6 — TRAVEL -----------------------------------------------------------------
export const ScreenTravel: React.FC = () => {
  const frame = useCurrentFrame();
  const shimmer = interpolate(frame % 90, [0, 90], [0, 360]);
  return (
    <ScreenShell bg="linear-gradient(165deg,#062a33,#03161c)">
      <Reveal delay={4}>
        <div style={{ fontSize: 30, opacity: 0.6 }}>Explore</div>
        <div style={{ fontSize: 52, fontWeight: 900 }}>Where to next?</div>
      </Reveal>
      <Reveal delay={10} style={{ marginTop: 28, position: "relative", borderRadius: 36, overflow: "hidden", height: 460 }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${shimmer}deg, #16e0c8, #0984e3, #16e0c8)` }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7))" }} />
        <div style={{ position: "absolute", left: 30, bottom: 30 }}>
          <div style={{ fontSize: 30, opacity: 0.85 }}>📍 Featured</div>
          <div style={{ fontSize: 60, fontWeight: 900 }}>Santorini</div>
          <div style={{ fontSize: 30, opacity: 0.85 }}>Greece · from $890</div>
        </div>
      </Reveal>
      <Reveal delay={18} style={{ marginTop: 26, display: "flex", gap: 22 }}>
        {[["Bali", "#16e0c8", "#0984e3"], ["Tokyo", "#FF4D8D", "#9b5cff"], ["Dubai", "#FFC24A", "#FF6B4A"]].map(([n, a, b], i) => (
          <div key={i} style={{ flex: 1 }}>
            <Tile a={a as string} b={b as string} h={170} radius={24} />
            <div style={{ fontSize: 32, fontWeight: 800, marginTop: 14 }}>{n}</div>
          </div>
        ))}
      </Reveal>
      <Reveal delay={26} style={{ marginTop: 32 }}><PrimaryButton label="Book your trip" accent="#16e0c8" /></Reveal>
    </ScreenShell>
  );
};
