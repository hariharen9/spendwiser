import React, { useState } from 'react';
import { Transaction, Account } from '../../types/types';
import { motion } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants } from '../../components/Common/AnimationVariants';
import { Edit, Trash2, Check, X, MessageSquare } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void; // For modal
  onSaveTransaction: (transaction: Omit<Transaction, 'id'>, id: string) => void; // For inline save
  onDeleteTransaction: (id: string) => void;
  currency: string;
  categories: string[];
  accounts: Account[]; // Add accounts property
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEditTransaction,
  onSaveTransaction,
  onDeleteTransaction,
  currency,
  accounts // Add accounts parameter
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [tooltipId, setTooltipId] = useState<string | null>(null); // For tooltip tracking
  const [expandedTransactionId, setExpandedTransactionId] = useState<string | null>(null);

  const handleDoubleClick = (transaction: Transaction) => {
    setEditingCellId(transaction.id);
    setEditedName(transaction.name);
    setEditingTransaction(transaction);
  };

  const handleCancel = () => {
    setEditingCellId(null);
    setEditedName('');
    setEditingTransaction(null);
  };

  const handleSaveName = () => {
    if (editingTransaction && editedName) {
      const { id, ...transactionData } = { ...editingTransaction, name: editedName };
      onSaveTransaction(transactionData, id);
    }
    handleCancel();
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

  let rowIndex = 0;

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#1A1A1A]">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <motion.tbody 
            className="divide-y divide-gray-200 dark:divide-gray-700"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
              <React.Fragment key={date}>
                {/* Date Header Row */}
                <tr>
                  <td colSpan={6} className="px-6 py-2 bg-gray-50 dark:bg-[#1A1A1A]">
                    <div className="flex items-center">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {formatHeaderDate(date)}
                      </div>
                      <div className="flex-grow border-t border-gray-300 dark:border-gray-600 ml-4"></div>
                    </div>
                  </td>
                </tr>
                {/* Transaction Rows */}
                {dateTransactions.map((transaction) => {
                  const currentIndex = rowIndex++;
                  const creditCardInfo = getCreditCardInfo(transaction.accountId);
                  return (
                    <React.Fragment key={transaction.id}>
                      <motion.tr
                        className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                        variants={fadeInVariants}
                        initial="initial"
                        animate="animate"
                        transition={{ delay: currentIndex * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                      >
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-[#F5F5F5]">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td 
                          className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-[#F5F5F5] relative"
                          onDoubleClick={() => handleDoubleClick(transaction)}
                        >
                          <div className="flex items-center">
                            <span>{transaction.name}</span>
                            {creditCardInfo && (
                              <div className="relative ml-2">
                                <span 
                                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded-full cursor-pointer"
                                  onMouseEnter={() => setExpandedTransactionId(transaction.id)}
                                  onMouseLeave={() => setExpandedTransactionId(null)}
                                >
                                  CC
                                </span>
                                {expandedTransactionId === transaction.id && (
                                  <div className="absolute z-50 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded-md shadow-sm bottom-full left-1/2 transform -translate-x-1/2 -translate-y-2 whitespace-nowrap">
                                    Paid with {creditCardInfo.name}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {editingCellId === transaction.id ? (
                            <div className='relative mt-2'>
                              <input 
                                type="text" 
                                value={editedName} 
                                onChange={(e) => setEditedName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveName();
                                  if (e.key === 'Escape') handleCancel();
                                }}
                                className="w-full bg-gray-100 dark:bg-gray-800 rounded p-1 border border-blue-500"
                                autoFocus
                              />
                              <div className="absolute right-0 top-full mt-1 flex space-x-1 z-10 bg-white dark:bg-gray-800 p-1 rounded-md shadow-lg">
                                <button onClick={handleSaveName} className="p-1 text-green-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                                  <Check className="h-4 w-4" />
                                </button>
                                <button onClick={handleCancel} className="p-1 text-red-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-[#888888]">
                          {transaction.category}
                        </td>
                        <td className={`px-6 py-4 text-sm font-semibold ${
                          transaction.type === 'income' ? 'text-[#28A745]' : 'text-[#DC3545]'
                        }`}>
                          {transaction.type === 'income' ? '+' : ''}{currency}{Math.abs(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.type === 'income'
                              ? 'bg-[#28A745]/10 text-[#28A745]'
                              : 'bg-[#DC3545]/10 text-[#DC3545]'
                          }`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm relative">
                          <div className="flex items-center space-x-2">
                            {transaction.comments && (
                              <motion.button
                                onClick={() => setExpandedTransactionId(expandedTransactionId === transaction.id ? null : transaction.id)}
                                className="p-2 text-gray-500 dark:text-[#888888] hover:text-blue-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-all duration-200"
                                variants={buttonHoverVariants}
                                whileHover="hover"
                                whileTap="tap"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </motion.button>
                            )}
                            <motion.button
                              onClick={() => onEditTransaction(transaction)}
                              className="p-2 text-gray-500 dark:text-[#888888] hover:text-blue-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-all duration-200"
                              variants={buttonHoverVariants}
                              whileHover="hover"
                              whileTap="tap"
                            >
                              <Edit className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => setDeleteConfirmId(transaction.id)}
                              className="p-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-all duration-200"
                              variants={buttonHoverVariants}
                              whileHover="hover"
                              whileTap="tap"
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          </div>
                          {deleteConfirmId === transaction.id && (
                            <motion.div 
                              className="absolute right-0 top-full mt-2 w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-20"
                              initial={{ opacity: 0, scale: 0.9, y: 10 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.9, y: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 text-center">Are you sure?</p>
                              <div className="flex justify-center space-x-3">
                                <motion.button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="px-4 py-1 text-xs font-semibold rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200"
                                  variants={buttonHoverVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  Cancel
                                </motion.button>
                                <motion.button
                                  onClick={() => {
                                    onDeleteTransaction(transaction.id);
                                    setDeleteConfirmId(null);
                                  }}
                                  className="px-4 py-1 text-xs font-semibold rounded-md text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
                                  variants={buttonHoverVariants}
                                  whileHover="hover"
                                  whileTap="tap"
                                >
                                  Delete
                                </motion.button>
                              </div>
                            </motion.div>
                          )}
                        </td>
                      </motion.tr>
                      {expandedTransactionId === transaction.id && transaction.comments && (
                        <motion.tr
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                        >
                          <td colSpan={6} className="px-6 py-2 bg-gray-50 dark:bg-[#1A1A1A]">
                            <p className="text-sm text-gray-500 dark:text-[#888888]">{transaction.comments}</p>
                          </td>
                        </motion.tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </React.Fragment>
            ))}
          </motion.tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default TransactionTable;