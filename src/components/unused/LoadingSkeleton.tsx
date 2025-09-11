import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  type?: 'card' | 'list' | 'text' | 'circle';
  width?: string;
  height?: string;
  className?: string;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  type = 'card', 
  width = 'w-full', 
  height = 'h-4', 
  className = '' 
}) => {
  const getVariantClasses = () => {
    switch (type) {
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'rounded';
      case 'list':
        return 'rounded-lg';
      case 'card':
      default:
        return 'rounded-lg';
    }
  };

  return (
    <motion.div
      className={`${width} ${height} ${getVariantClasses()} ${className} bg-gray-200 dark:bg-gray-700`}
      animate={{
        opacity: [0.5, 1, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  );
};

export default LoadingSkeleton;