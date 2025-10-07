
import React, { useState, useMemo } from 'react';
import { Account, Transaction } from '../../types/types';

import { motion } from 'framer-motion';
import { fadeInVariants } from '../Common/AnimationVariants';
import { TrendingUp, TrendingDown, Minus, Info, Scale } from 'lucide-react';

interface MonthlyBalanceWidgetProps {
  accounts: Account[];
  transactions: Transaction[];
  currency: string;
}

const MonthlyBalanceWidget: React.FC<MonthlyBalanceWidgetProps> = ({ accounts, transactions, currency }) => {
  const [activeTab, setActiveTab] = useState('Overall');
  const [isInfoVisible, setIsInfoVisible] = useState(false);

  const monthlyData = useMemo(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const calculateBalanceData = (account: Account | null) => {
      const relevantTransactions = account
        ? transactions.filter(t => t.accountId === account.id)
        : transactions;

      const transactionsThisMonth = relevantTransactions.filter(t => new Date(t.date) >= firstDayOfMonth);

      const currentBalance = account ? account.balance : accounts.reduce((sum, acc) => acc.type !== 'Credit Card' ? sum + acc.balance : sum, 0);

      const sumOfMonthTransactions = transactionsThisMonth.reduce((sum, t) => sum + t.amount, 0);

      const startOfMonthBalance = currentBalance - sumOfMonthTransactions;
      
      const difference = currentBalance - startOfMonthBalance;

      return {
        startOfMonthBalance,
        currentBalance,
        difference,
      };
    };

    const overallData = calculateBalanceData(null);

    const individualAccountsData = accounts
      .filter(acc => acc.type !== 'Credit Card')
      .map(account => ({
        accountName: account.name,
        ...calculateBalanceData(account),
      }));

    return {
      overall: overallData,
      accounts: individualAccountsData,
    };
  }, [accounts, transactions]);

  const renderDifference = (difference: number) => {
    const isIncrease = difference > 0;
    const isDecrease = difference < 0;
    const Icon = isIncrease ? TrendingUp : isDecrease ? TrendingDown : Minus;
    const color = isIncrease ? 'text-green-500' : isDecrease ? 'text-red-500' : 'text-gray-500';

    return (
      <span className={`flex items-center text-sm font-medium ${color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {currency}{Math.abs(difference).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    );
  };

  const tabs = [
    { id: 'Overall', label: 'Overall' },
    ...accounts.filter(acc => acc.type !== 'Credit Card').map(acc => ({ id: acc.name, label: acc.name }))
  ];

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 h-full flex flex-col"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
            <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center"><Scale className="w-5 h-5 mr-2" />Monthly Balance</h3>
        <div
          className="relative"
          onMouseEnter={() => setIsInfoVisible(true)}
          onMouseLeave={() => setIsInfoVisible(false)}
        >
          <Info className="h-5 w-5 text-gray-400 cursor-pointer" />
          {isInfoVisible && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-800 text-white text-sm rounded-lg p-3 shadow-lg z-10">
              This widget shows your balance at the start of the current month versus your current balance, for all accounts or a specific one.
            </div>
          )}
        </div>
      </div>
      <div className="mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2 -mx-6 px-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow">
        {activeTab === 'Overall' ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-[#888888]">Start of Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                {currency}{monthlyData.overall.startOfMonthBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-[#888888]">Current Balance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                {currency}{monthlyData.overall.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-[#888888]">Change</p>
              {renderDifference(monthlyData.overall.difference)}
            </div>
          </div>
        ) : (
          monthlyData.accounts.filter(acc => acc.accountName === activeTab).map(accData => (
            <div key={accData.accountName} className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-[#888888]">Start of Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  {currency}{accData.startOfMonthBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-[#888888]">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  {currency}{accData.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-[#888888]">Change</p>
                {renderDifference(accData.difference)}
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default MonthlyBalanceWidget;
