import React, { useState } from 'react';
import { Transaction } from '../../types/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiBarChart2, FiList } from 'react-icons/fi';
import { TrendingUp } from 'lucide-react';
import CategoryTransactionsModal from './CategoryTransactionsModal';

interface TopSpendingCategoriesProps {
  transactions: Transaction[];
  currency: string;
}

const TopSpendingCategories: React.FC<TopSpendingCategoriesProps> = ({ transactions, currency }) => {
  const [viewMode, setViewMode] = useState<'chart' | 'list'>('list');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setIsModalOpen(true);
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      'Groceries': '🛒',
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Utilities': '⚡',
      'Health': '🏥',
      'Other': '📦'
    };
    return iconMap[category] || '💰';
  };

  const getCategoryColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-purple-500 to-purple-600', 
      'from-green-500 to-green-600',
      'from-yellow-500 to-yellow-600',
      'from-red-500 to-red-600'
    ];
    return colors[index] || 'from-gray-500 to-gray-600';
  };

  const processData = () => {
    const categorySpending: { [key: string]: number } = {};
    const currentMonthTxs = transactions.filter(t => {
      const txDate = new Date(t.date);
      const today = new Date();
      return txDate.getMonth() === today.getMonth() && 
             txDate.getFullYear() === today.getFullYear() && 
             t.type === 'expense' && 
             t.category !== 'Payment' && 
             !t.creditCardPaymentId;
    });

    currentMonthTxs.forEach(t => {
      const amount = Math.abs(t.amount);
      if (categorySpending[t.category]) {
        categorySpending[t.category] += amount;
      } else {
        categorySpending[t.category] = amount;
      }
    });

    return Object.entries(categorySpending)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const topCategories = processData();
  const totalSpent = topCategories.reduce((sum, cat) => sum + cat.amount, 0);

  if (topCategories.length === 0) {
    return (
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Top Categories</h3>
        <div className="text-center py-6">
          <FiBarChart2 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-[#888888] mb-2">No spending this month</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Your top categories will appear here</p>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
      >
        {/* Header with view toggle */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center"><TrendingUp className="w-5 h-5 mr-2" />Top Categories</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">This month</p>
          </div>
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <FiList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'chart'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow'
                  : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              <FiBarChart2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-3"
            >
              {topCategories.map((category, index) => {
                const percentage = totalSpent > 0 ? (category.amount / totalSpent) * 100 : 0;
                const isHovered = hoveredCategory === category.name;
                
                return (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isHovered
                        ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 shadow-sm'
                        : 'bg-white dark:bg-gray-800/20 border-gray-200 dark:border-gray-700'
                    }`}
                    onMouseEnter={() => setHoveredCategory(category.name)}
                    onMouseLeave={() => setHoveredCategory(null)}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleCategoryClick(category.name)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-lg">{getCategoryIcon(category.name)}</div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{category.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{percentage.toFixed(1)}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                          {currency}{category.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">#{index + 1}</p>
                      </div>
                    </div>
                    
                    {/* Progress bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div 
                        className={`h-2 rounded-full bg-gradient-to-r ${getCategoryColor(index)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </motion.div>
                );
              })}
              
              {/* Summary */}
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total Spent</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {currency}{totalSpent.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="chart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{ width: '100%', height: 280 }}
            >
              <ResponsiveContainer>
                <BarChart
                  layout="vertical"
                  data={topCategories}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  onClick={(data) => data && handleCategoryClick(data.activeLabel as string)}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis type="number" tickFormatter={(value) => `${currency}${(value / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip 
                    formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Bar dataKey="amount" fill="url(#colorGradient)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="5%" stopColor="#007BFF" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#007BFF" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <CategoryTransactionsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        transactions={transactions}
        currency={currency}
      />
    </>
  );
};

export default TopSpendingCategories;