import React, { useState } from 'react';
import { ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import { Transaction } from '../../types/types';

interface TransactionTableProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  currency: string;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  currency
}) => {
  const [sortBy, setSortBy] = useState<keyof Transaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleSort = (field: keyof Transaction) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedTransactions = [...transactions].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700">
      <div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-[#1A1A1A]">
            <tr>
              {[
                { key: 'date', label: 'Date' },
                { key: 'name', label: 'Name' },
                { key: 'category', label: 'Category' },
                { key: 'amount', label: 'Amount' },
                { key: 'type', label: 'Type' }
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-[#F5F5F5] cursor-pointer hover:bg-gray-100 dark:hover:bg-[#242424] transition-colors"
                  onClick={() => handleSort(key as keyof Transaction)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{label}</span>
                    <ArrowUpDown className="h-4 w-4 text-gray-400 dark:text-[#888888]" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedTransactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900 dark:text-[#F5F5F5]">
                  {new Date(transaction.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">
                  {transaction.name}
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
                    <button
                      onClick={() => onEditTransaction(transaction)}
                      className="p-2 text-gray-500 dark:text-[#888888] hover:text-blue-500 dark:hover:text-blue-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(transaction.id)}
                      className="p-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2A2A2A] transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {deleteConfirmId === transaction.id && (
                    <div className="absolute right-0 top-full mt-2 w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-3 z-20">
                      <p className="text-sm text-gray-800 dark:text-gray-200 mb-3 text-center">Are you sure?</p>
                      <div className="flex justify-center space-x-3">
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-4 py-1 text-xs font-semibold rounded-md text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onDeleteTransaction(transaction.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-4 py-1 text-xs font-semibold rounded-md text-white bg-red-500 hover:bg-red-600 transition-all duration-200"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;