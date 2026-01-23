import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Check, RotateCcw } from 'lucide-react';
import { PullToRefreshState } from '../../hooks/usePullToRefresh';

interface PullToRefreshIndicatorProps {
  state: PullToRefreshState;
}

const PullToRefreshIndicator: React.FC<PullToRefreshIndicatorProps> = ({ state }) => {
  const { isPulling, isRefreshing, isComplete, pullProgress, pullDistance, isReady, isHardRefresh } = state;

  const isVisible = isPulling || isRefreshing || isComplete;

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Subtle top gradient overlay */}
          <motion.div
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/5 dark:from-white/5 to-transparent"
            style={{ height: Math.min(pullDistance * 1.5, 120) }}
          />

          {/* Main indicator */}
          <motion.div
            className="relative mt-4"
            initial={{ y: -60, scale: 0.8 }}
            animate={{
              y: Math.min(pullDistance * 0.6, 60),
              scale: isReady ? 1 : 0.8 + (pullProgress * 0.2),
            }}
            exit={{ y: -60, scale: 0.8, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
            }}
          >
            {/* Clean circular indicator */}
            <motion.div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center
                backdrop-blur-xl shadow-lg border
                ${isComplete
                  ? 'bg-emerald-500/90 border-emerald-400/50'
                  : isHardRefresh
                  ? 'bg-orange-500/90 border-orange-400/50'
                  : isReady || isRefreshing
                  ? 'bg-white/90 dark:bg-gray-800/90 border-gray-200/50 dark:border-gray-600/50'
                  : 'bg-white/70 dark:bg-gray-800/70 border-gray-200/30 dark:border-gray-700/30'
                }
              `}
              animate={{
                scale: isComplete ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Progress ring */}
              {!isRefreshing && !isComplete && (
                <svg
                  className="absolute inset-0 w-full h-full -rotate-90"
                  viewBox="0 0 40 40"
                >
                  <circle
                    cx="20"
                    cy="20"
                    r="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={isHardRefresh ? "text-orange-500" : "text-blue-500"}
                    strokeDasharray={`${pullProgress * 113} 113`}
                    strokeLinecap="round"
                  />
                </svg>
              )}

              {/* Icon */}
              <AnimatePresence mode="wait">
                {isComplete ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  >
                    <Check className="w-5 h-5 text-white" strokeWidth={2.5} />
                  </motion.div>
                ) : isRefreshing ? (
                  <motion.div
                    key="spinner"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                  >
                    <RefreshCw className={`w-4 h-4 ${isHardRefresh ? 'text-orange-500' : 'text-blue-500'}`} />
                  </motion.div>
                ) : isHardRefresh ? (
                  <motion.div
                    key="reload"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1, rotate: pullProgress * 180 }}
                  >
                    <RotateCcw className="w-4 h-4 text-orange-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="arrow"
                    animate={{ rotate: pullProgress * 180 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <RefreshCw
                      className={`w-4 h-4 transition-colors duration-200 ${
                        isReady ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Status text - minimal */}
            <motion.p
              className={`
                absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap
                text-xs font-medium tracking-wide
                ${isComplete
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isHardRefresh
                  ? 'text-orange-600 dark:text-orange-400'
                  : isReady || isRefreshing
                  ? 'text-gray-600 dark:text-gray-300'
                  : 'text-gray-400 dark:text-gray-500'
                }
              `}
              initial={{ opacity: 0 }}
              animate={{ opacity: isReady || isRefreshing || isComplete ? 1 : 0.6 }}
            >
              {isComplete
                ? 'Done'
                : isRefreshing
                ? isHardRefresh ? 'Reloading...' : 'Syncing...'
                : isHardRefresh
                ? 'Release to reload'
                : isReady
                ? 'Release to sync'
                : ''}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PullToRefreshIndicator;
