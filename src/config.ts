// Config — Dark Needle edition
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

export interface SceneConfig { id: string; durationInFrames: number; }

export const SCENES: SceneConfig[] = [
  { id: "beat-01-dream",    durationInFrames: 150 },
  { id: "beat-02-doubt",    durationInFrames: 120 },
  { id: "beat-03-struggle", durationInFrames: 150 },
  { id: "beat-04-spark",    durationInFrames: 130 },
  { id: "beat-05-growth",   durationInFrames: 170 },
  { id: "beat-06-triumph",  durationInFrames: 130 },
  { id: "beat-07-closing",  durationInFrames: 180 },
];

export const getSceneStart = (i: number) =>
  SCENES.slice(0, i).reduce((s, sc) => s + sc.durationInFrames, 0);
export const TOTAL_FRAMES = SCENES.reduce((s, sc) => s + sc.durationInFrames, 0);
