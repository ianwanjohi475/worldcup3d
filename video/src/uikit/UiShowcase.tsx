import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { linearTiming, springTiming, TransitionSeries } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { flip } from "@remotion/transitions/flip";
import { iris } from "@remotion/transitions/iris";
import { clockWipe } from "@remotion/transitions/clock-wipe";
import { AnimatedBackground, PhoneFrame, UIFONT } from "./uikit";
import {
  ScreenFinance,
  ScreenFitness,
  ScreenFood,
  ScreenMusic,
  ScreenSocial,
  ScreenTravel,
} from "./screens";

export const UI_DURATION = 1200; // 40s @ 30fps
const W = 1080;
const H = 1920;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const NAMES = ["Finance", "Music", "Food", "Fitness", "Social", "Travel"];

// Intro --------------------------------------------------------------------
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const out = interpolate(f, [92, 112], [1, 0], clamp);
  const t1 = spring({ frame: f, fps, config: { damping: 200 } });
  const t2 = spring({ frame: f - 10, fps, config: { damping: 200 } });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", opacity: out, fontFamily: UIFONT }}>
      <div style={{ transform: `scale(${interpolate(t1, [0, 1], [0.6, 1])})`, opacity: t1, fontSize: 300, fontWeight: 900, color: "#fff", letterSpacing: -10, lineHeight: 0.9, textShadow: "0 0 90px rgba(124,92,255,0.85)" }}>
        UI<span style={{ color: "#7C5CFF" }}>/</span>UX
      </div>
      <div style={{ opacity: t2, transform: `translateY(${interpolate(t2, [0, 1], [40, 0])}px)`, fontSize: 60, fontWeight: 800, color: "#fff", letterSpacing: 12, marginTop: 14 }}>
        DESIGN SHOWCASE
      </div>
      <div style={{ opacity: interpolate(f, [26, 44], [0, 1], clamp), fontSize: 38, color: "rgba(255,255,255,0.6)", marginTop: 30, letterSpacing: 2 }}>
        6 screens · 40 seconds
      </div>
    </AbsoluteFill>
  );
};

// Phone section with the 6 transitioning screens ----------------------------
const PhoneSection: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f, fps, config: { damping: 200 } });
  const exit = interpolate(f, [972, 994], [0, 1], clamp);
  const scale = interpolate(enter, [0, 1], [0.84, 1]) * interpolate(exit, [0, 1], [1, 0.9]);
  const rotY = interpolate(enter, [0, 1], [22, 0]);
  const ty = interpolate(exit, [0, 1], [0, -60]);
  const opacity = Math.min(enter, 1 - exit);
  const idx = Math.max(0, Math.min(5, Math.floor(f / 165)));
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", transform: `perspective(2200px) translateY(${ty}px) scale(${scale}) rotateY(${rotY}deg)`, opacity }}>
        <PhoneFrame screenBg="#0d0a22">
          <TransitionSeries>
            <TransitionSeries.Sequence durationInFrames={180}><ScreenFinance /></TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={iris({ width: W, height: H })} timing={linearTiming({ durationInFrames: 18 })} />
            <TransitionSeries.Sequence durationInFrames={180}><ScreenMusic /></TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 18 })} />
            <TransitionSeries.Sequence durationInFrames={180}><ScreenFood /></TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={clockWipe({ width: W, height: H })} timing={linearTiming({ durationInFrames: 18 })} />
            <TransitionSeries.Sequence durationInFrames={180}><ScreenFitness /></TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={flip({ direction: "from-right" })} timing={springTiming({ config: { damping: 200 }, durationInFrames: 20 })} />
            <TransitionSeries.Sequence durationInFrames={180}><ScreenSocial /></TransitionSeries.Sequence>
            <TransitionSeries.Transition presentation={wipe({ direction: "from-bottom-right" })} timing={linearTiming({ durationInFrames: 18 })} />
            <TransitionSeries.Sequence durationInFrames={180}><ScreenTravel /></TransitionSeries.Sequence>
          </TransitionSeries>
        </PhoneFrame>
      </AbsoluteFill>
      <div style={{ position: "absolute", top: 72, left: 64, fontFamily: UIFONT, fontWeight: 800, fontSize: 34, color: "rgba(255,255,255,0.9)", letterSpacing: 3, opacity }}>
        UI / UX · {NAMES[idx]}
      </div>
      <div style={{ position: "absolute", bottom: 72, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 16, opacity }}>
        {NAMES.map((_, i) => (
          <div key={i} style={{ width: i === idx ? 46 : 16, height: 16, borderRadius: 8, background: i === idx ? "#7C5CFF" : "rgba(255,255,255,0.3)" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// Outro ---------------------------------------------------------------------
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = interpolate(f, [0, 14], [0, 1], clamp);
  const brand = spring({ frame: f - 6, fps, config: { damping: 200 } });
  const pulse = interpolate(Math.sin(f / 6), [-1, 1], [0.97, 1.05]);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 34, opacity: inn, fontFamily: UIFONT }}>
      <div style={{ transform: `scale(${interpolate(brand, [0, 1], [0.7, 1])})`, opacity: brand, fontSize: 150, fontWeight: 900, color: "#fff", letterSpacing: 4, textShadow: "0 0 70px rgba(124,92,255,0.9)" }}>
        Pixelyn
      </div>
      <div style={{ fontSize: 44, color: "rgba(255,255,255,0.7)", letterSpacing: 2 }}>Fresh UI drops every week</div>
      <div style={{ transform: `scale(${pulse})`, marginTop: 14, background: "#7C5CFF", color: "#fff", fontWeight: 900, fontSize: 46, padding: "22px 58px", borderRadius: 18, boxShadow: "0 16px 50px rgba(124,92,255,0.6)" }}>
        ▶ Subscribe
      </div>
    </AbsoluteFill>
  );
};

export const UiShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#070710" }}>
      <Audio src={staticFile("ui-soundtrack.wav")} />
      <AnimatedBackground />
      <Sequence durationInFrames={112}><Intro /></Sequence>
      <Sequence from={96} durationInFrames={994}><PhoneSection /></Sequence>
      <Sequence from={1086} durationInFrames={114}><Outro /></Sequence>
    </AbsoluteFill>
  );
};
