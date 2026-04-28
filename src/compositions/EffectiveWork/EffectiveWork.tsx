/* ══════ EFFECTIVE WORK — MASTER COMPOSITION ══════ */
import React from 'react';
import { Sequence, AbsoluteFill } from 'remotion';
import { SCENES, C } from './constants';
import { Scene01_Overload } from './scenes/Scene01_Overload';
import { Scene02_Exhausted } from './scenes/Scene02_Exhausted';
import { Scene03_DefineProductivity } from './scenes/Scene03_DefineProductivity';

export const EffectiveWorkDarkLogic: React.FC = () => {
  let offset = 0;

  const scenes: { component: React.FC; frames: number }[] = [
    { component: Scene01_Overload, frames: SCENES.s01 },
    { component: Scene02_Exhausted, frames: SCENES.s02 },
    { component: Scene03_DefineProductivity, frames: SCENES.s03 },
  ];

  return (
    <AbsoluteFill style={{ backgroundColor: C.black }}>
      {/* Google Fonts loader */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@500;600;700;800;900&display=swap');`}</style>
      {scenes.map((s, i) => {
        const from = offset;
        offset += s.frames;
        const SceneComp = s.component;
        return (
          <Sequence key={`scene-${i + 1}`} from={from} durationInFrames={s.frames}>
            <SceneComp />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
