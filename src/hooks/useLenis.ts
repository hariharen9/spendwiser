import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

interface UseLenisOptions {
  /** Enable or disable smooth scrolling */
  enabled?: boolean;
  /** Lerp (linear interpolation) intensity (0 to 1) - lower = smoother */
  lerp?: number;
  /** Duration of the scroll animation */
  duration?: number;
  /** Easing function for the scroll */
  easing?: (t: number) => number;
  /** Scroll orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Enable smooth scrolling on touch devices */
  smoothTouch?: boolean;
  /** Multiplier for touch scroll */
  touchMultiplier?: number;
  /** Infinite scrolling */
  infinite?: boolean;
  /** Wrapper element - defaults to window */
  wrapper?: HTMLElement | Window;
  /** Content element */
  content?: HTMLElement;
}

const defaultOptions: UseLenisOptions = {
  enabled: true,
  lerp: 0.1,
  duration: 1.2,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easeOutExpo
  orientation: 'vertical',
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
};

export function useLenis(options: UseLenisOptions = {}) {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  const mergedOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    if (!mergedOptions.enabled) return;

    // Initialize Lenis
    lenisRef.current = new Lenis({
      lerp: mergedOptions.lerp,
      duration: mergedOptions.duration,
      easing: mergedOptions.easing,
      orientation: mergedOptions.orientation,
      smoothTouch: mergedOptions.smoothTouch,
      touchMultiplier: mergedOptions.touchMultiplier,
      infinite: mergedOptions.infinite,
      wrapper: mergedOptions.wrapper,
      content: mergedOptions.content,
    });

    // Animation frame loop
    function raf(time: number) {
      lenisRef.current?.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    }

    rafRef.current = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenisRef.current?.destroy();
    };
  }, [
    mergedOptions.enabled,
    mergedOptions.lerp,
    mergedOptions.duration,
    mergedOptions.orientation,
    mergedOptions.smoothTouch,
    mergedOptions.touchMultiplier,
    mergedOptions.infinite,
  ]);

  return lenisRef.current;
}

export default useLenis;
