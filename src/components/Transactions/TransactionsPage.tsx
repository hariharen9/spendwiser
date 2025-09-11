import React, { useMemo } from 'react';
import FilterBar from './FilterBar';
import TransactionTable from './TransactionTable';
import MobileTransactionList from './MobileTransactionList';
import { Transaction } from '../../types/types';
import { motion } from 'framer-motion';
import { fadeInVariants, staggerContainer } from '../../components/Common/AnimationVariants';

interface TransactionsPageProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
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
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
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
  currency
}) => {
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = transactionType === 'all' || transaction.type === transactionType;
      
      const matchesCategory = selectedCategory === '' || transaction.category === selectedCategory;
      
      // Date filtering
      let matchesDate = true;
      if (startDate && endDate) {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDate = transactionDate >= start && transactionDate <= end;
      } else if (startDate) {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        matchesDate = transactionDate >= start;
      } else if (endDate) {
        const transactionDate = new Date(transaction.date);
        const end = new Date(endDate);
        matchesDate = transactionDate <= end;
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, searchTerm, transactionType, selectedCategory, startDate, endDate]);

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
          {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </motion.h2>
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
          transactions={filteredTransactions}
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
          transactions={filteredTransactions}
          onEditTransaction={onEditTransaction}
          onDeleteTransaction={onDeleteTransaction}
          currency={currency}
        />
      </motion.div>
    </motion.div>
  );
};

export default TransactionsPage;