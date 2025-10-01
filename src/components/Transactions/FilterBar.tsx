import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X, Clock } from 'lucide-react';
import AnimatedDropdown from '../Common/AnimatedDropdown';

interface FilterBarProps {
  transactionCount: number;
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
  sortOption: string;
  onSortChange: (value: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  transactionCount,
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
  onEndDateChange,
  sortOption,
  onSortChange
}) => {
  const [showDateInputs, setShowDateInputs] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('custom');

  const clearDateRange = () => {
    onStartDateChange('');
    onEndDateChange('');
    setSelectedPreset('custom');
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDatePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const today = new Date();
    let start = new Date(), end = new Date();

    switch (preset) {
      case 'today':
        start = today;
        end = today;
        break;
      case 'this-week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        start = new Date(weekStart);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        end = new Date(weekEnd);
        break;
      case 'this-month':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case 'this-year':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        break;
      case 'custom':
        onStartDateChange('');
        onEndDateChange('');
        return;
      default:
        return;
    }
    onStartDateChange(formatDate(start));
    onEndDateChange(formatDate(end));
  };

  const handlePillClick = (preset: string) => {
    if (selectedPreset === preset) {
      handleDatePresetChange('custom');
    } else {
      handleDatePresetChange(preset);
    }
  };

  // For mobile view, we'll show a simplified filter bar with a toggle
  const datePresetOptions = [
    { value: 'custom', label: 'Custom Range' },
    { value: 'today', label: 'Today' },
    { value: 'this-week', label: 'This Week' },
    { value: 'this-month', label: 'This Month' },
    { value: 'this-year', label: 'This Year' },
  ];

  return (
    <>
      {/* Mobile Filter Bar */}
      <div className="md:hidden bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700 mb-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
            <input
              type="text"
              placeholder={`Search ${transactionCount} transactions...`}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] placeholder-gray-400 dark:placeholder-[#888888] focus:outline-none focus:border-[#007BFF]"
            />
          </div>
          <button
            onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
            className="p-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Collapsible Mobile Filters */}
        {isMobileFiltersOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <AnimatedDropdown
                selectedValue={transactionType}
                options={[{value: 'all', label: 'All Types'}, {value: 'income', label: 'Income'}, {value: 'expense', label: 'Expense'}]}
                onChange={onTransactionTypeChange}
              />
              
              <AnimatedDropdown
                selectedValue={selectedCategory}
                options={[{value: '', label: 'All Categories'}, ...categories.map(c => ({value: c, label: c}))]}
                onChange={onCategoryChange}
              />
            </div>
            <div>
              <label htmlFor="sort-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by</label>
              <AnimatedDropdown
                selectedValue={sortOption}
                options={[
                  {value: 'date-desc', label: 'Date (Newest First)'},
                  {value: 'date-asc', label: 'Date (Oldest First)'},
                  {value: 'highest-income', label: 'Highest Income'},
                  {value: 'lowest-income', label: 'Lowest Income'},
                  {value: 'highest-expense', label: 'Highest Expense'},
                  {value: 'lowest-expense', label: 'Lowest Expense'},
                ]}
                onChange={onSortChange}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowDateInputs(!showDateInputs)}
                className="flex-1 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              >
                {showDateInputs ? 'Hide Date Range' : 'Show Date Range'}
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={clearDateRange}
                  className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-red-500 dark:hover:bg-red-600 text-gray-900 dark:text-[#F5F5F5] hover:text-white dark:hover:text-white rounded-lg transition-colors"
                  title="Clear date range"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {showDateInputs && (
              <div className="space-y-4">
                <AnimatedDropdown
                  selectedValue={selectedPreset}
                  options={datePresetOptions}
                  onChange={handleDatePresetChange}
                />
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input type="date" value={startDate} onChange={(e) => { onStartDateChange(e.target.value); setSelectedPreset('custom'); }} className="w-full pl-8 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]" />
                    <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
                  </div>
                  <div className="relative">
                    <input type="date" value={endDate} onChange={(e) => { onEndDateChange(e.target.value); setSelectedPreset('custom'); }} className="w-full pl-8 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]" />
                    <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Desktop Filter Bar - Unchanged */}
      <div className="hidden md:block bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
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
          <AnimatedDropdown
            selectedValue={transactionType}
            options={[{value: 'all', label: 'All Types'}, {value: 'income', label: 'Income'}, {value: 'expense', label: 'Expense'}]}
            onChange={onTransactionTypeChange}
          />

          {/* Category Dropdown */}
          <AnimatedDropdown
            selectedValue={selectedCategory}
            options={[{value: '', label: 'All Categories'}, ...categories.map(c => ({value: c, label: c}))]}
            onChange={onCategoryChange}
          />

          {/* Sort By Dropdown */}
          <AnimatedDropdown
            selectedValue={sortOption}
            options={[
              {value: 'date-desc', label: 'Sort: Newest First'},
              {value: 'date-asc', label: 'Sort: Oldest First'},
              {value: 'highest-income', label: 'Sort: Highest Income'},
              {value: 'lowest-income', label: 'Sort: Lowest Income'},
              {value: 'highest-expense', label: 'Sort: Highest Expense'},
              {value: 'lowest-expense', label: 'Sort: Lowest Expense'},
            ]}
            onChange={onSortChange}
          />
        </div>

        <div className="flex justify-between items-center mt-4">
            <div className="flex items-center justify-start space-x-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quick Select:</span>
                <div>
                    <button 
                        onClick={() => handlePillClick('today')} 
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedPreset === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        Today
                    </button>
                </div>
                <div>
                    <button 
                        onClick={() => handlePillClick('this-week')} 
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedPreset === 'this-week' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        This Week
                    </button>
                </div>
                <div>
                    <button 
                        onClick={() => handlePillClick('this-month')} 
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${selectedPreset === 'this-month' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                        This Month
                    </button>
                </div>
            </div>
            <button onClick={() => setShowDateInputs(!showDateInputs)} className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                <Clock className="h-4 w-4 mr-1" />
                {showDateInputs ? 'Hide Date Filters' : 'Filter by Date'}
            </button>
        </div>

        {/* Date Inputs (Hidden by default) */}
        {showDateInputs && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <AnimatedDropdown
              selectedValue={selectedPreset}
              options={datePresetOptions}
              onChange={handleDatePresetChange}
            />
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
              <input type="date" value={startDate} onChange={(e) => { onStartDateChange(e.target.value); setSelectedPreset('custom'); }} className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]" placeholder="Start Date" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
              <input type="date" value={endDate} onChange={(e) => { onEndDateChange(e.target.value); setSelectedPreset('custom'); }} className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]" placeholder="End Date" />
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
    </>
  );
};

export default FilterBar;