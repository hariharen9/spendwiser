import React from 'react';
import { Goal } from '../../types/types';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../Common/AnimationVariants';
import { Target } from 'lucide-react';

interface FinancialGoalsWidgetProps {
  goals: Goal[];
  currency: string;
}

const FinancialGoalsWidget: React.FC<FinancialGoalsWidgetProps> = ({ goals, currency }) => {
  const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3);

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-full"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4 flex items-center"><Target className="w-5 h-5 mr-2" />Financial Goals</h3>
      {activeGoals.length > 0 ? (
        <div className="space-y-4">
          {activeGoals.map((goal, index) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{goal.name}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {currency}{goal.currentAmount.toLocaleString()} / {currency}{goal.targetAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <motion.div
                    className="bg-green-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">{progress.toFixed(1)}% Complete</p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-[#888888] mb-2">No active goals</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Add a goal to start tracking!</p>
        </div>
      )}
    </motion.div>
  );
};

export default FinancialGoalsWidget;
