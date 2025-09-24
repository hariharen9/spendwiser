import React, { useState } from 'react';
import { Target, TrendingUp, Plus, Edit, Trash2, X, DollarSign } from 'lucide-react';
import { Budget, Transaction, TotalBudget } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants, cardHoverVariants, modalVariants } from '../../components/Common/AnimationVariants';

interface BudgetsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  totalBudget: TotalBudget | null;
  onEditBudget: (budget: Budget) => void;
  onAddBudget: () => void;
  onDeleteBudget: (id: string) => void;
  onSaveTotalBudget: (limit: number) => void;
  onDeleteTotalBudget: () => void;
  currency: string;
}

const BudgetsPage: React.FC<BudgetsPageProps> = ({ 
  budgets, 
  transactions, 
  totalBudget,
  onEditBudget, 
  onAddBudget, 
  onDeleteBudget, 
  onSaveTotalBudget,
  onDeleteTotalBudget,
  currency 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showTotalBudgetModal, setShowTotalBudgetModal] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState('');

  const totalSpent = budgets.reduce((total, budget) => {
    const categorySpent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return total + categorySpent;
  }, 0);

  const handleConfirmDeleteBudget = (id: string) => {
    onDeleteBudget(id);
    setShowDeleteConfirm(null);
  };

  const handleSaveTotalBudget = () => {
    const limit = parseFloat(totalBudgetInput);
    if (!isNaN(limit) && limit > 0) {
      onSaveTotalBudget(limit);
      setShowTotalBudgetModal(false);
      setTotalBudgetInput('');
    }
  };

  const handleDeleteTotalBudget = () => {
    onDeleteTotalBudget();
    setShowTotalBudgetModal(false);
  };

  // Calculate monthly expenses for total budget
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = transactions
    .filter(t => {
      const txDate = new Date(t.date);
      return t.type === 'expense' && 
             txDate.toISOString().slice(0, 7) === currentMonth;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalBudgetPercentage = totalBudget && totalBudget.limit > 0 
    ? (monthlyExpenses / totalBudget.limit) * 100 
    : 0;
  const isTotalBudgetOver = totalBudgetPercentage > 100;
  const isTotalBudgetNearLimit = totalBudgetPercentage > 80;

  return (
    <motion.div 
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Overview Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {/* Total Monthly Budget Card */}
        <motion.div 
          className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          variants={cardHoverVariants}
          initial="initial"
          whileHover="hover"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div 
              className="p-3 bg-gradient-to-r from-[#FF6B6B] to-[#FF8E53] rounded-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <DollarSign className="h-6 w-6 text-white" />
            </motion.div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-500 dark:text-[#888888]">Total Monthly Budget</h3>
              {totalBudget ? (
                <motion.p 
                  className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {currency}{totalBudget.limit.toLocaleString()}
                </motion.p>
              ) : (
                <motion.p 
                  className="text-sm text-gray-500 dark:text-[#888888]"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Not set
                </motion.p>
              )}
            </div>
          </div>
          
          {totalBudget && (
            <div className="space-y-3">
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
        </motion.div>

        {/* Existing Total Budgeted Card */}
        <motion.div 
          className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          variants={cardHoverVariants}
          initial="initial"
          whileHover="hover"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div 
              className="p-3 bg-[#007BFF] rounded-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Target className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-[#888888]">Total Budgeted</h3>
              <motion.p 
                className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currency}{budgets.reduce((sum, b) => sum + b.limit, 0).toLocaleString()}
              </motion.p>
            </div>
          </div>
        </motion.div>

        {/* Existing Total Spent Card */}
        <motion.div 
          className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          variants={cardHoverVariants}
          initial="initial"
          whileHover="hover"
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.div 
              className="p-3 bg-[#00C9A7] rounded-lg"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <TrendingUp className="h-6 w-6 text-white" />
            </motion.div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-[#888888]">Total Spent</h3>
              <motion.p 
                className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {currency}{totalSpent.toLocaleString()}
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>

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
                  {totalBudget && (
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

      {/* Budget Categories */}
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
      >
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Budget Categories</h3>
          <motion.button 
            onClick={onAddBudget}
            className="flex items-center space-x-2 bg-[#00C9A7] text-white px-4 py-2 rounded-lg font-medium"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Plus className="h-4 w-4" />
            <span>Add Budget</span>
          </motion.button>
        </motion.div>
        <motion.div 
          className="space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {budgets.map((budget, index) => {
            const currentMonthStr = new Date().toISOString().slice(0, 7);
            const categoryTransactions = transactions.filter(t => t.type === 'expense' && t.category === budget.category);

            const calculatedSpent = categoryTransactions
              .filter(t => t.date.startsWith(currentMonthStr))
              .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            const percentage = (calculatedSpent / budget.limit) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80;

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

            return (
              <motion.div 
                key={budget.id} 
                className="space-y-3"
                variants={fadeInVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">{budget.category}</h4>
                    <p className="text-sm text-gray-500 dark:text-[#888888]">
                      {currency}{calculatedSpent.toFixed(2)} of {currency}{budget.limit} spent
                    </p>
                    {historicalAverage > 0 && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        3-Month Avg: {currency}{historicalAverage.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <motion.span 
                        className={`text-sm font-medium ${
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
                      <p className="text-sm text-gray-500 dark:text-[#888888]">
                        {currency}{(budget.limit - calculatedSpent).toFixed(2)} remaining
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                       <motion.button 
                         onClick={() => onEditBudget(budget)} 
                         className="p-2 text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200"
                         variants={buttonHoverVariants}
                         whileHover="hover"
                         whileTap="tap"
                       >
                          <Edit className="h-4 w-4" />
                       </motion.button>
                       <motion.button 
                         onClick={() => setShowDeleteConfirm(budget.id)} 
                         className="p-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-[#DC3545] hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200"
                         variants={buttonHoverVariants}
                         whileHover="hover"
                         whileTap="tap"
                       >
                          <Trash2 className="h-4 w-4" />
                       </motion.button>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 dark:bg-[#1A1A1A] rounded-full h-3 overflow-hidden">
                  <motion.div
                    className={`h-3 rounded-full ${
                      isOverBudget
                        ? 'bg-[#DC3545]'
                        : isNearLimit
                        ? 'bg-gradient-to-r from-[#FFC107] to-[#DC3545]'
                        : 'bg-gradient-to-r from-[#00C9A7] to-[#007BFF]'
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(percentage, 100)}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  ></motion.div>
                </div>

                {isOverBudget && (
                  <motion.p 
                    className="text-xs text-[#DC3545] font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Over budget by {currency}{(calculatedSpent - budget.limit).toFixed(2)}
                  </motion.p>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>

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
    </motion.div>
  );
};

export default BudgetsPage;