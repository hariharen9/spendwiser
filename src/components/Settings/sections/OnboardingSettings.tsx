import React from 'react';
import { motion } from 'framer-motion';
import { RotateCcw, Play, CheckCircle } from 'lucide-react';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <Play className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Onboarding Tour
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Manage your welcome tour experience
          </p>
        </div>
      </div>

      <div className="space-y-4">
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
    </motion.div>
  );
};

export default OnboardingSettings;