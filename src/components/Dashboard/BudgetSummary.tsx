import React from 'react';
import { Budget, Transaction } from '../../types/types';

interface BudgetSummaryProps {
  budgets: Budget[];
  transactions: Transaction[];
  currency: string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budgets, transactions, currency }) => {

  const getSpentAmount = (category: string) => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  if (budgets.length === 0) {
    return (
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Budget Summary</h3>
        <p className="text-gray-500 dark:text-[#888888]">No budgets set up yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Budget Summary</h3>
      <div className="space-y-4">
        {budgets.map(budget => {
          const spent = getSpentAmount(budget.category);
          const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
          const progressBarColor = percentage > 100 ? 'bg-red-500' : 'bg-green-500';

          return (
            <div key={budget.id}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{budget.category}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{currency}{spent.toLocaleString()} / {currency}{budget.limit.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div className={`${progressBarColor} h-2.5 rounded-full`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetSummary;