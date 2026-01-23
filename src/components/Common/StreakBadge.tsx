import React, { useState, useRef, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StreakBadgeProps {
  visitStreak: number;
  transactionStreak: number;
  compact?: boolean;
}

const StreakBadge: React.FC<StreakBadgeProps> = ({
  visitStreak,
  transactionStreak,
  compact = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'above' | 'below'>('below');
  const badgeRef = useRef<HTMLDivElement>(null);

  const hasVisitStreak = visitStreak > 0;
  const hasTransactionStreak = transactionStreak > 0;

  // Calculate tooltip position based on available space
  useEffect(() => {
    if (showTooltip && badgeRef.current) {
      const rect = badgeRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const tooltipHeight = 120; // Approximate tooltip height

      // If not enough space below, show above
      if (spaceBelow < tooltipHeight) {
        setTooltipPosition('above');
      } else {
        setTooltipPosition('below');
      }
    }
  }, [showTooltip]);

  if (!hasVisitStreak && !hasTransactionStreak) return null;

  // Show transaction streak (super flame) if available, otherwise visit streak
  const isSuper = hasTransactionStreak;
  const streakCount = isSuper ? transactionStreak : visitStreak;

  return (
    <div
      ref={badgeRef}
      className="relative inline-flex"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={() => setShowTooltip(true)}
      onTouchEnd={() => setTimeout(() => setShowTooltip(false), 2000)}
    >
      <motion.div
        className={`flex items-center ${
          compact ? 'gap-0.5 px-1.5 py-0.5' : 'gap-1 px-2 py-1'
        } ${
          isSuper
            ? 'bg-gradient-to-r from-red-100 to-amber-100 dark:from-red-900/30 dark:to-amber-900/30 border border-red-200 dark:border-red-800'
            : 'bg-orange-100 dark:bg-orange-900/30'
        } rounded-full cursor-pointer`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      >
        <motion.div
          className="relative"
          animate={{
            scale: [1, isSuper ? 1.3 : 1.2, 1],
            rotate: [0, isSuper ? -10 : -5, isSuper ? 10 : 5, 0],
          }}
          transition={{
            duration: isSuper ? 1 : 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {isSuper && (
            <Flame
              className={`${
                compact ? 'h-3 w-3' : 'h-4 w-4'
              } text-red-500 absolute top-0 left-0`}
              fill="currentColor"
              style={{ filter: 'blur(1px)', opacity: 0.5 }}
            />
          )}
          <Flame
            className={`${compact ? 'h-3 w-3' : 'h-4 w-4'} ${
              isSuper ? 'text-amber-500' : 'text-orange-500'
            }`}
            fill="currentColor"
          />
        </motion.div>
        <span
          className={`${compact ? 'text-xs' : 'text-sm'} font-bold ${
            isSuper
              ? 'bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent'
              : 'text-orange-600 dark:text-orange-400'
          }`}
        >
          {streakCount}
        </span>
      </motion.div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: tooltipPosition === 'above' ? -5 : 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: tooltipPosition === 'above' ? -5 : 5, scale: 0.95 }}
            className={`absolute ${
              tooltipPosition === 'above'
                ? 'bottom-full mb-2'
                : 'top-full mt-2'
            } left-1/2 -translate-x-1/2 p-3 bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-xl shadow-xl z-[100] whitespace-nowrap min-w-[200px]`}
            style={{
              maxWidth: 'calc(100vw - 32px)',
            }}
          >
            <div className="space-y-2">
              {hasVisitStreak && (
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-orange-500/20 rounded flex-shrink-0">
                    <Flame className="h-3 w-3 text-orange-400" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-semibold text-orange-300">Visit Streak: {visitStreak} day{visitStreak !== 1 ? 's' : ''}</p>
                    <p className="text-gray-400 text-[10px]">Consecutive days opened</p>
                  </div>
                </div>
              )}
              {hasTransactionStreak && (
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-gradient-to-r from-red-500/20 to-amber-500/20 rounded flex-shrink-0">
                    <Flame className="h-3 w-3 text-amber-400" fill="currentColor" />
                  </div>
                  <div>
                    <p className="font-semibold bg-gradient-to-r from-red-300 to-amber-300 bg-clip-text text-transparent">
                      Super Streak: {transactionStreak} day{transactionStreak !== 1 ? 's' : ''}
                    </p>
                    <p className="text-gray-400 text-[10px]">Consecutive days logged</p>
                  </div>
                </div>
              )}
            </div>
            {/* Tooltip arrow */}
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-800 rotate-45 ${
                tooltipPosition === 'above' ? '-bottom-1' : '-top-1'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StreakBadge;
