import React from "react";
import { Composition } from "remotion";
import { GsapShowcase } from "./compositions/GsapShowcase";
import { EgoShatter } from "./scenes/EgoShatter";
import { GsapCollisionReassembly } from "./compositions/GsapCollisionReassembly";
import { CinematicStickman } from "./compositions/CinematicStickman";
import { StickmanFightComplex } from "./compositions/StickmanFightComplex";
import { HeroStrikeScene } from "./compositions/HeroStrikeScene";
import { WiproCyber } from "./compositions/WiproCyber";
import { EffectiveWorkDarkLogic } from "./compositions/EffectiveWork/EffectiveWork";
import { Scene01BusStop } from "./compositions/Scene01BusStop";
import { Seq01_TheHook } from "./sequences/Seq01_TheHook";
import { Seq02_DataViz } from "./sequences/Seq02_DataViz";
import { Seq03_GlassUI } from "./sequences/Seq03_GlassUI";
import { Seq04_ChaosOrder } from "./sequences/Seq04_ChaosOrder";
import { Seq05_Resolution } from "./sequences/Seq05_Resolution";
import { AutomationEraMain } from "./AutomationEraMain";
import { DigitalSingularityMain } from "./DigitalSingularityMain";
import { Seq01_TheBreach } from "./sequences/Seq01_TheBreach";
import { Seq02_DataStorm } from "./sequences/Seq02_DataStorm";
import { Seq03_CrashRebirth } from "./sequences/Seq03_CrashRebirth";
import { ArchitectureOfThoughtMain } from "./ArchitectureOfThoughtMain";
import { Part01_TrendsVsTools } from "./sequences/Part01_TrendsVsTools";
import { Part02_DreamVsCollision } from "./sequences/Part02_DreamVsCollision";
import { Part03_ResponsibilityVsLogic } from "./sequences/Part03_ResponsibilityVsLogic";
import { GLSLShowcase } from "./compositions/GLSLShowcase";
import { WaterMotion } from "./compositions/WaterMotion";
import { WaterMotion3D } from "./compositions/WaterMotion3D";
import { TheCoreAwakening } from "./compositions/core-awakening/TheCoreAwakening";
import { SolarSystem } from "./compositions/SolarSystem";
import { SolarSystem3D } from "./compositions/solar3d/SolarSystem3D";
import { BlueMarble } from "./compositions/BlueMarbel";
import { FPS, WIDTH, HEIGHT, TOTAL_FRAMES } from "./config";
import { GSAP_TOTAL } from "./gsapShowcaseConfig";

export const Root: React.FC = () => {
  return (
    <>
      {/* ═══ BLUE MARBLE — Photorealistic Earth ═══ */}
      <Composition
        id="BlueMarble"
        component={BlueMarble}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ SOLAR SYSTEM 3D ═══ */}
      <Composition
        id="SolarSystem3D"
        component={SolarSystem3D}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ SOLAR SYSTEM 2D ═══ */}
      <Composition
        id="SolarSystem"
        component={SolarSystem}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ THE CORE AWAKENING ═══ */}
      <Composition
        id="TheCoreAwakening"
        component={TheCoreAwakening}
        durationInFrames={450}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ WATER MOTION 3D ═══ */}
      <Composition
        id="WaterMotion3D"
        component={WaterMotion3D}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ WATER MOTION 2D ═══ */}
      <Composition
        id="WaterMotion"
        component={WaterMotion}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ GLSL SHOWCASE ═══ */}
      <Composition
        id="GLSL-QuantumFluid"
        component={GLSLShowcase}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ ARCHITECTURE OF THOUGHT: 1-minute compressed ═══ */}
      <Composition
        id="ArchitectureOfThought-FULL"
        component={ArchitectureOfThoughtMain}
        durationInFrames={1800}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AOT-Part01-TrendsVsTools"
        component={Part01_TrendsVsTools}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AOT-Part02-DreamVsCollision"
        component={Part02_DreamVsCollision}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AOT-Part03-ResponsibilityVsLogic"
        component={Part03_ResponsibilityVsLogic}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ DIGITAL SINGULARITY ═══ */}
      <Composition
        id="DigitalSingularity-FULL"
        component={DigitalSingularityMain}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DS-Seq01-TheBreach"
        component={Seq01_TheBreach}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DS-Seq02-DataStorm"
        component={Seq02_DataStorm}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DS-Seq03-CrashRebirth"
        component={Seq03_CrashRebirth}
        durationInFrames={2700}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ AUTOMATION ERA: Full 3-minute video ═══ */}
      <Composition
        id="AutomationEra-FULL"
        component={AutomationEraMain}
        durationInFrames={5400}
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ═══ Individual sequences for preview ═══ */}
      <Composition
        id="AutomationEra-Seq01"
        component={Seq01_TheHook}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutomationEra-Seq02"
        component={Seq02_DataViz}
        durationInFrames={1200}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutomationEra-Seq03"
        component={Seq03_GlassUI}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutomationEra-Seq04"
        component={Seq04_ChaosOrder}
        durationInFrames={1350}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="AutomationEra-Seq05"
        component={Seq05_Resolution}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GsapShowcase"
        component={GsapShowcase}
        durationInFrames={GSAP_TOTAL}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="EgoShatter"
        component={EgoShatter}
        durationInFrames={240}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="GsapCollisionReassembly"
        component={GsapCollisionReassembly}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="CinematicStickman"
        component={CinematicStickman}
        durationInFrames={420}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StickmanFightComplex"
        component={StickmanFightComplex}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HeroStrikeScene"
        component={HeroStrikeScene}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="WiproCyber"
        component={WiproCyber}
        durationInFrames={600}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="EffectiveWorkDarkLogic"
        component={EffectiveWorkDarkLogic}
        durationInFrames={885}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Scene01BusStop"
        component={Scene01BusStop}
        durationInFrames={210}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
