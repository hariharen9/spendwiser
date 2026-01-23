import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import { hapticScramble } from '../../hooks/useHaptic';

interface AnimatedNumberProps {
  /** The target number to animate to */
  value: number;
  /** Currency symbol to prepend */
  currency?: string;
  /** Number of decimal places */
  decimals?: number;
  /** Duration of animation in seconds */
  duration?: number;
  /** Additional CSS classes */
  className?: string;
  /** Whether to use locale string formatting (adds commas) */
  formatLocale?: boolean;
  /** Locale to use for formatting */
  locale?: string;
  /** Whether to show + for positive numbers */
  showPlusSign?: boolean;
  /** Whether to show as absolute value */
  absolute?: boolean;
  /** Suffix to append (e.g., '%', 'k') */
  suffix?: string;
  /** Spring stiffness (higher = faster) */
  stiffness?: number;
  /** Spring damping (higher = less bounce) */
  damping?: number;
  /** Enable haptic feedback on mobile (default: true) */
  enableHaptic?: boolean;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  currency = '',
  decimals = 0,
  duration = 0.6,
  className = '',
  formatLocale = true,
  locale = 'en-IN',
  showPlusSign = false,
  absolute = false,
  suffix = '',
  stiffness = 120,
  damping = 25,
  enableHaptic = true,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const lastHapticTime = useRef(0);

  // Use the absolute value if specified
  const targetValue = absolute ? Math.abs(value) : value;

  // Spring animation for smooth counting
  const spring = useSpring(0, {
    stiffness,
    damping,
    duration: duration * 1000,
  });

  // Track velocity for haptic feedback
  useMotionValueEvent(spring, 'velocityChange', (velocity) => {
    if (!enableHaptic) return;

    // Throttle haptic feedback to every 50ms for performance
    const now = Date.now();
    if (now - lastHapticTime.current < 50) return;
    lastHapticTime.current = now;

    // Normalize velocity (typical range 0-10000, we want 0-1)
    const normalizedVelocity = Math.min(Math.abs(velocity) / 5000, 1);

    // Only trigger if velocity is significant
    if (normalizedVelocity > 0.05) {
      hapticScramble(normalizedVelocity);
    }
  });

  // Transform spring value to formatted display
  const display = useTransform(spring, (current) => {
    const num = decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current);

    let formatted: string;
    if (formatLocale) {
      formatted = Number(num).toLocaleString(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    } else {
      formatted = String(num);
    }

    const sign = showPlusSign && current > 0 ? '+' : '';
    return `${sign}${currency}${formatted}${suffix}`;
  });

  // Intersection Observer for viewport detection
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            setIsInView(true);
          }
        });
      },
      { rootMargin: '-50px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [hasAnimated]);

  // Trigger animation when in view
  useEffect(() => {
    if (isInView && !hasAnimated) {
      spring.set(targetValue);
      setHasAnimated(true);
    }
  }, [isInView, targetValue, spring, hasAnimated]);

  // Update value when it changes (after initial animation)
  useEffect(() => {
    if (hasAnimated) {
      spring.set(targetValue);
    }
  }, [targetValue, spring, hasAnimated]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
};

export default AnimatedNumber;
