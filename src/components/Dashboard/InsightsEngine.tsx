import React, { useState, useEffect } from 'react';
import { Transaction, Budget } from '../../types/types';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';

interface InsightsEngineProps {
  transactions: Transaction[];
  budgets: Budget[];
  currency: string;
}

const InsightsEngine: React.FC<InsightsEngineProps> = ({ transactions, budgets, currency }) => {
  const [insights, setInsights] = useState<string[]>([]);

  useEffect(() => {
    const generateInsights = () => {
      const newInsights: string[] = [];

      // Rule 1: High spending in a category
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      const thisMonth = new Date().getMonth();

      const spendingByCategory: { [key: string]: { current: number; past: number } } = {};

      transactions.forEach(t => {
        if (t.type === 'expense') {
          const txDate = new Date(t.date);
          const category = t.category;
          if (!spendingByCategory[category]) {
            spendingByCategory[category] = { current: 0, past: 0 };
          }
          if (txDate.getMonth() === thisMonth) {
            spendingByCategory[category].current += Math.abs(t.amount);
          } else if (txDate > threeMonthsAgo) {
            spendingByCategory[category].past += Math.abs(t.amount);
          }
        }
      });

      for (const category in spendingByCategory) {
        const avgPast = spendingByCategory[category].past / 3;
        if (avgPast > 0 && spendingByCategory[category].current > avgPast * 1.5) {
          newInsights.push(`Heads up! Your spending on ${category} is significantly higher than usual this month.`);
        }
      }

      // Rule 2: Approaching budget limit
      const today = new Date();
      const daysLeft = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() - today.getDate();
      budgets.forEach(b => {
        const spent = transactions
          .filter(t => t.category === b.category && t.type === 'expense' && new Date(t.date).getMonth() === thisMonth)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        if (b.limit > 0 && spent / b.limit > 0.9 && daysLeft > 7) {
          newInsights.push(`You've used over 90% of your ${b.category} budget with ${daysLeft} days left in the month.`);
        }
      });

      // Rule 3: Good savings rate
      const incomeThisMonth = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === thisMonth)
        .reduce((sum, t) => sum + t.amount, 0);
      const expensesThisMonth = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === thisMonth)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      if (incomeThisMonth > expensesThisMonth * 2 && incomeThisMonth > 0) {
        newInsights.push('Great job! Your savings rate is high this month.');
      }

      setInsights(newInsights);
    };

    generateInsights();
  }, [transactions, budgets]);

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Personalized Insights</h3>
      {insights.length > 0 ? (
        <ul className="space-y-3">
          {insights.map((insight, index) => (
            <li key={index} className="text-sm text-gray-800 dark:text-gray-200">- {insight}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-[#888888]">No special insights at the moment.</p>
      )}
    </motion.div>
  );
};

export default InsightsEngine;