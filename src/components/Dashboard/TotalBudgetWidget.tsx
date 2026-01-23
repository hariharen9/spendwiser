import React from 'react';
import { TotalBudget, Transaction } from '../../types/types';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { TrendingUp, TrendingDown, AlertTriangle, PiggyBank } from 'lucide-react';
import AnimatedNumber from '../Common/AnimatedNumber';

interface TotalBudgetWidgetProps {
  totalBudget: TotalBudget | null;
  transactions: Transaction[];
  currency: string;
}

const TotalBudgetWidget: React.FC<TotalBudgetWidgetProps> = ({ totalBudget, transactions, currency }) => {

  const calculateMonthlyExpenses = () => {
    if (!totalBudget) return 0;

    const currentMonth = new Date().toISOString().slice(0, 7);
    return transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' &&
               txDate.toISOString().slice(0, 7) === currentMonth;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  if (!totalBudget) {
    return (
      <motion.div
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Monthly Budget</h3>
        <p className="text-gray-500 dark:text-[#888888] text-sm">
          No monthly budget set. Set a total monthly budget to track your spending.
        </p>
      </motion.div>
    );
  }

  const monthlyExpenses = calculateMonthlyExpenses();
  const percentageUsed = totalBudget.limit > 0 ? (monthlyExpenses / totalBudget.limit) * 100 : 0;
  const remaining = totalBudget.limit - monthlyExpenses;

  // Determine status and colors
  let progressColor = 'bg-green-500';
  let statusIcon = <TrendingUp className="h-4 w-4 text-green-500" />;
  let statusText = 'On track';

  if (percentageUsed >= 80 && percentageUsed < 100) {
    progressColor = 'bg-yellow-500';
    statusIcon = <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    statusText = 'Near limit';
  } else if (percentageUsed >= 100) {
    progressColor = 'bg-red-500';
    statusIcon = <TrendingDown className="h-4 w-4 text-red-500" />;
    statusText = 'Over budget';
  }

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center"><PiggyBank className="w-5 h-5 mr-2" />Monthly Budget</h3>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700">
          {statusIcon}
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{statusText}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <AnimatedNumber
              value={monthlyExpenses}
              currency={currency}
              decimals={0}
            />
            {' '}spent
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            <AnimatedNumber
              value={totalBudget.limit}
              currency={currency}
              decimals={0}
            />
            {' '}limit
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
          <motion.div
            className={`${progressColor} h-3 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentageUsed, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500 dark:text-[#888888]">Percentage used</p>
          <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
            <AnimatedNumber
              value={Math.round(percentageUsed)}
              decimals={0}
              suffix="%"
            />
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-[#888888]">Remaining</p>
          <p className={`font-semibold ${
            remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <AnimatedNumber
              value={Math.abs(remaining)}
              currency={currency}
              decimals={0}
            />
          </p>
        </div>
      </div>

      {/* Month indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-[#888888] text-center">
          Tracking: {new Date(totalBudget.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </p>
      </div>
    </motion.div>
  );
};

export default TotalBudgetWidget;
