import React, { useState } from 'react';
import { Budget, Transaction, TotalBudget } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FlipHorizontal } from 'lucide-react';

interface BudgetSummaryProps {
  budgets: Budget[];
  transactions: Transaction[];
  totalBudget: TotalBudget | null;
  currency: string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budgets, transactions, totalBudget, currency }) => {
  const [showDetailedView, setShowDetailedView] = useState(false);

  const getSpentAmount = (category: string) => {
    return transactions
      .filter(t => t.category === category && t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const calculateMonthlyExpenses = () => {
    if (!totalBudget) return 0;
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    return transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && 
               txDate.toISOString().slice(0, 7) === currentMonth;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const toggleView = () => {
    setShowDetailedView(!showDetailedView);
  };

  if (budgets.length === 0 && !totalBudget) {
    return (
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
            {showDetailedView ? 'Total Monthly Budget' : 'Budget Summary'}
          </h3>
          <button 
            onClick={toggleView}
            className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5]"
          >
            <FlipHorizontal size={16} />
          </button>
        </div>
        <p className="text-gray-500 dark:text-[#888888]">No budgets set up yet.</p>
      </motion.div>
    );
  }

  // Render detailed total budget view
  const renderDetailedView = () => {
    if (!totalBudget) return null;
    
    const monthlyExpenses = calculateMonthlyExpenses();
    const percentageUsed = totalBudget.limit > 0 ? (monthlyExpenses / totalBudget.limit) * 100 : 0;
    const remaining = totalBudget.limit - monthlyExpenses;
    
    // Determine status and colors
    let status = 'normal';
    let progressColor = 'bg-green-500';
    let statusText = 'On track';
    
    if (percentageUsed >= 80 && percentageUsed < 100) {
      status = 'warning';
      progressColor = 'bg-yellow-500';
      statusText = 'Near limit';
    } else if (percentageUsed >= 100) {
      status = 'danger';
      progressColor = 'bg-red-500';
      statusText = 'Over budget';
    }

    return (
      <motion.div
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 backface-hidden"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
        style={{ 
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Total Monthly Budget</h3>
          <button 
            onClick={toggleView}
            className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-transform duration-200 hover:scale-110"
          >
            <FlipHorizontal size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-[#888888]">Monthly Limit:</span>
            <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">
              {currency}{totalBudget.limit.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-[#888888]">Spent this month:</span>
            <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">
              {currency}{monthlyExpenses.toLocaleString()}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-[#888888]">Remaining:</span>
            <span className={`font-medium ${
              remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {currency}{Math.abs(remaining).toLocaleString()}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
            <div 
              className={`${progressColor} h-3 rounded-full transition-all duration-300`} 
              style={{ width: `${Math.min(percentageUsed, 100)}%` }}
            />
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500 dark:text-[#888888]">Usage:</span>
            <span className={`font-medium ${
              percentageUsed >= 100 ? 'text-red-600 dark:text-red-400' : 
              percentageUsed >= 80 ? 'text-yellow-600 dark:text-yellow-400' : 
              'text-green-600 dark:text-green-400'
            }`}>
              {Math.round(percentageUsed)}%
            </span>
          </div>
          
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-[#888888] text-center">
              Status: <span className="font-medium">{statusText}</span>
            </p>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render summary view
  const renderSummaryView = () => {
    return (
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 backface-hidden"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
        style={{ 
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden'
        }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Budget Summary</h3>
          {totalBudget && (
            <button 
              onClick={toggleView}
              className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-transform duration-200 hover:scale-110"
            >
              <FlipHorizontal size={20} />
            </button>
          )}
        </div>
        
        {budgets.length === 0 ? (
          <p className="text-gray-500 dark:text-[#888888]">No budgets set up yet.</p>
        ) : (
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
        )}
      </motion.div>
    );
  };

  return (
    <div className="perspective-1000" style={{ perspective: '1000px' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={showDetailedView ? 'detailed' : 'summary'}
          initial={{ 
            rotateY: showDetailedView ? -180 : 180,
            zIndex: 10
          }}
          animate={{ 
            rotateY: 0,
            zIndex: 20
          }}
          exit={{ 
            rotateY: showDetailedView ? 180 : -180,
            zIndex: 0
          }}
          transition={{ 
            duration: 0.6,
            ease: [0.645, 0.045, 0.355, 1] // Custom easing for smoother animation
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center'
          }}
        >
          {showDetailedView ? renderDetailedView() : renderSummaryView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default BudgetSummary;