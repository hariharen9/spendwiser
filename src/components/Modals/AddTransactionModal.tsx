import React, { useState, useEffect, useRef } from 'react';
import { X, DollarSign, Calendar, Rows, Columns, Tag as TagIcon, Briefcase, MessageSquare, Users, Plus } from 'lucide-react';
import { Transaction, Account, Shortcut, Tag, Loan } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import AnimatedDropdown from '../Common/AnimatedDropdown';
import AccountDropdown from '../Common/AccountDropdown';
import BillSplittingModal from './BillSplittingModal';
import CurrencyInput from '../Common/CurrencyInput';
import TagInput from '../Common/TagInput';
import { hapticFeedback } from '../../hooks/useHaptic';
import { TimezoneManager } from '../../lib/timezone';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'>) => void;
  editingTransaction?: Transaction;
  accounts: Account[];
  creditCards?: Account[];
  defaultAccountId?: string | null;
  categories?: string[];
  shortcuts: Shortcut[];
  currency?: string;
  loans?: Loan[];
  defaultType?: 'income' | 'expense' | null; // Pre-select transaction type
  userTags?: Tag[];
  onAddTag?: (name: string, color: string) => Promise<Tag | null>;
  onUpdateTag?: (tagId: string, name: string, color: string) => Promise<void>;
  onDeleteTag?: (tagId: string) => Promise<void>;
}

