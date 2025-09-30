import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownLeft, Eye } from 'lucide-react';
import { Transaction } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiClock, FiTag } from 'react-icons/fi';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
  currency: string;
  onSaveTransaction: (transaction: Omit<Transaction, 'id'>, id: string) => void;
  categories: string[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onViewAll, currency, onSaveTransaction, categories }) => {
  const [hoveredTransaction, setHoveredTransaction] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<'name' | 'category' | null>(null);
  const [editedValue, setEditedValue] = useState('');

  const recentTransactions = transactions
    .sort((a, b) => {
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) return dateComparison;
      if (a.createdAt && b.createdAt) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    })
    .slice(0, 7);

  const handleDoubleClick = (transaction: Transaction, field: 'name' | 'category') => {
    setEditingId(transaction.id);
    setEditingField(field);
    setEditedValue(transaction[field]);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingField(null);
    setEditedValue('');
  };

  const handleSave = () => {
    if (!editingId || !editingField) return;

    const transactionToUpdate = transactions.find(t => t.id === editingId);
    if (transactionToUpdate) {
      const { id, ...transactionData } = { ...transactionToUpdate, [editingField]: editedValue };
      onSaveTransaction(transactionData, id);
    }
    handleCancel();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') handleCancel();
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Groceries': '🛒',
      'Food & Dining': '🍽️',
      'Transportation': '🚗',
      'Entertainment': '🎬',
      'Shopping': '🛍️',
      'Utilities': '⚡',
      'Health': '🏥',
      'Salary': '💼',
      'Investment': '📈',
      'Other': '📦'
    };
    return iconMap[category] || '💰';
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const txDate = new Date(date);
    const diffInMilliseconds = now.getTime() - txDate.getTime();
    const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
    const diffInHours = Math.floor(diffInMilliseconds / (1000 * 60 * 60));

    const today = new Date();
    const isToday = today.toDateString() === txDate.toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday = yesterday.toDateString() === txDate.toDateString();

    if (isToday) {
      if (diffInMinutes < 1) return 'Just now';
      if (diffInHours < 1) return `${diffInMinutes}m ago`;
      return `${diffInHours}h ago`;
    }

    if (isYesterday) {
      return 'Yesterday';
    }

    return txDate.toLocaleDateString();
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
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Recent Transactions</h3>
        <button
          onClick={onViewAll}
          className="flex items-center space-x-2 text-[#007BFF] hover:text-[#0056b3] transition-colors"
        >
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">View All</span>
        </button>
      </div>

      {recentTransactions.length === 0 ? (
        <div className="text-center py-8">
          <FiClock className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-[#888888] mb-2">No recent transactions</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Your latest transactions will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {recentTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
                onMouseEnter={() => setHoveredTransaction(transaction.id)}
                onMouseLeave={() => setHoveredTransaction(null)}
              >
                <div className={`p-3 rounded-xl border transition-all duration-200 ${
                  hoveredTransaction === transaction.id
                    ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 shadow-sm'
                    : 'bg-white dark:bg-gray-800/20 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {getCategoryIcon(transaction.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {editingId === transaction.id && editingField === 'name' ? (
                            <input 
                              type="text"
                              value={editedValue}
                              onChange={(e) => setEditedValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleSave}
                              className="w-full bg-gray-100 dark:bg-gray-700 rounded p-1 border border-blue-500 text-sm"
                              autoFocus
                            />
                          ) : (
                            <p 
                              className="font-medium text-gray-900 dark:text-white text-sm truncate cursor-pointer"
                              onDoubleClick={() => handleDoubleClick(transaction, 'name')}
                            >
                              {transaction.name}
                            </p>
                          )}
                          <div className={`p-1 rounded-full ${
                            transaction.type === 'income' 
                              ? 'bg-green-100 dark:bg-green-900/30'
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {transaction.type === 'income' ? (
                              <ArrowUpRight className="h-2 w-2 text-green-600 dark:text-green-400" />
                            ) : (
                              <ArrowDownLeft className="h-2 w-2 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <FiTag className="w-3 h-3 text-gray-400" />
                          {editingId === transaction.id && editingField === 'category' ? (
                             <select
                                value={editedValue}
                                onChange={(e) => setEditedValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onBlur={handleSave}
                                className="w-full bg-gray-100 dark:bg-gray-700 rounded p-1 border border-blue-500 text-xs"
                                autoFocus
                              >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                              </select>
                          ) : (
                            <span 
                              className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer"
                              onDoubleClick={() => handleDoubleClick(transaction, 'category')}
                            >
                              {transaction.category}
                            </span>
                          )}
                          <span className="text-gray-300 dark:text-gray-600">•</span>
                          <FiClock className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(transaction.date)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-sm ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{currency}{Math.abs(transaction.amount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">This Week</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {recentTransactions.filter(t => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(t.date) >= weekAgo;
                  }).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Latest</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {recentTransactions.length > 0 ? getTimeAgo(recentTransactions[0].date) : 'None'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default RecentTransactions;