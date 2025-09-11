import React from 'react';
import { Transaction } from '../../types/types';

interface LifestyleCreepIndicatorProps {
  transactions: Transaction[];
}

const LifestyleCreepIndicator: React.FC<LifestyleCreepIndicatorProps> = ({ transactions }) => {
  const calculateLifestyleCreep = () => {
    const nonEssentialCategories = ['Entertainment', 'Shopping', 'Food & Dining'];

    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentPeriodExpenses = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && nonEssentialCategories.includes(t.category) && txDate > threeMonthsAgo;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const previousPeriodExpenses = transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && nonEssentialCategories.includes(t.category) && txDate > sixMonthsAgo && txDate <= threeMonthsAgo;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const avgRecent = recentPeriodExpenses / 3;
    const avgPrevious = previousPeriodExpenses / 3;

    if (avgPrevious === 0) {
      return { percentageChange: avgRecent > 0 ? 100 : 0, isCreep: avgRecent > 0 };
    }

    const percentageChange = ((avgRecent - avgPrevious) / avgPrevious) * 100;
    const isCreep = percentageChange > 10; // More than 10% increase is considered a creep

    return { percentageChange, isCreep };
  };

  const { percentageChange, isCreep } = calculateLifestyleCreep();

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Lifestyle Creep Indicator</h3>
      <div className="text-center">
        <p className={`text-4xl font-bold ${isCreep ? 'text-red-500' : 'text-green-500'}`}>
          {percentageChange >= 0 ? '+' : ''}{percentageChange.toFixed(1)}%
        </p>
        <p className="text-gray-500 dark:text-[#888888]">in non-essential spending</p>
      </div>
      <div className="text-center mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">Comparing the last 3 months to the 3 months before.</p>
      </div>
    </div>
  );
};

export default LifestyleCreepIndicator;
