import React, { useMemo } from 'react';
import FilterBar from './FilterBar';
import TransactionTable from './TransactionTable';
import { Transaction } from '../../types/types';

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-[#F5F5F5]">
          {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </h2>
      </div>

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

      <TransactionTable
        transactions={filteredTransactions}
        onEditTransaction={onEditTransaction}
        onDeleteTransaction={onDeleteTransaction}
        currency={currency}
      />
    </div>
  );
};

export default TransactionsPage;