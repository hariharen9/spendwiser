import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Play, CheckCircle, ChevronRight, GraduationCap } from 'lucide-react';

interface OnboardingSettingsProps {
  hasCompletedOnboarding: boolean;
  onResetOnboarding: () => void;
  onTriggerOnboarding: () => void;
}

const OnboardingSettings: React.FC<OnboardingSettingsProps> = ({
  hasCompletedOnboarding,
  onResetOnboarding,
  onTriggerOnboarding
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Default to collapsed
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Collapsible Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <GraduationCap className="w-6 h-6 text-purple-500" />
          <div className="text-left">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
              Onboarding Tour
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {hasCompletedOnboarding ? 'Tour completed' : 'Welcome tour available'}
            </p>
          </div>
          {hasCompletedOnboarding && (
            <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              Completed
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </motion.div>
      </button>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-100 dark:border-gray-700">
              <div className="pt-4 space-y-4">


        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center space-x-3">
            {hasCompletedOnboarding ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-full" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Tour Status
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {hasCompletedOnboarding ? 'Completed' : 'Not completed'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <motion.button
            onClick={onTriggerOnboarding}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-4 h-4" />
            <span>{hasCompletedOnboarding ? 'Replay Tour' : 'Start Tour'}</span>
          </motion.button>

          {hasCompletedOnboarding && (
            <motion.button
              onClick={onResetOnboarding}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Status</span>
            </motion.button>
          )}
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="font-medium mb-1">💡 About the Tour</p>
          <p>
            The onboarding tour helps new users understand SpendWiser's features. 
            It automatically shows for first-time users when sample data is loaded.
          </p>
        </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingSettings;