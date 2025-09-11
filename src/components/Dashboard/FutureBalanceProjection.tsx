import React from 'react';
import { Transaction, Account } from '../../types/types';

interface FutureBalanceProjectionProps {
  transactions: Transaction[];
  accounts: Account[];
}

const FutureBalanceProjection: React.FC<FutureBalanceProjectionProps> = ({ transactions, accounts }) => {
  const calculateProjection = () => {
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const relevantTransactions = transactions.filter(t => new Date(t.date) > sixMonthsAgo);

    const totalIncome = relevantTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = relevantTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgMonthlyNet = (totalIncome - totalExpense) / 6;

    const projection3Months = totalBalance + avgMonthlyNet * 3;
    const projection6Months = totalBalance + avgMonthlyNet * 6;
    const projection12Months = totalBalance + avgMonthlyNet * 12;

    return { projection3Months, projection6Months, projection12Months, avgMonthlyNet };
  };

  const { projection3Months, projection6Months, projection12Months, avgMonthlyNet } = calculateProjection();

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Future Balance Projection</h3>
      <ul className="space-y-3">
        <li className="flex justify-between items-center">
          <span className="font-medium text-gray-800 dark:text-gray-200">In 3 Months</span>
          <span className="font-semibold text-gray-900 dark:text-white">₹{projection3Months.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </li>
        <li className="flex justify-between items-center">
          <span className="font-medium text-gray-800 dark:text-gray-200">In 6 Months</span>
          <span className="font-semibold text-gray-900 dark:text-white">₹{projection6Months.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </li>
        <li className="flex justify-between items-center">
          <span className="font-medium text-gray-800 dark:text-gray-200">In 12 Months</span>
          <span className="font-semibold text-gray-900 dark:text-white">₹{projection12Months.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
        </li>
      </ul>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Based on an average net saving of <strong>₹{avgMonthlyNet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> per month.</p>
      </div>
    </div>
  );
};

export default FutureBalanceProjection;
