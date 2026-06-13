import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import {
  REEL,
  REEL_TRANSITION_FRAMES,
  ReelSegment,
  reelDurationInFrames,
} from "./reel.config";
import { COLORS, FONT, Grain, Vignette } from "./ui";

export const reelDuration = reelDurationInFrames;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Reel-style caption: bold, punchy, lower third with a pop-in.
const ReelCaption: React.FC<{ text: string }> = ({ text }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 200, mass: 0.5 } });
  const out = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    clamp,
  );
  const y = interpolate(p, [0, 1], [50, 0]);
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 360 }}>
      <div
        style={{
          opacity: Math.min(p, out),
          transform: `translateY(${y}px)`,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 76,
          lineHeight: 1.05,
          color: COLORS.white,
          textAlign: "center",
          textTransform: "uppercase",
          letterSpacing: -1,
          maxWidth: 980,
          padding: "0 40px",
          textShadow: "0 6px 30px rgba(0,0,0,0.9)",
        }}
      >
        <span style={{ background: COLORS.red, padding: "6px 18px", borderRadius: 10, boxDecorationBreak: "clone", WebkitBoxDecorationBreak: "clone" }}>
          {text}
        </span>
      </div>
    </AbsoluteFill>
  );
};

const Overlay: React.FC = () => (
  <>
    <AbsoluteFill
      style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.75) 100%)" }}
    />
    <Vignette strength={0.6} />
    <Grain opacity={0.05} />
  </>
);

// --- title (no media) ---
const TitleCard: React.FC<{ text: string; sub?: string; caption?: string }> = ({
  text,
  sub,
  caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 200 } });
  const s = interpolate(p, [0, 1], [0.8, 1]);
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <AbsoluteFill
        style={{ background: `radial-gradient(80% 60% at 50% 35%, #2a0a12 0%, ${COLORS.bg} 70%)` }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 20 }}>
        <div style={{ transform: `scale(${s})`, fontFamily: FONT, fontWeight: 900, fontSize: 260, color: COLORS.white, letterSpacing: -6, lineHeight: 0.9, textShadow: `0 0 60px ${COLORS.red}` }}>
          {text}
        </div>
        {sub ? (
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 60, color: COLORS.gold, letterSpacing: 6, textTransform: "uppercase", opacity: interpolate(frame, [8, 22], [0, 1], clamp) }}>
            {sub}
          </div>
        ) : null}
      </AbsoluteFill>
      <Overlay />
      {caption ? <ReelCaption text={caption} /> : null}
    </AbsoluteFill>
  );
};

// --- real video clip ---
const ClipCard: React.FC<{ src: string; caption?: string; punchZoom?: boolean }> = ({
  src,
  caption,
  punchZoom,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = punchZoom ? interpolate(frame, [0, durationInFrames], [1, 1.12]) : 1.04;
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${scale})` }}>
        <OffthreadVideo
          src={staticFile(src)}
          muted
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </AbsoluteFill>
      <Overlay />
      {caption ? <ReelCaption text={caption} /> : null}
    </AbsoluteFill>
  );
};

// --- still image with Ken Burns ---
const ImageCard: React.FC<{ src: string; caption?: string }> = ({ src, caption }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const scale = interpolate(frame, [0, durationInFrames], [1.05, 1.2]);
  const pan = interpolate(frame, [0, durationInFrames], [0, -3]);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) translateX(${pan}%)` }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </AbsoluteFill>
      <Overlay />
      {caption ? <ReelCaption text={caption} /> : null}
    </AbsoluteFill>
  );
};

const SegmentView: React.FC<{ seg: ReelSegment }> = ({ seg }) => {
  if (seg.kind === "title") return <TitleCard text={seg.text} sub={seg.sub} caption={seg.caption} />;
  if (seg.kind === "clip") return <ClipCard src={seg.src} caption={seg.caption} punchZoom={seg.punchZoom} />;
  return <ImageCard src={seg.src} caption={seg.caption} />;
};

export const Cr7Reel: React.FC = () => {
  const children: React.ReactNode[] = [];
  REEL.segments.forEach((seg, i) => {
    if (i > 0) {
      children.push(
        <TransitionSeries.Transition
          key={`t${i}`}
          presentation={fade()}
          timing={linearTiming({ durationInFrames: REEL_TRANSITION_FRAMES })}
        />,
      );
    }
    children.push(
      <TransitionSeries.Sequence key={`s${i}`} durationInFrames={Math.round(seg.durationSec * REEL.fps)}>
        <SegmentView seg={seg} />
      </TransitionSeries.Sequence>,
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {REEL.music ? <Audio src={staticFile(REEL.music)} volume={REEL.voiceover ? 0.35 : 0.9} /> : null}
      {REEL.voiceover ? <Audio src={staticFile(REEL.voiceover)} /> : null}
      <TransitionSeries>{children}</TransitionSeries>
    </AbsoluteFill>
  );
};
