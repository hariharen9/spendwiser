import React, { useState, useEffect } from 'react';
import { Search, Calendar, Filter, X, Clock, DollarSign, Tag } from 'lucide-react';
import AnimatedDropdown from '../Common/AnimatedDropdown';
import StyledCheckbox from '../Common/StyledCheckbox';
import { Tag as TagType } from '../../types/types';
import { getTagColorClasses } from '../Common/TagColors';
import { TimezoneManager } from '../../lib/timezone';

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
  userTags?: TagType[];
  selectedTags?: string[];
  onSelectedTagsChange?: (tagIds: string[]) => void;
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
  onShowOnlyWithCommentsChange,
  userTags = [],
  selectedTags = [],
  onSelectedTagsChange,
}) => {
  const [showDateInputs, setShowDateInputs] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [showMobileAdvanced, setShowMobileAdvanced] = useState(false);
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
    return TimezoneManager.toDateString(date);
  };

  const handleDatePresetChange = (preset: string) => {
    setSelectedPreset(preset);
    const today = TimezoneManager.today();
    let start: Date, end: Date;

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
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            {/* Type & Category */}
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

            {/* Sort */}
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

            {/* Quick Date Presets + Advanced Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">Quick:</span>
              <div className="flex gap-1 flex-1">
                {['today', 'this-week', 'this-month'].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => handlePillClick(preset)}
                    className={`flex-1 px-2 py-1.5 text-xs rounded-lg transition-colors ${
                      selectedPreset === preset
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {preset === 'today' ? 'Today' : preset === 'this-week' ? 'Week' : 'Month'}
                  </button>
                ))}
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={clearDateRange}
                  className="p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => setShowMobileAdvanced(!showMobileAdvanced)}
                className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors flex items-center gap-1 ${
                  showMobileAdvanced
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Filter className="h-3 w-3" />
                More
              </button>
            </div>

            {/* Advanced Filters Section */}
            {showMobileAdvanced && (
              <div className="space-y-3 pt-2 border-t border-gray-200 dark:border-gray-700">
                {/* Date Range Section */}
                <div className="bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-lg p-3 space-y-2">
                  <label className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                    <Calendar className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    Date Range
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => { onStartDateChange(e.target.value); setSelectedPreset('custom'); }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#007BFF]"
                    />
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => { onEndDateChange(e.target.value); setSelectedPreset('custom'); }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#007BFF]"
                    />
                  </div>
                </div>

                {/* Amount Range Section */}
                <div className="bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-lg p-3 space-y-2">
                  <label className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                    <DollarSign className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                    Amount Range
                    {(minAmount || maxAmount) && (
                      <button
                        onClick={clearAmountRange}
                        className="ml-auto text-xs text-red-500 flex items-center"
                      >
                        <X className="h-3 w-3 mr-0.5" />
                        Clear
                      </button>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Min"
                        value={minAmount}
                        onChange={(e) => onMinAmountChange(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#007BFF]"
                      />
                    </div>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxAmount}
                        onChange={(e) => onMaxAmountChange(e.target.value)}
                        className="w-full pl-7 pr-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#007BFF]"
                      />
                    </div>
                  </div>
                </div>

                {/* Categories Section */}
                <div className="bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-lg p-3 space-y-2">
                  <label className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                    <Filter className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
                    Categories
                    {selectedCategories.length > 0 && (
                      <>
                        <span className="ml-1.5 px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                          {selectedCategories.length}
                        </span>
                        <button
                          onClick={() => onSelectedCategoriesChange([])}
                          className="ml-auto text-xs text-red-500 flex items-center"
                        >
                          <X className="h-3 w-3 mr-0.5" />
                          Clear
                        </button>
                      </>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => handleCategoryToggle(category)}
                        className={`px-2 py-1 text-xs rounded-full transition-all ${
                          selectedCategories.includes(category)
                            ? 'bg-blue-500 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Section */}
                {userTags.length > 0 && onSelectedTagsChange && (
                  <div className="bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-lg p-3 space-y-2">
                    <label className="flex items-center text-xs font-medium text-gray-600 dark:text-gray-400">
                      <Tag className="h-3.5 w-3.5 mr-1.5 text-orange-500" />
                      Tags
                      {selectedTags.length > 0 && (
                        <>
                          <span className="ml-1.5 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                            {selectedTags.length}
                          </span>
                          <button
                            onClick={() => onSelectedTagsChange([])}
                            className="ml-auto text-xs text-red-500 flex items-center"
                          >
                            <X className="h-3 w-3 mr-0.5" />
                            Clear
                          </button>
                        </>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {userTags.map((tag) => {
                        const colorClasses = getTagColorClasses(tag.color);
                        const isSelected = selectedTags.includes(tag.id);
                        return (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                onSelectedTagsChange(selectedTags.filter(id => id !== tag.id));
                              } else {
                                onSelectedTagsChange([...selectedTags, tag.id]);
                              }
                            }}
                            className={`px-2 py-1 text-xs rounded-full transition-all flex items-center gap-1 ${
                              isSelected
                                ? `${colorClasses.bg} ${colorClasses.text} ring-1 ring-blue-500`
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${colorClasses.dot}`} />
                            {tag.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quick Toggles */}
                <div className="flex items-center gap-4 pt-1">
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
            <AnimatedDropdown
              selectedValue={selectedCategory}
              options={[{value: '', label: 'All Categories'}, ...categories.map(c => ({value: c, label: c}))]}
              onChange={onCategoryChange}
            />
            {selectedCategories.length > 1 && (
              <div className="absolute inset-y-0 right-8 flex items-center px-2 pointer-events-none text-xs text-blue-500 z-10">
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

        {/* Advanced Filters Section */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
            {/* Row 1: Date Range + Amount Range */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Date Range */}
              <div className="bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-lg p-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                  Date Range
                  {(startDate || endDate) && (
                    <button
                      onClick={clearDateRange}
                      className="ml-auto text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
                      title="Clear date range"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => { onStartDateChange(e.target.value); setSelectedPreset('custom'); }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#007BFF]"
                    />
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">to</span>
                  <div className="relative flex-1">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => { onEndDateChange(e.target.value); setSelectedPreset('custom'); }}
                      className="w-full px-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#007BFF]"
                    />
                  </div>
                </div>
              </div>

              {/* Amount Range */}
              <div className="bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-lg p-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  Amount Range
                  {(minAmount || maxAmount) && (
                    <button
                      onClick={clearAmountRange}
                      className="ml-auto text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
                      title="Clear amount range"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </button>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
                    <input
                      type="number"
                      placeholder="Min"
                      value={minAmount}
                      onChange={(e) => onMinAmountChange(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#007BFF]"
                    />
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 text-sm">to</span>
                  <div className="relative flex-1">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#888888]" />
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxAmount}
                      onChange={(e) => onMaxAmountChange(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] text-sm focus:outline-none focus:border-[#007BFF]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Categories + Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Multiple Category Selection */}
              <div className="bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-lg p-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Filter className="h-4 w-4 mr-2 text-purple-500" />
                  Categories
                  {selectedCategories.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs rounded-full">
                      {selectedCategories.length} selected
                    </span>
                  )}
                  {selectedCategories.length > 0 && (
                    <button
                      onClick={() => onSelectedCategoriesChange([])}
                      className="ml-auto text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </button>
                  )}
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => handleCategoryToggle(category)}
                      className={`px-2.5 py-1 text-xs rounded-full transition-all ${
                        selectedCategories.includes(category)
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag Filter */}
              <div className="bg-gray-50 dark:bg-[#1A1A1A]/50 rounded-lg p-4">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Tag className="h-4 w-4 mr-2 text-orange-500" />
                  Tags
                  {selectedTags.length > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs rounded-full">
                      {selectedTags.length} selected
                    </span>
                  )}
                  {selectedTags.length > 0 && onSelectedTagsChange && (
                    <button
                      onClick={() => onSelectedTagsChange([])}
                      className="ml-auto text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
                    >
                      <X className="h-3 w-3 mr-1" />
                      Clear
                    </button>
                  )}
                </label>
                {userTags.length > 0 && onSelectedTagsChange ? (
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {userTags.map((tag) => {
                      const colorClasses = getTagColorClasses(tag.color);
                      const isSelected = selectedTags.includes(tag.id);
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              onSelectedTagsChange(selectedTags.filter(id => id !== tag.id));
                            } else {
                              onSelectedTagsChange([...selectedTags, tag.id]);
                            }
                          }}
                          className={`px-2.5 py-1 text-xs rounded-full transition-all flex items-center gap-1 ${
                            isSelected
                              ? `${colorClasses.bg} ${colorClasses.text} ring-2 ring-offset-1 ring-blue-500 dark:ring-offset-[#1A1A1A]`
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${colorClasses.dot}`} />
                          {tag.name}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">No tags created yet</p>
                )}
              </div>
            </div>

            {/* Row 3: Quick Toggles */}
            <div className="flex items-center gap-6 pt-2">
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
        )}
      </div>
    </>
  );
};

export default FilterBar;