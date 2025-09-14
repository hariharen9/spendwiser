import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardHoverVariants, bounceVariants } from '../../components/Common/AnimationVariants';

interface MetricCardProps {
  title: string;
  mobileTitle?: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  mobileTitle,
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  color 
}) => {
  const changeColor = {
    positive: 'text-[#28A745]',
    negative: 'text-[#DC3545]',
    neutral: 'text-[#888888]'
  };

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-3 sm:p-4 md:p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
        <motion.div 
          className={`p-1.5 sm:p-2 md:p-3 rounded-lg ${color}`}
          variants={bounceVariants}
          whileHover="bounce"
        >
          <Icon className="h-3 w-3 sm:h-4 sm:w-4 md:h-6 md:w-6 text-white" />
        </motion.div>
        {change && (
          <motion.span 
            className={`text-xs sm:text-sm font-medium ${changeColor[changeType]}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            {change}
          </motion.span>
        )}
      </div>
      <div>
        <motion.h3 
          className="text-xs sm:text-sm font-medium text-gray-500 dark:text-[#888888] mb-1 truncate"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <span className="sm:hidden">{mobileTitle || title}</span>
          <span className="hidden sm:inline">{title}</span>
        </motion.h3>
        <motion.p 
          className="text-sm sm:text-lg md:text-2xl font-bold text-gray-900 dark:text-[#F5F5F5] truncate"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {value}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default MetricCard;