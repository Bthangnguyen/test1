// GSAP Showcase — Scene Config
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export interface SceneConfig { id: string; durationInFrames: number; }

export const GSAP_SCENES: SceneConfig[] = [
  { id: "title",        durationInFrames: 90  },  // 3s
  { id: "to-from",      durationInFrames: 150 },  // 5s
  { id: "easing-grid",  durationInFrames: 180 },  // 6s
  { id: "timeline",     durationInFrames: 150 },  // 5s
  { id: "stagger",      durationInFrames: 150 },  // 5s
  { id: "repeat-yoyo",  durationInFrames: 150 },  // 5s
  { id: "drawsvg",      durationInFrames: 150 },  // 5s
  { id: "morphsvg",     durationInFrames: 150 },  // 5s
  { id: "motionpath",   durationInFrames: 150 },  // 5s
  { id: "splittext",    durationInFrames: 150 },  // 5s
  { id: "flip",         durationInFrames: 150 },  // 5s
  { id: "closing",      durationInFrames: 120 },  // 4s
];

export const GSAP_TOTAL = GSAP_SCENES.reduce((s, sc) => s + sc.durationInFrames, 0);

export const gsapSceneStart = (i: number) =>
  GSAP_SCENES.slice(0, i).reduce((s, sc) => s + sc.durationInFrames, 0);
