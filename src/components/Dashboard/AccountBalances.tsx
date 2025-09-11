import React from 'react';
import { Account } from '../../types/types';

interface AccountBalancesProps {
  accounts: Account[];
  currency: string;
}

const AccountBalances: React.FC<AccountBalancesProps> = ({ accounts, currency }) => {
  if (accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Account Balances</h3>
        <p className="text-gray-500 dark:text-[#888888]">No accounts added yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Account Balances</h3>
      <ul className="space-y-3">
        {accounts.map(account => (
          <li key={account.id} className="flex justify-between items-center">
            <span className="font-medium text-gray-800 dark:text-gray-200">{account.name}</span>
            <span className="font-semibold text-gray-900 dark:text-white">{currency}{account.balance.toLocaleString()}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccountBalances;