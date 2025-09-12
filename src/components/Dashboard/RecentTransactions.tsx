import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Eye } from 'lucide-react';
import { Transaction } from '../../types/types';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';

interface RecentTransactionsProps {
  transactions: Transaction[];
  onViewAll: () => void;
  currency: string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, onViewAll, currency }) => {
  const recentTransactions = transactions.slice(0, 5);

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

      <div className="space-y-4">
        {recentTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                transaction.type === 'income' 
                  ? 'bg-[#28A745]/10 text-[#28A745]'
                  : 'bg-[#DC3545]/10 text-[#DC3545]'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4" />
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">{transaction.name}</p>
                <p className="text-sm text-gray-500 dark:text-[#888888]">{transaction.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${
                transaction.type === 'income' ? 'text-[#28A745]' : 'text-[#DC3545]'
              }`}>
                {transaction.type === 'income' ? '+' : ''}{currency}{Math.abs(transaction.amount)}
              </p>
              <p className="text-sm text-[#888888]">
                {new Date(transaction.date).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentTransactions;