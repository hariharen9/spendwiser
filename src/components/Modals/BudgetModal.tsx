import React, { useState, useEffect } from 'react';
import { X, Target, DollarSign, Tag } from 'lucide-react';
import { Budget } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import AnimatedDropdown from '../Common/AnimatedDropdown';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>) => void;
  editingBudget?: Budget;
  categories?: string[];
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBudget,
  categories = ['Salary', 'Freelance', 'Investment', 'Groceries', 'Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Housing', 'Health', 'Travel', 'Other']
}) => {
  const [formData, setFormData] = useState({
    category: categories[0],
    limit: '',
    spent: '0'
  });

  useEffect(() => {
    if (editingBudget) {
      setFormData({
        category: editingBudget.category,
        limit: editingBudget.limit.toString(),
        spent: editingBudget.spent.toString()
      });
    } else {
      setFormData({
        category: categories[0],
        limit: '',
        spent: '0'
      });
    }
  }, [editingBudget, isOpen, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const budget: Omit<Budget, 'id'> = {
      category: formData.category,
      limit: parseFloat(formData.limit),
      spent: editingBudget ? parseFloat(formData.spent) : 0
    };

    onSave(budget);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="p-2 bg-[#007BFF] rounded-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  {editingBudget ? 'Edit Budget' : 'Add Budget'}
                </h2>
              </motion.div>
              <motion.button
                onClick={onClose}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>

            {/* Form */}
            <motion.form 
              onSubmit={handleSubmit} 
              className="p-6 space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
            >
              {/* Category */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                    <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  Category *
                </label>
                <AnimatedDropdown
                  selectedValue={formData.category}
                  options={categories}
                  onChange={(value) => setFormData({ ...formData, category: value })}
                />
              </motion.div>

              {/* Budget Limit */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  Budget Limit *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#888888]">₹</span>
                  <input
                    type="number"
                    required
                    step="0.01"
                    min="0"
                    value={formData.limit}
                    onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-[#888888] focus:outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div 
                className="flex items-center justify-end space-x-4 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.5 }}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {editingBudget ? 'Update Budget' : 'Save Budget'}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BudgetModal;