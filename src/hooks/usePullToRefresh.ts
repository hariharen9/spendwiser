import { useState, useEffect, useCallback, useRef } from 'react';
import { hapticFeedback } from './useHaptic';

export interface PullToRefreshState {
  isPulling: boolean;
  isRefreshing: boolean;
  isComplete: boolean;
  pullProgress: number; // 0 to 1 for soft refresh, can go beyond for hard refresh
  pullDistance: number; // actual pixels
  isReady: boolean; // soft refresh threshold reached
  isHardRefresh: boolean; // hard refresh (page reload) threshold reached
}

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // pixels to pull for soft refresh
  hardRefreshThreshold?: number; // pixels to pull for hard page reload
  maxPull?: number; // max pull distance
  disabled?: boolean;
}

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  hardRefreshThreshold = 140,
  maxPull = 180,
  disabled = false,
}: UsePullToRefreshOptions) => {
  const [state, setState] = useState<PullToRefreshState>({
    isPulling: false,
    isRefreshing: false,
    isComplete: false,
    pullProgress: 0,
    pullDistance: 0,
    isReady: false,
    isHardRefresh: false,
  });

  const startY = useRef(0);
  const currentY = useRef(0);
  const hasTriggeredReadyHaptic = useRef(false);
  const hasTriggeredHardHaptic = useRef(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing) return;

    // Only activate if at the top of the page
    if (window.scrollY > 5) return;

    startY.current = e.touches[0].clientY;
    hasTriggeredReadyHaptic.current = false;
    hasTriggeredHardHaptic.current = false;
  }, [disabled, state.isRefreshing]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || state.isRefreshing) return;
    if (window.scrollY > 5) return;
    if (startY.current === 0) return;

    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;

    if (diff > 0) {
      // Pulling down - apply resistance curve for natural feel
      const resistance = 0.4;
      const pullDistance = Math.min(diff * resistance, maxPull);
      const pullProgress = Math.min(pullDistance / threshold, 1);
      const isReady = pullDistance >= threshold;
      const isHardRefresh = pullDistance >= hardRefreshThreshold;

      // Haptic feedback when crossing soft threshold
      if (isReady && !hasTriggeredReadyHaptic.current) {
        hapticFeedback('light');
        hasTriggeredReadyHaptic.current = true;
      }

      // Haptic feedback when crossing hard threshold
      if (isHardRefresh && !hasTriggeredHardHaptic.current) {
        hapticFeedback('heavy');
        hasTriggeredHardHaptic.current = true;
      } else if (!isHardRefresh && hasTriggeredHardHaptic.current) {
        hapticFeedback('light');
        hasTriggeredHardHaptic.current = false;
      }

      setState(prev => ({
        ...prev,
        isPulling: true,
        pullProgress,
        pullDistance,
        isReady,
        isHardRefresh,
      }));

      // Prevent default scrolling while pulling
      if (pullDistance > 10) {
        e.preventDefault();
      }
    }
  }, [disabled, state.isRefreshing, threshold, hardRefreshThreshold, maxPull]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || state.isRefreshing) return;
    if (!state.isPulling) return;

    if (state.isHardRefresh) {
      // Hard refresh - reload the page
      hapticFeedback('success');
      setState(prev => ({
        ...prev,
        isPulling: false,
        isRefreshing: true,
        pullProgress: 1,
        pullDistance: threshold,
      }));

      // Small delay to show the animation, then reload
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } else if (state.isReady) {
      // Soft refresh - sync data
      hapticFeedback('medium');

      setState(prev => ({
        ...prev,
        isPulling: false,
        isRefreshing: true,
        pullProgress: 1,
        pullDistance: threshold,
        isHardRefresh: false,
      }));

      try {
        await onRefresh();

        // Show complete state briefly
        hapticFeedback('success');
        setState(prev => ({
          ...prev,
          isRefreshing: false,
          isComplete: true,
        }));

        // Reset after animation
        setTimeout(() => {
          setState({
            isPulling: false,
            isRefreshing: false,
            isComplete: false,
            pullProgress: 0,
            pullDistance: 0,
            isReady: false,
            isHardRefresh: false,
          });
        }, 600);
      } catch (error) {
        hapticFeedback('error');
        setState({
          isPulling: false,
          isRefreshing: false,
          isComplete: false,
          pullProgress: 0,
          pullDistance: 0,
          isReady: false,
          isHardRefresh: false,
        });
      }
    } else {
      // Cancel pull - didn't reach threshold
      setState({
        isPulling: false,
        isRefreshing: false,
        isComplete: false,
        pullProgress: 0,
        pullDistance: 0,
        isReady: false,
        isHardRefresh: false,
      });
    }

    // Reset start position
    startY.current = 0;
  }, [disabled, state.isRefreshing, state.isPulling, state.isReady, state.isHardRefresh, threshold, onRefresh]);

  useEffect(() => {
    if (disabled) return;

    const options = { passive: false } as AddEventListenerOptions;

    document.addEventListener('touchstart', handleTouchStart, options);
    document.addEventListener('touchmove', handleTouchMove, options);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return state;
};

export default usePullToRefresh;
