
import React, { useState, useMemo } from 'react';
import { Goal, Transaction, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, PiggyBank, Zap } from 'lucide-react';
import { modalVariants } from '../Common/AnimationVariants';

interface GoalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  transactions: Transaction[];
  accounts: Account[];
  currency: string;
}

const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({ isOpen, onClose, goal, transactions, accounts, currency }) => {
  const [extraMonthlyContribution, setExtraMonthlyContribution] = useState(0);
  const [lumpSum, setLumpSum] = useState(0);

  const roadmap = useMemo(() => {
    if (!goal) return null;

    const remainingAmount = goal.targetAmount - goal.currentAmount;
    const monthsRemaining = Math.max(1, Math.ceil((new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
    const requiredMonthlyContribution = remainingAmount / monthsRemaining;

    const lastThreeMonths = new Date();
    lastThreeMonths.setMonth(lastThreeMonths.getMonth() - 3);

    const monthlyIncome = transactions
      .filter(t => t.type === 'income' && new Date(t.date) > lastThreeMonths)
      .reduce((sum, t) => sum + t.amount, 0) / 3;

    const monthlyExpenses = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) > lastThreeMonths)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 3;

    const averageMonthlySavings = monthlyIncome - monthlyExpenses;

    const newRemainingAmount = remainingAmount - lumpSum;
    const newMonthlyContribution = requiredMonthlyContribution + extraMonthlyContribution;
    const newMonthsRemaining = newRemainingAmount / newMonthlyContribution;
    const newProjectedDate = new Date();
    newProjectedDate.setMonth(newProjectedDate.getMonth() + newMonthsRemaining);

    const topExpenseCategories = transactions
      .filter(t => t.type === 'expense' && new Date(t.date) > lastThreeMonths)
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as { [key: string]: number });

    const sortedExpenseCategories = Object.entries(topExpenseCategories)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return {
      remainingAmount,
      monthsRemaining,
      requiredMonthlyContribution,
      averageMonthlySavings,
      newProjectedDate,
      sortedExpenseCategories
    };
  }, [goal, transactions, extraMonthlyContribution, lumpSum]);

  if (!goal || !roadmap) return null;

  const { remainingAmount, monthsRemaining, requiredMonthlyContribution, averageMonthlySavings, newProjectedDate, sortedExpenseCategories } = roadmap;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5] flex items-center space-x-3">
                <span className="text-3xl">{goal.emoji}</span>
                <span>{goal.name}</span>
              </h2>
              <motion.button
                onClick={onClose}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </motion.div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: Goal Summary & Simulator */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="w-full bg-gray-200 rounded-full h-4 dark:bg-gray-700">
                    <motion.div
                      className="bg-blue-500 h-4 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  <div className="flex justify-between text-lg font-medium text-gray-700 dark:text-gray-300">
                    <span>{currency}{goal.currentAmount.toLocaleString()} / {currency}{goal.targetAmount.toLocaleString()}</span>
                    <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Goal Achievement Simulator */}
                <div className="bg-gray-50 dark:bg-[#1A1A1A] p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Goal Achievement Simulator</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Extra Monthly Contribution</label>
                      <input 
                        type="range" 
                        min="0" 
                        max={remainingAmount / 2} 
                        step="100" 
                        value={extraMonthlyContribution} 
                        onChange={(e) => setExtraMonthlyContribution(Number(e.target.value))} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                      />
                      <div className="flex justify-between text-xs px-1 text-gray-500 dark:text-gray-400">
                        <span>{currency}0</span>
                        <span>{currency}{extraMonthlyContribution}</span>
                        <span>{currency}{remainingAmount / 2}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Lump Sum Investment</label>
                      <input 
                        type="number" 
                        value={lumpSum} 
                        onChange={(e) => setLumpSum(Number(e.target.value))} 
                        className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                        placeholder="e.g., Bonus, windfall"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Roadmap & Insights */}
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800/30">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Your New Roadmap</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-300">New Projected Date:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{newProjectedDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Time Saved:</span>
                      <span className="font-bold text-green-600 dark:text-green-400">{Math.floor(monthsRemaining - (newProjectedDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30.44))} months</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-800/30">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4 flex items-center space-x-2">
                    <Zap className="h-6 w-6 text-yellow-500" />
                    <span>AI-Powered Insights</span>
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <li>
                      <p>Your average monthly saving is <strong>{currency}{averageMonthlySavings.toFixed(2)}</strong>. To stay on track, you need to save at least <strong>{currency}{requiredMonthlyContribution.toFixed(2)}</strong> per month.</p>
                    </li>
                    <li>
                      <p><strong>Top Spending Categories:</strong></p>
                      <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                        {sortedExpenseCategories.map(([category, amount]) => (
                          <li key={category}>{category}: {currency}{amount.toFixed(2)}</li>
                        ))}
                      </ul>
                      <p className="mt-2">Consider reducing spending in these areas to free up more cash for your goal.</p>
                    </li>
                    <li>
                      <p><strong>Tip:</strong> Set up a recurring transfer of {currency}{requiredMonthlyContribution.toFixed(2)} to a dedicated savings account each month to automate your goal progress.</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalDetailsModal;
