import React, { useState, useEffect } from 'react';
import { X, DollarSign, AlertTriangle, Calendar, Rows, Columns } from 'lucide-react';
import { Transaction, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import AnimatedDropdown from '../Common/AnimatedDropdown';
import AccountDropdown from '../Common/AccountDropdown';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction?: Transaction;
  accounts: Account[];
  creditCards?: Account[];
  defaultAccountId?: string | null;
  categories?: string[];
}

// Category keywords mapping for auto-categorization
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Groceries': ['grocery', 'market', 'supermarket', 'vegetables', 'fruits', 'meat', 'dairy', 'zepto', 'instamart', 'blinkit', 'bigbasket', 'grofers', 'reliance fresh', 'dmart'],
  'Food & Dining': ['restaurant', 'cafe', 'food', 'breakfast', 'lunch', 'dinner', 'meal', 'dining', 'burger', 'pizza', 'mcdonalds', 'starbucks', 'swiggy', 'zomato', 'haldirams', 'bikaner', 'faasos', 'behrouz', 'ovenstory'],
  'Transportation': [ 'uber', 'taxi', 'bus', 'train', 'flight', 'airline', 'parking', 'toll', 'auto', 'cab', 'ola', 'rapido', 'metro', 'local train'],
  'Utilities': ['electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'mobile', 'subscription', 'netflix', 'spotify', 'airtel', 'jio', 'vodafone', 'idea', 'bsnl', 'act', 'hathway', 'prime video', 'hotstar', 'zee5', 'sonyliv'],
  'Entertainment': ['movie', 'cinema', 'theater', 'concert', 'ticket', 'game', 'playstation', 'xbox', 'streaming'],
  'Shopping': ['clothing', 'shoes', 'mall', 'store', 'retail', 'purchase', 'buy', 'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'croma', 'reliance digital'],
  'Healthcare': ['doctor', 'hospital', 'medicine', 'pharmacy', 'drug', 'medical', 'clinic', 'dentist', 'apollo', 'fortis', 'max', 'lal pathlabs', '1mg', 'netmeds', 'pharmeasy'],
  'Education': ['school', 'college', 'university', 'tuition', 'books', 'course', 'training', 'education'],
  'Salary': ['salary', 'wage', 'payroll', 'income', 'deposit', 'paycheck'],
  'Freelance': ['freelance', 'consulting', 'contract', 'project', 'client'],
  'Investment': ['investment', 'stock', 'mutual fund', 'sip', 'fd', 'fixed deposit', 'shares', 'zerodha', 'upstox', 'groww', 'paytm money'],
  'Recharge & Bills': ['recharge', 'bill', 'paytm', 'gpay', 'phonepe', 'google pay'],
  'Fuel': ['gas', 'fuel', 'petrol', 'diesel',],
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  accounts,
  creditCards = [],
  defaultAccountId,
  categories = ['Salary', 'Freelance', 'Investment', 'Groceries', 'Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Recharge & Bills', 'Other']
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: categories[0],
    type: 'expense' as 'income' | 'expense',
    accountId: '',
    comments: ''
  });
  
  const [isLargeAmount, setIsLargeAmount] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(() => {
    const savedMode = localStorage.getItem('addTransactionModalCompactMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  const allAccounts = [...accounts, ...creditCards];

  // Auto-categorization based on transaction name
  useEffect(() => {
    if (formData.name && !editingTransaction) {
      const lowerName = formData.name.toLowerCase();
      let bestMatchCategory = null;
      let bestMatchCount = 0;
      
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const matches = keywords.filter(keyword => lowerName.includes(keyword)).length;
        if (matches > bestMatchCount) {
          bestMatchCount = matches;
          bestMatchCategory = category;
        }
      }
      
      if (bestMatchCategory && bestMatchCategory !== formData.category) {
        setSuggestedCategory(bestMatchCategory);
      } else {
        setSuggestedCategory(null);
      }
    } else {
      setSuggestedCategory(null);
    }
  }, [formData.name, formData.category, editingTransaction]);

  // Amount validation for large transactions
  useEffect(() => {
    if (formData.amount) {
      const amount = parseFloat(formData.amount);
      // Threshold for "large" transaction - can be adjusted based on user's typical spending
      const threshold = 10000; // ₹10,000 as example threshold
      setIsLargeAmount(amount > threshold);
    } else {
      setIsLargeAmount(false);
    }
  }, [formData.amount]);

  // Save isCompact preference to localStorage
  useEffect(() => {
    localStorage.setItem('addTransactionModalCompactMode', JSON.stringify(isCompact));
  }, [isCompact]);

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        name: editingTransaction.name,
        amount: Math.abs(editingTransaction.amount).toString(),
        date: editingTransaction.date,
        category: editingTransaction.category,
        type: editingTransaction.type,
        accountId: editingTransaction.accountId || '',
        comments: editingTransaction.comments || ''
      });
    } else {
      // Set default account based on the rules
      let defaultAccount = '';
      if (defaultAccountId && allAccounts.some(acc => acc.id === defaultAccountId)) {
        defaultAccount = defaultAccountId;
      } else if (allAccounts.length === 1) {
        defaultAccount = allAccounts[0].id;
      }
      
      setFormData({
        name: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: categories[0],
        type: 'expense',
        accountId: defaultAccount,
        comments: ''
      });
    }
  }, [editingTransaction, isOpen, accounts, creditCards, defaultAccountId, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isAccountRequired && !formData.accountId) {
      alert('Please select an account for the transaction.');
      return;
    }
    
    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === 'expense' ? -amount : amount;

    const transaction: Omit<Transaction, 'id'> = {
      name: formData.name,
      amount: finalAmount,
      date: formData.date,
      category: formData.category,
      type: formData.type,
      ...(formData.accountId && { accountId: formData.accountId }),
      ...(formData.comments && { comments: formData.comments }),
    };

    onSave(transaction);
    onClose();
  };

  // Determine if account selection is required
  const isAccountRequired = allAccounts.length > 0;
  const shouldShowAccountField = !isCompact || (allAccounts.length > 1 && !defaultAccountId);

  // Handle quick date selection
  const setQuickDate = (daysOffset: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + daysOffset);
    setFormData({ ...formData, date: newDate.toISOString().split('T')[0] });
  };

  // Apply suggested category
  const applySuggestedCategory = () => {
    if (suggestedCategory) {
      setFormData({ ...formData, category: suggestedCategory });
      setSuggestedCategory(null);
    }
  };

  // Format account name with balance
  const formatAccountName = (account: Account) => {
    return `${account.name} (₹${account.balance.toFixed(2)})`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="p-2 bg-[#007BFF] rounded-lg">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
              </motion.div>
              <div className="flex items-center space-x-2">
                <div className="relative group">
                    <motion.button
                        type="button"
                        onClick={() => setIsCompact(!isCompact)}
                        className="text-gray-500 dark:text-[#888888] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        {isCompact ? <Rows className="h-5 w-5" /> : <Columns className="h-5 w-5" />}
                    </motion.button>
                    <div className="absolute bottom-full mb-2 w-64 right-0 transform translate-x-1/4 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[60]">
                        <h4 className="font-bold">{isCompact ? 'Switch to Comfy View' : 'Switch to Compact View'}</h4>
                        {isCompact ? (
                            <p>Shows all fields including date, accounts, and notes for detailed entries.</p>
                        ) : (
                            <p>Hides date, account (if default is set), and notes for faster entry.</p>
                        )}
                        <div className="absolute top-full right-1/2 transform translate-x-1/2 h-0 w-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
                    </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </motion.button>
              </div>
            </div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className={`p-4 md:p-6 space-y-4 md:space-y-6 flex-grow ${!isCompact ? 'overflow-y-auto' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ delay: 0.2 }}
            >              {/* Transaction Name */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  Transaction Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 md:py-3 px-3 md:px-4 transition-all placeholder-gray-400 dark:placeholder-[#888888]"
                  placeholder="e.g., Coffee Shop, Salary, Gas Station"
                />
                
                {/* Category suggestion */}
                {suggestedCategory && (
                  <motion.div 
                    className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex justify-between items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-blue-800 dark:text-blue-200 text-sm">
                        Suggested category: <span className="font-semibold">{suggestedCategory}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={applySuggestedCategory}
                      className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Apply
                    </button>
                  </motion.div>
                )}
              </motion.div>

              {/* Amount and Type */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.4 }}
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Amount *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className={`w-full rounded-lg border shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:text-white py-2 md:py-3 px-3 md:px-4 transition-all placeholder-gray-400 dark:placeholder-[#888888] ${
                        isLargeAmount 
                          ? 'border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/50' 
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0.00"
                    />
                    {isLargeAmount && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      </div>
                    )}
                  </div>
                  {isLargeAmount && (
                    <motion.p 
                      className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      Large transaction amount
                    </motion.p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                      className={`px-2 py-2 md:px-3 md:py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        formData.type === 'income'
                          ? 'bg-[#28A745] text-white shadow-md'
                          : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#888888] border border-gray-300 dark:border-gray-600 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Income
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                      className={`px-2 py-2 md:px-3 md:py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        formData.type === 'expense'
                          ? 'bg-[#DC3545] text-white shadow-md'
                          : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#888888] border border-gray-300 dark:border-gray-600 hover:text-gray-900 dark:hover:text-[#F5F5F5]'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Expense
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* Date and Quick Selection */}
              {!isCompact && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Date *
                  </label>
                  <div className="mb-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickDate(0)}
                      className="text-xs bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(-1)}
                      className="text-xs bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      Yesterday
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDate(-7)}
                      className="text-xs bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#2A2A2A] text-gray-700 dark:text-gray-300 px-2 py-1 rounded transition-colors"
                    >
                      Last Week
                    </button>
                  </div>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 md:py-3 px-3 md:px-4 transition-all"
                  />
                </motion.div>
              )}

              {/* Category */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.6 }}
              >
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                    <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </span>
                  Category *
                </label>
                <AnimatedDropdown
                  selectedValue={formData.category}
                  options={categories}
                  onChange={(value) => setFormData({ ...formData, category: value })}
                />
              </motion.div>

              {/* Account */}
              {shouldShowAccountField && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    {isAccountRequired ? 'Account *' : 'Account (Optional)'}
                  </label>
                  {allAccounts.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-[#888888] py-2 md:py-3 px-3 md:px-4">
                      No accounts available. Add an account in Settings.
                    </p>
                  ) : allAccounts.length === 1 ? (
                    <div className="py-2 md:py-3 px-3 md:px-4 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5]">
                      {formatAccountName(allAccounts[0])} (Auto-selected)
                      <input type="hidden" name="accountId" value={allAccounts[0].id} />
                    </div>
                  ) : (
                    <AccountDropdown
                      accounts={accounts}
                      creditCards={creditCards}
                      selectedValue={formData.accountId}
                      onChange={(value) => setFormData({ ...formData, accountId: value })}
                      defaultAccountId={defaultAccountId}
                    />
                  )}
                </motion.div>
              )}

              {/* Comments */}
              {!isCompact && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Comments (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.comments}
                    onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 md:py-3 px-3 md:px-4 transition-all resize-none placeholder-gray-400 dark:placeholder-[#888888]"
                    placeholder="Add any additional notes..."
                  />
                </motion.div>
              )}

              {/* Actions */}
              <motion.div 
                className="flex items-center justify-end space-x-3 md:space-x-4 pt-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.9 }}
              >
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 md:px-5 md:py-2.5 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="px-4 py-2 md:px-5 md:py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {editingTransaction ? 'Update Transaction' : 'Save Transaction'}
                </motion.button>
              </motion.div>
            </motion.form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddTransactionModal;