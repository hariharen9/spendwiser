import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, useInView } from 'framer-motion';

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
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const [hasAnimated, setHasAnimated] = useState(false);

  // Use the absolute value if specified
  const targetValue = absolute ? Math.abs(value) : value;

  // Spring animation for smooth counting
  const spring = useSpring(0, {
    stiffness,
    damping,
    duration: duration * 1000,
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
