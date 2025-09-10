import React, { useState, useEffect } from 'react';
import { X, Target } from 'lucide-react';
import { Budget } from '../../types/types';
import { categories } from '../../data/mockData';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Omit<Budget, 'id'>) => void;
  editingBudget?: Budget;
}

const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingBudget
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
  }, [editingBudget, isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#007BFF] rounded-lg">
              <Target className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
              {editingBudget ? 'Edit Budget' : 'Add Budget'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
              Category *
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Budget Limit */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
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
                className="w-full pl-8 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#888888] focus:outline-none focus:border-[#007BFF]"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
            >
              {editingBudget ? 'Update Budget' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetModal;
