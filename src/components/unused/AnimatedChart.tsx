import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedChartProps {
  data: { name: string; value: number }[];
  color?: string;
  height?: number;
  className?: string;
}

const AnimatedChart: React.FC<AnimatedChartProps> = ({ 
  data, 
  color = 'bg-blue-500', 
  height = 200,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(item => item.value), 1);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-end justify-between h-full" style={{ height: `${height}px` }}>
        {data.map((item, index) => (
          <motion.div
            key={item.name}
            className="flex flex-col items-center flex-1 mx-1"
            initial={{ height: 0 }}
            animate={{ height: `${(item.value / maxValue) * 100}%` }}
            transition={{ 
              duration: 1, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <motion.div
              className={`w-full rounded-t ${color}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.5 }}
            />
            <motion.span
              className="text-xs text-gray-500 dark:text-gray-400 mt-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.7 }}
            >
              {item.name}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedChart;