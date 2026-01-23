/**
 * Haptic Feedback Hook for PWA
 * Uses the Vibration API for tactile feedback on supported devices
 */

// Check if vibration is supported
const isVibrationSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

// Haptic feedback patterns (in milliseconds)
export const HapticPatterns = {
  // Light tap - for navigation, toggles
  light: [10],

  // Medium tap - for button presses, selections
  medium: [20],

  // Heavy tap - for confirmations, important actions
  heavy: [30],

  // Success - for completed actions
  success: [10, 50, 20],

  // Error - for failed actions
  error: [50, 30, 50, 30, 50],

  // Warning - for alerts
  warning: [30, 50, 30],

  // Double tap - for special selections
  double: [15, 50, 15],

  // Scroll tick - very subtle for list scrolling
  tick: [5],
} as const;

export type HapticPattern = keyof typeof HapticPatterns;

/**
 * Trigger haptic feedback
 * @param pattern - Pattern name or custom pattern array
 * @param intensity - Multiplier for vibration duration (0.5 = half, 2 = double)
 */
export const hapticFeedback = (
  pattern: HapticPattern | number[] = 'medium',
  intensity: number = 1
): void => {
  if (!isVibrationSupported()) return;

  try {
    const vibrationPattern = typeof pattern === 'string'
      ? HapticPatterns[pattern]
      : pattern;

    // Apply intensity multiplier
    const adjustedPattern = vibrationPattern.map(duration =>
      Math.round(duration * intensity)
    );

    navigator.vibrate(adjustedPattern);
  } catch (e) {
    // Silently fail if vibration not allowed
  }
};

/**
 * Stop any ongoing vibration
 */
export const stopHaptic = (): void => {
  if (!isVibrationSupported()) return;

  try {
    navigator.vibrate(0);
  } catch (e) {
    // Silently fail
  }
};

/**
 * Create a scrambling vibration effect based on velocity
 * Higher velocity = more intense vibration
 * @param velocity - Current animation velocity (0-1 normalized)
 */
export const hapticScramble = (velocity: number): void => {
  if (!isVibrationSupported()) return;
  if (velocity < 0.01) return; // Skip if nearly stopped

  try {
    // Scale vibration based on velocity (5-25ms range)
    const duration = Math.round(5 + (velocity * 20));
    navigator.vibrate(duration);
  } catch (e) {
    // Silently fail
  }
};

/**
 * React hook for haptic feedback
 */
export const useHaptic = () => {
  return {
    trigger: hapticFeedback,
    stop: stopHaptic,
    scramble: hapticScramble,
    isSupported: isVibrationSupported(),
    patterns: HapticPatterns,
  };
};

export default useHaptic;
