
import React from 'react';
import { motion } from 'framer-motion';
import { fadeInVariants } from '../../components/Common/AnimationVariants';

interface TransactionSummaryProps {
  totalExpenses: number;
  netTotal: number;
  incomeCount: number;
  expenseCount: number;
  avgIncome: number;
  avgExpense: number;
  largestIncome: number;
  largestExpense: number;
  topCategory: string;
  dailyAverage: number;
  currency: string;
}

const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  totalExpenses,
  netTotal,
  incomeCount,
  expenseCount,
  avgIncome,
  avgExpense,
  largestIncome,
  largestExpense,
  topCategory,
  dailyAverage,
  currency,
}) => {
  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 mt-6"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
      transition={{ delay: 0.4 }}
    >
      <div className="p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">
          Filtered Transactions Summary
        </h3>
        
        <div className="flex gap-4 text-center mb-6">
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-lg w-1/2">
            <p className="text-sm text-red-800 dark:text-red-300">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {currency}{totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg w-1/2">
            <p className="text-sm text-gray-800 dark:text-gray-300">Net Total</p>
            <p className={`text-2xl font-bold ${netTotal >= 0 ? 'text-gray-600 dark:text-gray-100' : 'text-red-600 dark:text-red-400'}`}>
              {netTotal >= 0 ? `${currency}${netTotal.toFixed(2)}` : `-${currency}${Math.abs(netTotal).toFixed(2)}`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
          {dailyAverage > 0 && (
            <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-lg col-span-2 md:col-span-3">
              <p className="text-sm text-gray-800 dark:text-gray-300">Avg. Daily Spend</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{currency}{dailyAverage.toFixed(2)}</p>
            </div>
          )}

          {/* Transaction Count */}
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-xs text-gray-800 dark:text-gray-300">Transactions</p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">{incomeCount} <span className="text-green-500">In</span> / {expenseCount} <span className="text-red-500">Out</span></p>
          </div>

          {/* Average Transaction Value */}
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-xs text-gray-800 dark:text-gray-300">Avg. Transaction</p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">{currency}{avgIncome.toFixed(0)} <span className="text-green-500">In</span> / {currency}{avgExpense.toFixed(0)} <span className="text-red-500">Out</span></p>
          </div>

          {/* Largest Transaction */}
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-xs text-gray-800 dark:text-gray-300">Largest Transaction</p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">{currency}{largestIncome.toFixed(0)} <span className="text-green-500">In</span> / {currency}{largestExpense.toFixed(0)} <span className="text-red-500">Out</span></p>
          </div>

          {/* Top Spending Category */}
          <div className="bg-gray-100 dark:bg-gray-700/50 p-3 rounded-lg col-span-2 md:col-span-3">
            <p className="text-xs text-gray-800 dark:text-gray-300">Top Spending Category</p>
            <p className="text-lg font-semibold text-gray-600 dark:text-gray-100">{topCategory}</p>
          </div>

        </div>
      </div>
    </motion.div>
  );
};

export default TransactionSummary;
