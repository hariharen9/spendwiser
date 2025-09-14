import React from 'react';
import { Account } from '../../types/types';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';

interface AccountBalancesProps {
  accounts: Account[];
  currency: string;
}

const AccountBalances: React.FC<AccountBalancesProps> = ({ accounts, currency }) => {
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
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Account Balances</h3>
      <ul className="space-y-3">
        {accounts.map(account => (
          <li key={account.id} className="flex justify-between items-center">
            <span className="font-medium text-gray-800 dark:text-gray-200">{account.name}</span>
            <span className={`font-semibold ${account.balance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{currency}{account.balance.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AccountBalances;