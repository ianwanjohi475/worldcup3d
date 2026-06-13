import { continueRender, delayRender, staticFile } from "remotion";

// Loads local display fonts and blocks render until they're ready (no FOUT).
const loadOne = (family: string, file: string) => {
  if (typeof window === "undefined" || typeof FontFace === "undefined") return;
  const handle = delayRender(`load-font-${family}`);
  const face = new FontFace(family, `url(${staticFile(file)}) format("truetype")`);
  face
    .load()
    .then((loaded) => {
      document.fonts.add(loaded);
      continueRender(handle);
    })
    .catch(() => continueRender(handle));
};

loadOne("Bebas Neue", "fonts/BebasNeue-Regular.ttf");
loadOne("Anton", "fonts/Anton-Regular.ttf");

export const BEBAS = '"Bebas Neue", Arial, sans-serif';
export const ANTON = '"Anton", Arial, sans-serif';
