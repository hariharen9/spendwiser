import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cardHoverVariants, bounceVariants } from '../../components/Common/AnimationVariants';
import AnimatedNumber from '../Common/AnimatedNumber';

interface MetricCardProps {
  title: string;
  mobileTitle?: string;
  value: string | number;
  numericValue?: number; // For animated number
  currency?: string; // Currency symbol for animation
  icon: LucideIcon;
  color: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  hideValue?: boolean; // For privacy mode
  hiddenText?: string; // Text to show when hidden
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  mobileTitle,
  value,
  numericValue,
  currency = '',
  change,
  changeType = 'neutral',
  icon: Icon,
  color,
  hideValue = false,
  hiddenText,
}) => {
  const changeColor = {
    positive: 'text-emerald-500 dark:text-emerald-400',
    negative: 'text-rose-500 dark:text-rose-400',
    neutral: 'text-slate-400 dark:text-slate-500'
  };

  // Extract base color for glow effects
  const getGlowColor = () => {
    if (color.includes('#007BFF')) return 'rgba(0, 123, 255, 0.3)';
    if (color.includes('#28A745')) return 'rgba(40, 167, 69, 0.3)';
    if (color.includes('#DC3545')) return 'rgba(220, 53, 69, 0.3)';
    return 'rgba(0, 0, 0, 0.1)';
  };

  // Determine if we should use animated number
  const shouldAnimate = numericValue !== undefined && !hideValue;

  return (
    <motion.div
      className="relative overflow-hidden bg-white/80 dark:bg-[#1e1e1e]/80 backdrop-blur-xl rounded-xl md:rounded-2xl p-3 md:p-6 border border-white/20 dark:border-white/5 shadow-lg shadow-slate-200/50 dark:shadow-none"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      {/* Background Gradient Decorative Element */}
      <div
        className={`absolute -right-4 -top-4 w-16 h-16 md:w-24 md:h-24 rounded-full blur-2xl md:blur-3xl opacity-20 dark:opacity-10 ${color}`}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2 md:mb-4">
          <motion.div
            className={`p-2 md:p-3 rounded-lg md:rounded-xl ${color} shadow-lg`}
            style={{ boxShadow: `0 8px 20px -4px ${getGlowColor()}` }}
            variants={bounceVariants}
            whileHover="bounce"
          >
            <Icon className="h-3.5 w-3.5 md:h-6 md:w-6 text-white" />
          </motion.div>
          {change && (
            <motion.div
              className={`flex items-center gap-1 px-2 py-0.5 md:px-2.5 md:py-1 rounded-full text-[10px] md:text-xs font-semibold bg-slate-100 dark:bg-white/5 ${changeColor[changeType]}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {change}
            </motion.div>
          )}
        </div>

        <div className="space-y-0.5 md:space-y-1">
          <motion.h3
            className="text-[10px] md:text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="sm:hidden">{mobileTitle || title}</span>
            <span className="hidden sm:inline">{title}</span>
          </motion.h3>
          <motion.p
            className="text-base sm:text-lg md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {hideValue ? (
              hiddenText || '••••••'
            ) : shouldAnimate ? (
              <AnimatedNumber
                value={numericValue}
                currency={currency}
                decimals={0}
              />
            ) : (
              value
            )}
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;
