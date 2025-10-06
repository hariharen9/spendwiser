import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X, Clock, DollarSign } from 'lucide-react';
import AnimatedDropdown from '../Common/AnimatedDropdown';
import StyledCheckbox from '../Common/StyledCheckbox';

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
  minAmount: string; // New prop for amount range
  maxAmount: string; // New prop for amount range
  onMinAmountChange: (value: string) => void; // New prop for amount range
  onMaxAmountChange: (value: string) => void; // New prop for amount range
  selectedCategories: string[]; // New prop for multiple categories
  onSelectedCategoriesChange: (categories: string[]) => void; // New prop for multiple categories
  showOnlyCC: boolean;
  onShowOnlyCCChange: (value: boolean) => void;
  showOnlyWithComments: boolean;
  onShowOnlyWithCommentsChange: (value: boolean) => void;
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
  onSortChange,
  minAmount, // New prop for amount range
  maxAmount, // New prop for amount range
  onMinAmountChange, // New prop for amount range
  onMaxAmountChange, // New prop for amount range
  selectedCategories, // New prop for multiple categories
  onSelectedCategoriesChange, // New prop for multiple categories
  showOnlyCC,
  onShowOnlyCCChange,
  showOnlyWithComments,
  onShowOnlyWithCommentsChange
}) => {
  const [showDateInputs, setShowDateInputs] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('this-month');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false); // For advanced filters toggle

  const clearDateRange = () => {
    onStartDateChange('');
    onEndDateChange('');
    setSelectedPreset('custom');
  };

  const clearAmountRange = () => {
    onMinAmountChange('');
    onMaxAmountChange('');
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

  // Handle multiple category selection
  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectedCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onSelectedCategoriesChange([...selectedCategories, category]);
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
            <div className="flex items-center space-x-4 pt-4">
                <StyledCheckbox
                    id="cc-filter-mobile"
                    label="CC Only"
                    checked={showOnlyCC}
                    onChange={onShowOnlyCCChange}
                />
                <StyledCheckbox
                    id="comments-filter-mobile"
                    label="Has Comments"
                    checked={showOnlyWithComments}
                    onChange={onShowOnlyWithCommentsChange}
                />
            </div>
          </div>
        )}
      </div>

      {/* Desktop Filter Bar - Updated with Advanced Search */}
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

          {/* Category Dropdown - Updated to show "Multiple" when multiple categories selected */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            {selectedCategories.length > 1 && (
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-xs text-blue-500">
                +{selectedCategories.length - 1} more
              </div>
            )}
          </div>

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

        {/* Advanced Search Toggle and Quick Select */}
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
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)} 
            className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
            <Filter className="h-4 w-4 mr-1" />
            {showAdvancedFilters ? 'Hide Advanced Filters' : 'Show Advanced Filters'}
          </button>
        </div>

        {/* Advanced Filters - Amount Range, Multiple Categories, and Date Filters on same line */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Amount Range */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Range</label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAmount}
                      onChange={(e) => onMinAmountChange(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAmount}
                      onChange={(e) => onMaxAmountChange(e.target.value)}
                      className="w-full pl-8 pr-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    />
                  </div>
                  {(minAmount || maxAmount) && (
                    <button
                      onClick={clearAmountRange}
                      className="p-2 bg-gray-200 dark:bg-gray-600 hover:bg-red-500 dark:hover:bg-red-600 text-gray-900 dark:text-[#F5F5F5] hover:text-white dark:hover:text-white rounded-lg transition-colors"
                      title="Clear amount range"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Multiple Category Selection */}
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categories</label>
                <div className="relative">
                  <div className="bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg p-2 min-h-[42px] max-h-32 overflow-y-auto">
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategoryToggle(category)}
                          className={`px-2 py-1 text-xs rounded-full transition-colors ${
                            selectedCategories.includes(category)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedCategories.length > 0 && (
                    <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedCategories.length} category{selectedCategories.length !== 1 ? 's' : ''} selected
                    </div>
                  )}
                </div>
              </div>

              {/* Date Filters */}
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Range</label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => { onStartDateChange(e.target.value); setSelectedPreset('custom'); }} 
                      className="w-full pl-8 pr-2 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]" 
                      placeholder="Start Date" 
                    />
                  </div>
                  <span className="text-gray-500 dark:text-gray-400">to</span>
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => { onEndDateChange(e.target.value); setSelectedPreset('custom'); }} 
                      className="w-full pl-8 pr-2 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]" 
                      placeholder="End Date" 
                    />
                  </div>
                </div>
                <div className="flex space-x-1 mt-2">
                  <button 
                    onClick={() => handleDatePresetChange('today')} 
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${selectedPreset === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                    Today
                  </button>
                  <button 
                    onClick={() => handleDatePresetChange('this-week')} 
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${selectedPreset === 'this-week' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                    Week
                  </button>
                  <button 
                    onClick={() => handleDatePresetChange('this-month')} 
                    className={`px-2 py-1 text-xs rounded-full transition-colors ${selectedPreset === 'this-month' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'}`}>
                    Month
                  </button>
                </div>
                {(startDate || endDate) && (
                  <div className="mt-2">
                    <button
                      onClick={clearDateRange}
                      className="flex items-center text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
                      title="Clear date range"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear dates
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
                {/* New filters */}
                <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Other Filters</label>
                    <div className="flex items-center space-x-4">
                        <StyledCheckbox
                            id="cc-filter"
                            label="Credit Card Only"
                            checked={showOnlyCC}
                            onChange={onShowOnlyCCChange}
                        />
                        <StyledCheckbox
                            id="comments-filter"
                            label="Has Comments"
                            checked={showOnlyWithComments}
                            onChange={onShowOnlyWithCommentsChange}
                        />
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default FilterBar;