import "./index.css";
import { Composition } from "remotion";
import { HelloWorld, myCompSchema } from "./HelloWorld";
import { Logo, myCompSchema2 } from "./HelloWorld/Logo";
import { Cr7Explainer, CR7_DURATION } from "./worldcup/Cr7Explainer";
import { Cr7Reel } from "./worldcup/Cr7Reel";
import { reelDurationInFrames } from "./worldcup/reel.config";
import { UiShowcase, UI_DURATION } from "./uikit/UiShowcase";
import { RankingVideo, rankingDurationInFrames } from "./ranking/RankingVideo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Cr7Explainer"
        component={Cr7Explainer}
        durationInFrames={CR7_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Cr7Reel"
        component={Cr7Reel}
        durationInFrames={reelDurationInFrames()}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="UiShowcase"
        component={UiShowcase}
        durationInFrames={UI_DURATION}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        id="RankingVideo"
        component={RankingVideo}
        durationInFrames={rankingDurationInFrames()}
        fps={30}
        width={1080}
        height={1920}
      />
      <Composition
        // You can take the "id" to render a video:
        // npx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        schema={myCompSchema}
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
          logoColor1: "#91EAE4",
          logoColor2: "#86A8E7",
        }}
      />

      {/* Mount any React component to make it show up in the sidebar and work on it individually! */}
      <Composition
        id="OnlyLogo"
        component={Logo}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        schema={myCompSchema2}
        defaultProps={{
          logoColor1: "#91dAE2" as const,
          logoColor2: "#86A8E7" as const,
        }}
      />
    </>
  );
};
