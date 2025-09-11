import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ 
  value, 
  duration = 3, 
  prefix = '', 
  suffix = '',
  className = ''
}) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let start: number | null = null;
    const finalValue = value;
    
    const animate = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      const currentValue = Math.floor(percentage * finalValue);
      setDisplayValue(currentValue);
      
      if (percentage < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return (
    <motion.span 
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}{displayValue.toLocaleString()}{suffix}
    </motion.span>
  );
};

export default AnimatedCounter;