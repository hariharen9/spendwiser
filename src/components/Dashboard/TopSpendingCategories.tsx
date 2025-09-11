import React from 'react';
import { Transaction } from '../../types/types';

interface TopSpendingCategoriesProps {
  transactions: Transaction[];
}

const TopSpendingCategories: React.FC<TopSpendingCategoriesProps> = ({ transactions }) => {
  const processData = () => {
    const categorySpending: { [key: string]: number } = {};
    const currentMonthTxs = transactions.filter(t => {
      const txDate = new Date(t.date);
      const today = new Date();
      return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear() && t.type === 'expense';
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
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  };

  const topCategories = processData();

  if (topCategories.length === 0) {
    return (
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Top Spending Categories</h3>
        <p className="text-gray-500 dark:text-[#888888]">No spending this month.</p>
      </div>
    );
  }

  const maxAmount = Math.max(...topCategories.map(([, amount]) => amount));

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Top Spending Categories (This Month)</h3>
      <div className="space-y-4">
        {topCategories.map(([category, amount]) => {
          const percentage = maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
          return (
            <div key={category} className="w-full">
              <div className="flex justify-between mb-1">
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{category}</span>
                 <span className="text-sm font-medium text-gray-700 dark:text-gray-300">₹{amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopSpendingCategories;
