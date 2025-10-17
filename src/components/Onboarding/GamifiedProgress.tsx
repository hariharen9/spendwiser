import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Star, Zap } from 'lucide-react';

interface GamifiedProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles: string[];
}

const GamifiedProgress: React.FC<GamifiedProgressProps> = ({
  currentStep,
  totalSteps,
  stepTitles
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Main Progress Bar */}
      <div className="relative mb-6">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center space-x-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-5 h-5 text-yellow-500" />
            </motion.div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Financial Co-pilot Setup
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
        </div>

        {/* Animated Progress Bar */}
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full relative"
          >
            {/* Shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Step Indicators - Mobile Optimized for 7 steps */}
      <div className="flex justify-between items-center gap-1">
        {stepTitles.map((title, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isUpcoming = index > currentStep;

          return (
            <motion.div
              key={index}
              className="flex flex-col items-center space-y-1 md:space-y-2 flex-1 min-w-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Step Circle */}
              <motion.div
                className={`relative flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-all ${
                  isCompleted
                    ? 'bg-green-500 border-green-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-400'
                }`}
                animate={{
                  scale: isCurrent ? [1, 1.2, 1] : 1,
                  boxShadow: isCurrent 
                    ? [
                        '0 0 0 0 rgba(59, 130, 246, 0.7)',
                        '0 0 0 6px rgba(59, 130, 246, 0)',
                        '0 0 0 0 rgba(59, 130, 246, 0)'
                      ]
                    : '0 0 0 0 rgba(59, 130, 246, 0)'
                }}
                transition={{
                  duration: isCurrent ? 2 : 0.3,
                  repeat: isCurrent ? Infinity : 0,
                  ease: "easeOut"
                }}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <CheckCircle className="w-3 h-3 md:w-5 md:h-5" />
                  </motion.div>
                ) : (
                  <span className="text-xs font-bold">{index + 1}</span>
                )}
              </motion.div>

              {/* Step Label - Truncated on mobile */}
              <motion.span
                className={`text-xs text-center font-medium transition-colors truncate w-full ${
                  isCompleted || isCurrent
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
                }`}
                animate={{
                  scale: isCurrent ? 1.05 : 1,
                  fontWeight: isCurrent ? 600 : 500
                }}
                title={title} // Show full title on hover
              >
                {/* Show abbreviated titles on very small screens */}
                <span className="hidden sm:inline">{title}</span>
                <span className="sm:hidden">
                  {title === 'Welcome' ? 'Hi' : 
                   title === 'Dashboard' ? 'Dash' :
                   title === 'Transactions' ? 'Trans' :
                   title === 'Budgets' ? 'Budget' :
                   title === 'Goals' ? 'Goals' :
                   title === 'EMIs' ? 'EMIs' :
                   title === 'Complete' ? 'Done' : title}
                </span>
              </motion.span>

              {/* Celebration particles for completed steps */}
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0] }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="absolute -top-2 -right-2"
                >
                  <Star className="w-3 h-3 text-yellow-400" />
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mt-4"
      >
        <p className="text-sm text-gray-600 dark:text-gray-300">
          {currentStep === 0 && "🚀 Let's get started on your financial journey!"}
          {currentStep === 1 && "📊 Discovering your financial dashboard..."}
          {currentStep === 2 && "💳 Learning about smart transactions..."}
          {currentStep === 3 && "🎯 Setting up intelligent budgeting..."}
          {currentStep === 4 && "✨ Exploring financial goals..."}
          {currentStep === 5 && "🏦 Mastering EMI & loan management..."}
          {currentStep === totalSteps - 1 && "🎉 You're all set! Welcome aboard!"}
        </p>
      </motion.div>
    </div>
  );
};

export default GamifiedProgress;