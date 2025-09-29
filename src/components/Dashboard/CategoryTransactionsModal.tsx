
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../../types/types';
import { X } from 'lucide-react';

interface CategoryTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string | null;
  transactions: Transaction[];
  currency: string;
}

const CategoryTransactionsModal: React.FC<CategoryTransactionsModalProps> = ({
  isOpen,
  onClose,
  category,
  transactions,
  currency,
}) => {
  if (!category) return null;

  const filteredTransactions = transactions.filter(
    (t) => t.category === category && t.type === 'expense'
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-[#242424] rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                Transactions for {category}
              </h3>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-all duration-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-[#1A1A1A] sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-[#888888] uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-[#F5F5F5]">
                          {new Date(transaction.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">
                          {transaction.name}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-[#DC3545]">
                          {currency}
                          {Math.abs(transaction.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="text-center py-10 text-gray-500 dark:text-[#888888]">
                        No transactions found for this category.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryTransactionsModal;
