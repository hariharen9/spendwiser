import React, { useState, useMemo } from 'react';
import { Download } from 'lucide-react';
import FilterBar from './FilterBar';
import TransactionTable from './TransactionTable';
import { Transaction } from '../../types/types';
import { categories } from '../../data/mockData';

interface TransactionsPageProps {
  transactions: Transaction[];
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

const TransactionsPage: React.FC<TransactionsPageProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Name', 'Category', 'Amount', 'Type', 'Credit Card'],
      ...filteredTransactions.map(t => [
        t.date,
        t.name,
        t.category,
        t.amount,
        t.type,
        t.creditCard || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-[#F5F5F5]">
          {filteredTransactions.length} Transaction{filteredTransactions.length !== 1 ? 's' : ''}
        </h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-2 bg-[#007BFF] hover:bg-[#0056b3] text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </button>
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
      />
    </div>
  );
};

export default TransactionsPage;