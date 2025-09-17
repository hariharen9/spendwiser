import React, { useState } from 'react';
import { Transaction } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiCheckCircle, FiInfo, FiShoppingBag } from 'react-icons/fi';

interface LifestyleCreepIndicatorProps {
  transactions: Transaction[];
  currency: string;
}

const LifestyleCreepIndicator: React.FC<LifestyleCreepIndicatorProps> = ({ transactions, currency }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'3months' | '6months'>('3months');

  const calculateLifestyleCreep = () => {
    const nonEssentialCategories = ['Entertainment', 'Shopping', 'Food & Dining', 'Travel', 'Personal Care'];

    const periodMonths = selectedPeriod === '3months' ? 3 : 6;
    const recentPeriodStart = new Date();
    recentPeriodStart.setMonth(recentPeriodStart.getMonth() - periodMonths);
    const previousPeriodStart = new Date();
    previousPeriodStart.setMonth(previousPeriodStart.getMonth() - (periodMonths * 2));

    const recentPeriodExpenses = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && nonEssentialCategories.includes(t.category) && txDate > recentPeriodStart;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const previousPeriodExpenses = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && nonEssentialCategories.includes(t.category) && 
               txDate > previousPeriodStart && txDate <= recentPeriodStart;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgRecent = recentPeriodExpenses / periodMonths;
    const avgPrevious = previousPeriodExpenses / periodMonths;

    if (avgPrevious === 0) {
      return { 
        percentageChange: avgRecent > 0 ? 100 : 0, 
        isCreep: avgRecent > 0,
        avgRecent,
        avgPrevious,
        recentTotal: recentPeriodExpenses,
        previousTotal: previousPeriodExpenses
      };
    }

    const percentageChange = ((avgRecent - avgPrevious) / avgPrevious) * 100;
    const isCreep = percentageChange > 10; // More than 10% increase is considered a creep

    return { 
      percentageChange, 
      isCreep, 
      avgRecent, 
      avgPrevious,
      recentTotal: recentPeriodExpenses,
      previousTotal: previousPeriodExpenses
    };
  };

  const { percentageChange, isCreep, avgRecent, avgPrevious, recentTotal, previousTotal } = calculateLifestyleCreep();

  const getStatusColor = () => {
    if (percentageChange < -10) return 'text-green-500';
    if (percentageChange > 20) return 'text-red-500';
    if (percentageChange > 10) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getStatusIcon = () => {
    if (percentageChange < -10) return <FiCheckCircle className="w-6 h-6" />;
    if (percentageChange > 20) return <FiAlertTriangle className="w-6 h-6" />;
    if (percentageChange > 10) return <FiTrendingUp className="w-6 h-6" />;
    return <FiTrendingDown className="w-6 h-6" />;
  };

  const getStatusMessage = () => {
    if (percentageChange < -10) return 'Great! You\'re reducing lifestyle spending';
    if (percentageChange > 20) return 'High lifestyle creep detected';
    if (percentageChange > 10) return 'Moderate lifestyle creep';
    return 'Lifestyle spending is stable';
  };

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
          <FiShoppingBag className="w-5 h-5 mr-2" />
          Lifestyle Creep
        </h3>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setSelectedPeriod('3months')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedPeriod === '3months'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
            >
              3M
            </button>
            <button
              onClick={() => setSelectedPeriod('6months')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                selectedPeriod === '6months'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
            >
              6M
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
          <div className={`text-4xl font-bold ${getStatusColor()} flex items-center justify-center mb-2`}>
            {getStatusIcon()}
            <span className="ml-2">
              {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
            </span>
          </div>
          <p className="text-gray-500 dark:text-[#888888] text-sm">
            in non-essential spending
          </p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs mt-2 ${
            percentageChange < -10 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            percentageChange > 20 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            percentageChange > 10 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
          }`}>
            {getStatusMessage()}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {currency}{avgRecent.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">Recent Average</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {currency}{avgPrevious.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Previous Average</p>
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
              <span className="text-gray-600 dark:text-gray-400">Recent period total:</span>
              <span className="font-medium">{currency}{recentTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Previous period total:</span>
              <span className="font-medium">{currency}{previousTotal.toLocaleString()}</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              <p>Categories tracked: Entertainment, Shopping, Food & Dining, Travel, Personal Care</p>
              <p className="mt-1">
                Comparing last {selectedPeriod === '3months' ? '3' : '6'} months to the {selectedPeriod === '3months' ? '3' : '6'} months before.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default LifestyleCreepIndicator;