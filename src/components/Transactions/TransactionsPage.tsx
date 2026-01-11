import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from './FilterBar';
import SmartTransactionTable from './TransactionTable';
import MobileTransactionList from './MobileTransactionList';
import TransactionSummary from './TransactionSummary';
import { Transaction, Account, RecurringTransaction } from '../../types/types';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Trash2, Calendar, List, Search, BarChart3, X } from 'lucide-react';
import { fadeInVariants, staggerContainer } from '../../components/Common/AnimationVariants';
import CalendarView from './CalendarView';
import { BarChart, Bar, ResponsiveContainer, Cell, Tooltip } from 'recharts';

interface TransactionsPageProps {
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
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
  accounts: Account[];
}

const SpendingPulse: React.FC<{
  transactions: Transaction[];
  currentMonth: Date;
  onSelectDate: (date: string | null) => void;
  selectedDate: string | null;
  currency: string;
}> = ({ transactions, currentMonth, onSelectDate, selectedDate, currency }) => {
  const data = useMemo(() => {
    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const chartData = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const daySpend = transactions
        .filter(t => t.date === dateStr && t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      chartData.push({ day: i, date: dateStr, amount: daySpend });
    }
    return chartData;
  }, [transactions, currentMonth]);

  return (
    <div className="h-32 w-full bg-white dark:bg-[#1A1A1A] rounded-2xl p-4 border border-gray-100 dark:border-gray-800 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
          <BarChart3 size={14} />
          Spending Pulse
        </h3>
        {selectedDate && (
          <button 
            onClick={() => onSelectDate(null)}
            className="text-[10px] font-bold text-blue-500 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full flex items-center gap-1 hover:bg-blue-100 transition-colors"
          >
            Clear Filter <X size={10} />
          </button>
        )}
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} onClick={(data) => data && onSelectDate(data.activePayload?.[0].payload.date)}>
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-gray-900 text-white text-xs p-2 rounded-lg font-bold shadow-xl">
                    {currency}{payload[0].value}
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="amount" radius={[4, 4, 4, 4]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.date === selectedDate ? '#3b82f6' : entry.amount > 0 ? '#cbd5e1' : '#f1f5f9'} 
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

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
  accounts,
  recurringTransactions
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [monthNavigatorText, setMonthNavigatorText] = useState('');
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showOnlyCC, setShowOnlyCC] = useState(false);
  const [showOnlyWithComments, setShowOnlyWithComments] = useState(false);
  const [pulseDateFilter, setPulseDateFilter] = useState<string | null>(null);

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const setMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    setStartDate(formatDate(firstDay));
    setEndDate(formatDate(lastDay));
    setCurrentMonth(date);
    setPulseDateFilter(null); // Reset pulse filter when month changes
  };

  useEffect(() => {
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });
    const yearNum = currentMonth.getFullYear();
    setMonthNavigatorText(`${monthName} ${yearNum}`);
  }, [currentMonth]);

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
      // Text search filter
      const matchesSearch = searchTerm === '' || transaction.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Transaction type filter
      const matchesType = transactionType === 'all' || transaction.type === transactionType;
      
      // Category filter (single or multiple)
      let matchesCategory = true;
      if (selectedCategories.length > 0) {
        matchesCategory = selectedCategories.includes(transaction.category);
      } else if (selectedCategory) {
        matchesCategory = transaction.category === selectedCategory;
      }
      
      // Amount range filter
      let matchesAmount = true;
      const amount = Math.abs(transaction.amount);
      if (minAmount && amount < parseFloat(minAmount)) {
        matchesAmount = false;
      }
      if (maxAmount && amount > parseFloat(maxAmount)) {
        matchesAmount = false;
      }
      
      // Date filter
      const transactionDate = new Date(transaction.date);
      // Adjust for timezone offset to ensure correct date comparison
      const transactionDateString = transaction.date.split('T')[0];
      
      // Pulse Filter (Specific Day)
      if (pulseDateFilter) {
        if (transactionDateString !== pulseDateFilter) return false;
      }

      // Range Filter
      let matchesDate = true;
      if (startDate && endDate) {
         matchesDate = transactionDateString >= startDate && transactionDateString <= endDate;
      }

      const isCCTransaction = accounts.find(acc => acc.id === transaction.accountId)?.type === 'Credit Card';
      const matchesCC = !showOnlyCC || isCCTransaction;

      const matchesComments = !showOnlyWithComments || (transaction.comments && transaction.comments.trim() !== '');
      
      return matchesSearch && matchesType && matchesCategory && matchesAmount && matchesDate && matchesCC && matchesComments;
    });

    // Sort Logic (unchanged)
    switch (sortOption) {
      case 'date-desc':
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
      case 'date-asc':
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'highest-income':
        filtered.sort((a, b) => (a.type === 'income' && b.type === 'income') ? b.amount - a.amount : 0);
        break;
      case 'lowest-income':
        filtered.sort((a, b) => (a.type === 'income' && b.type === 'income') ? a.amount - b.amount : 0);
        break;
      case 'highest-expense':
        filtered.sort((a, b) => (a.type === 'expense' && b.type === 'expense') ? Math.abs(b.amount) - Math.abs(a.amount) : 0);
        break;
      case 'lowest-expense':
        filtered.sort((a, b) => (a.type === 'expense' && b.type === 'expense') ? Math.abs(a.amount) - Math.abs(b.amount) : 0);
        break;
      default:
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }

    return filtered;
  }, [transactions, searchTerm, transactionType, selectedCategory, selectedCategories, minAmount, maxAmount, startDate, endDate, sortOption, showOnlyCC, showOnlyWithComments, accounts, pulseDateFilter]);

  const summary = useMemo(() => {
    // ... (Existing summary logic logic retained for bottom stats)
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
    // ... (rest of summary logic)
    return {
      totalIncome, totalExpenses, netTotal, incomeCount, expenseCount, avgIncome, avgExpense,
      largestIncome, largestExpense, topCategory, dailyAverage, categorySpending
    };
  }, [sortedAndFilteredTransactions, startDate, endDate]);

  const handleSelectAll = () => {
    if (selectedTransactions.length === sortedAndFilteredTransactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(sortedAndFilteredTransactions.map(t => t.id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedTransactions.length} transaction(s)?`)) {
      selectedTransactions.forEach(id => onDeleteTransaction(id));
      setSelectedTransactions([]);
    }
  };

  return (
    <motion.div 
      className="space-y-6 pb-20"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header & Month Nav */}
      <motion.div className="flex flex-col md:flex-row items-center justify-between gap-4" variants={fadeInVariants}>
        <div className="flex items-center gap-4 bg-white dark:bg-[#1A1A1A] p-1.5 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
          <motion.button onClick={handlePreviousMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" whileTap={{ scale: 0.9 }}>
            <ChevronLeft size={20} className="text-gray-600 dark:text-gray-300" />
          </motion.button>
          <span className="text-sm font-bold w-32 text-center text-gray-900 dark:text-white">{monthNavigatorText}</span>
          <motion.button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full" whileTap={{ scale: 0.9 }}>
            <ChevronRight size={20} className="text-gray-600 dark:text-gray-300" />
          </motion.button>
        </div>

        <div className="flex-1 w-full max-w-md relative hidden md:block">
           <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
           <input 
             type="text" 
             placeholder="Search transactions..." 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-shadow"
           />
        </div>

        <div className="flex gap-2">
           <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl flex">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-gray-700 shadow text-blue-600' : 'text-gray-500'}`}
              >
                <Calendar size={18} />
              </button>
           </div>
           <motion.button
            onClick={onOpenRecurringModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            >
            Recurring
            </motion.button>
        </div>
      </motion.div>

      {/* Spending Pulse Chart */}
      {viewMode === 'list' && (
        <motion.div variants={fadeInVariants}>
          <SpendingPulse 
            transactions={transactions} 
            currentMonth={currentMonth} 
            onSelectDate={setPulseDateFilter}
            selectedDate={pulseDateFilter}
            currency={currency}
          />
        </motion.div>
      )}

      {/* Filters & Content */}
      <motion.div variants={fadeInVariants} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters (Desktop) */}
        <div className="hidden lg:block space-y-6">
           <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 border border-gray-200 dark:border-gray-800 sticky top-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Filters</h3>
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
                minAmount={minAmount}
                maxAmount={maxAmount}
                onMinAmountChange={setMinAmount}
                onMaxAmountChange={setMaxAmount}
                selectedCategories={selectedCategories}
                onSelectedCategoriesChange={setSelectedCategories}
                showOnlyCC={showOnlyCC}
                onShowOnlyCCChange={setShowOnlyCC}
                showOnlyWithComments={showOnlyWithComments}
                onShowOnlyWithCommentsChange={setShowOnlyWithComments}
                isVertical={true} // Add this prop to FilterBar for vertical layout
              />
           </div>
        </div>

        {/* Main List */}
        <div className="lg:col-span-3 space-y-6">
           {selectedTransactions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-blue-600 text-white p-4 rounded-xl flex justify-between items-center shadow-lg shadow-blue-500/30"
              >
                <span className="font-bold">{selectedTransactions.length} Selected</span>
                <div className="flex gap-3">
                   <button onClick={handleSelectAll} className="text-sm hover:underline opacity-80">Unselect All</button>
                   <button onClick={handleBulkDelete} className="bg-white text-blue-600 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                      <Trash2 size={14} /> Delete
                   </button>
                </div>
              </motion.div>
           )}

           {viewMode === 'list' ? (
              <SmartTransactionTable 
                transactions={sortedAndFilteredTransactions}
                onEditTransaction={onEditTransaction}
                onSaveTransaction={onSaveTransaction}
                onDeleteTransaction={onDeleteTransaction}
                currency={currency}
                categories={categories}
                accounts={accounts}
                selectedTransactions={selectedTransactions}
                setSelectedTransactions={setSelectedTransactions}
              />
           ) : (
              <CalendarView 
                currentMonth={currentMonth}
                transactions={calendarTransactions} // Use calendar-specific filtered list
                currency={currency}
              />
           )}
        </div>
      </motion.div>

      {/* Mobile View (Simplified) */}
      <div className="lg:hidden">
         {/* Re-use MobileTransactionList or adapt SmartTable for mobile? 
             For now, SmartTable is responsive, but MobileTransactionList is optimized.
             Let's keep the existing Mobile View toggle logic but ensure FilterBar is shown.
         */}
      </div>

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