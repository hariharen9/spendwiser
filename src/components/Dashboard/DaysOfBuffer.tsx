import React, { useState } from 'react';
import { Transaction, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiShield, FiAlertTriangle, FiCheckCircle, FiClock, FiInfo, FiTrendingDown } from 'react-icons/fi';

interface DaysOfBufferProps {
  transactions: Transaction[];
  accounts: Account[];
  currency: string;
}

const DaysOfBuffer: React.FC<DaysOfBufferProps> = ({ transactions, accounts, currency }) => {
  const [timePeriod, setTimePeriod] = useState<'week' | 'month' | '90days' | '6months'>('90days');
  const [showDetails, setShowDetails] = useState(false);
  const [includeEmergencyOnly, setIncludeEmergencyOnly] = useState(false);

  const calculateDaysOfBuffer = () => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const emergencyBalance = includeEmergencyOnly 
      ? accounts.filter(acc => acc.name.toLowerCase().includes('emergency') || acc.name.toLowerCase().includes('savings')).reduce((sum, acc) => sum + acc.balance, 0)
      : totalBalance;

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

    // Calculate essential vs non-essential expenses
    const essentialCategories = ['Utilities', 'Groceries', 'Housing', 'Transportation', 'Healthcare', 'Insurance'];
    const essentialExpenses = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && txDate > periodAgo && essentialCategories.includes(t.category);
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgDailyExpense = expensesInPeriod / daysToConsider;
    const avgDailyEssential = essentialExpenses / daysToConsider;

    if (avgDailyExpense === 0) {
      return { 
        days: Infinity, 
        essentialDays: Infinity,
        avgDailyExpense, 
        avgDailyEssential,
        daysToConsider,
        totalBalance: emergencyBalance,
        expensesInPeriod,
        essentialExpenses
      };
    }

    const days = emergencyBalance / avgDailyExpense;
    const essentialDays = avgDailyEssential > 0 ? emergencyBalance / avgDailyEssential : Infinity;
    
    return { 
      days, 
      essentialDays,
      avgDailyExpense, 
      avgDailyEssential,
      daysToConsider,
      totalBalance: emergencyBalance,
      expensesInPeriod,
      essentialExpenses
    };
  };

  const { days, essentialDays, avgDailyExpense, avgDailyEssential, daysToConsider, totalBalance, expensesInPeriod, essentialExpenses } = calculateDaysOfBuffer();

  const getPeriodLabel = () => {
    switch (timePeriod) {
      case 'week': return '7 days';
      case 'month': return '30 days';
      case '6months': return '180 days';
      default: return '90 days';
    }
  };

  const getBufferStatus = () => {
    const daysValue = isFinite(days) ? days : 365;
    if (daysValue >= 180) return { status: 'excellent', color: 'text-green-500', icon: FiCheckCircle, message: 'Excellent buffer' };
    if (daysValue >= 90) return { status: 'good', color: 'text-blue-500', icon: FiShield, message: 'Good buffer' };
    if (daysValue >= 30) return { status: 'moderate', color: 'text-yellow-500', icon: FiClock, message: 'Moderate buffer' };
    return { status: 'low', color: 'text-red-500', icon: FiAlertTriangle, message: 'Low buffer' };
  };

  const bufferStatus = getBufferStatus();
  const StatusIcon = bufferStatus.icon;

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
          <FiShield className="w-5 h-5 mr-2" />
          Days of Buffer
        </h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIncludeEmergencyOnly(!includeEmergencyOnly)}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              includeEmergencyOnly 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {includeEmergencyOnly ? 'Emergency Only' : 'All Accounts'}
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiInfo className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="flex justify-center mb-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setTimePeriod('week')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timePeriod === 'week'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimePeriod('month')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timePeriod === 'month'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimePeriod('90days')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timePeriod === '90days'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            90 Days
          </button>
          <button
            onClick={() => setTimePeriod('6months')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              timePeriod === '6months'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            6 Months
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
          <div className={`text-5xl font-bold ${bufferStatus.color} flex items-center justify-center mb-2`}>
            <StatusIcon className="w-8 h-8 mr-3" />
            {isFinite(days) ? Math.floor(days) : '∞'}
          </div>
          <p className="text-gray-500 dark:text-[#888888] text-lg">days of buffer</p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs mt-2 ${
            bufferStatus.status === 'excellent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            bufferStatus.status === 'good' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
            bufferStatus.status === 'moderate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {bufferStatus.message}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <FiTrendingDown className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
              {currency}{avgDailyExpense.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Daily Spend</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <FiShield className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {isFinite(essentialDays) ? Math.floor(essentialDays) : '∞'}
            </span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Essential Days</p>
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
              <span className="text-gray-600 dark:text-gray-400">Available balance:</span>
              <span className="font-medium">{currency}{totalBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Total expenses ({getPeriodLabel()}):</span>
              <span className="font-medium">{currency}{expensesInPeriod.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Essential expenses ({getPeriodLabel()}):</span>
              <span className="font-medium">{currency}{essentialExpenses.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Daily essential spend:</span>
              <span className="font-medium">{currency}{avgDailyEssential.toFixed(2)}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              <p>Essential categories: Utilities, Groceries, Housing, Transportation, Healthcare, Insurance</p>
              <p className="mt-1">
                Buffer calculated using {includeEmergencyOnly ? 'emergency/savings accounts only' : 'all account balances'}.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DaysOfBuffer;