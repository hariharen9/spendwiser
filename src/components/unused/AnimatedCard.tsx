import React from 'react';
import { motion } from 'framer-motion';
import { cardHoverVariants } from './AnimationVariants';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  className = '', 
  onClick 
}) => {
  return (
    <motion.div
      className={`bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      onClick={onClick}
      layout
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;