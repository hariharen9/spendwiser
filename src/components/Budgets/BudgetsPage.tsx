import React from 'react';
import { Target, TrendingUp, Plus, Edit, Trash2 } from 'lucide-react';
import { Budget, Transaction } from '../../types/types';
import { motion } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants, cardHoverVariants } from '../../components/Common/AnimationVariants';

interface BudgetsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  onEditBudget: (budget: Budget) => void;
  onAddBudget: () => void;
  onDeleteBudget: (id: string) => void;
  currency: string;
}

const BudgetsPage: React.FC<BudgetsPageProps> = ({ budgets, transactions, onEditBudget, onAddBudget, onDeleteBudget, currency }) => {

  const totalSpent = budgets.reduce((total, budget) => {
    const categorySpent = transactions
      .filter(t => t.type === 'expense' && t.category === budget.category)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return total + categorySpent;
  }, 0);

  return (
    <motion.div 
      className="space-y-8"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Overview Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
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
            const calculatedSpent = transactions
              .filter(t => t.type === 'expense' && t.category === budget.category)
              .reduce((sum, t) => sum + Math.abs(t.amount), 0);

            const percentage = (calculatedSpent / budget.limit) * 100;
            const isOverBudget = percentage > 100;
            const isNearLimit = percentage > 80;

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
                         onClick={() => onDeleteBudget(budget.id)} 
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
    </motion.div>
  );
};

export default BudgetsPage;