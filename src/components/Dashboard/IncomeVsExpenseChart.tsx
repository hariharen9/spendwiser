import React, { useState } from 'react';
import { Transaction } from '../../types/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiBarChart2, FiActivity } from 'react-icons/fi';
import { BarChart3 } from 'lucide-react';
import AnimatedNumber from '../Common/AnimatedNumber';

interface IncomeVsExpenseChartProps {
  transactions: Transaction[];
  currency: string;
}

const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({ transactions, currency }) => {
  const [viewMode, setViewMode] = useState<'bar' | 'line'>('bar');
  const [showSavingsRate, setShowSavingsRate] = useState(true);

  const processData = () => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i)); // Fix the order to be chronological
      return { 
        name: d.toLocaleString('default', { month: 'short' }), 
        year: d.getFullYear(), 
        month: d.getMonth(),
        income: 0, 
        expense: 0 
      };
    });

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();
      
      const monthIndex = months.findIndex(m => m.month === txMonth && m.year === txYear);

      if (monthIndex !== -1) {
        if (t.type === 'income') {
          months[monthIndex].income += Math.abs(t.amount);
        } else if (t.type === 'expense' && t.category !== 'Payment' && !t.creditCardPaymentId) {
          months[monthIndex].expense += Math.abs(t.amount);
        }
      }
    });

    return months;
  };

  const data = processData();
  
  // Calculate savings rate for each month
  const dataWithSavings = data.map(month => ({
    ...month,
    savings: month.income - month.expense,
    savingsRate: month.income > 0 ? ((month.income - month.expense) / month.income) * 100 : 0
  }));

  const currentMonth = dataWithSavings[dataWithSavings.length - 1];
  const avgSavingsRate = dataWithSavings.reduce((sum, month) => sum + month.savingsRate, 0) / dataWithSavings.length;

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      {/* Header with controls */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center"><BarChart3 className="w-5 h-5 mr-2" />Income vs Expense</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Last 6 months</p>
        </div>
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('bar')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'bar'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <FiBarChart2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('line')}
            className={`p-2 rounded-md transition-colors ${
              viewMode === 'line'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                : 'text-gray-600 dark:text-gray-300'
            }`}
          >
            <FiActivity className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
          <FiTrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
            <AnimatedNumber
              value={currentMonth?.income || 0}
              currency={currency}
              decimals={0}
            />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
        </div>
        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-center">
          <FiTrendingDown className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">
            <AnimatedNumber
              value={currentMonth?.expense || 0}
              currency={currency}
              decimals={0}
            />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Expenses</p>
        </div>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
          <FiDollarSign className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <p className={`text-xs font-medium ${
            (currentMonth?.savings || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            <AnimatedNumber
              value={Math.abs(currentMonth?.savings || 0)}
              currency={currency}
              decimals={0}
            />
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {(currentMonth?.savings || 0) >= 0 ? 'Saved' : 'Deficit'}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-60 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              {viewMode === 'bar' ? (
                <BarChart data={dataWithSavings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${currency}${value.toLocaleString()}`, 
                      name === 'income' ? 'Income' : name === 'expense' ? 'Expense' : 'Net'
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Income" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="expense" fill="#EF4444" name="Expense" radius={[2, 2, 0, 0]} />
                  {showSavingsRate && <Bar dataKey="savings" fill="#3B82F6" name="Net" radius={[2, 2, 0, 0]} />}
                </BarChart>
              ) : (
                <LineChart data={dataWithSavings} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`}
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#E5E7EB', strokeWidth: 1 }}
                    tickLine={{ stroke: '#E5E7EB' }}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${currency}${value.toLocaleString()}`, 
                      name === 'income' ? 'Income' : 'Expense'
                    ]}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #E5E7EB',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#10B981' }}
                    name="Income"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke="#EF4444" 
                    strokeWidth={3} 
                    dot={{ r: 4, fill: '#EF4444' }}
                    name="Expense"
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Savings Rate Indicator */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500 dark:text-gray-400">Avg Savings Rate</span>
          <span className={`font-semibold text-sm ${
            avgSavingsRate >= 20 ? 'text-green-600 dark:text-green-400' :
            avgSavingsRate >= 10 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {avgSavingsRate.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
          <motion.div 
            className={`h-2 rounded-full ${
              avgSavingsRate >= 20 ? 'bg-green-500' :
              avgSavingsRate >= 10 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(Math.max(avgSavingsRate, 0), 100)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default IncomeVsExpenseChart;