import React, { useState, useEffect, useMemo } from 'react';
import { Transaction } from '../../types/types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, Area, AreaChart
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { 
  FiBarChart2, FiPieChart, FiTrendingUp, FiDollarSign, FiDownload, FiZap, 
  FiChevronDown, FiChevronUp, FiTarget, FiAlertTriangle, FiTrendingDown,
  FiActivity, FiCalendar, FiFilter, FiRefreshCw
} from 'react-icons/fi';

interface ChartData {
  name: string;
  value: number;
  color: string;
  percentage: number;
  [key: string]: any;
}

interface SpendingChartProps {
  transactions: Transaction[];
  currency: string;
  timeRange: 'month' | 'quarter' | 'year';
  setTimeRange: (range: 'month' | 'quarter' | 'year') => void;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions, currency, timeRange, setTimeRange }) => {
  const [viewMode, setViewMode] = useState<'pie' | 'bar' | 'trend'>('pie');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  // Removed showComparison state
  const [showInsights, setShowInsights] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Extended color palette with 50+ distinct colors for better category differentiation
  const extendedColorPalette = [
    '#007BFF', '#00C9A7', '#28A745', '#FFC107', '#DC3545', '#17A2B8', '#6F42C1', '#FD7E14',
    '#20C997', '#6610F2', '#E83E8C', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFBE0B', '#FB5607',
    '#FF006E', '#8338EC', '#3A86FF', '#38B000', '#9EF01A', '#FF9E00', '#FF5400', '#7209B7',
    '#0DCAF0', '#ADB5BD', '#6C757D', '#FF6B35', '#F72585', '#7209B7', '#3A0CA3', '#4361EE',
    '#4CC9F0', '#560BAD', '#4895EF', '#4361EE', '#3F37C9', '#480CA8', '#560BAD', '#7209B7',
    '#F72585', '#B5179E', '#7209B7', '#560BAD', '#480CA8', '#3A0CA3', '#3F37C9', '#4361EE',
    '#4895EF', '#4CC9F0', '#606C38', '#283618', '#BC6C25', '#DDA15E', '#2A9D8F', '#E9C46A',
    '#F4A261', '#E76F51', '#264653', '#2A9D8F', '#E9C46A', '#F4A261', '#E76F51', '#1D3557',
    '#457B9D', '#A8DADC', '#F1FAEE', '#E63946', '#A8DADC', '#457B9D', '#1D3557', '#F25F5C',
    '#FFE066', '#247BA0', '#70C1B3', '#B2DBBF', '#F3FFBD', '#FF165D', '#3DAE8B', '#114B5F'
  ];

  // Function to get a random color from the palette
  const getRandomColor = () => {
    const randomIndex = Math.floor(Math.random() * extendedColorPalette.length);
    return extendedColorPalette[randomIndex];
  };

  // Function to get color for a category (uses predefined colors for known categories, random for others)
  const getCategoryColor = (categoryName: string) => {
    const predefinedColors: { [key: string]: string } = {
      'Groceries': '#007BFF',
      'Food & Dining': '#00C9A7',
      'Transportation': '#28A745',
      'Entertainment': '#FFC107',
      'Shopping': '#DC3545',
      'Utilities': '#17A2B8',
      'Health': '#6F42C1',
      'Other': '#FD7E14',
    };

    // Return predefined color if exists, otherwise return a random color
    return predefinedColors[categoryName] || getRandomColor();
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
          color: getCategoryColor(t.category),
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

  // Generate comparison data (previous period)
  const comparisonData = useMemo(() => {
    const now = new Date();
    let startDate: Date, endDate: Date;
    
    if (timeRange === 'month') {
      // Previous month
      const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      startDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth(), 1);
      endDate = new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 0);
    } else if (timeRange === 'quarter') {
      // Previous quarter
      const currentQuarter = Math.floor(now.getMonth() / 3);
      let prevQuarter = currentQuarter - 1;
      let year = now.getFullYear();
      
      if (prevQuarter < 0) {
        prevQuarter = 3;
        year = year - 1;
      }
      
      startDate = new Date(year, prevQuarter * 3, 1);
      endDate = new Date(year, (prevQuarter + 1) * 3, 0);
    } else {
      // Previous year
      startDate = new Date(now.getFullYear() - 1, 0, 1);
      endDate = new Date(now.getFullYear() - 1, 11, 31);
    }

    const prevTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startDate && txDate <= endDate && t.type === 'expense';
    });

    const prevData = prevTransactions.reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      const amount = Math.abs(t.amount);
      if (existing) {
        existing.value += amount;
      } else {
        acc.push({
          name: t.category,
          value: amount,
          color: getCategoryColor(t.category),
        });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

    return prevData;
  }, [transactions, timeRange]);

  // Generate AI insights
  const insights = useMemo(() => {
    const insights: string[] = [];
    const prevTotal = comparisonData.reduce((sum, item) => sum + item.value, 0);
    const changePercent = prevTotal > 0 ? ((totalSpending - prevTotal) / prevTotal) * 100 : 0;

    if (Math.abs(changePercent) > 20) {
      insights.push(
        changePercent > 0 
          ? `📈 Spending increased by ${Math.round(changePercent)}% compared to last ${timeRange}`
          : `📉 Great job! Spending decreased by ${Math.round(Math.abs(changePercent))}% compared to last ${timeRange}`
      );
    }

    if (highestSpendingCategory && highestSpendingCategory.percentage > 40) {
      insights.push(`🎯 ${highestSpendingCategory.name} accounts for ${highestSpendingCategory.percentage}% of your spending - consider setting a budget`);
    }

    const smallCategories = data.filter(d => d.percentage < 5).length;
    if (smallCategories > 5) {
      insights.push(`🔍 You have ${smallCategories} small spending categories - consider consolidating for better tracking`);
    }

    if (data.length > 10) {
      insights.push(`📊 You're tracking ${data.length} categories - great for detailed insights!`);
    }

    return insights;
  }, [data, comparisonData, totalSpending, highestSpendingCategory, timeRange]);

  // Generate trend data for line chart
  const trendData = useMemo(() => {
    const now = new Date();
    const periods: { name: string; value: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      let periodStart: Date, periodEnd: Date, periodName: string;
      
      if (timeRange === 'month') {
        periodStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        periodEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        periodName = periodStart.toLocaleDateString('en-US', { month: 'short' });
      } else if (timeRange === 'quarter') {
        const quarterStart = Math.floor(now.getMonth() / 3) - i;
        periodStart = new Date(now.getFullYear(), quarterStart * 3, 1);
        periodEnd = new Date(now.getFullYear(), (quarterStart + 1) * 3, 0);
        periodName = `Q${quarterStart + 1}`;
      } else {
        periodStart = new Date(now.getFullYear() - i, 0, 1);
        periodEnd = new Date(now.getFullYear() - i, 11, 31);
        periodName = (now.getFullYear() - i).toString();
      }

      const periodTransactions = transactions.filter(t => {
        const txDate = new Date(t.date);
        return txDate >= periodStart && txDate <= periodEnd && t.type === 'expense';
      });

      const periodTotal = periodTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      periods.push({ name: periodName, value: periodTotal });
    }

    return periods;
  }, [transactions, timeRange]);

  // Export functionality
  const handleExport = async () => {
    setIsExporting(true);
    
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create CSV data
    const csvData = [
      ['Category', 'Amount', 'Percentage'],
      ...data.map(item => [item.name, item.value.toString(), `${item.percentage}%`])
    ];
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spending-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    setIsExporting(false);
  };

  

  // Reset selection when data changes
  useEffect(() => {
    setSelectedCategory(null);
  }, [timeRange]);

  const handleTimeRangeChange = (range: 'month' | 'quarter' | 'year') => {
    setTimeRange(range);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'pie' | 'bar' | 'trend') => {
    setViewMode(mode);
    setAnimationKey(prevKey => prevKey + 1);
  };

  // Handle category selection (for legend clicks)
  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(selectedCategory === categoryName ? null : categoryName);
  };

  // Handle chart hover (separate from selection)
  const handleChartHover = (categoryName: string | null) => {
    // We'll use a different state for hover effects to prevent jittering
    // For now, we'll just keep the existing behavior but can optimize further if needed
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
      {/* Enhanced Header with title and controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">Spending Insights</h3>
            <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">
              {timeRange === 'month' && 'This month'}
              {timeRange === 'quarter' && 'This quarter'}
              {timeRange === 'year' && 'This year'}
              {comparisonData.length > 0 && (
                <span className="ml-2 text-xs">
                  vs {comparisonData.reduce((sum, item) => sum + item.value, 0) > totalSpending ? '📉' : '📈'} prev {timeRange}
                </span>
              )}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-1">
            <button
              onClick={() => handleTimeRangeChange('month')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                timeRange === 'month'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
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
            >
              Year
            </button>
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 dark:bg-[#1A1A1A] rounded-lg p-1">
            <button
              onClick={() => handleViewModeChange('pie')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'pie'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
              title="Pie Chart"
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
              title="Bar Chart"
            >
              <FiBarChart2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleViewModeChange('trend')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'trend'
                  ? 'bg-white dark:bg-[#242424] text-gray-900 dark:text-[#F5F5F5] shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
              }`}
              title="Trend Chart"
            >
              <FiActivity className="h-4 w-4" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <motion.button
              onClick={handleExport}
              disabled={isExporting}
              className="p-2 rounded-lg bg-green-500 text-white shadow-lg shadow-green-500/25 hover:bg-green-600 hover:shadow-xl hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isExporting ? 1 : 1.05 }}
              whileTap={{ scale: isExporting ? 1 : 0.95 }}
              title="Export data"
            >
              {isExporting ? (
                <FiRefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <FiDownload className="h-4 w-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats summary - very small cards */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <motion.div 
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded p-1 sm:p-2 border border-blue-100 dark:border-blue-900/50"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-1 bg-blue-100 dark:bg-blue-900/50 rounded mr-1 sm:mr-2">
              <FiDollarSign className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#F5F5F5]">
                {currency}{totalSpending.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        {highestSpendingCategory && (
          <motion.div 
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded p-1 sm:p-2 border border-purple-100 dark:border-purple-900/50"
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center">
              <div 
                className="p-1 rounded mr-1 sm:mr-2"
                style={{ backgroundColor: `${highestSpendingCategory.color}20` }}
              >
                <FiTrendingUp className="h-3 w-3" style={{ color: highestSpendingCategory.color }} />
              </div>
              <div>
                <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Top</p>
                <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#F5F5F5] truncate max-w-[60px] sm:max-w-[80px]">
                  {highestSpendingCategory.name}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div 
          className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded p-1 sm:p-2 border border-green-100 dark:border-green-900/50"
          whileHover={{ y: -2 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center">
            <div className="p-1 bg-green-100 dark:bg-green-900/50 rounded mr-1 sm:mr-2">
              <div className="h-3 w-3 flex items-center justify-center text-green-600 dark:text-green-400 text-[8px] sm:text-[10px] font-bold">
                {data.length}
              </div>
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">Categories</p>
              <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-[#F5F5F5]">
                {data.length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Enhanced Chart container with multiple views */}
      <div className="h-80 md:h-96 relative">
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
            ) : viewMode === 'bar' ? (
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
                  <Bar dataKey="value" name="Current" fill="#007BFF" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={trendData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${currency}${value.toLocaleString()}`} />
                  <Tooltip 
                    formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Spending']}
                    labelStyle={{ color: '#374151' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#007BFF" 
                    fill="url(#colorGradient)" 
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#007BFF" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#007BFF" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Chart Labels removed */}
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
              .map((item, index) => {
                const prevItem = comparisonData.find(comp => comp.name === item.name);
                const change = prevItem ? ((item.value - prevItem.value) / prevItem.value) * 100 : 0;
                
                return (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-2">
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
                    
                    {prevItem && Math.abs(change) > 5 && (
                      <div className={`flex items-center text-xs ${
                        change > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {change > 0 ? <FiTrendingUp className="w-3 h-3 mr-1" /> : <FiTrendingDown className="w-3 h-3 mr-1" />}
                        {Math.abs(change).toFixed(1)}% vs last {timeRange}
                      </div>
                    )}
                  </div>
                );
              })
            }
          </motion.div>
        )}
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* AI Insights Panel */}
            {insights.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <FiZap className="w-4 h-4 text-yellow-500" />
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">AI Insights</h4>
                </div>
                <div className="space-y-2">
                  {insights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30"
                    >
                      <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Categories Analysis */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3 flex items-center gap-2">
                  <FiTarget className="w-4 h-4 text-green-500" />
                  Top Categories
                </h4>
                <div className="space-y-2">
                  {data.slice(0, 5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {currency}{item.value.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">{item.percentage}%</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Spending Patterns */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3 flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-purple-500" />
                  Spending Patterns
                </h4>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Average per category</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {currency}{Math.round(totalSpending / data.length).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Categories tracked</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{data.length}</span>
                    </div>
                  </div>

                  {comparisonData.length > 0 && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">vs Previous {timeRange}</span>
                        <span className={`text-sm font-medium ${
                          totalSpending > comparisonData.reduce((sum, item) => sum + item.value, 0)
                            ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {totalSpending > comparisonData.reduce((sum, item) => sum + item.value, 0) ? '+' : ''}
                          {currency}{(totalSpending - comparisonData.reduce((sum, item) => sum + item.value, 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Quick Actions</h4>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  onClick={() => {
                    setShowInsights(!showInsights);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    showInsights 
                      ? 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiZap className="w-3 h-3 mr-1 inline" />
                  {showInsights ? 'Hide Insights' : 'More Insights'}
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    // Switch to trend view to show spending patterns
                    setViewMode('trend');
                    setAnimationKey(prevKey => prevKey + 1);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    viewMode === 'trend'
                      ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/50'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiTarget className="w-3 h-3 mr-1 inline" />
                  View Trends
                </motion.button>
                
                <motion.button
                  onClick={() => {
                    // Switch to different time ranges to analyze patterns
                    const nextRange = timeRange === 'month' ? 'quarter' : timeRange === 'quarter' ? 'year' : 'month';
                    setTimeRange(nextRange);
                  }}
                  className="px-3 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiCalendar className="w-3 h-3 mr-1 inline" />
                  Switch Period
                </motion.button>
              </div>
            </div>

            {/* Additional Insights Section */}
            <AnimatePresence>
              {showInsights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3 flex items-center gap-2">
                    <FiZap className="w-4 h-4 text-yellow-500" />
                    Advanced Insights
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                      <h5 className="text-xs font-semibold text-yellow-800 dark:text-yellow-200 mb-2">Spending Velocity</h5>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        You're spending {currency}{(totalSpending / 30).toFixed(0)} per day on average this {timeRange}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                      <h5 className="text-xs font-semibold text-indigo-800 dark:text-indigo-200 mb-2">Category Diversity</h5>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {data.length > 8 ? 'High diversity' : data.length > 5 ? 'Moderate diversity' : 'Low diversity'} - {data.length} categories tracked
                      </p>
                    </div>
                    {comparisonData.length > 0 && (
                      <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-900/30">
                        <h5 className="text-xs font-semibold text-green-800 dark:text-green-200 mb-2">Trend Analysis</h5>
                        <p className="text-xs text-gray-700 dark:text-gray-300">
                          {totalSpending > comparisonData.reduce((sum, item) => sum + item.value, 0) 
                            ? 'Spending is trending upward' 
                            : 'Spending is trending downward'} compared to last {timeRange}
                        </p>
                      </div>
                    )}
                    <div className="p-3 bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 rounded-lg border border-pink-100 dark:border-pink-900/30">
                      <h5 className="text-xs font-semibold text-pink-800 dark:text-pink-200 mb-2">Focus Recommendation</h5>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {highestSpendingCategory 
                          ? `Consider reviewing ${highestSpendingCategory.name} expenses (${highestSpendingCategory.percentage}% of total)`
                          : 'Great job maintaining balanced spending across categories'}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle More/Less Button at Bottom */}
      <div className="flex justify-center mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <FiChevronUp className="w-3 h-3" />
            </>
          ) : (
            <>
              <span>Show more</span>
              <FiChevronDown className="w-3 h-3" />
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SpendingChart;