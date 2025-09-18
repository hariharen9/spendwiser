import React, { useMemo } from 'react';
import FilterBar from './FilterBar';
import TransactionTable from './TransactionTable';
import MobileTransactionList from './MobileTransactionList';
import TransactionSummary from './TransactionSummary';
import { Transaction } from '../../types/types';
import { motion } from 'framer-motion';
import { fadeInVariants, staggerContainer } from '../../components/Common/AnimationVariants';

interface TransactionsPageProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenRecurringModal: () => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  transactionType: string;
  setTransactionType: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  categories: string[];
  currency: string;
  sortOption: string;
  setSortOption: (value: string) => void;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onOpenRecurringModal,
  searchTerm,
  setSearchTerm,
  transactionType,
  setTransactionType,
  selectedCategory,
  setSelectedCategory,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  categories,
  currency,
  sortOption,
  setSortOption
}) => {
  const summary = useMemo(() => {
    const incomeTransactions = transactions.filter(t => t.type === 'income');
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const netTotal = totalIncome - totalExpenses;

    const incomeCount = incomeTransactions.length;
    const expenseCount = expenseTransactions.length;

    const avgIncome = incomeCount > 0 ? totalIncome / incomeCount : 0;
    const avgExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

    const largestIncome = incomeTransactions.length > 0 ? Math.max(...incomeTransactions.map(t => t.amount)) : 0;
    const largestExpense = expenseTransactions.length > 0 ? Math.max(...expenseTransactions.map(t => Math.abs(t.amount))) : 0;

    const categoryExpenses: { [key: string]: number } = {};
    expenseTransactions.forEach(t => {
      categoryExpenses[t.category] = (categoryExpenses[t.category] || 0) + Math.abs(t.amount);
    });

    const topCategory = Object.keys(categoryExpenses).length > 0 ? Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';

    let dailyAverage = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      if (diffDays > 0) {
        dailyAverage = totalExpenses / diffDays;
      }
    }

    return {
      totalIncome,
      totalExpenses,
      netTotal,
      incomeCount,
      expenseCount,
      avgIncome,
      avgExpense,
      largestIncome,
      largestExpense,
      topCategory,
      dailyAverage
    };
  }, [transactions, startDate, endDate]);

  const sortedAndFilteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      const matchesSearch = searchTerm === '' || transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = transactionType === 'all' || transaction.type === transactionType;
      const matchesCategory = selectedCategory === '' || transaction.category === selectedCategory;

      const transactionDate = new Date(transaction.date);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      const matchesDate = (!start || transactionDate >= start) && (!end || transactionDate <= end);

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });


    switch (sortOption) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest-income':
        filtered.sort((a, b) => {
          if (a.type === 'income' && b.type === 'income') return b.amount - a.amount;
          if (a.type === 'income') return -1;
          if (b.type === 'income') return 1;
          return 0;
        });
        break;
      case 'lowest-income':
        filtered.sort((a, b) => {
          if (a.type === 'income' && b.type === 'income') return a.amount - b.amount;
          if (a.type === 'income') return -1;
          if (b.type === 'income') return 1;
          return 0;
        });
        break;
      case 'highest-expense':
        filtered.sort((a, b) => {
          if (a.type === 'expense' && b.type === 'expense') return Math.abs(b.amount) - Math.abs(a.amount);
          if (a.type === 'expense') return -1;
          if (b.type === 'expense') return 1;
          return 0;
        });
        break;
      case 'lowest-expense':
        filtered.sort((a, b) => {
          if (a.type === 'expense' && b.type === 'expense') return Math.abs(a.amount) - Math.abs(b.amount);
          if (a.type === 'expense') return -1;
          if (b.type === 'expense') return 1;
          return 0;
        });
        break;
      default:
        // Default sort by date descending
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    return filtered;
  }, [transactions, searchTerm, transactionType, selectedCategory, startDate, endDate, sortOption]);

  return (
    <motion.div 
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
      >
        <motion.h2 
          className="text-xl font-semibold text-gray-900 dark:text-[#F5F5F5]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}
        </motion.h2>
        <motion.button
            onClick={onOpenRecurringModal}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center shadow-md hover:shadow-lg"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
        >
            Manage Recurring
        </motion.button>
      </motion.div>

      <motion.div
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          transactionType={transactionType}
          onTransactionTypeChange={setTransactionType}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={setStartDate}
          onEndDateChange={setEndDate}
          sortOption={sortOption}
          onSortChange={setSortOption}
        />
      </motion.div>

      {/* Desktop View */}
      <motion.div
        className="hidden md:block"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <TransactionTable
          transactions={sortedAndFilteredTransactions}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          currency={currency}
        />
      </motion.div>

      {/* Mobile View */}
      <motion.div
        className="md:hidden"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <MobileTransactionList
          transactions={sortedAndFilteredTransactions}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          currency={currency}
        />
      </motion.div>

      <TransactionSummary
        totalExpenses={summary.totalExpenses}
        netTotal={summary.netTotal}
        incomeCount={summary.incomeCount}
        expenseCount={summary.expenseCount}
        avgIncome={summary.avgIncome}
        avgExpense={summary.avgExpense}
        largestIncome={summary.largestIncome}
        largestExpense={summary.largestExpense}
        topCategory={summary.topCategory}
        dailyAverage={summary.dailyAverage}
        currency={currency}
      />
    </motion.div>
  );
};

export default TransactionsPage;