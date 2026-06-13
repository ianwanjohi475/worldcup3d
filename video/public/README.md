# Reel assets

Drop your media in here, then edit `../src/worldcup/reel.config.ts` to list it.
No code changes needed.

- `clips/`  — video clips (`.mp4`, `.webm`, `.mov`). Reference as `clips/yourfile.mp4`.
- `images/` — images (`.jpg`, `.png`, `.webp`). Reference as `images/yourfile.jpg`.
- voiceover — put a narration file (e.g. `voiceover.mp3`) directly in this folder,
  then set `voiceover: "voiceover.mp3"` in `reel.config.ts`.

## Recommended specs (vertical reel = 1080×1920)
- Clips are center-cropped to fill the frame; any resolution works, 1080×1920 is ideal.
- Keep each segment ~2–4s for a punchy, reel-style pace.
- Only use footage you own or have licensed (match footage / agency photos are copyrighted).

## Build it
```
npm run dev                                # live preview in Remotion Studio
npx remotion render Cr7Reel out/cr7-reel.mp4
```
