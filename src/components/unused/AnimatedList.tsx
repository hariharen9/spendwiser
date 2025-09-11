import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInVariants } from './AnimationVariants';

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedList: React.FC<AnimatedListProps> = ({ children, className = '' }) => {
  return (
    <motion.div
      className={className}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedListItemProps {
  children: React.ReactNode;
  index: number;
  className?: string;
}

const AnimatedListItem: React.FC<AnimatedListItemProps> = ({ children, index, className = '' }) => {
  return (
    <motion.div
      className={className}
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: index * 0.1 }}
    >
      {children}
    </motion.div>
  );
};

export { AnimatedList, AnimatedListItem };