import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from './FilterBar';
import TransactionTable from './TransactionTable';
import MobileTransactionList from './MobileTransactionList';
import TransactionSummary from './TransactionSummary';
import { Transaction, Account } from '../../types/types';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fadeInVariants, staggerContainer } from '../../components/Common/AnimationVariants';

interface TransactionsPageProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id'>, id?: string) => void;
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
  accounts: Account[]; // Add accounts property
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onEditTransaction,
  onSaveTransaction,
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
  setSortOption,
  accounts // Add accounts parameter
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthNavigatorText, setMonthNavigatorText] = useState('');

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const setMonth = (date: Date) => {
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const firstDay = new Date(Date.UTC(year, month, 1));
    const lastDay = new Date(Date.UTC(year, month + 1, 0));
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
    setCurrentMonth(date);
    // Use UTC month for toLocaleString to avoid timezone issues
    const monthName = date.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
    const yearNum = date.getUTCFullYear();
    setMonthNavigatorText(`${monthName} ${yearNum}`);
  };

  useEffect(() => {
    setMonth(new Date());
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) {
      setMonthNavigatorText('Custom Range');
      return;
    }

    try {
      const start = new Date(startDate + 'T00:00:00Z');
      const end = new Date(endDate + 'T00:00:00Z');

      const firstDayOfMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
      const lastDayOfMonth = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0));

      if (start.getTime() !== firstDayOfMonth.getTime() || end.getTime() !== lastDayOfMonth.getTime()) {
        setMonthNavigatorText('Custom Range');
      }
    } catch (e) {
      setMonthNavigatorText('Custom Range');
    }
  }, [startDate, endDate]);

  const handlePreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setMonth(newDate);
  };
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
        filtered.sort((a, b) => {
          // First sort by transaction date (newest first)
          const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateComparison !== 0) {
            return dateComparison;
          }
          
          // For transactions on the same date, sort by creation time (newest first)
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          
          // If createdAt is not available for either transaction, maintain original order
          return 0;
        });
        break;
      case 'date-asc':
        filtered.sort((a, b) => {
          // First sort by transaction date (oldest first)
          const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          if (dateComparison !== 0) {
            return dateComparison;
          }
          
          // For transactions on the same date, sort by creation time (newest first)
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          
          // If createdAt is not available for either transaction, maintain original order
          return 0;
        });
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
        // Default sort by transaction date first, then by creation time
        filtered.sort((a, b) => {
          // First sort by transaction date (newest first)
          const dateComparison = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (dateComparison !== 0) {
            return dateComparison;
          }
          
          // For transactions on the same date, sort by creation time (newest first)
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          
          // If createdAt is not available for either transaction, maintain original order
          return 0;
        });
        break;
    }

    return filtered;
  }, [transactions, searchTerm, transactionType, selectedCategory, startDate, endDate, sortOption]);

  const summary = useMemo(() => {
    const incomeTransactions = sortedAndFilteredTransactions.filter(t => t.type === 'income');
    const expenseTransactions = sortedAndFilteredTransactions.filter(t => t.type === 'expense');

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

    const categorySpending = Object.entries(categoryExpenses)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

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
      dailyAverage,
      categorySpending
    };
  }, [sortedAndFilteredTransactions, startDate, endDate]);

  return (
    <motion.div 
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Responsive Header */}
      <motion.div
        className="flex items-center justify-between"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
      >
        {/* Left side: Transaction count (subtle) */}
        <motion.h2
          className="hidden md:block text-sm font-normal text-gray-500 dark:text-gray-400 md:text-xl md:font-semibold md:text-gray-900 md:dark:text-[#F5F5F5]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {transactions.length} Transaction{transactions.length !== 1 ? 's' : ''}
        </motion.h2>

        {/* Center: Month Navigator (prominent) */}
        <motion.div
          className="flex items-center justify-center space-x-2 md:space-x-4 flex-grow"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={handlePreviousMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </motion.button>
          <span className="text-base font-bold text-gray-800 dark:text-gray-100 md:text-lg w-36 md:w-48 text-center">
            {monthNavigatorText}
          </span>
          <motion.button
            onClick={handleNextMonth}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            whileTap={{ scale: 0.9 }}
          >
            <ChevronRight className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </motion.button>
        </motion.div>

        {/* Right side: Manage Recurring button (compact) */}
        <motion.button
          onClick={onOpenRecurringModal}
          className="px-3 py-1 text-sm md:px-4 md:py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center shadow-sm md:shadow-md hover:shadow-lg"
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
          transactionCount={transactions.length}
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
          onSaveTransaction={onSaveTransaction}
          onDeleteTransaction={onDeleteTransaction}
          currency={currency}
          categories={categories}
          accounts={accounts} // Pass accounts data
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
          accounts={accounts} // Pass accounts data
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
        categorySpending={summary.categorySpending}
        currency={currency}
      />
    </motion.div>
  );
};

export default TransactionsPage;