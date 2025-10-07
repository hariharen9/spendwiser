import React, { useState } from 'react';
import { Transaction } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiDollarSign, FiInfo } from 'react-icons/fi';
import { BarChart2 } from 'lucide-react';

interface CashFlowForecastProps {
  transactions: Transaction[];
  currency: string;
}

const CashFlowForecast: React.FC<CashFlowForecastProps> = ({ transactions, currency }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [timeframe, setTimeframe] = useState<'month' | 'quarter'>('month');

  const calculateForecast = () => {
    const today = new Date();
    const startOfPeriod = timeframe === 'month' 
      ? new Date(today.getFullYear(), today.getMonth(), 1)
      : new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
    
    const endOfPeriod = timeframe === 'month'
      ? new Date(today.getFullYear(), today.getMonth() + 1, 0)
      : new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3 + 3, 0);
    
    const daysInPeriod = Math.ceil((endOfPeriod.getTime() - startOfPeriod.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today.getTime() - startOfPeriod.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = daysInPeriod - daysElapsed;

    const periodTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startOfPeriod && txDate <= endOfPeriod;
    });

    const incomeThisPeriod = periodTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesSoFar = periodTransactions
      .filter(t => t.type === 'expense' && new Date(t.date) <= today)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Enhanced recurring expense prediction
    const recurringExpenses = periodTransactions
      .filter(t => t.type === 'expense' && (
        t.name.toLowerCase().includes('subscription') ||
        t.name.toLowerCase().includes('netflix') ||
        t.name.toLowerCase().includes('spotify') ||
        t.category === 'Utilities'
      ))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const nonRecurringExpenses = expensesSoFar - recurringExpenses;
    const avgDailySpend = daysElapsed > 0 ? nonRecurringExpenses / daysElapsed : 0;
    const projectedDailySpend = avgDailySpend * daysRemaining;

    const forecast = incomeThisPeriod - expensesSoFar - projectedDailySpend;
    const confidence = daysElapsed > 7 ? Math.min(95, 60 + (daysElapsed * 2)) : 40;

    return { 
      forecast, 
      incomeThisPeriod, 
      expensesSoFar, 
      projectedDailySpend,
      avgDailySpend,
      daysRemaining,
      confidence,
      recurringExpenses
    };
  };

  const { forecast, incomeThisPeriod, expensesSoFar, projectedDailySpend, avgDailySpend, daysRemaining, confidence, recurringExpenses } = calculateForecast();

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center">
          <BarChart2 className="w-5 h-5 mr-2" />
          Cash Flow Forecast
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setTimeframe('month')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeframe === 'month'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeframe('quarter')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeframe === 'quarter'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
            >
              Quarter
            </button>
          </div>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiInfo className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className={`text-4xl font-bold ${forecast >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center justify-center`}>
            {forecast >= 0 ? <FiTrendingUp className="w-8 h-8 mr-2" /> : <FiTrendingDown className="w-8 h-8 mr-2" />}
            {currency}{Math.abs(forecast).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-gray-500 dark:text-[#888888] mt-1">
            Projected Net Cash Flow
          </p>
          <div className="flex items-center justify-center mt-2">
            <div className={`px-2 py-1 rounded-full text-xs ${
              confidence >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
              confidence >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {confidence}% confidence
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <FiDollarSign className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {currency}{incomeThisPeriod.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Income</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <FiTrendingDown className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {currency}{expensesSoFar.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-red-600 dark:text-red-400 mt-1">Spent</p>
        </div>
      </div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3"
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Daily average spend:</span>
              <span className="font-medium">{currency}{avgDailySpend.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Projected remaining spend:</span>
              <span className="font-medium">{currency}{projectedDailySpend.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Recurring expenses:</span>
              <span className="font-medium">{currency}{recurringExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Days remaining:</span>
              <span className="font-medium">{daysRemaining} days</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CashFlowForecast;