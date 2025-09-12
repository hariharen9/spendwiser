import React from 'react';
import { Transaction } from '../../types/types';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';

interface CashFlowForecastProps {
  transactions: Transaction[];
  currency: string;
}

const CashFlowForecast: React.FC<CashFlowForecastProps> = ({ transactions, currency }) => {
  const calculateForecast = () => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const daysRemaining = daysInMonth - today.getDate();

    const thisMonthTransactions = transactions.filter(t => {
      const txDate = new Date(t.date);
      return txDate >= startOfMonth && txDate <= endOfMonth;
    });

    const incomeThisMonth = thisMonthTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expensesSoFar = thisMonthTransactions
      .filter(t => t.type === 'expense' && new Date(t.date) <= today)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Simplified recurring expense prediction
    const recurringExpenses = thisMonthTransactions
      .filter(t => t.type === 'expense' && t.name.toLowerCase().includes('subscription'))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const nonRecurringExpenses = expensesSoFar - recurringExpenses;
    const avgDailySpend = nonRecurringExpenses / today.getDate();
    const projectedDailySpend = avgDailySpend * daysRemaining;

    const forecast = incomeThisMonth - expensesSoFar - projectedDailySpend;

    return { forecast, incomeThisMonth, expensesSoFar };
  };

  const { forecast, incomeThisMonth, expensesSoFar } = calculateForecast();

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">End of Month Forecast</h3>
      <div className="text-center">
        <p className={`text-4xl font-bold ${forecast >= 0 ? 'text-green-500' : 'text-red-500'}`}>{currency}{forecast.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        <p className="text-gray-500 dark:text-[#888888]">Projected Net Cash Flow</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Income this month:</span>
          <span className="text-sm font-medium text-green-500">{currency}{incomeThisMonth.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Expenses so far:</span>
          <span className="text-sm font-medium text-red-500">{currency}{expensesSoFar.toLocaleString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default CashFlowForecast;