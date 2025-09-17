import React, { useState } from 'react';
import { Budget, Transaction, TotalBudget } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FlipHorizontal } from 'lucide-react';
import { FiAlertTriangle, FiCheckCircle, FiTarget, FiTrendingUp } from 'react-icons/fi';

interface BudgetSummaryProps {
  budgets: Budget[];
  transactions: Transaction[];
  totalBudget: TotalBudget | null;
  currency: string;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ budgets, transactions, totalBudget, currency }) => {
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showAllBudgets, setShowAllBudgets] = useState(false);

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
          <div className="text-center py-6">
            <FiTarget className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-[#888888] mb-2">No budgets set up yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Create budgets to track your spending</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(showAllBudgets ? budgets : budgets.slice(0, 6)).map((budget, index) => {
              const spent = getSpentAmount(budget.category);
              const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
              const remaining = budget.limit - spent;
              
              let status = 'good';
              let statusIcon = FiCheckCircle;
              let statusColor = 'text-green-500';
              let progressColor = 'bg-gradient-to-r from-green-400 to-green-500';
              
              if (percentage >= 90) {
                status = 'danger';
                statusIcon = FiAlertTriangle;
                statusColor = 'text-red-500';
                progressColor = 'bg-gradient-to-r from-red-400 to-red-500';
              } else if (percentage >= 75) {
                status = 'warning';
                statusIcon = FiAlertTriangle;
                statusColor = 'text-yellow-500';
                progressColor = 'bg-gradient-to-r from-yellow-400 to-yellow-500';
              }
              
              const StatusIcon = statusIcon;

              return (
                <motion.div 
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{budget.category}</span>
                      <StatusIcon className={`w-3 h-3 ${statusColor}`} />
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {currency}{spent.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                        / {currency}{budget.limit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className={`h-2 rounded-full ${progressColor}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(percentage, 100)}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 dark:text-gray-400">
                      {Math.round(percentage)}% used
                    </span>
                    <span className={`font-medium ${
                      remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {remaining >= 0 ? `${currency}${remaining.toLocaleString()} left` : `${currency}${Math.abs(remaining).toLocaleString()} over`}
                    </span>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Show More/Less Button */}
            {budgets.length > 6 && (
              <div className="flex justify-center pt-2">
                <motion.button
                  onClick={() => setShowAllBudgets(!showAllBudgets)}
                  className="flex items-center gap-1 px-3 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-md hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {showAllBudgets ? (
                    <>
                      <span>Show less</span>
                      <FiTrendingUp className="w-3 h-3 rotate-180" />
                    </>
                  ) : (
                    <>
                      <span>Show {budgets.length - 6} more</span>
                      <FiTrendingUp className="w-3 h-3 rotate-90" />
                    </>
                  )}
                </motion.button>
              </div>
            )}
            
            {/* Quick Stats */}
            <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Active Budgets</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{budgets.length}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">On Track</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {budgets.filter(b => (getSpentAmount(b.category) / b.limit) * 100 < 75).length}
                  </p>
                </div>
              </div>
            </div>
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