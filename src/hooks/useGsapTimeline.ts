import { useRef, useLayoutEffect } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import gsap from "gsap";

/**
 * Hook to bridge GSAP with Remotion's frame-based system.
 * It pauses the GSAP timeline and manually seeks based on current frame.
 */
export const useGsapTimeline = (
  buildTimeline: (tl: gsap.core.Timeline) => void
) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tl = useRef<gsap.core.Timeline | null>(null);

  useLayoutEffect(() => {
    // Initialize paused timeline
    tl.current = gsap.timeline({ paused: true });
    
    // Build the animation sequence
    buildTimeline(tl.current);

    return () => {
      tl.current?.kill();
    };
  }, []);

  useLayoutEffect(() => {
    if (tl.current) {
      // Sync GSAP playhead with Remotion frame
      tl.current.seek(frame / fps, false);
    }
  }, [frame, fps]);

  return tl;
};
