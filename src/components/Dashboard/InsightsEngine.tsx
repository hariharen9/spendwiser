import React, { useState, useEffect } from 'react';
import { Transaction, Budget } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiZap, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiCheckCircle, FiInfo, FiTarget, FiRefreshCw, FiDollarSign } from 'react-icons/fi';

interface InsightsEngineProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: string;
}

interface Insight {
  id: string;
  category: 'spending' | 'budget' | 'savings' | 'trends' | 'opportunities' | 'warnings';
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  message: string;
  value?: number;
  icon: React.ComponentType<any>;
  priority: number; // 1-5, 5 being highest priority
}

const InsightsEngine: React.FC<InsightsEngineProps> = ({ transactions, budgets, currency }) => {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const generateInsights = () => {
      const newInsights: Insight[] = [];
      const thisMonth = new Date().getMonth();
      const today = new Date();
      const currentYear = new Date().getFullYear();

      // Rule 0: No transactions
      if (transactions.length === 0) {
        newInsights.push({
          id: 'no-transactions',
          category: 'opportunities',
          type: 'neutral',
          title: 'Get Started',
          message: "Add some transactions to see your personalized financial insights!",
          icon: FiInfo,
          priority: 5
        });
        setInsights(newInsights);
        return;
      }

      // Enhanced spending analysis
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const spendingByCategory: { [key: string]: { current: number; past3M: number; past6M: number; transactions: number } } = {};
      transactions.forEach(t => {
        if (t.type === 'expense') {
          const txDate = new Date(t.date);
          const category = t.category;
          if (!spendingByCategory[category]) {
            spendingByCategory[category] = { current: 0, past3M: 0, past6M: 0, transactions: 0 };
          }
          if (txDate.getMonth() === thisMonth && txDate.getFullYear() === currentYear) {
            spendingByCategory[category].current += Math.abs(t.amount);
            spendingByCategory[category].transactions++;
          } else if (txDate > threeMonthsAgo) {
            spendingByCategory[category].past3M += Math.abs(t.amount);
          } else if (txDate > sixMonthsAgo) {
            spendingByCategory[category].past6M += Math.abs(t.amount);
          }
        }
      });

      // Rule 1: High spending alerts
      for (const category in spendingByCategory) {
        const avgPast3M = spendingByCategory[category].past3M / 3;
        const current = spendingByCategory[category].current;

        if (avgPast3M > 0 && current > avgPast3M * 1.8) {
          newInsights.push({
            id: `high-spending-${category}`,
            category: 'warnings',
            type: 'warning',
            title: 'Spending Alert',
            message: `Your ${category} spending is 80% higher than your 3-month average`,
            value: current - avgPast3M,
            icon: FiTrendingUp,
            priority: 4
          });
        } else if (avgPast3M > 0 && current < avgPast3M * 0.5) {
          newInsights.push({
            id: `low-spending-${category}`,
            category: 'trends',
            type: 'positive',
            title: 'Spending Reduction',
            message: `Great! You've reduced ${category} spending by 50% this month`,
            value: avgPast3M - current,
            icon: FiTrendingDown,
            priority: 3
          });
        }
      }

      // Rule 2: Enhanced budget analysis
      const daysLeft = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
      const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      const monthProgress = (daysInMonth - daysLeft) / daysInMonth;

      budgets.forEach(b => {
        const spent = transactions
          .filter(t => t.category === b.category && t.type === 'expense' &&
            new Date(t.date).getMonth() === thisMonth &&
            new Date(t.date).getFullYear() === currentYear)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const spentPercentage = b.limit > 0 ? spent / b.limit : 0;

        if (spentPercentage > 0.9 && daysLeft > 7) {
          newInsights.push({
            id: `budget-warning-${b.category}`,
            category: 'budget',
            type: 'warning',
            title: 'Budget Alert',
            message: `You've used ${(spentPercentage * 100).toFixed(0)}% of your ${b.category} budget with ${daysLeft} days remaining`,
            value: b.limit - spent,
            icon: FiAlertTriangle,
            priority: 5
          });
        } else if (spentPercentage > monthProgress + 0.2) {
          newInsights.push({
            id: `budget-pace-${b.category}`,
            category: 'budget',
            type: 'warning',
            title: 'Budget Pacing',
            message: `Your ${b.category} spending is ahead of schedule for this month`,
            icon: FiTarget,
            priority: 3
          });
        } else if (spentPercentage < monthProgress - 0.2 && monthProgress > 0.5) {
          newInsights.push({
            id: `budget-under-${b.category}`,
            category: 'budget',
            type: 'positive',
            title: 'Budget Success',
            message: `You're staying well under budget for ${b.category} this month`,
            icon: FiCheckCircle,
            priority: 2
          });
        }
      });

      // Rule 3: Enhanced savings analysis
      const incomeThisMonth = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
      const expensesThisMonth = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === thisMonth && new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const savingsRate = incomeThisMonth > 0 ? ((incomeThisMonth - expensesThisMonth) / incomeThisMonth) * 100 : 0;

      if (savingsRate > 30) {
        newInsights.push({
          id: 'high-savings',
          category: 'savings',
          type: 'positive',
          title: 'Excellent Savings',
          message: `Outstanding! You're saving ${savingsRate.toFixed(0)}% of your income this month`,
          value: savingsRate,
          icon: FiCheckCircle,
          priority: 4
        });
      } else if (savingsRate > 20) {
        newInsights.push({
          id: 'good-savings',
          category: 'savings',
          type: 'positive',
          title: 'Good Savings Rate',
          message: `You're saving ${savingsRate.toFixed(0)}% of your income - keep it up!`,
          value: savingsRate,
          icon: FiTrendingUp,
          priority: 3
        });
      } else if (savingsRate < 0) {
        newInsights.push({
          id: 'negative-savings',
          category: 'savings',
          type: 'negative',
          title: 'Spending Exceeds Income',
          message: `Your expenses are ${Math.abs(savingsRate).toFixed(0)}% higher than your income this month`,
          value: Math.abs(savingsRate),
          icon: FiAlertTriangle,
          priority: 5
        });
      }

      // Rule 4: Enhanced subscription detection
      const potentialSubscriptions: { [key: string]: { dates: number[]; amount: number; name: string } } = {};
      transactions.forEach(t => {
        if (t.type === 'expense') {
          const roundedAmount = Math.round(t.amount * 100) / 100; // Round to nearest cent
          const key = `${t.name.toLowerCase()}-${roundedAmount}`;
          if (!potentialSubscriptions[key]) {
            potentialSubscriptions[key] = { dates: [], amount: roundedAmount, name: t.name };
          }
          potentialSubscriptions[key].dates.push(new Date(t.date).getTime());
        }
      });

      for (const key in potentialSubscriptions) {
        const sub = potentialSubscriptions[key];
        if (sub.dates.length >= 3) {
          // Check if dates are roughly monthly
          sub.dates.sort((a, b) => a - b);
          const intervals = [];
          for (let i = 1; i < sub.dates.length; i++) {
            intervals.push(sub.dates[i] - sub.dates[i - 1]);
          }
          const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
          const monthInMs = 30 * 24 * 60 * 60 * 1000;

          if (Math.abs(avgInterval - monthInMs) < monthInMs * 0.3) { // Within 30% of a month
            newInsights.push({
              id: `subscription-${key}`,
              category: 'opportunities',
              type: 'neutral',
              title: 'Subscription Detected',
              message: `"${sub.name}" appears to be a recurring ${currency}${sub.amount} subscription`,
              value: sub.amount,
              icon: FiRefreshCw,
              priority: 2
            });
          }
        }
      }

      // Rule 5: Top spending insights
      let topCategory = '';
      let maxSpent = 0;
      for (const category in spendingByCategory) {
        if (spendingByCategory[category].current > maxSpent) {
          maxSpent = spendingByCategory[category].current;
          topCategory = category;
        }
      }
      if (topCategory && maxSpent > 0) {
        newInsights.push({
          id: 'top-category',
          category: 'spending',
          type: 'neutral',
          title: 'Top Spending Category',
          message: `${topCategory} accounts for ${currency}${maxSpent.toFixed(2)} of your spending this month`,
          value: maxSpent,
          icon: FiDollarSign,
          priority: 1
        });
      }

      // Rule 6: Weekend vs weekday spending
      const weekendSpending = transactions
        .filter(t => {
          const date = new Date(t.date);
          const day = date.getDay();
          return t.type === 'expense' && date.getMonth() === thisMonth && (day === 0 || day === 6);
        })
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      const weekdaySpending = expensesThisMonth - weekendSpending;

      if (weekendSpending > weekdaySpending * 0.4) { // Weekend spending > 40% of weekday spending
        newInsights.push({
          id: 'weekend-spending',
          category: 'trends',
          type: 'neutral',
          title: 'Weekend Spending Pattern',
          message: `You spend significantly more on weekends (${currency}${weekendSpending.toFixed(2)})`,
          value: weekendSpending,
          icon: FiTrendingUp,
          priority: 2
        });
      }

      // Sort insights by priority (highest first) and limit to top 8
      const sortedInsights = newInsights
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 8);

      setInsights(sortedInsights);
    };

    generateInsights();
  }, [transactions, budgets, currency]);

  const toggleDetails = (insightId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [insightId]: !prev[insightId]
    }));
  };

  const filteredInsights = selectedCategory === 'all'
    ? insights
    : insights.filter(insight => insight.category === selectedCategory);

  const categories = ['all', 'warnings', 'budget', 'savings', 'spending', 'trends', 'opportunities'];

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      all: 'All',
      warnings: 'Warnings',
      budget: 'Budget',
      savings: 'Savings',
      spending: 'Spending',
      trends: 'Trends',
      opportunities: 'Opportunities'
    };
    return labels[category] || category;
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'border-l-green-500 bg-green-50 dark:bg-green-900/20';
      case 'negative': return 'border-l-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-blue-500';
    }
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
          <FiZap className="w-5 h-5 mr-2" />
          Insights
        </h3>
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {filteredInsights.length} insight{filteredInsights.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {filteredInsights.length > 0 ? (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredInsights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`border-l-4 rounded-lg p-4 ${getInsightColor(insight.type)} hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => toggleDetails(insight.id)}
                >
                  <div className="flex items-start space-x-3">
                    <IconComponent className={`w-5 h-5 mt-0.5 ${getIconColor(insight.type)} flex-shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {insight.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {insight.value && (
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${insight.type === 'positive' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' :
                                insight.type === 'negative' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' :
                                  insight.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200' :
                                    'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200'
                              }`}>
                              {insight.category === 'savings' && insight.value ? `${insight.value.toFixed(0)}%` :
                                insight.value ? `${currency}${Math.abs(insight.value).toLocaleString()}` : ''}
                            </span>
                          )}
                          <div className={`w-2 h-2 rounded-full ${insight.priority >= 4 ? 'bg-red-400' :
                              insight.priority >= 3 ? 'bg-yellow-400' :
                                'bg-blue-400'
                            }`} />
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                        {insight.message}
                      </p>

                      <AnimatePresence>
                        {showDetails[insight.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>Category: {getCategoryLabel(insight.category)}</span>
                              <span>Priority: {insight.priority}/5</span>
                            </div>
                            {insight.category === 'budget' && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                💡 Consider adjusting your spending habits or budget allocation for this category.
                              </div>
                            )}
                            {insight.category === 'opportunities' && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                💡 Review this recurring expense to ensure it's still providing value.
                              </div>
                            )}
                            {insight.category === 'savings' && insight.type === 'positive' && (
                              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                💡 Consider investing this surplus or building your emergency fund.
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8">
          <FiZap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-[#888888]">
            {selectedCategory === 'all'
              ? "No insights available at the moment."
              : `No ${getCategoryLabel(selectedCategory).toLowerCase()} insights found.`}
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
            Add more transactions to get personalized insights.
          </p>
        </div>
      )}

      {insights.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Insights update automatically as you add transactions</span>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span>High Priority</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-yellow-400" />
                <span>Medium</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Low</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default InsightsEngine;