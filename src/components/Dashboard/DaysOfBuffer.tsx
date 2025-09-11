import React from 'react';
import { Transaction, Account } from '../../types/types';

interface DaysOfBufferProps {
  transactions: Transaction[];
  accounts: Account[];
  currency: string;
}

const DaysOfBuffer: React.FC<DaysOfBufferProps> = ({ transactions, accounts, currency }) => {
  const calculateDaysOfBuffer = () => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const expensesLast90Days = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && txDate > ninetyDaysAgo;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgDailyExpense = expensesLast90Days / 90;

    if (avgDailyExpense === 0) {
      return { days: Infinity, avgDailyExpense: 0 };
    }

    const days = totalBalance / avgDailyExpense;
    return { days, avgDailyExpense };
  };

  const { days, avgDailyExpense } = calculateDaysOfBuffer();

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Days of Buffer</h3>
      <div className="text-center">
        <p className="text-4xl font-bold text-green-500">{isFinite(days) ? Math.floor(days) : '∞'}</p>
        <p className="text-gray-500 dark:text-[#888888]">days</p>
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Based on an average daily spend of <strong>{currency}{avgDailyExpense.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> over the last 90 days.</p>
      </div>
    </div>
  );
};

export default DaysOfBuffer;