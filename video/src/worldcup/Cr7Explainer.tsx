import React from "react";
import {
  AbsoluteFill,
  Audio,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import {
  linearTiming,
  springTiming,
  TransitionSeries,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import {
  BrandLogo,
  Caption,
  CinematicBackground,
  COLORS,
  FONT,
  Headline,
  Kicker,
  Pitch,
  PlayerChip,
  PortugalStripe,
  StatCounter,
  Subtext,
  SubscribeCTA,
  Trophy,
} from "./ui";

const Center: React.FC<{ children: React.ReactNode; gap?: number }> = ({
  children,
  gap = 34,
}) => (
  <AbsoluteFill
    style={{
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "column",
      gap,
      padding: 90,
    }}
  >
    {children}
  </AbsoluteFill>
);

// 1 — HOOK -------------------------------------------------------------------
const SceneHook: React.FC = () => (
  <AbsoluteFill>
    <CinematicBackground from={COLORS.bg2} to="#1d2740" accent={COLORS.red} />
    <Center>
      <Kicker text="World Cup 2026" delay={6} />
      <Headline lines={["Can Cristiano Ronaldo", "Win The World Cup?"]} delay={14} size={96} />
      <Subtext text="At 41 years old — one final shot at glory." delay={48} />
      <PortugalStripe delay={60} />
    </Center>
    <Caption text="At 41, can Cristiano Ronaldo finally win the World Cup?" />
  </AbsoluteFill>
);

// 2 — THE LEGEND -------------------------------------------------------------
const SceneLegend: React.FC = () => (
  <AbsoluteFill>
    <CinematicBackground from="#160608" to="#360a12" accent={COLORS.red} />
    <Center gap={50}>
      <Kicker text="The Numbers Don't Lie" delay={4} color={COLORS.red} />
      <div style={{ display: "flex", gap: 70, alignItems: "flex-start" }}>
        <StatCounter to={900} suffix="+" label="Career Goals" delay={10} />
        <StatCounter to={5} suffix="×" label="Ballon d'Or" delay={24} />
        <StatCounter to={1} prefix="#" label="All-Time Int'l Scorer" delay={38} />
      </div>
    </Center>
    <Caption text="900+ goals. 5 Ballon d'Ors. Football's greatest scorer." />
  </AbsoluteFill>
);

// 3 — THE TEAM ---------------------------------------------------------------
const SceneTeam: React.FC = () => (
  <AbsoluteFill>
    <CinematicBackground from="#04140c" to="#0a3020" accent={COLORS.green} zoom={false} />
    <Pitch delay={6} />
    <AbsoluteFill style={{ alignItems: "center", paddingTop: 70 }}>
      <Kicker text="He's Not Alone" delay={4} color={COLORS.gold} />
    </AbsoluteFill>
    <AbsoluteFill>
      <PlayerChip name="Ronaldo" x={50} y={30} delay={16} />
      <PlayerChip name="B. Fernandes" x={30} y={50} delay={24} />
      <PlayerChip name="B. Silva" x={70} y={50} delay={30} />
      <PlayerChip name="Leão" x={24} y={72} delay={36} />
      <PlayerChip name="Vitinha" x={50} y={68} delay={42} />
      <PlayerChip name="N. Mendes" x={76} y={72} delay={48} />
    </AbsoluteFill>
    <Caption text="Portugal's golden generation — 2025 Nations League champions." />
  </AbsoluteFill>
);

// 4 — THE HUNGER -------------------------------------------------------------
const SceneHunger: React.FC = () => (
  <AbsoluteFill>
    <CinematicBackground from="#1a1206" to="#33240a" accent={COLORS.gold} />
    <Center gap={28}>
      <Headline lines={["One Trophy", "Still Missing"]} delay={6} size={92} color={COLORS.white} />
      <div style={{ marginTop: 6 }}>
        <Trophy delay={26} />
      </div>
      <Subtext text="Euro 2016. Nations League. Now the big one." delay={52} color={COLORS.gold} />
    </Center>
    <Caption text="One trophy still eludes him — and time is running out." />
  </AbsoluteFill>
);

// 5 — THE VERDICT ------------------------------------------------------------
const Bullet: React.FC<{ text: string; delay: number }> = ({ text, delay }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const x = interpolate(p, [0, 1], [-70, 0]);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${x}px)`,
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize: 62,
        color: COLORS.white,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}
    >
      <span style={{ color: COLORS.gold, fontSize: 68 }}>✓</span>
      {text}
    </div>
  );
};

const SceneVerdict: React.FC = () => (
  <AbsoluteFill>
    <CinematicBackground from="#16060a" to="#360812" accent={COLORS.red} />
    <Center gap={44}>
      <Headline lines={["Why Portugal", "Can Win It All"]} delay={4} size={84} />
      <div style={{ display: "flex", flexDirection: "column", gap: 26, alignItems: "flex-start" }}>
        <Bullet text="Elite Squad Depth" delay={40} />
        <Bullet text="Big-Game Experience" delay={54} />
        <Bullet text="A Leader On A Mission" delay={68} />
      </div>
    </Center>
    <Caption text="Depth, experience, and a legend chasing history." />
  </AbsoluteFill>
);

// 6 — OUTRO ------------------------------------------------------------------
const SceneOutro: React.FC = () => (
  <AbsoluteFill>
    <CinematicBackground from="#0a0a14" to="#240810" accent={COLORS.red} />
    <Center gap={40}>
      <BrandLogo name="Pixelyn" delay={6} />
      <Subtext text="Football takes — every week." delay={28} color={COLORS.dim} />
      <div style={{ marginTop: 10 }}>
        <SubscribeCTA delay={40} />
      </div>
    </Center>
  </AbsoluteFill>
);

// Composition ----------------------------------------------------------------
export const CR7_DURATION = 900; // 30s @ 30fps

export const Cr7Explainer: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <Audio src={staticFile("soundtrack.wav")} />
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={150}>
          <SceneHook />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <SceneLegend />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-right" })}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={180}>
          <SceneTeam />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={linearTiming({ durationInFrames: 15 })}
        />
        <TransitionSeries.Sequence durationInFrames={183}>
          <SceneHunger />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 18 })}
        />
        <TransitionSeries.Sequence durationInFrames={162}>
          <SceneVerdict />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: 12 })}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
