import React, { useState } from 'react';
import { Transaction, Account } from '../../types/types';
import { Edit, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface MobileTransactionListProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currency: string;
  accounts: Account[]; // Add accounts property
}

const MobileTransactionList: React.FC<MobileTransactionListProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  currency,
  accounts // Add accounts parameter
}) => {
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null); // For tooltip tracking

  const toggleExpand = (id: string) => {
    setExpandedTransactionId(expandedTransactionId === id ? null : id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Group transactions by date, sorted by transaction date first, then by creation time
  const groupedTransactions = transactions
    .sort((a, b) => {
      // First sort by transaction date (newest first)
      const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
      if (dateComparison !== 0) {
        return dateComparison;
      }
      
      // For transactions on the same date, sort by creation time (newest first)
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      
      // If createdAt is not available for either transaction, maintain original order
      return 0;
    })
    .reduce((groups, transaction) => {
      const date = transaction.date.split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {} as Record<string, Transaction[]>);

  // Format date for display as header
  const formatHeaderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Find credit card account by ID
  const getCreditCardInfo = (accountId: string | undefined) => {
    if (!accountId) return null;
    const account = accounts.find(acc => acc.id === accountId);
    if (account && account.type === 'Credit Card') {
      return account;
    }
    return null;
  };

  return (
    <div className="space-y-3">
      {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
        <div key={date} className="space-y-3">
          {/* Date Header with Visual Separator - Rounded pill shape with darker color in dark mode */}
          <div className="flex items-center">
            <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#1A1A1A] px-4 py-2 rounded-full">
              {formatHeaderDate(date)}
            </div>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600 ml-3"></div>
          </div>
          
          {/* Transactions for this date */}
          {dateTransactions.map((transaction) => {
            const creditCardInfo = getCreditCardInfo(transaction.accountId);
            return (
              <motion.div
                key={transaction.id}
                className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden ml-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Main Transaction Info */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer"
                  onClick={() => toggleExpand(transaction.id)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.type === 'income' 
                        ? 'bg-green-100 dark:bg-green-900/30' 
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      <span className={`font-semibold ${
                        transaction.type === 'income' 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900 dark:text-[#F5F5F5] truncate max-w-[120px]">
                          {transaction.name}
                        </h3>
                        {creditCardInfo && (
                          <div className="relative ml-2">
                            <span 
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full cursor-pointer"
                              onMouseEnter={() => setTooltipId(transaction.id)}
                              onMouseLeave={() => setTooltipId(null)}
                            >
                              CC
                            </span>
                            {tooltipId === transaction.id && (
                              <div className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 whitespace-nowrap">
                                Paid with {creditCardInfo.name}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-[#888888]">
                        {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`font-semibold ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{currency}{Math.abs(transaction.amount)}
                    </span>
                    {expandedTransactionId === transaction.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 dark:text-[#888888]" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 dark:text-[#888888]" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedTransactionId === transaction.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <p className="text-gray-500 dark:text-[#888888]">Type</p>
                            <p className="font-medium text-gray-900 dark:text-[#F5F5F5] capitalize">
                              {transaction.type}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-[#888888]">Category</p>
                            <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                              {transaction.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-[#888888]">Date</p>
                            <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                              {formatDate(transaction.date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500 dark:text-[#888888]">Amount</p>
                            <p className={`font-medium ${
                              transaction.type === 'income' 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'}{currency}{Math.abs(transaction.amount)}
                            </p>
                          </div>
                          {creditCardInfo && (
                            <div>
                              <p className="text-gray-500 dark:text-[#888888]">Credit Card</p>
                              <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                                {creditCardInfo.name}
                              </p>
                            </div>
                          )}
                          {transaction.comments && (
                            <div className="col-span-2">
                              <p className="text-gray-500 dark:text-[#888888]">Comments</p>
                              <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                                {transaction.comments}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 pt-2">
                          <button
                            onClick={() => onEditTransaction(transaction)}
                            className="flex-1 flex items-center justify-center py-2 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg transition-colors"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(transaction.id)}
                            className="flex-1 flex items-center justify-center py-2 bg-gray-100 dark:bg-[#1A1A1A] hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Delete Confirmation */}
                <AnimatePresence>
                  {deleteConfirmId === transaction.id && (
                    <motion.div 
                      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div 
                        className="bg-white dark:bg-[#242424] rounded-lg p-6 w-full max-w-sm"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                      >
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-2">
                          Confirm Delete
                        </h3>
                        <p className="text-gray-600 dark:text-[#888888] mb-6">
                          Are you sure you want to delete this transaction?
                        </p>
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="flex-1 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 text-gray-900 dark:text-[#F5F5F5] rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              onDeleteTransaction(transaction.id);
                              setDeleteConfirmId(null);
                            }}
                            className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      ))}
      
      {transactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-[#888888]">
            No transactions found
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileTransactionList;