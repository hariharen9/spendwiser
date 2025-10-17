import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Sparkles } from 'lucide-react';
import OnboardingWizard from './OnboardingWizard';

/**
 * Demo component to showcase the onboarding wizard
 * This can be used for testing or demonstration purposes
 */
const OnboardingDemo: React.FC = () => {
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasLoadedMockData, setHasLoadedMockData] = useState(true);

  const handleStartOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const handleCloseOnboarding = () => {
    setIsOnboardingOpen(false);
  };

  const handleCompleteOnboarding = () => {
    setHasCompletedOnboarding(true);
    setIsOnboardingOpen(false);
  };

  const handleResetOnboarding = () => {
    setHasCompletedOnboarding(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4"
          >
            <Sparkles className="w-8 h-8 text-white" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Onboarding Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Experience the SpendWiser onboarding wizard
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Onboarding Status
            </span>
            <span className={`text-sm font-semibold ${
              hasCompletedOnboarding 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {hasCompletedOnboarding ? 'Completed' : 'Not Started'}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mock Data Loaded
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={hasLoadedMockData}
                onChange={(e) => setHasLoadedMockData(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <motion.button
            onClick={handleStartOnboarding}
            className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="w-5 h-5" />
            <span>{hasCompletedOnboarding ? 'Replay Onboarding' : 'Start Onboarding'}</span>
          </motion.button>

          {hasCompletedOnboarding && (
            <motion.button
              onClick={handleResetOnboarding}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <RotateCcw className="w-5 h-5" />
              <span>Reset Status</span>
            </motion.button>
          )}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            <strong>💡 Demo Features:</strong>
            <br />
            • Toggle mock data scenario
            <br />
            • Reset completion status
            <br />
            • Experience full wizard flow
          </p>
        </div>
      </motion.div>

      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
        onComplete={handleCompleteOnboarding}
        hasLoadedMockData={hasLoadedMockData}
      />
    </div>
  );
};

export default OnboardingDemo;