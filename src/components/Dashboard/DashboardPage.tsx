import React from 'react';
import Masonry from 'react-masonry-css';
import { DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import MetricCard from './MetricCard';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import { Transaction, Account, Budget } from '../../types/types';
import IncomeVsExpenseChart from './IncomeVsExpenseChart';
import BudgetSummary from './BudgetSummary';
import AccountBalances from './AccountBalances';
import TopSpendingCategories from './TopSpendingCategories';
import './Dashboard.css';

interface DashboardPageProps {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  onViewAllTransactions: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions, accounts, budgets, onViewAllTransactions }) => {
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

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        <SpendingChart transactions={currentMonthTxs} />
        <RecentTransactions 
          transactions={transactions}
          onViewAll={onViewAllTransactions}
        />
        <IncomeVsExpenseChart transactions={transactions} />
        <TopSpendingCategories transactions={transactions} />
        <BudgetSummary budgets={budgets} transactions={transactions} />
        <AccountBalances accounts={accounts} />
      </Masonry>
    </div>
  );
};

export default DashboardPage;