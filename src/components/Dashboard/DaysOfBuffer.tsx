import React, { useState } from 'react';
import { Transaction, Account } from '../../types/types';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';

interface DaysOfBufferProps {
  transactions: Transaction[];
  accounts: Account[];
  currency: string;
}

const DaysOfBuffer: React.FC<DaysOfBufferProps> = ({ transactions, accounts, currency }) => {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | '90days' | '6months'>('90days');

  const calculateDaysOfBuffer = () => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    let daysToConsider: number;
    switch (timePeriod) {
      case 'week':
        daysToConsider = 7;
        break;
      case 'month':
        daysToConsider = 30;
        break;
      case '6months':
        daysToConsider = 180;
        break;
      default: // 90 days
        daysToConsider = 90;
        break;
    }

    const periodAgo = new Date();
    periodAgo.setDate(periodAgo.getDate() - daysToConsider);

    const expensesInPeriod = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && txDate > periodAgo;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgDailyExpense = expensesInPeriod / daysToConsider;

    if (avgDailyExpense === 0) {
      return { days: Infinity, avgDailyExpense, daysToConsider };
    }

    const days = totalBalance / avgDailyExpense;
    return { days, avgDailyExpense, daysToConsider };
  };

  const { days, avgDailyExpense, daysToConsider } = calculateDaysOfBuffer();

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'week': return '7 days';
      case 'month': return '30 days';
      case '6months': return '180 days';
      default: return '90 days';
    }
  };

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Days of Buffer</h3>
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setTimePeriod('week')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              timePeriod === 'week'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              timePeriod === 'month'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimePeriod('90days')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              timePeriod === '90days'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setTimePeriod('6months')}
            className={`px-2 py-1 text-xs rounded-md transition-colors ${
              timePeriod === '6months'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            6 Months
          </button>
        </div>
      </div>
      <div className="text-center">
        <p className="text-4xl font-bold text-green-500">{isFinite(days) ? Math.floor(days) : '∞'}</p>
        <p className="text-gray-500 dark:text-[#888888]">days</p>
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Based on an average daily spend of <strong>{currency}{avgDailyExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> over the last {getPeriodLabel()}.</p>
      </div>
    </motion.div>
  );
};

export default DaysOfBuffer;