import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import MetricCard from './MetricCard';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import { Transaction, Account } from '../../types/types';

interface DashboardPageProps {
  transactions: Transaction[];
  accounts: Account[];
  onViewAllTransactions: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions, accounts, onViewAllTransactions }) => {
  // Calculate metrics
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const currentMonthTxs = transactions.filter(t => {
    const txDate = new Date(t.date);
    const today = new Date();
    return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
  });

  const monthlyIncome = currentMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = Math.abs(
    currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Balance"
          value={`₹${totalBalance.toLocaleString()}`}
          icon={DollarSign}
          color="bg-[#007BFF]"
        />
        <MetricCard
          title="This Month's Income"
          value={`₹${monthlyIncome.toLocaleString()}`}
          icon={TrendingUp}
          color="bg-[#28A745]"
        />
        <MetricCard
          title="This Month's Expenses"
          value={`₹${monthlyExpenses.toLocaleString()}`}
          icon={TrendingDown}
          color="bg-[#DC3545]"
        />
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart transactions={currentMonthTxs} />
        <RecentTransactions 
          transactions={transactions}
          onViewAll={onViewAllTransactions}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