// Category keywords mapping for auto-categorization
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Groceries': ['grocery', 'market', 'supermarket', 'vegetables', 'fruits', 'meat', 'dairy', 'zepto', 'instamart', 'blinkit', 'bigbasket', 'grofers', 'reliance fresh', 'dmart', 'more', 'spencer', 'nature bsket', 'ratnadeep', 'heritage'],
  'Food & Dining': ['restaurant', 'cafe', 'food', 'breakfast', 'lunch', 'dinner', 'meal', 'dining', 'burger', 'pizza', 'mcdonalds', 'starbucks', 'swiggy', 'zomato', 'haldirams', 'bikaner', 'faasos', 'behrouz', 'ovenstory', 'domino', 'kfc', 'subway', 'chai', 'coffee', 'barista', 'costa', 'tim hortons', 'dunkin', 'baskin', 'eatclub', 'magicpin'],
  'Transportation': ['uber', 'taxi', 'bus', 'train', 'flight', 'airline', 'parking', 'toll', 'auto', 'cab', 'ola', 'rapido', 'metro', 'local train', 'irctc', 'indigo', 'vistara', 'air india', 'spicejet', 'akasa', 'redbus', 'abhibus', 'fastag', 'park+', 'zoomcar', 'revv'],
  'Utilities': ['electricity', 'water', 'gas', 'internet', 'wifi', 'phone', 'mobile', 'subscription', 'netflix', 'spotify', 'airtel', 'jio', 'vodafone', 'idea', 'bsnl', 'act', 'hathway', 'prime video', 'hotstar', 'zee5', 'sonyliv', 'apple music', 'youtube', 'hulu', 'disney', 'hbo', 'tatasky', 'dish tv', 'dth', 'bescom', 'bwssb', 'mahavitaran', 'adani', 'torrent'],
  'Entertainment': ['movie', 'cinema', 'theater', 'concert', 'ticket', 'game', 'playstation', 'xbox', 'streaming', 'pvr', 'inox', 'cinepolis', 'bookmyshow', 'insider', 'event', 'steam', 'epic games', 'nintendo', 'twitch'],
  'Shopping': ['clothing', 'shoes', 'mall', 'store', 'retail', 'purchase', 'buy', 'amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'meesho', 'croma', 'reliance digital', 'tatacliq', 'snapdeal', 'decathlon', 'nike', 'adidas', 'puma', 'zara', 'h&m', 'uniqlo', 'westside', 'pantaloons', 'shoppers stop', 'lifestyle', 'max'],
  'Healthcare': ['doctor', 'hospital', 'medicine', 'pharmacy', 'drug', 'medical', 'clinic', 'dentist', 'apollo', 'fortis', 'max', 'lal pathlabs', '1mg', 'netmeds', 'pharmeasy', 'medplus', 'practo', 'cult', 'fit', 'gym', 'wellness', 'insurance'],
  'Education': ['school', 'college', 'university', 'tuition', 'books', 'course', 'training', 'education', 'udemy', 'coursera', 'edx', 'upgrad', 'byjus', 'unacademy', 'physics wallah', 'kindle', 'audible'],
  'Salary': ['salary', 'wage', 'payroll', 'income', 'deposit', 'paycheck', 'bonus', 'stipend', 'earnings'],
  'Freelance': ['freelance', 'consulting', 'contract', 'project', 'client', 'upwork', 'fiverr', 'freelancer'],
  'Investment': ['investment', 'stock', 'mutual fund', 'sip', 'fd', 'fixed deposit', 'shares', 'zerodha', 'upstox', 'groww', 'paytm money', 'indmoney', 'smallcase', 'coin', 'kite', 'kuvera', 'crypto', 'binance', 'coinbase', 'wazirx', 'coindcx'],
  'Bills & EMIs': ['recharge', 'bill', 'paytm', 'gpay', 'phonepe', 'google pay', 'cred', 'freecharge', 'mobikwik', 'amazon pay', 'bharatpe', 'emi', 'loan', 'repayment', 'lic', 'premium', 'insurance premium', 'credit card bill', 'cc bill'],
  'Fuel': ['gas', 'fuel', 'petrol', 'diesel', 'shell', 'hp', 'indian oil', 'bharat petroleum', 'cng', 'ev charging'],
  'Travel': ['hotel', 'airbnb', 'booking.com', 'agoda', 'makemytrip', 'goibibo', 'cleartrip', 'easemytrip', 'oyorooms', 'taj', 'marriott', 'hyatt', 'hilton', 'resort', 'stay', 'trip'],
  'Personal Care': ['salon', 'spa', 'haircut', 'barber', 'cosmetics', 'urban company', 'parlour', 'massage', 'grooming'],
  'Housing': ['rent', 'mortgage', 'maintenance', 'repair', 'furniture', 'decor', 'ikea', 'pepperfry', 'urban ladder', 'home centre'],
};

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingTransaction,
  accounts,
  creditCards = [],
  defaultAccountId,
  categories = ['Home', 'Groceries', 'Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Personal', 'Fuel', 'Utilities', 'Healthcare', 'Education', 'Bills & EMIs', 'Rent & Housing', 'Investment', 'Travel', 'Other'],
  shortcuts,
  currency = '₹',
  loans = [],
  defaultType = null,
  userTags = [],
  onAddTag,
  onUpdateTag,
  onDeleteTag,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    date: TimezoneManager.getInputDate(),
    category: categories[0],
    type: 'expense' as 'income' | 'expense',
    accountId: '',
    comments: '',
    loanId: '', // Add loanId to formData
    tags: [] as string[], // Array of tag IDs
  });
  
  const [isLargeAmount, setIsLargeAmount] = useState(false);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [isCompact, setIsCompact] = useState(() => {
    const savedMode = localStorage.getItem('addTransactionModalCompactMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [isBillSplittingOpen, setIsBillSplittingOpen] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const amountInputRef = useRef<HTMLDivElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const accountInputRef = useRef<HTMLDivElement>(null);

  // Prevent unwanted auto-focus on mobile
  useEffect(() => {
    if (isOpen) {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Blur any focused element after modal opens
        setTimeout(() => {
          if (document.activeElement instanceof HTMLElement) {
            document.activeElement.blur();
          }
        }, 100);
      }
    }
  }, [isOpen]);

  const allAccounts = [...accounts, ...creditCards];

  // Determine if account selection is required (moved up for validation)
  const isAccountRequired = allAccounts.length > 0;
  const shouldShowAccountField = !isCompact || (allAccounts.length > 1 && !defaultAccountId);

  // Validation function
  const validateField = (field: string, value: string): string => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Transaction name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'amount':
        if (!value) return 'Amount is required';
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) return 'Please enter a valid amount';
        return '';
      case 'date':
        if (!value) return 'Date is required';
        return '';
      case 'accountId':
        if (isAccountRequired && !value) return 'Please select an account';
        return '';
      default:
        return '';
    }
  };

  // Check if expense exceeds bank balance
  const getInsufficientBalanceError = (): string => {
    if (formData.type !== 'expense' || !formData.accountId || !formData.amount) {
      return '';
    }
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) return '';

    const selectedAccount = allAccounts.find(acc => acc.id === formData.accountId);
    if (!selectedAccount) return '';

    // Only check for non-credit card accounts
    if (selectedAccount.type === 'Credit Card') return '';

    if (amount > selectedAccount.balance) {
      return `Insufficient balance. Available: ${currency}${selectedAccount.balance.toLocaleString()}`;
    }
    return '';
  };

  const insufficientBalanceError = getInsufficientBalanceError();

  // Validate all fields
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    newErrors.name = validateField('name', formData.name);
    newErrors.amount = validateField('amount', formData.amount);
    if (!isCompact) {
      newErrors.date = validateField('date', formData.date);
    }
    if (shouldShowAccountField && isAccountRequired) {
      newErrors.accountId = validateField('accountId', formData.accountId);
    }

    // Check for insufficient balance
    const balanceError = getInsufficientBalanceError();
    if (balanceError) {
      newErrors.amount = balanceError;
    }

    // Filter out empty errors
    const filteredErrors: Record<string, string> = {};
    Object.entries(newErrors).forEach(([key, value]) => {
      if (value) filteredErrors[key] = value;
    });

    setErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  // Handle field blur for individual validation
  const handleFieldBlur = (field: string, value: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  // Scroll to first error
  const scrollToFirstError = (errorFields: Record<string, string>) => {
    const fieldRefs: Record<string, React.RefObject<HTMLElement | HTMLDivElement | HTMLInputElement>> = {
      name: nameInputRef,
      amount: amountInputRef,
      date: dateInputRef,
      accountId: accountInputRef,
    };

    for (const field of ['name', 'amount', 'date', 'accountId']) {
      if (errorFields[field]) {
        const ref = fieldRefs[field];
        if (ref?.current) {
          ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Focus the input if possible
          const input = ref.current.querySelector('input') || ref.current;
          if (input instanceof HTMLElement) {
            setTimeout(() => input.focus(), 300);
          }
          break;
        }
      }
    }
  };

  const handleNameBlur = () => {
    const lowerName = formData.name.toLowerCase();
    if (lowerName.includes('.')) {
      const parts = lowerName.split('.');
      if (parts.length === 2 && !isNaN(Number(parts[1]))) {
        const keyword = parts[0];
        const amount = parts[1];
        const shortcut = shortcuts.find(s => s.keyword.toLowerCase() === keyword);
        if (shortcut) {
          setFormData(prev => ({
            ...prev,
            name: shortcut.name,
            amount: amount,
            category: shortcut.category,
            type: shortcut.type,
            accountId: shortcut.accountId || prev.accountId,
          }));
        }
      }
    }
  };

  // Auto-categorization based on transaction name
  useEffect(() => {
    if (formData.name && !editingTransaction) {
      const lowerName = formData.name.toLowerCase();
      let bestMatchCategory: string | null = null;
      let bestMatchCount = 0;
      
      for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const matches = keywords.filter(keyword => lowerName.includes(keyword)).length;
        if (matches > bestMatchCount) {
          bestMatchCount = matches;
          bestMatchCategory = category;
        }
      }
      
      if (bestMatchCategory && bestMatchCategory !== formData.category) {
        // Validate that the suggested category exists in the user's available categories
        
        // 1. Try exact match
        const exactMatch = categories.find(c => c === bestMatchCategory);
        
        if (exactMatch) {
          setSuggestedCategory(exactMatch);
        } else {
          // 2. Try case-insensitive match
          const lowerBestMatch = bestMatchCategory.toLowerCase();
          const looseMatch = categories.find(c => c.toLowerCase() === lowerBestMatch);
          
          if (looseMatch) {
            setSuggestedCategory(looseMatch);
          } else {
            // 3. Try partial/fuzzy match
            // Check if the user's category contains the best match keyword OR vice versa
            const partialMatch = categories.find(c => {
              const lowerCat = c.toLowerCase();
              return lowerCat.includes(lowerBestMatch) || lowerBestMatch.includes(lowerCat);
            });

            if (partialMatch) {
              setSuggestedCategory(partialMatch);
            } else {
              // Category not found in user's list - don't suggest it
              setSuggestedCategory(null);
            }
          }
        }
      } else {
        setSuggestedCategory(null);
      }
    } else {
      setSuggestedCategory(null);
    }
  }, [formData.name, formData.category, editingTransaction, categories]);

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
        date: editingTransaction.date.split('T')[0],
        category: editingTransaction.category,
        type: editingTransaction.type,
        accountId: editingTransaction.accountId || '',
        comments: editingTransaction.comments || '',
        loanId: editingTransaction.loanId || '',
        tags: editingTransaction.tags || [],
      });
      // Show tag input if editing transaction has tags
      setShowTagInput(editingTransaction.tags && editingTransaction.tags.length > 0);
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
        type: defaultType || 'expense',
        accountId: defaultAccount,
        comments: '',
        loanId: '',
        tags: [],
      });
      // Reset tag input visibility
      setShowTagInput(false);
      // Reset validation state
      setErrors({});
      setTouched({});
    }
  }, [editingTransaction, isOpen, accounts, creditCards, defaultAccountId, categories, defaultType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const isValid = validateForm();

    if (!isValid) {
      hapticFeedback('error');
      // Mark all fields as touched to show errors
      setTouched({
        name: true,
        amount: true,
        date: true,
        accountId: true,
      });
      // Scroll to first error
      setTimeout(() => {
        const currentErrors: Record<string, string> = {};
        currentErrors.name = validateField('name', formData.name);
        currentErrors.amount = validateField('amount', formData.amount);
        if (!isCompact) currentErrors.date = validateField('date', formData.date);
        if (shouldShowAccountField && isAccountRequired) {
          currentErrors.accountId = validateField('accountId', formData.accountId);
        }
        scrollToFirstError(currentErrors);
      }, 100);
      return;
    }

    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === 'expense' ? -amount : amount;

    // Always store date as YYYY-MM-DD format - no more ISO timestamp mixing
    // The date from the input is already in YYYY-MM-DD format
    const finalDateString = formData.date;

    const transaction: Omit<Transaction, 'id'> = {
      name: formData.name,
      amount: finalAmount,
      date: finalDateString,
      category: formData.category,
      type: formData.type,
      ...(formData.accountId && { accountId: formData.accountId }),
      ...(formData.comments && { comments: formData.comments }),
      ...(formData.loanId && { loanId: formData.loanId }), // Add loanId to the saved transaction
      ...(formData.tags.length > 0 && { tags: formData.tags }), // Add tags
    };

    // Haptic feedback on successful save
    hapticFeedback('success');
    onSave(transaction);
    onClose();
  };

  // Handle quick date selection
  const setQuickDate = (daysOffset: number) => {
    const newDate = TimezoneManager.addDays(TimezoneManager.today(), daysOffset);
    setFormData({ ...formData, date: TimezoneManager.toDateString(newDate) });
  };

  // Apply suggested category
  const applySuggestedCategory = () => {
    if (suggestedCategory) {
      setFormData({ ...formData, category: suggestedCategory });
      setSuggestedCategory(null);
    }
  };

  // Format account name with balance (hides balance for credit cards)
  const formatAccountName = (account: Account) => {
    if (account.type === 'Credit Card') {
      return account.name;
    }
    return `${account.name} (${currency}${account.balance.toFixed(2)})`;
  };

  return (
    <>
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
                ref={formRef}
                onSubmit={handleSubmit}
                noValidate
                className={`p-4 md:p-6 space-y-4 md:space-y-6 flex-grow ${!isCompact ? 'overflow-y-auto' : ''}`}
                data-lenis-prevent
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.2 }}
              >              {/* Transaction Name */}
                <motion.div
                  ref={nameInputRef as React.RefObject<HTMLDivElement>}
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
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (touched.name) {
                        setErrors(prev => ({ ...prev, name: validateField('name', e.target.value) }));
                      }
                    }}
                    onBlur={(e) => {
                      handleNameBlur();
                      handleFieldBlur('name', e.target.value);
                    }}
                    className={`w-full rounded-lg border shadow-sm focus:ring focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:text-white py-2 md:py-3 px-3 md:px-4 transition-all placeholder-gray-400 dark:placeholder-[#888888] ${
                      errors.name && touched.name
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/50'
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Coffee Shop, Salary, Gas Station"
                  />
                  {errors.name && touched.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-500 flex items-center"
                    >
                      <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      {errors.name}
                    </motion.p>
                  )}
                  
                  {/* Category suggestion */}
                  {suggestedCategory && (
                    <motion.div 
                      className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex justify-between items-center"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="flex items-center">
                        <TagIcon className="h-4 w-4 text-blue-500 mr-2" />
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

                  <div ref={amountInputRef}>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                        <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Amount *
                    </label>
                    <CurrencyInput
                      value={formData.amount}
                      onChange={(value) => {
                        setFormData({ ...formData, amount: value });
                        if (touched.amount) {
                          setErrors(prev => ({ ...prev, amount: validateField('amount', value) }));
                        }
                      }}
                      currency={currency}
                      className={`w-full ${
                        (errors.amount && touched.amount) || insufficientBalanceError || isLargeAmount
                          ? 'border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/50'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0.00"
                      error={
                        errors.amount && touched.amount
                          ? errors.amount
                          : insufficientBalanceError
                          ? insufficientBalanceError
                          : isLargeAmount
                          ? "Large amount - please double check"
                          : undefined
                      }
                    />
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
                      ref={dateInputRef}
                      type="date"
                      value={formData.date}
                      onChange={(e) => {
                        setFormData({ ...formData, date: e.target.value });
                        if (touched.date) {
                          setErrors(prev => ({ ...prev, date: validateField('date', e.target.value) }));
                        }
                      }}
                      onBlur={(e) => handleFieldBlur('date', e.target.value)}
                      className={`w-full rounded-lg border shadow-sm focus:ring focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:text-white py-2 md:py-3 px-3 md:px-4 transition-all ${
                        errors.date && touched.date
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-200 dark:border-red-500 dark:focus:ring-red-900/50'
                          : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200 dark:border-gray-600'
                      }`}
                    />
                    {errors.date && touched.date && (
                      <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-500 flex items-center"
                      >
                        <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {errors.date}
                      </motion.p>
                    )}
                  </motion.div>
                )}

                {/* Category and Tags Row */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <TagIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Category *
                  </label>
                  <div className="flex gap-3 items-stretch">
                    {/* Category - 70% */}
                    <div className="flex-[7]">
                      <AnimatedDropdown
                        selectedValue={formData.category}
                        options={categories}
                        onChange={(value) => setFormData({ ...formData, category: value })}
                      />
                    </div>

                    {/* Add Tags Button - 30% */}
                    {onAddTag && (
                      <div className="flex-[3]">
                        <motion.button
                          type="button"
                          onClick={() => setShowTagInput(!showTagInput)}
                          className={`w-full h-full min-h-[42px] flex items-center justify-center gap-1.5 rounded-lg border transition-all text-sm font-medium ${
                            showTagInput || formData.tags.length > 0
                              ? 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300'
                              : 'bg-gray-50 dark:bg-[#1A1A1A] border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-purple-400 hover:text-purple-600 dark:hover:text-purple-400'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {formData.tags.length > 0 ? (
                            <>
                              <TagIcon className="h-4 w-4" />
                              <span>{formData.tags.length}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4" />
                              <span>Tags</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {/* Expandable Tags Input */}
                  <AnimatePresence>
                    {showTagInput && onAddTag && (
                      <motion.div
                        initial={{ height: 0, opacity: 0, marginTop: 0 }}
                        animate={{ height: 'auto', opacity: 1, marginTop: 12 }}
                        exit={{ height: 0, opacity: 0, marginTop: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="overflow-hidden"
                      >
                        <TagInput
                          selectedTagIds={formData.tags}
                          availableTags={userTags}
                          onChange={(tagIds) => setFormData({ ...formData, tags: tagIds })}
                          onCreateTag={onAddTag}
                          onUpdateTag={onUpdateTag}
                          onDeleteTag={onDeleteTag}
                          placeholder="Search or create tags..."
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Loan Selector - Only show for Bills & EMIs */}
                {formData.category === 'Bills & EMIs' && loans.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center mt-4">
                      <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                        <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Link to Loan (Optional)
                    </label>
                    <AnimatedDropdown
                      selectedValue={formData.loanId}
                      placeholder="Select a loan..."
                      options={[{ value: '', label: 'No loan link' }, ...loans.map(loan => ({ value: loan.id, label: loan.name }))]}
                      onChange={(value) => setFormData({ ...formData, loanId: value })}
                    />
                  </motion.div>
                )}

                {/* Account */}
                {shouldShowAccountField && (
                  <motion.div
                    ref={accountInputRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ delay: 0.7 }}
                  >
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                        <Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                      <>
                        <AccountDropdown
                          accounts={accounts}
                          creditCards={creditCards}
                          selectedValue={formData.accountId}
                          onChange={(value) => {
                            setFormData({ ...formData, accountId: value });
                            if (touched.accountId) {
                              setErrors(prev => ({ ...prev, accountId: validateField('accountId', value) }));
                            }
                          }}
                          defaultAccountId={defaultAccountId}
                          currency={currency}
                        />
                        {errors.accountId && touched.accountId && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-500 flex items-center"
                          >
                            <span className="inline-block w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                            {errors.accountId}
                          </motion.p>
                        )}
                      </>
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
                        <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
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
                  className="flex items-center justify-between pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.button
                    type="button"
                    onClick={() => setIsBillSplittingOpen(true)}
                    className="flex items-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Split Bill
                  </motion.button>
                  <div className="flex items-center space-x-3 md:space-x-4">
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
                  </div>
                </motion.div>
              </motion.form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bill Splitting Modal */}
      <BillSplittingModal 
        isOpen={isBillSplittingOpen} 
        onClose={() => setIsBillSplittingOpen(false)} 
        currency={currency} // Pass currency to BillSplittingModal
      />
    </>
  );
};

export default AddTransactionModal;