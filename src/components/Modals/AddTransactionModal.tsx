import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Transaction } from '../../types/types';
import { categories, mockCreditCards } from '../../data/mockData';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction?: Transaction;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: categories[0],
    type: 'expense' as 'income' | 'expense',
    creditCard: '',
    comments: ''
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        name: editingTransaction.name,
        amount: Math.abs(editingTransaction.amount).toString(),
        date: editingTransaction.date,
        category: editingTransaction.category,
        type: editingTransaction.type,
        creditCard: editingTransaction.creditCard || '',
        comments: editingTransaction.comments || ''
      });
    } else {
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: categories[0],
        type: 'expense',
        creditCard: '',
        comments: ''
      });
    }
  }, [editingTransaction, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === 'expense' ? -amount : amount;

    const transaction: Omit<Transaction, 'id'> = {
      name: formData.name,
      amount: finalAmount,
      date: formData.date,
      category: formData.category,
      type: formData.type,
      creditCard: formData.creditCard || undefined,
      comments: formData.comments || undefined
    };

    onSave(transaction);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#007BFF] rounded-lg">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
              {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Transaction Name */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
              Transaction Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#888888] focus:outline-none focus:border-[#007BFF]"
              placeholder="e.g., Coffee Shop, Salary, Gas Station"
            />
          </div>

          {/* Amount and Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                Amount *
              </label>
              <input
                type="number"
                required
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#888888] focus:outline-none focus:border-[#007BFF]"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income' })}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    formData.type === 'income'
                      ? 'bg-[#28A745] text-white'
                      : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#888888] border border-gray-300 dark:border-gray-600 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
                  }`}
                >
                  Income
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense' })}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    formData.type === 'expense'
                      ? 'bg-[#DC3545] text-white'
                      : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#888888] border border-gray-300 dark:border-gray-600 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
                  }`}
                >
                  Expense
                </button>
              </div>
            </div>
          </div>

          {/* Date and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                Date *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Credit Card */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
              Credit Card (Optional)
            </label>
            <select
              value={formData.creditCard}
              onChange={(e) => setFormData({ ...formData, creditCard: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
            >
              <option value="">None</option>
              {mockCreditCards.map(card => (
                <option key={card.id} value={card.name}>{card.name}</option>
              ))}
            </select>
          </div>

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
              Comments (Optional)
            </label>
            <textarea
              rows={3}
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#888888] focus:outline-none focus:border-[#007BFF] resize-none"
              placeholder="Add any additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
            >
              {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;