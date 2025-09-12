import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types/types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiBarChart2, FiPieChart, FiTrendingUp, FiDollarSign } from 'react-icons/fi';

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

interface SpendingChartProps {
  transactions: Transaction[];
  currency: string;
  timeRange: 'month' | 'quarter' | 'year';
  setTimeRange: (range: 'month' | 'quarter' | 'year') => void;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions, currency, timeRange, setTimeRange }) => {
  const [viewMode, setViewMode] = useState<'pie' | 'bar'>('pie');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);

  const categoryColors: { [key: string]: string } = {
    'Groceries': '#007BFF',
    'Food & Dining': '#00C9A7',
    'Transportation': '#28A745',
    'Entertainment': '#FFC107',
    'Shopping': '#DC3545',
    'Utilities': '#17A2B8',
    'Health': '#6F42C1',
    'Other': '#FD7E14',
  };

  const data: ChartData[] = (() => {
    const aggregatedData = transactions.reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      const amount = Math.abs(t.amount);
      if (existing) {
        existing.value += amount;
      } else {
        acc.push({
          name: t.category,
          value: amount,
          color: categoryColors[t.category] || '#6C757D',
        });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

    const total = aggregatedData.reduce((sum, item) => sum + item.value, 0);
    const dataWithPercentages = aggregatedData.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
    }));

    return dataWithPercentages.sort((a, b) => b.value - a.value);
  })();

  // Calculate total spending
  const totalSpending = data.reduce((sum, item) => sum + item.value, 0);

  // Find highest spending category
  const highestSpendingCategory = data.length > 0 ? data[0] : null;

  

  // Reset selection when data changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [timeRange]);

  const handleTimeRangeChange = (range: 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'pie' | 'bar') => {
    setViewMode(mode);
  };

  // Handle category selection
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  if (data.length === 0) {
    return (
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-full"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
      >
        <div className="text-center">
          <FiDollarSign className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-[#888888]">No spending data for this period.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
            Add some transactions to see your spending insights!
          </p>
        </div>
      </motion.div>
    );
  }

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#1A1A1A] p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-[#F5F5F5]">{data.name}</p>
          <p className="text-[#007BFF]">{currency}{data.value.toLocaleString()}</p>
          <p className="text-gray-500 dark:text-[#888888]">{data.percentage}% of total spending</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend component
  const CustomLegend = () => (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {data.map((entry, index) => (
        <motion.div
          key={`legend-${index}`}
          className={`flex items-center px-3 py-1 rounded-full cursor-pointer transition-all ${
            selectedCategory === entry.name 
              ? 'bg-gray-100 dark:bg-[#1A1A1A] shadow' 
              : 'hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
          }`}
          style={{
            border: selectedCategory === entry.name ? `2px solid ${entry.color}` : '1px solid #E5E7EB'
          }}
          onClick={() => handleCategorySelect(entry.name)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div 
            className="w-3 h-3 rounded-full mr-2" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-[#F5F5F5]">
            {entry.name}
          </span>
        </motion.div>
      ))}
    </div>
  );

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      {/* Header with title and controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">Spending Insights</h3>
          <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">
            {timeRange === 'month' && 'This month'}
            {timeRange === 'quarter' && 'This quarter'}
            {timeRange === 'year' && 'This year'}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          <div className="flex bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-1">
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeRange === 'month'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
              aria-label="Month view"
            >
              Month
            </button>
            <button
              onClick={() => handleTimeRangeChange('quarter')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeRange === 'quarter'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
              aria-label="Quarter view"
            >
              Quarter
            </button>
            <button
              onClick={() => handleTimeRangeChange('year')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeRange === 'year'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
              aria-label="Year view"
            >
              Year
            </button>
          </div>
          
          <div className="flex bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('pie')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'pie'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
              aria-label="Pie chart view"
            >
              <FiPieChart className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('bar')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'bar'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
              aria-label="Bar chart view"
            >
              <FiBarChart2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats summary - very small cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded p-2 border border-blue-100 dark:border-blue-900/50"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded mr-2">
              <FiDollarSign className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-sm font-bold text-gray-900 dark:text-[#F5F5F5]">
                {currency}{totalSpending.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {highestSpendingCategory && (
          <motion.div 
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded p-2 border border-purple-100 dark:border-purple-900/50"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center">
              <div 
                className="p-1.5 rounded mr-2"
                style={{ backgroundColor: `${highestSpendingCategory.color}20` }}
              >
                <FiTrendingUp className="h-3 w-3" style={{ color: highestSpendingCategory.color }} />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Top</p>
                <p className="text-sm font-bold text-gray-900 dark:text-[#F5F5F5] truncate max-w-[80px]">
                  {highestSpendingCategory.name}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded p-2 border border-green-100 dark:border-green-900/50"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/50 rounded mr-2">
              <div className="h-3 w-3 flex items-center justify-center text-green-600 dark:text-green-400 text-[10px] font-bold">
                {data.length}
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Categories</p>
              <p className="text-sm font-bold text-gray-900 dark:text-[#F5F5F5]">
                {data.length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Chart container - responsive height */}
      <div className="h-80 md:h-96">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${viewMode}-${animationKey}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {viewMode === 'pie' ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    onMouseEnter={(data) => handleCategorySelect(data.name)}
                    onMouseLeave={() => setSelectedCategory(null)}
                  >
                    {data.map((entry, index) => {
                      const isSelected = selectedCategory === entry.name;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          stroke={isSelected ? '#fff' : 'none'}
                          strokeWidth={isSelected ? 3 : 0}
                          opacity={selectedCategory && !isSelected ? 0.5 : 1}
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={60}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${currency}${value.toLocaleString()}`}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    name="Amount"
                    onMouseEnter={(data) => handleCategorySelect(data.name)}
                    onMouseLeave={() => setSelectedCategory(null)}
                  >
                    {data.map((entry, index) => {
                      const isSelected = selectedCategory === entry.name;
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color} 
                          opacity={selectedCategory && !isSelected ? 0.5 : 1}
                          stroke={isSelected ? '#fff' : 'none'}
                          strokeWidth={isSelected ? 2 : 0}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Legend and category details */}
      <div className="mt-6">
        <CustomLegend />
        
        {selectedCategory && (
          <motion.div 
            className="mt-4 p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {data
              .filter(item => item.name === selectedCategory)
              .map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-2" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                      {item.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-[#F5F5F5]">
                      {currency}{item.value.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-[#888888]">
                      {item.percentage}% of total
                    </p>
                  </div>
                </div>
              ))
            }
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SpendingChart;