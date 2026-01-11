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
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <GraduationCap size={20} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Onboarding Tour</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage welcome tutorials</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasCompletedOnboarding && (
            <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              Completed
            </span>
          )}
          <motion.div animate={{ rotate: isCollapsed ? 0 : 90 }}>
            <ChevronRight className="text-gray-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 border-t border-gray-100 dark:border-gray-800 pt-6">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`w-5 h-5 ${hasCompletedOnboarding ? 'text-green-500' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">Tour Status</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{hasCompletedOnboarding ? 'You have completed the walkthrough.' : 'Tour not yet completed.'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={onTriggerOnboarding}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
                >
                  <Play size={16} />
                  <span>{hasCompletedOnboarding ? 'Replay Tour' : 'Start Tour'}</span>
                </button>

                {hasCompletedOnboarding && (
                  <button
                    onClick={onResetOnboarding}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    <RotateCcw size={16} />
                    <span>Reset Progress</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default OnboardingSettings;
