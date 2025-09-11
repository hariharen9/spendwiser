import React, { useState, useEffect } from 'react';
import { Transaction, Budget, Account } from '../../types/types';

interface AchievementsProps {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
}

const Achievements: React.FC<AchievementsProps> = ({ transactions, budgets, accounts }) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);

  useEffect(() => {
    const checkAchievements = () => {
      const newAchievements: string[] = [];

      // Achievement 1: Budget Boss
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthBudgets = budgets.every(b => {
        const spent = transactions
          .filter(t => t.category === b.category && t.type === 'expense' && new Date(t.date).getMonth() === lastMonth.getMonth())
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return spent <= b.limit;
      });
      if (lastMonthBudgets && budgets.length > 0) {
        newAchievements.push('Budget Boss');
      }

      // Achievement 2: Savings Streak
      let savingsStreak = 0;
      for (let i = 1; i <= 3; i++) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const income = transactions
          .filter(t => t.type === 'income' && new Date(t.date).getMonth() === month.getMonth())
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
          .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === month.getMonth())
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        if (income > expenses) {
          savingsStreak++;
        } else {
          break;
        }
      }
      if (savingsStreak === 3) {
        newAchievements.push('Savings Streak');
      }

      // Achievement 3: Debt Destroyer
      const debtDestroyer = accounts.some(acc => acc.type === 'Credit Card' && acc.balance === 0);
      if (debtDestroyer) {
        newAchievements.push('Debt Destroyer');
      }

      setUnlockedAchievements(newAchievements);
    };

    checkAchievements();
  }, [transactions, budgets, accounts]);

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Achievements</h3>
      {unlockedAchievements.length > 0 ? (
        <div className="flex flex-wrap gap-4">
          {unlockedAchievements.map(ach => (
            <div key={ach} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">
              {ach}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-[#888888]">No achievements unlocked yet. Keep going!</p>
      )}
    </div>
  );
};

export default Achievements;
