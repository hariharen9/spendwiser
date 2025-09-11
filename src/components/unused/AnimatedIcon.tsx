import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedIconProps {
  children: React.ReactNode;
  className?: string;
  hoverScale?: number;
  tapScale?: number;
  rotation?: number;
}

const AnimatedIcon: React.FC<AnimatedIconProps> = ({ 
  children, 
  className = '', 
  hoverScale = 1.1,
  tapScale = 0.9,
  rotation = 0
}) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: hoverScale, rotate: rotation }}
      whileTap={{ scale: tapScale }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedIcon;