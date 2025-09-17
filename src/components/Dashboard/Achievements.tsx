import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Budget, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, cardHoverVariants } from '../../components/Common/AnimationVariants';
import { Trophy, Star, Zap, Target, Award, Crown, Sparkles, TrendingUp, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';

// Define achievement tiers
type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

// Define achievement categories
type AchievementCategory = 'tracking' | 'budgeting' | 'savings' | 'spending' | 'consistency' | 'milestones';

// Enhanced achievement interface
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  achieved: boolean;
  progress?: number; // 0-100 for progress bar
  requirement?: string;
  tier: AchievementTier;
  category: AchievementCategory;
  points: number; // Achievement points for gamification
  unlockedDate?: string; // When the achievement was unlocked
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  hint?: string; // Subtle hint for unachieved achievements
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
  const [totalPoints, setTotalPoints] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const confettiRef = useRef<HTMLDivElement>(null);

  // Achievement tier colors and styles
  const getTierStyle = (tier: AchievementTier, achieved: boolean) => {
    const baseStyle = achieved ? 'shadow-lg' : 'opacity-70';
    switch (tier) {
      case 'bronze':
        return `${baseStyle} ${achieved ? 'bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 border-amber-300 dark:border-amber-700' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`;
      case 'silver':
        return `${baseStyle} ${achieved ? 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/30 dark:to-gray-600/30 border-gray-400 dark:border-gray-500' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`;
      case 'gold':
        return `${baseStyle} ${achieved ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/30 dark:to-yellow-800/30 border-yellow-400 dark:border-yellow-600' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`;
      case 'platinum':
        return `${baseStyle} ${achieved ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 border-blue-400 dark:border-blue-600' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`;
      case 'diamond':
        return `${baseStyle} ${achieved ? 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 border-purple-400 dark:border-purple-600' : 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600'}`;
      default:
        return `${baseStyle} bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600`;
    }
  };

  const getRarityGlow = (rarity: Achievement['rarity'], achieved: boolean) => {
    if (!achieved) return '';
    switch (rarity) {
      case 'common': return '';
      case 'rare': return 'shadow-blue-500/25';
      case 'epic': return 'shadow-purple-500/25';
      case 'legendary': return 'shadow-yellow-500/25 animate-pulse';
      default: return '';
    }
  };

  useEffect(() => {
    const checkAchievements = () => {
      const newAchievements: Achievement[] = [
        // === TRACKING CATEGORY ===
        {
          id: 'first-transaction',
          title: 'First Step',
          description: 'Recorded your first transaction',
          icon: '🎯',
          achieved: transactions.length > 0,
          requirement: 'Add your first transaction',
          tier: 'bronze',
          category: 'tracking',
          points: 10,
          rarity: 'common',
          hint: 'Start by adding any income or expense'
        },
        {
          id: 'transaction-milestone-10',
          title: 'Getting Started',
          description: 'Recorded 10 transactions',
          icon: '📝',
          achieved: transactions.length >= 10,
          progress: Math.min(100, (transactions.length / 10) * 100),
          requirement: 'Record 10 transactions',
          tier: 'bronze',
          category: 'tracking',
          points: 25,
          rarity: 'common'
        },
        {
          id: 'transaction-milestone-50',
          title: 'Data Collector',
          description: 'Recorded 50 transactions',
          icon: '📊',
          achieved: transactions.length >= 50,
          progress: Math.min(100, (transactions.length / 50) * 100),
          requirement: 'Record 50 transactions',
          tier: 'silver',
          category: 'tracking',
          points: 50,
          rarity: 'rare'
        },
        {
          id: 'transaction-milestone-100',
          title: 'Data Master',
          description: 'Recorded 100 transactions',
          icon: '🏆',
          achieved: transactions.length >= 100,
          progress: Math.min(100, (transactions.length / 100) * 100),
          requirement: 'Record 100 transactions',
          tier: 'gold',
          category: 'tracking',
          points: 100,
          rarity: 'epic'
        },
        {
          id: 'category-explorer',
          title: 'Category Explorer',
          description: 'Used 5 different expense categories',
          icon: '🗂️',
          achieved: false,
          requirement: 'Use 5 different expense categories',
          tier: 'silver',
          category: 'tracking',
          points: 30,
          rarity: 'common'
        },

        // === BUDGETING CATEGORY ===
        {
          id: 'budget-creator',
          title: 'Budget Planner',
          description: 'Created your first budget',
          icon: '📋',
          achieved: budgets.length > 0,
          requirement: 'Create your first budget category',
          tier: 'bronze',
          category: 'budgeting',
          points: 20,
          rarity: 'common',
          hint: 'Set spending limits for your categories'
        },
        {
          id: 'budget-boss',
          title: 'Budget Boss',
          description: 'Stayed within all budget categories for a month',
          icon: '👑',
          achieved: false,
          requirement: 'Stay within all budget limits for one month',
          tier: 'gold',
          category: 'budgeting',
          points: 75,
          rarity: 'rare'
        },
        {
          id: 'budget-master',
          title: 'Budget Master',
          description: 'Created budgets for 5+ categories',
          icon: '🎯',
          achieved: budgets.length >= 5,
          progress: Math.min(100, (budgets.length / 5) * 100),
          requirement: 'Create budgets for 5 categories',
          tier: 'silver',
          category: 'budgeting',
          points: 40,
          rarity: 'common'
        },

        // === SAVINGS CATEGORY ===
        {
          id: 'savings-streak',
          title: 'Savings Streak',
          description: 'Saved money for 3 consecutive months',
          icon: '📈',
          achieved: false,
          requirement: 'Have income greater than expenses for 3 months in a row',
          tier: 'gold',
          category: 'savings',
          points: 100,
          rarity: 'epic'
        },
        {
          id: 'positive-month',
          title: 'In the Green',
          description: 'Had a positive cash flow this month',
          icon: '💚',
          achieved: false,
          requirement: 'Earn more than you spend in a month',
          tier: 'bronze',
          category: 'savings',
          points: 25,
          rarity: 'common'
        },
        {
          id: 'emergency-fund',
          title: 'Safety Net',
          description: 'Built an emergency fund of 3 months expenses',
          icon: '🛡️',
          achieved: false,
          requirement: 'Save 3 months worth of expenses',
          tier: 'platinum',
          category: 'savings',
          points: 200,
          rarity: 'legendary'
        },

        // === SPENDING CATEGORY ===
        {
          id: 'big-spender',
          title: 'Big Purchase',
          description: 'Made a transaction over 10,000',
          icon: '💎',
          achieved: transactions.some(t => Math.abs(t.amount) > 10000),
          requirement: `Make a transaction over ${currency}10,000`,
          tier: 'silver',
          category: 'spending',
          points: 30,
          rarity: 'rare'
        },
        {
          id: 'frugal-month',
          title: 'Frugal Fighter',
          description: 'Spent less than average this month',
          icon: '🎯',
          achieved: false,
          requirement: 'Spend below your average monthly expenses',
          tier: 'bronze',
          category: 'spending',
          points: 35,
          rarity: 'common'
        },

        // === CONSISTENCY CATEGORY ===
        {
          id: 'consistent-tracker',
          title: 'Daily Tracker',
          description: 'Tracked expenses for 7 consecutive days',
          icon: '📅',
          achieved: false,
          requirement: 'Record at least one transaction each day for 7 days',
          tier: 'silver',
          category: 'consistency',
          points: 50,
          rarity: 'rare'
        },
        {
          id: 'monthly-champion',
          title: 'Monthly Champion',
          description: 'Tracked expenses every day for a month',
          icon: '🏅',
          achieved: false,
          requirement: 'Record transactions daily for 30 days',
          tier: 'gold',
          category: 'consistency',
          points: 150,
          rarity: 'epic'
        },

        // === MILESTONES CATEGORY ===
        {
          id: 'account-manager',
          title: 'Account Manager',
          description: 'Set up your first account',
          icon: '🏦',
          achieved: accounts.length > 0,
          requirement: 'Add your first financial account',
          tier: 'bronze',
          category: 'milestones',
          points: 15,
          rarity: 'common',
          hint: 'Add your bank account or credit card'
        },
        {
          id: 'debt-destroyer',
          title: 'Debt Destroyer',
          description: 'Paid off a credit card completely',
          icon: '⚔️',
          achieved: false,
          requirement: 'Bring a credit card balance to zero',
          tier: 'platinum',
          category: 'milestones',
          points: 150,
          rarity: 'legendary'
        },
        {
          id: 'net-worth-positive',
          title: 'Wealth Builder',
          description: 'Achieved positive net worth',
          icon: '💰',
          achieved: accounts.reduce((sum, acc) => sum + acc.balance, 0) > 0,
          requirement: 'Have more assets than debts',
          tier: 'gold',
          category: 'milestones',
          points: 75,
          rarity: 'rare'
        },
        {
          id: 'spendwise-veteran',
          title: 'SpendWise Veteran',
          description: 'Used SpendWiser for 30 days',
          icon: '🎖️',
          achieved: false,
          requirement: 'Keep using SpendWiser for 30 days',
          tier: 'diamond',
          category: 'milestones',
          points: 250,
          rarity: 'legendary'
        }
      ];

      // === ADVANCED ACHIEVEMENT CHECKING ===

      // Check Category Explorer
      const uniqueCategories = [...new Set(transactions.filter(t => t.type === 'expense').map(t => t.category))];
      const categoryExplorerIndex = newAchievements.findIndex(a => a.id === 'category-explorer');
      if (categoryExplorerIndex !== -1) {
        newAchievements[categoryExplorerIndex].achieved = uniqueCategories.length >= 5;
        newAchievements[categoryExplorerIndex].progress = Math.min(100, (uniqueCategories.length / 5) * 100);
      }

      // Check Budget Boss achievement
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const budgetBossAchieved = budgets.length > 0 && budgets.every(b => {
        const spent = transactions
          .filter(t => t.category === b.category && t.type === 'expense' &&
            new Date(t.date).getMonth() === currentMonth &&
            new Date(t.date).getFullYear() === currentYear)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        return spent <= b.limit;
      });
      const budgetBossIndex = newAchievements.findIndex(a => a.id === 'budget-boss');
      if (budgetBossIndex !== -1) {
        newAchievements[budgetBossIndex].achieved = budgetBossAchieved;
      }

      // Check Savings Streak achievement
      let savingsStreak = 0;
      for (let i = 0; i < 3; i++) {
        const checkDate = new Date();
        checkDate.setMonth(checkDate.getMonth() - i);
        const month = checkDate.getMonth();
        const year = checkDate.getFullYear();

        const income = transactions
          .filter(t => t.type === 'income' &&
            new Date(t.date).getMonth() === month &&
            new Date(t.date).getFullYear() === year)
          .reduce((sum, t) => sum + t.amount, 0);
        const expenses = transactions
          .filter(t => t.type === 'expense' &&
            new Date(t.date).getMonth() === month &&
            new Date(t.date).getFullYear() === year)
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        if (income > expenses) {
          savingsStreak++;
        } else {
          break;
        }
      }
      const savingsStreakIndex = newAchievements.findIndex(a => a.id === 'savings-streak');
      if (savingsStreakIndex !== -1) {
        newAchievements[savingsStreakIndex].achieved = savingsStreak >= 3;
        newAchievements[savingsStreakIndex].progress = Math.min(100, (savingsStreak / 3) * 100);
      }

      // Check Positive Month
      const thisMonthIncome = transactions
        .filter(t => t.type === 'income' &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + t.amount, 0);
      const thisMonthExpenses = transactions
        .filter(t => t.type === 'expense' &&
          new Date(t.date).getMonth() === currentMonth &&
          new Date(t.date).getFullYear() === currentYear)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      const positiveMonthIndex = newAchievements.findIndex(a => a.id === 'positive-month');
      if (positiveMonthIndex !== -1) {
        newAchievements[positiveMonthIndex].achieved = thisMonthIncome > thisMonthExpenses;
      }

      // Check Debt Destroyer achievement
      const debtDestroyer = accounts.some(acc => acc.type === 'Credit Card' && acc.balance === 0);
      const debtDestroyerIndex = newAchievements.findIndex(a => a.id === 'debt-destroyer');
      if (debtDestroyerIndex !== -1) {
        newAchievements[debtDestroyerIndex].achieved = debtDestroyer;
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
      const consistentTrackerIndex = newAchievements.findIndex(a => a.id === 'consistent-tracker');
      if (consistentTrackerIndex !== -1) {
        newAchievements[consistentTrackerIndex].achieved = consistentDays >= 7;
        newAchievements[consistentTrackerIndex].progress = Math.min(100, (consistentDays / 7) * 100);
      }

      // Check Monthly Champion
      let monthlyConsistentDays = 0;
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() - i);
        const hasTransaction = transactions.some(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getDate() === checkDate.getDate() &&
            transactionDate.getMonth() === checkDate.getMonth() &&
            transactionDate.getFullYear() === checkDate.getFullYear();
        });
        if (hasTransaction) {
          monthlyConsistentDays++;
        }
      }
      const monthlyChampionIndex = newAchievements.findIndex(a => a.id === 'monthly-champion');
      if (monthlyChampionIndex !== -1) {
        newAchievements[monthlyChampionIndex].achieved = monthlyConsistentDays >= 30;
        newAchievements[monthlyChampionIndex].progress = Math.min(100, (monthlyConsistentDays / 30) * 100);
      }

      // Check Frugal Month
      const avgMonthlyExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0) / Math.max(1,
          [...new Set(transactions.map(t => `${new Date(t.date).getMonth()}-${new Date(t.date).getFullYear()}`))].length
        );
      const frugalMonthIndex = newAchievements.findIndex(a => a.id === 'frugal-month');
      if (frugalMonthIndex !== -1) {
        newAchievements[frugalMonthIndex].achieved = thisMonthExpenses < avgMonthlyExpenses && avgMonthlyExpenses > 0;
      }

      // Add unlock dates for newly achieved achievements
      const previousAchievements = achievements;
      newAchievements.forEach(achievement => {
        const previous = previousAchievements.find(a => a.id === achievement.id);
        if (achievement.achieved && (!previous || !previous.achieved)) {
          achievement.unlockedDate = new Date().toISOString();
          setRecentlyUnlocked(prev => [...prev, achievement.id]);
          // Remove from recently unlocked after 5 seconds
          setTimeout(() => {
            setRecentlyUnlocked(prev => prev.filter(id => id !== achievement.id));
          }, 5000);
        } else if (previous?.unlockedDate) {
          achievement.unlockedDate = previous.unlockedDate;
        }
      });

      setAchievements(newAchievements);

      // Calculate total points and user level
      const earnedPoints = newAchievements.filter(a => a.achieved).reduce((sum, a) => sum + a.points, 0);
      setTotalPoints(earnedPoints);
      setUserLevel(Math.floor(earnedPoints / 100) + 1);
    };

    checkAchievements();
  }, [transactions, budgets, accounts]);

  // Enhanced confetti effect with tier-based colors
  const triggerConfetti = (achievement: Achievement) => {
    import('canvas-confetti').then((confettiModule) => {
      const confetti = confettiModule.default;

      // Tier-based confetti colors
      const getTierColors = (tier: AchievementTier) => {
        switch (tier) {
          case 'bronze': return ['#CD7F32', '#B8860B'];
          case 'silver': return ['#C0C0C0', '#A8A8A8'];
          case 'gold': return ['#FFD700', '#FFA500'];
          case 'platinum': return ['#E5E4E2', '#87CEEB'];
          case 'diamond': return ['#B9F2FF', '#E6E6FA'];
          default: return ['#FFD700', '#FFA500'];
        }
      };

      const colors = getTierColors(achievement.tier);
      const count = achievement.rarity === 'legendary' ? 200 :
        achievement.rarity === 'epic' ? 150 :
          achievement.rarity === 'rare' ? 100 : 75;

      // Main burst
      confetti({
        particleCount: count,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors,
        zIndex: 10000
      });

      // Secondary burst for legendary achievements
      if (achievement.rarity === 'legendary') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 120,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'],
            zIndex: 10000
          });
        }, 200);
      }
    });
  };


  const totalAchieved = achievements.filter(a => a.achieved).length;
  const completionPercentage = achievements.length > 0 ? (totalAchieved / achievements.length) * 100 : 0;

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700 relative overflow-hidden"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      {/* Confetti container */}
      <div ref={confettiRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Compact Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-[#F5F5F5]">Achievements</h3>
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium">
            L{userLevel}
          </span>
        </div>
        <div className="flex items-center gap-2 group">
          <div className="text-right text-xs">
            <div className="font-medium text-gray-900 dark:text-[#F5F5F5]">
              {totalAchieved}/{achievements.length}
            </div>
            <div className="text-gray-500 dark:text-gray-400">
              {totalPoints} XP
            </div>
          </div>
          <motion.button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`
              relative px-3 py-2 rounded-lg font-medium text-xs transition-all duration-300
              ${isExpanded
                ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-600 hover:to-purple-600'
              }
              transform hover:scale-105 active:scale-95
            `}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 10px 10px -5px rgba(59, 130, 246, 0.04)"
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-1">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  <span>Less</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  <span>More</span>
                </>
              )}
            </div>

            {/* Subtle glow effect */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>

            {/* Shine effect */}
            <div className="absolute inset-0 rounded-lg overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </div>
          </motion.button>
        </div>
      </div>

      {/* Compact Progress bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
          <motion.div
            className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
          {Math.round(completionPercentage)}% Complete
        </div>
      </div>

      {/* Recent Achievements - Show only top 3 most recent */}
      {achievements.filter(a => a.achieved).slice(0, 3).length > 0 ? (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Recent Unlocks</div>
          {achievements
            .filter(a => a.achieved)
            .sort((a, b) => (b.unlockedDate || '').localeCompare(a.unlockedDate || ''))
            .slice(0, 3)
            .map((achievement) => (
              <motion.div
                key={achievement.id}
                className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 ${getTierStyle(achievement.tier, achievement.achieved)} ${getRarityGlow(achievement.rarity, achievement.achieved)}`}
                whileHover={{ scale: 1.02 }}
                onClick={() => triggerConfetti(achievement)}
                onMouseEnter={() => setHoveredAchievement(achievement.id)}
                onMouseLeave={() => setHoveredAchievement(null)}
              >
                {/* Recently unlocked indicator */}
                {recentlyUnlocked.includes(achievement.id) && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1 py-0.5 rounded-full z-10"
                  >
                    NEW!
                  </motion.div>
                )}

                <div className="text-lg">{achievement.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {achievement.title}
                    </span>
                    {achievement.rarity !== 'common' && (
                      <div className="flex-shrink-0">
                        {achievement.rarity === 'legendary' && <Crown className="w-3 h-3 text-yellow-500" />}
                        {achievement.rarity === 'epic' && <Sparkles className="w-3 h-3 text-purple-500" />}
                        {achievement.rarity === 'rare' && <Star className="w-3 h-3 text-blue-500" />}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {achievement.points} XP • {achievement.tier}
                  </div>
                </div>

                {/* Hover tooltip */}
                {hoveredAchievement === achievement.id && (
                  <motion.div
                    className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-50 max-w-xs"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className="text-center">
                      <div className="font-semibold">{achievement.title}</div>
                      <div className="text-gray-300 mt-1">{achievement.description}</div>
                      <div className="text-blue-300 mt-1">
                        {achievement.points} XP • {achievement.tier} • {achievement.rarity}
                      </div>
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                  </motion.div>
                )}
              </motion.div>
            ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <Trophy className="w-8 h-8 text-gray-400 dark:text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 dark:text-[#888888] mb-1">
            No achievements unlocked yet!
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Start tracking to earn your first achievement
          </p>
        </div>
      )}

      {/* Next Achievement Preview - Only show when collapsed */}
      {!isExpanded && (() => {
        const nextAchievement = achievements
          .filter(a => !a.achieved && a.progress !== undefined)
          .sort((a, b) => (b.progress || 0) - (a.progress || 0))[0];

        return nextAchievement ? (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Next Goal</div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="text-sm grayscale opacity-70">{nextAchievement.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">
                  {nextAchievement.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <motion.div
                      className="bg-blue-500 h-1 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${nextAchievement.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round(nextAchievement.progress || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null;
      })()}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            {/* Category Stats */}
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Progress by Category</div>
              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  const categories: AchievementCategory[] = ['tracking', 'budgeting', 'savings', 'spending', 'consistency', 'milestones'];
                  return categories.map(category => {
                    const categoryAchievements = achievements.filter(a => a.category === category);
                    const achieved = categoryAchievements.filter(a => a.achieved).length;
                    const total = categoryAchievements.length;
                    const percentage = total > 0 ? (achieved / total) * 100 : 0;

                    return (
                      <div key={category} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                            {category}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {achieved}/{total}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                          <motion.div
                            className="bg-blue-500 h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* All Achievements - Compact Grid */}
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">All Achievements</div>
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-300 ${getTierStyle(achievement.tier, achievement.achieved)} ${getRarityGlow(achievement.rarity, achievement.achieved)}`}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => {
                      if (achievement.achieved) {
                        triggerConfetti(achievement);
                      }
                    }}
                    onMouseEnter={() => setHoveredAchievement(achievement.id)}
                    onMouseLeave={() => setHoveredAchievement(null)}
                  >
                    {/* Recently unlocked indicator */}
                    {recentlyUnlocked.includes(achievement.id) && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-xs font-bold px-1 py-0.5 rounded-full z-10"
                      >
                        NEW!
                      </motion.div>
                    )}

                    <div className={`text-sm ${achievement.achieved ? '' : 'grayscale opacity-50'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className={`text-xs font-medium truncate ${achievement.achieved ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {achievement.title}
                        </span>
                        {achievement.rarity !== 'common' && achievement.achieved && (
                          <div className="flex-shrink-0">
                            {achievement.rarity === 'legendary' && <Crown className="w-3 h-3 text-yellow-500" />}
                            {achievement.rarity === 'epic' && <Sparkles className="w-3 h-3 text-purple-500" />}
                            {achievement.rarity === 'rare' && <Star className="w-3 h-3 text-blue-500" />}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {achievement.points} XP • {achievement.tier}
                        </div>
                        {!achievement.achieved && achievement.progress !== undefined && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {Math.round(achievement.progress)}%
                          </div>
                        )}
                      </div>

                      {/* Progress bar for unachieved achievements */}
                      {!achievement.achieved && achievement.progress !== undefined && (
                        <div className="mt-1">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                            <motion.div
                              className="bg-blue-500 h-1 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${achievement.progress}%` }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hover tooltip */}
                    {hoveredAchievement === achievement.id && (
                      <motion.div
                        className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 bg-black text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap z-50 max-w-xs"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                      >
                        <div className="text-center">
                          <div className="font-semibold">{achievement.title}</div>
                          <div className="text-gray-300 mt-1">{achievement.description}</div>
                          {!achievement.achieved && (
                            <div className="text-yellow-300 mt-1">
                              {achievement.hint || achievement.requirement}
                            </div>
                          )}
                          <div className="text-blue-300 mt-1">
                            {achievement.points} XP • {achievement.tier} • {achievement.rarity}
                          </div>
                        </div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Achievement Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                <div className="text-lg font-bold text-green-600 dark:text-green-400">
                  {achievements.filter(a => a.achieved).length}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400">Unlocked</div>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {totalPoints}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">Total XP</div>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {achievements.filter(a => a.achieved && a.rarity !== 'common').length}
                </div>
                <div className="text-xs text-purple-600 dark:text-purple-400">Rare+</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level up notification */}
      <AnimatePresence>
        {recentlyUnlocked.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-lg shadow-lg z-20"
          >
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-semibold">Unlocked!</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Achievements;