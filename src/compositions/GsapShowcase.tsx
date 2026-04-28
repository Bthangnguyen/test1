import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { GSAP_SCENES, gsapSceneStart } from "../gsapShowcaseConfig";
import { GsapTitle, GsapToFrom, GsapEasingGrid, GsapTimeline, GsapStagger } from "../scenes/gsap/ScenesA";
import { GsapRepeatYoyo, GsapDrawSVG, GsapMorphSVG } from "../scenes/gsap/ScenesB";
import { GsapMotionPath, GsapSplitText, GsapFlip, GsapClosing } from "../scenes/gsap/ScenesC";

const SCENE_COMPONENTS: React.FC[] = [
  GsapTitle,
  GsapToFrom,
  GsapEasingGrid,
  GsapTimeline,
  GsapStagger,
  GsapRepeatYoyo,
  GsapDrawSVG,
  GsapMorphSVG,
  GsapMotionPath,
  GsapSplitText,
  GsapFlip,
  GsapClosing,
];

export const GsapShowcase: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {GSAP_SCENES.map((scene, idx) => {
        const SceneComponent = SCENE_COMPONENTS[idx];
        return (
          <Sequence key={scene.id} from={gsapSceneStart(idx)} durationInFrames={scene.durationInFrames}>
            <SceneComponent />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
