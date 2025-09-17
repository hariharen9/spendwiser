import React, { useState } from 'react';
import { Transaction, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiTrendingUp, FiTrendingDown, FiCalendar, FiTarget, FiInfo, FiBarChart2 } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface FutureBalanceProjectionProps {
  transactions: Transaction[];
  accounts: Account[];
  currency: string;
}

const FutureBalanceProjection: React.FC<FutureBalanceProjectionProps> = ({ transactions, accounts, currency }) => {
  const [showChart, setShowChart] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [projectionPeriod, setProjectionPeriod] = useState<'conservative' | 'optimistic' | 'realistic'>('realistic');

  const calculateProjection = () => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const relevantTransactions = transactions.filter(t => new Date(t.date) > sixMonthsAgo);
    const recentTransactions = transactions.filter(t => new Date(t.date) > threeMonthsAgo);

    const totalIncome = relevantTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = relevantTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const recentIncome = recentTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const recentExpense = recentTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgMonthlyNet6M = (totalIncome - totalExpense) / 6;
    const avgMonthlyNet3M = (recentIncome - recentExpense) / 3;

    let avgMonthlyNet = avgMonthlyNet6M;
    switch (projectionPeriod) {
      case 'conservative':
        avgMonthlyNet = Math.min(avgMonthlyNet6M, avgMonthlyNet3M) * 0.8; // 20% more conservative
        break;
      case 'optimistic':
        avgMonthlyNet = Math.max(avgMonthlyNet6M, avgMonthlyNet3M) * 1.1; // 10% more optimistic
        break;
      case 'realistic':
        avgMonthlyNet = (avgMonthlyNet6M + avgMonthlyNet3M) / 2; // Average of both periods
        break;
    }

    const projection3Months = totalBalance + avgMonthlyNet * 3;
    const projection6Months = totalBalance + avgMonthlyNet * 6;
    const projection12Months = totalBalance + avgMonthlyNet * 12;
    const projection24Months = totalBalance + avgMonthlyNet * 24;

    // Generate chart data
    const chartData = [
      { month: 'Now', balance: totalBalance },
      { month: '3M', balance: projection3Months },
      { month: '6M', balance: projection6Months },
      { month: '12M', balance: projection12Months },
      { month: '24M', balance: projection24Months }
    ];

    const trend = avgMonthlyNet > 0 ? 'positive' : avgMonthlyNet < 0 ? 'negative' : 'neutral';
    const confidence = Math.min(95, Math.max(40, 70 + (relevantTransactions.length / 10)));

    return { 
      projection3Months, 
      projection6Months, 
      projection12Months, 
      projection24Months,
      avgMonthlyNet, 
      avgMonthlyNet6M,
      avgMonthlyNet3M,
      chartData,
      trend,
      confidence,
      totalBalance
    };
  };

  const { 
    projection3Months, 
    projection6Months, 
    projection12Months, 
    projection24Months,
    avgMonthlyNet, 
    avgMonthlyNet6M,
    avgMonthlyNet3M,
    chartData,
    trend,
    confidence,
    totalBalance
  } = calculateProjection();

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
          <FiTarget className="w-5 h-5 mr-2" />
          Balance Projection
        </h3>
      </div>

      {/* Projection Period Tabs */}
      <div className="flex justify-center mb-4">
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setProjectionPeriod('conservative')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              projectionPeriod === 'conservative'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            Conservative
          </button>
          <button
            onClick={() => setProjectionPeriod('realistic')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              projectionPeriod === 'realistic'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            Realistic
          </button>
          <button
            onClick={() => setProjectionPeriod('optimistic')}
            className={`px-3 py-1 text-xs rounded-md transition-colors ${
              projectionPeriod === 'optimistic'
                ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
            }`}
          >
            Optimistic
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => setShowChart(!showChart)}
          className={`p-2 rounded-lg transition-colors ${
            showChart 
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'
          }`}
          title="Toggle Chart"
        >
          <FiBarChart2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Show Details"
        >
          <FiInfo className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="mb-4">
        <div className={`flex items-center justify-center mb-2 ${
          trend === 'positive' ? 'text-green-500' : trend === 'negative' ? 'text-red-500' : 'text-gray-500'
        }`}>
          {trend === 'positive' ? <FiTrendingUp className="w-6 h-6 mr-2" /> : 
           trend === 'negative' ? <FiTrendingDown className="w-6 h-6 mr-2" /> : 
           <FiCalendar className="w-6 h-6 mr-2" />}
          <span className="text-sm font-medium">
            {trend === 'positive' ? 'Growing' : trend === 'negative' ? 'Declining' : 'Stable'} Trend
          </span>
        </div>
        <div className="flex items-center justify-center">
          <div className={`px-2 py-1 rounded-full text-xs ${
            confidence >= 80 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
            confidence >= 60 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {confidence.toFixed(0)}% confidence
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showChart && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 200 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-4"
          >
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Balance']}
                  labelStyle={{ color: '#666' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="balance" 
                  stroke={trend === 'positive' ? '#10b981' : trend === 'negative' ? '#ef4444' : '#6b7280'}
                  strokeWidth={3}
                  dot={{ fill: trend === 'positive' ? '#10b981' : trend === 'negative' ? '#ef4444' : '#6b7280', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <motion.div 
          className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <FiCalendar className="w-4 h-4 text-blue-500" />
            <span className={`text-sm font-medium ${projection3Months >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {currency}{Math.abs(projection3Months).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">3 Months</p>
        </motion.div>
        <motion.div 
          className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <FiCalendar className="w-4 h-4 text-purple-500" />
            <span className={`text-sm font-medium ${projection12Months >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {currency}{Math.abs(projection12Months).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">12 Months</p>
        </motion.div>
      </div>

      <ul className="space-y-2">
        <motion.li 
          className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">6 Months</span>
          <span className={`font-semibold ${projection6Months >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currency}{projection6Months.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </motion.li>
        <motion.li 
          className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          whileHover={{ x: 4 }}
          transition={{ duration: 0.2 }}
        >
          <span className="text-sm text-gray-600 dark:text-gray-400">24 Months</span>
          <span className={`font-semibold ${projection24Months >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {currency}{projection24Months.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </span>
        </motion.li>
      </ul>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-3"
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Current balance:</span>
              <span className="font-medium">{currency}{totalBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Monthly net (6M avg):</span>
              <span className={`font-medium ${avgMonthlyNet6M >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currency}{avgMonthlyNet6M.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Monthly net (3M avg):</span>
              <span className={`font-medium ${avgMonthlyNet3M >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currency}{avgMonthlyNet3M.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Projection basis:</span>
              <span className="font-medium">{currency}{avgMonthlyNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/month</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default FutureBalanceProjection;