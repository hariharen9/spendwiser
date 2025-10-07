import React, { useState, useMemo } from 'react';
import { Budget, Transaction, TotalBudget } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants, buttonHoverVariants, modalVariants } from '../../components/Common/AnimationVariants';
import { FlipHorizontal, Plus, Edit, Trash2, X, Target } from 'lucide-react';

interface BudgetSummaryProps {
  budgets: Budget[];
  transactions: Transaction[];
  totalBudget: TotalBudget | null;
  currency: string;
  onNavigate: (screen: string) => void;
  onEditBudget?: (budget: Budget) => void;
  onAddBudget?: () => void;
  onDeleteBudget?: (id: string) => void;
  onSaveTotalBudget?: (limit: number) => void;
  onDeleteTotalBudget?: () => void;
}

const BudgetSummary: React.FC<BudgetSummaryProps> = ({ 
  budgets, 
  transactions, 
  totalBudget,
  currency, 
  onNavigate,
  onEditBudget,
  onAddBudget,
  onDeleteBudget,
  onSaveTotalBudget,
  onDeleteTotalBudget
}) => {
  const [showDetailedView, setShowDetailedView] = useState(false);
  const [showAllBudgets, setShowAllBudgets] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showTotalBudgetModal, setShowTotalBudgetModal] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState('');

  // Use useMemo to ensure calculations are only re-run when dependencies change
  const currentMonth = useMemo(() => {
    return new Date().toISOString().slice(0, 7);
  }, []);

  // Calculate total spent across all budgets
  const totalSpent = useMemo(() => {
    return budgets.reduce((total, budget) => {
      const categorySpent = transactions
        .filter(t => t.type === 'expense' && t.category === budget.category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return total + categorySpent;
    }, 0);
  }, [budgets, transactions]);

  // Memoize monthly expenses calculation to ensure it updates when transactions change
  const monthlyExpenses = useMemo(() => {
    return transactions
      .filter(t => {
        const txDate = new Date(t.date);
        return t.type === 'expense' && 
               txDate.toISOString().slice(0, 7) === currentMonth;
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  }, [transactions, currentMonth]);

  // Memoize the budgets with their spent amounts and sort by nearing limit
  const budgetsWithSpent = useMemo(() => {
    const budgetsCalculated = budgets.map(budget => {
      const currentMonthStr = new Date().toISOString().slice(0, 7);
      const categoryTransactions = transactions.filter(t => t.type === 'expense' && t.category === budget.category);
      
      const calculatedSpent = categoryTransactions
        .filter(t => t.date.startsWith(currentMonthStr))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      // Calculate 3-month historical average
      let totalSpentInPastMonths = 0;
      let monthsWithSpending = 0;
      for (let i = 1; i <= 3; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const monthStr = d.toISOString().slice(0, 7);
        const monthlySpend = categoryTransactions
          .filter(t => t.date.startsWith(monthStr))
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        if (monthlySpend > 0) {
          totalSpentInPastMonths += monthlySpend;
          monthsWithSpending++;
        }
      }
      const historicalAverage = monthsWithSpending > 0 ? totalSpentInPastMonths / monthsWithSpending : 0;
      
      // Calculate percentage to determine how close to limit
      const percentage = budget.limit > 0 ? (calculatedSpent / budget.limit) * 100 : 0;

      return {
        ...budget,
        spent: calculatedSpent,
        historicalAverage,
        percentage
      };
    });
    
    // Sort by percentage (descending) to show budgets nearing limit first
    return budgetsCalculated.sort((a, b) => b.percentage - a.percentage);
  }, [budgets, transactions]);

  const toggleView = () => {
    setShowDetailedView(!showDetailedView);
  };

  const handleConfirmDeleteBudget = (id: string) => {
    if (onDeleteBudget) {
      onDeleteBudget(id);
    }
    setShowDeleteConfirm(null);
  };

  const handleSaveTotalBudget = () => {
    const limit = parseFloat(totalBudgetInput);
    if (onSaveTotalBudget && !isNaN(limit) && limit > 0) {
      onSaveTotalBudget(limit);
      setShowTotalBudgetModal(false);
      setTotalBudgetInput('');
    }
  };

  const handleDeleteTotalBudget = () => {
    if (onDeleteTotalBudget) {
      onDeleteTotalBudget();
    }
    setShowTotalBudgetModal(false);
  };

  // Calculate total budget percentage for detailed view
  const totalBudgetPercentage = totalBudget && totalBudget.limit > 0 
    ? (monthlyExpenses / totalBudget.limit) * 100 
    : 0;
  const isTotalBudgetOver = totalBudgetPercentage > 100;
  const isTotalBudgetNearLimit = totalBudgetPercentage > 80;

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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center">
            <Target className="w-5 h-5 mr-2" />
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
        {onAddBudget && (
          <motion.button 
            onClick={onAddBudget}
            className="mt-4 w-full flex items-center justify-center space-x-2 bg-[#00C9A7] text-white px-4 py-2 rounded-lg font-medium"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Plus className="h-4 w-4" />
            <span>Add Budget</span>
          </motion.button>
        )}
      </motion.div>
    );
  }

  // Render detailed total budget view
  const renderDetailedView = () => {
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center"><Target className="w-5 h-5 mr-2" />Total Monthly Budget</h3>
          <button 
            onClick={toggleView}
            className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-transform duration-200 hover:scale-110"
          >
            <FlipHorizontal size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          {totalBudget && (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#888888]">Monthly Limit:</span>
                <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                  {currency}{totalBudget.limit.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#888888]">Spent this month:</span>
                <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                  {currency}{monthlyExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#888888]">Remaining:</span>
                <span className={`font-medium ${
                  isTotalBudgetOver ? 'text-[#DC3545]' : 
                  isTotalBudgetNearLimit ? 'text-[#FFC107]' : 
                  'text-[#28A745]'
                }`}>
                  {currency}{Math.max(0, totalBudget.limit - monthlyExpenses).toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#1A1A1A] rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-2 rounded-full ${
                    isTotalBudgetOver
                      ? 'bg-[#DC3545]'
                      : isTotalBudgetNearLimit
                      ? 'bg-gradient-to-r from-[#FFC107] to-[#DC3545]'
                      : 'bg-gradient-to-r from-[#00C9A7] to-[#007BFF]'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(totalBudgetPercentage, 100)}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#888888]">Usage:</span>
                <span className={`font-medium ${
                  isTotalBudgetOver ? 'text-[#DC3545]' : 
                  isTotalBudgetNearLimit ? 'text-[#FFC107]' : 
                  'text-[#28A745]'
                }`}>
                  {Math.round(totalBudgetPercentage)}%
                </span>
              </div>
            </div>
          )}
          
          <motion.button 
            onClick={() => setShowTotalBudgetModal(true)}
            className="w-full mt-4 bg-gradient-to-r from-[#007BFF] to-[#00C9A7] text-white px-4 py-2 rounded-lg font-medium"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            {totalBudget ? 'Edit Total Budget' : 'Set Total Budget'}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Render summary view with budget categories sorted by nearing limit
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center"><Target className="w-5 h-5 mr-2" />Budget Summary</h3>
          {totalBudget && (
            <button 
              onClick={toggleView}
              className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-transform duration-200 hover:scale-110"
            >
              <FlipHorizontal size={20} />
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          {/* <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">Budgets Nearing Limit</h4> */}
          {onAddBudget && (
            <motion.button 
              onClick={onAddBudget}
              className="flex items-center space-x-1 bg-[#00C9A7] text-white px-3 py-1 rounded-lg text-sm font-medium"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Plus className="h-3 w-3" />
              <span>Add</span>
            </motion.button>
          )}
        </div>
        
        {budgets.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 dark:text-[#888888] mb-2">No budgets set up yet</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Create budgets to track your spending</p>
          </div>
        ) : (
          <div className="space-y-4">
            {(showAllBudgets ? budgetsWithSpent : budgetsWithSpent.slice(0, 3)).map((budget, index) => {
              const percentage = (budget.spent / budget.limit) * 100;
              const isOverBudget = percentage > 100;
              const isNearLimit = percentage > 80;
              
              return (
                <motion.div 
                  key={budget.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">{budget.category}</h4>
                    <div className="flex items-center space-x-1">
                      {onEditBudget && (
                        <motion.button 
                          onClick={() => onEditBudget(budget)} 
                          className="p-1 text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded transition-all duration-200"
                          variants={buttonHoverVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Edit className="h-3 w-3" />
                        </motion.button>
                      )}
                      {onDeleteBudget && (
                        <motion.button 
                          onClick={() => setShowDeleteConfirm(budget.id)} 
                          className="p-1 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-[#DC3545] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded transition-all duration-200"
                          variants={buttonHoverVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Trash2 className="h-3 w-3" />
                        </motion.button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-[#888888] mb-1">
                    {currency}{budget.spent.toFixed(2)} of {currency}{budget.limit} spent
                  </p>
                  
                  {budget.historicalAverage > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-2">
                      3-Month Avg: {currency}{budget.historicalAverage.toFixed(2)}
                    </p>
                  )}
                  
                  <div className="w-full bg-gray-200 dark:bg-[#1A1A1A] rounded-full h-2 overflow-hidden mb-1">
                    <motion.div
                      className={`h-2 rounded-full ${
                        isOverBudget
                          ? 'bg-[#DC3545]'
                          : isNearLimit
                          ? 'bg-gradient-to-r from-[#FFC107] to-[#DC3545]'
                          : 'bg-gradient-to-r from-[#00C9A7] to-[#007BFF]'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 1, delay: 0.3 }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <motion.span 
                      className={`font-medium ${
                        isOverBudget
                          ? 'text-[#DC3545]'
                          : isNearLimit
                          ? 'text-[#FFC107]'
                          : 'text-[#28A745]'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      {Math.round(percentage)}%
                    </motion.span>
                    <span className="text-gray-500 dark:text-[#888888]">
                      {currency}{(budget.limit - budget.spent).toFixed(2)} remaining
                    </span>
                  </div>
                  
                  {isOverBudget && (
                    <motion.p 
                      className="text-xs text-[#DC3545] font-medium mt-1"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      Over by {currency}{(budget.spent - budget.limit).toFixed(2)}
                    </motion.p>
                  )}
                </motion.div>
              );
            })}
            
            {/* Show More/Less Button */}
            {budgets.length > 3 && (
              <div className="flex justify-center pt-2">
                <motion.button
                  onClick={() => setShowAllBudgets(!showAllBudgets)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {showAllBudgets ? 'Show less' : `Show ${budgets.length - 3} more`}
                </motion.button>
              </div>
            )}
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
      
      {/* Total Budget Modal */}
      <AnimatePresence>
        {showTotalBudgetModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTotalBudgetModal(false)}
          >
            <motion.div 
              className="bg-white dark:bg-[#242424] rounded-lg p-6 w-full max-w-md"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                  {totalBudget ? 'Edit Total Budget' : 'Set Total Budget'}
                </h3>
                <button 
                  onClick={() => setShowTotalBudgetModal(false)}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-[#888888] mb-2">
                    Monthly Budget Limit
                  </label>
                  <input
                    type="number"
                    value={totalBudgetInput}
                    onChange={(e) => setTotalBudgetInput(e.target.value)}
                    placeholder={totalBudget ? totalBudget.limit.toString() : "Enter amount"}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007BFF] bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-[#F5F5F5]"
                  />
                </div>

                <div className="flex space-x-3">
                  <motion.button 
                    onClick={handleSaveTotalBudget}
                    className="flex-1 bg-[#00C9A7] text-white px-4 py-2 rounded-lg font-medium"
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    Save
                  </motion.button>
                  {totalBudget && onDeleteTotalBudget && (
                    <motion.button 
                      onClick={handleDeleteTotalBudget}
                      className="flex-1 bg-[#DC3545] text-white px-4 py-2 rounded-lg font-medium"
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Remove
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div 
              className="bg-white dark:bg-[#242424] rounded-lg p-6 w-full max-w-md"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Delete Budget</h3>
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-gray-600 dark:text-[#888888] mb-6">
                Are you sure you want to delete this budget category? This action cannot be undone.
              </p>

              <div className="flex space-x-3">
                <motion.button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 bg-gray-300 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#F5F5F5] px-4 py-2 rounded-lg font-medium"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Cancel
                </motion.button>
                <motion.button 
                  onClick={() => handleConfirmDeleteBudget(showDeleteConfirm)}
                  className="flex-1 bg-[#DC3545] text-white px-4 py-2 rounded-lg font-medium"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BudgetSummary;