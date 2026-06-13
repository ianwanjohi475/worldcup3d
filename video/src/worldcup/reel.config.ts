// ---------------------------------------------------------------------------
// Reel manifest — edit THIS file to build your reel. No code changes needed.
//
// 1. Drop video clips in   video/public/clips/   (e.g. clips/goal.mp4)
// 2. Drop images in        video/public/images/  (e.g. images/cr7.jpg)
// 3. Drop a voiceover in   video/public/          (e.g. voiceover.mp3)
// 4. List the segments below in the order you want them.
//
// `kind: "title"` needs no media, so the reel renders even before you add files.
// ---------------------------------------------------------------------------

export type ReelSegment =
  | { kind: "title"; text: string; sub?: string; durationSec: number; caption?: string }
  | { kind: "clip"; src: string; durationSec: number; caption?: string; punchZoom?: boolean }
  | { kind: "image"; src: string; durationSec: number; caption?: string };

export interface ReelConfig {
  fps: number;
  width: number;
  height: number;
  voiceover: string | null; // file in public/, e.g. "voiceover.mp3"
  music: string | null; // file in public/, e.g. "soundtrack.wav"
  segments: ReelSegment[];
}

export const REEL: ReelConfig = {
  fps: 30,
  width: 1080,
  height: 1920,
  voiceover: null, // set to "voiceover.mp3" once you record one
  music: "soundtrack.wav",
  segments: [
    { kind: "title", text: "CR7", sub: "WORLD CUP 2026", durationSec: 2.2, caption: "Can Ronaldo finally win it all?" },
    { kind: "title", text: "THE CASE", sub: "5× BALLON D'OR", durationSec: 2.4, caption: "900+ goals. The greatest scorer ever." },
    { kind: "title", text: "THE VERDICT", sub: "ONE LAST DANCE", durationSec: 2.4, caption: "Why Portugal can shock the world." },

    // --- Swap in real media like this once your files are added: ---
    // { kind: "clip",  src: "clips/ronaldo-goal.mp4", durationSec: 3.0, caption: "Still scoring at 41.", punchZoom: true },
    // { kind: "image", src: "images/portugal-squad.jpg", durationSec: 2.5, caption: "A golden generation." },
  ],
};

const TRANSITION_FRAMES = 8;

export const reelDurationInFrames = (cfg: ReelConfig = REEL): number => {
  const seq = cfg.segments.reduce(
    (sum, s) => sum + Math.round(s.durationSec * cfg.fps),
    0,
  );
  const transitions = Math.max(0, cfg.segments.length - 1) * TRANSITION_FRAMES;
  return Math.max(1, seq - transitions);
};

export const REEL_TRANSITION_FRAMES = TRANSITION_FRAMES;
