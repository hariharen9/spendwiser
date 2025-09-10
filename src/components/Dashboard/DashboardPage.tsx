import React from 'react';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import MetricCard from './MetricCard';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import { Transaction } from '../../types/types';

interface DashboardPageProps {
  transactions: Transaction[];
  onViewAllTransactions: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions, onViewAllTransactions }) => {
  // Calculate metrics
  const totalBalance = 12750.50;
  const monthlyIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = Math.abs(
    transactions
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
          change="+2.5%"
          changeType="positive"
          icon={DollarSign}
          color="bg-[#007BFF]"
        />
        <MetricCard
          title="This Month's Income"
          value={`₹${monthlyIncome.toLocaleString()}`}
          change="+12.3%"
          changeType="positive"
          icon={TrendingUp}
          color="bg-[#28A745]"
        />
        <MetricCard
          title="This Month's Expenses"
          value={`₹${monthlyExpenses.toLocaleString()}`}
          change="-5.1%"
          changeType="negative"
          icon={TrendingDown}
          color="bg-[#DC3545]"
        />
      </div>

      {/* Charts and Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SpendingChart />
        <RecentTransactions 
          transactions={transactions}
          onViewAll={onViewAllTransactions}
        />
      </div>
    </div>
  );
};

export default DashboardPage;