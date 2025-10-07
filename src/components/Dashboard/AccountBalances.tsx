import React, { useState } from 'react';
import { Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiCreditCard, FiDollarSign, FiTrendingUp, FiTrendingDown, FiEye, FiEyeOff, FiChevronRight } from 'react-icons/fi';
import { Wallet } from 'lucide-react';

interface AccountBalancesProps {
  accounts: Account[];
  currency: string;
}

const AccountBalances: React.FC<AccountBalancesProps> = ({ accounts, currency }) => {
  const [hideBalances, setHideBalances] = useState(false);
  const [hoveredAccount, setHoveredAccount] = useState<string | null>(null);

  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit card': return FiCreditCard;
      case 'checking': return FiDollarSign;
      case 'savings': return FiTrendingUp;
      default: return FiDollarSign;
    }
  };

  const getAccountIconColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit card': return 'text-orange-500';
      case 'checking': return 'text-blue-500';
      case 'savings': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  if (accounts.length === 0) {
    return (
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Account Balances</h3>
        <p className="text-gray-500 dark:text-[#888888]">No accounts added yet.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      {/* Header with total and hide toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center"><Wallet className="w-5 h-5 mr-2" />Accounts</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {hideBalances ? '••••••' : `${currency}${totalBalance.toLocaleString()}`}
          </p>
        </div>
        <motion.button
          onClick={() => setHideBalances(!hideBalances)}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {hideBalances ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Account Cards */}
      <div className="space-y-2">
        {accounts.map((account, index) => {
          const Icon = getAccountIcon(account.type);
          const isHovered = hoveredAccount === account.id;
          
          return (
            <motion.div
              key={account.id}
              className={`relative p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border transition-all duration-200 cursor-pointer ${
                isHovered 
                  ? 'border-gray-300 dark:border-gray-500 shadow-sm' 
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -1 }}
              onMouseEnter={() => setHoveredAccount(account.id)}
              onMouseLeave={() => setHoveredAccount(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <Icon className={`w-4 h-4 ${getAccountIconColor(account.type)}`} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{account.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{account.type}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className={`font-bold text-sm ${
                      account.balance >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {hideBalances ? '••••••' : `${currency}${Math.abs(account.balance).toLocaleString()}`}
                    </p>
                    {account.type.toLowerCase() === 'credit card' && account.limit && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Limit: {currency}{account.limit.toLocaleString()}
                      </p>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center"
                      >
                        <FiChevronRight className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Health indicator for credit cards */}
              {account.type.toLowerCase() === 'credit card' && account.limit && (
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Usage</span>
                    <span>{Math.round((Math.abs(account.balance) / account.limit) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                    <motion.div 
                      className={`h-1 rounded-full ${
                        (Math.abs(account.balance) / account.limit) > 0.8 
                          ? 'bg-red-500' 
                          : (Math.abs(account.balance) / account.limit) > 0.6 
                            ? 'bg-yellow-500' 
                            : 'bg-green-500'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((Math.abs(account.balance) / account.limit) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Quick stats */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Accounts</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{accounts.length}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Net Worth</p>
            <p className={`text-sm font-semibold ${
              totalBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {hideBalances ? '••••••' : `${currency}${totalBalance.toLocaleString()}`}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AccountBalances;