import React, { useState, useEffect } from 'react';
import { Transaction, Budget, Account } from '../../types/types';
import { motion } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '../../components/Common/AnimationVariants';

// Define achievement interface
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  progress?: number; // For unachieved achievements, show progress
  requirement?: string; // Description of what's needed to achieve
}

interface AchievementsProps {
  transactions: Transaction[];
  budgets: Budget[];
  accounts: Account[];
  currency: string;
}

const Achievements: React.FC<AchievementsProps> = ({ transactions, budgets, accounts, currency }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [hoveredAchievement, setHoveredAchievement] = useState<string | null>(null);

  useEffect(() => {
    const checkAchievements = () => {
      const newAchievements: Achievement[] = [
        // Budget Boss - Stay within budget for a month
        {
          id: 'budget-boss',
          title: 'Budget Boss',
          description: 'Stayed within all budget categories for a month',
          icon: '💰',
          achieved: false,
          requirement: 'Stay within all budget limits for one month'
        },
        // Savings Streak - Save money for 3 consecutive months
        {
          id: 'savings-streak',
          title: 'Savings Streak',
          description: 'Saved money for 3 consecutive months',
          icon: '📈',
          achieved: false,
          requirement: 'Have income greater than expenses for 3 months in a row'
        },
        // Debt Destroyer - Pay off a credit card
        {
          id: 'debt-destroyer',
          title: 'Debt Destroyer',
          description: 'Paid off a credit card completely',
          icon: '💳',
          achieved: false,
          requirement: 'Bring a credit card balance to zero'
        },
        // First Transaction
        {
          id: 'first-transaction',
          title: 'First Step',
          description: 'Recorded your first transaction',
          icon: '📝',
          achieved: transactions.length > 0,
          requirement: 'Add your first transaction'
        },
        // Budget Creator
        {
          id: 'budget-creator',
          title: 'Budget Planner',
          description: 'Created your first budget',
          icon: '📊',
          achieved: budgets.length > 0,
          requirement: 'Create your first budget category'
        },
        // Account Manager
        {
          id: 'account-manager',
          title: 'Account Manager',
          description: 'Set up your first account',
          icon: '🏦',
          achieved: accounts.length > 0,
          requirement: 'Add your first financial account'
        },
        // Big Spender
        {
          id: 'big-spender',
          title: 'Big Spender',
          description: 'Made a transaction over 10000',
          icon: '💎',
          achieved: transactions.some(t => Math.abs(t.amount) > 10000),
          requirement: 'Make a transaction over 10000'
        },
        // Consistent Tracker
        {
          id: 'consistent-tracker',
          title: 'Consistent Tracker',
          description: 'Tracked expenses for 7 consecutive days',
          icon: '📅',
          achieved: false,
          requirement: 'Record at least one transaction each day for 7 days'
        }
      ];

      // Check Budget Boss achievement
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthBudgets = budgets.every(b => {
        const spent = transactions
          .filter(t => t.category === b.category && t.type === 'expense' && new Date(t.date).getMonth() === lastMonth.getMonth())
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return spent <= b.limit;
      });
      if (lastMonthBudgets && budgets.length > 0) {
        const budgetBossIndex = newAchievements.findIndex(a => a.id === 'budget-boss');
        if (budgetBossIndex !== -1) {
          newAchievements[budgetBossIndex].achieved = true;
        }
      }

      // Check Savings Streak achievement
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
        const savingsStreakIndex = newAchievements.findIndex(a => a.id === 'savings-streak');
        if (savingsStreakIndex !== -1) {
          newAchievements[savingsStreakIndex].achieved = true;
        }
      }

      // Check Debt Destroyer achievement
      const debtDestroyer = accounts.some(acc => acc.type === 'Credit Card' && acc.balance === 0);
      if (debtDestroyer) {
        const debtDestroyerIndex = newAchievements.findIndex(a => a.id === 'debt-destroyer');
        if (debtDestroyerIndex !== -1) {
          newAchievements[debtDestroyerIndex].achieved = true;
        }
      }

      // Check Consistent Tracker achievement
      const today = new Date();
      let consistentDays = 0;
      for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const hasTransaction = transactions.some(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getDate() === checkDate.getDate() &&
                 transactionDate.getMonth() === checkDate.getMonth() &&
                 transactionDate.getFullYear() === checkDate.getFullYear();
        });
        if (hasTransaction) {
          consistentDays++;
        } else {
          break;
        }
      }
      if (consistentDays === 7) {
        const consistentTrackerIndex = newAchievements.findIndex(a => a.id === 'consistent-tracker');
        if (consistentTrackerIndex !== -1) {
          newAchievements[consistentTrackerIndex].achieved = true;
        }
      }

      setAchievements(newAchievements);
    };

    checkAchievements();
  }, [transactions, budgets, accounts]);

  // Function to trigger confetti effect
  const triggerConfetti = (achievementId: string) => {
    // Dynamically import confetti to avoid type issues
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;
      
      const count = 150;
      const defaults = {
        origin: { y: 0.7 },
        zIndex: 10000
      };

      // Create a more elaborate confetti effect
      confetti({
        ...defaults,
        particleCount: count,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Add a second burst for more effect
      setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: Math.floor(count * 0.7),
          spread: 50,
          startVelocity: 20,
          origin: { y: 0.6 }
        });
      }, 150);
    });
  };

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Achievements</h3>
      {achievements.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              className={`relative inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-all duration-300 cursor-pointer ${
                achievement.achieved
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 500 }}
              onClick={() => {
                if (achievement.achieved) {
                  triggerConfetti(achievement.id);
                }
              }}
              onMouseEnter={() => setHoveredAchievement(achievement.id)}
              onMouseLeave={() => setHoveredAchievement(null)}
            >
              <span className="mr-1">{achievement.icon}</span>
              <span>{achievement.title}</span>
              
              {/* Hover tooltip */}
              {hoveredAchievement === achievement.id && (
                <motion.div
                  className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-50"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                >
                  {achievement.achieved 
                    ? achievement.description 
                    : `Requirement: ${achievement.requirement}`}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 dark:text-[#888888]">No achievements unlocked yet. Keep going!</p>
      )}
    </motion.div>
  );
};

export default Achievements;