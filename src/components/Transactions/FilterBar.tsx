import React, { useState } from 'react';
import { Search, Calendar, Filter, X } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  transactionType: string;
  onTransactionTypeChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  transactionType,
  onTransactionTypeChange,
  selectedCategory,
  onCategoryChange,
  categories,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange
}) => {
  const [showDateInputs, setShowDateInputs] = useState(false);

  const clearDateRange = () => {
    onStartDateChange('');
    onEndDateChange('');
  };

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#888888] focus:outline-none focus:border-[#007BFF]"
          />
        </div>

        {/* Transaction Type */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
          <select
            value={transactionType}
            onChange={(e) => onTransactionTypeChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        {/* Category Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Date Filter Toggle */}
        <div className="relative">
          <button
            onClick={() => setShowDateInputs(!showDateInputs)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] flex items-center appearance-none"
          >
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
            <span className="flex-1 text-left">Date Range</span>
            <span className="ml-2">▼</span>
          </button>
        </div>
      </div>

      {/* Date Inputs (Hidden by default) */}
      {showDateInputs && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              placeholder="Start Date"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              placeholder="End Date"
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={clearDateRange}
              className="flex items-center justify-center w-full px-4 py-2 bg-gray-200 dark:bg-gray-600 hover:bg-red-500 dark:hover:bg-red-600 text-gray-900 dark:text-[#F5F5F5] hover:text-white dark:hover:text-white rounded-lg transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Dates
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;