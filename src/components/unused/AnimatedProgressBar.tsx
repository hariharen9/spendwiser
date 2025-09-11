import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedProgressBarProps {
  percentage: number;
  color?: string;
  height?: string;
  className?: string;
  showPercentage?: boolean;
}

const AnimatedProgressBar: React.FC<AnimatedProgressBarProps> = ({ 
  percentage, 
  color = 'bg-blue-500', 
  height = 'h-2', 
  className = '',
  showPercentage = false
}) => {
  return (
    <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${height} ${className} overflow-hidden`}>
      <motion.div
        className={`rounded-full ${color} ${height}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(percentage, 100)}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {showPercentage && (
        <motion.span 
          className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1 inline-block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {Math.round(percentage)}%
        </motion.span>
      )}
    </div>
  );
};

export default AnimatedProgressBar;