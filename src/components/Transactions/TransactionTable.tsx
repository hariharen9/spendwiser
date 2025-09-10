import React, { useState } from 'react';
import { ArrowUpDown, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Transaction } from '../../types/types';

interface TransactionTableProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [sortBy, setSortBy] = useState<keyof Transaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

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
    <div className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
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
                  {transaction.type === 'income' ? '+' : ''}₹{Math.abs(transaction.amount)}
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
                  <button
                    onClick={() => setActiveMenu(activeMenu === transaction.id ? null : transaction.id)}
                    className="text-gray-400 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] transition-all duration-200"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  
                  {activeMenu === transaction.id && (
                    <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                      <button
                        onClick={() => {
                          onEditTransaction(transaction);
                          setActiveMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-900 dark:text-[#F5F5F5] hover:bg-gray-50 dark:hover:bg-[#242424] flex items-center space-x-2 rounded-t-lg"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => {
                          onDeleteTransaction(transaction.id);
                          setActiveMenu(null);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-[#DC3545] hover:bg-gray-50 dark:hover:bg-[#242424] flex items-center space-x-2 rounded-b-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
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