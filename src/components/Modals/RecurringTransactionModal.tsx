import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, Repeat, Tag, Briefcase, Trash2, Edit, Clock, Info } from 'lucide-react';
import { RecurringTransaction, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import AnimatedDropdown from '../Common/AnimatedDropdown';
import { TimezoneManager } from '../../lib/timezone';

interface RecurringTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<RecurringTransaction, 'id' | 'lastProcessedDate'>) => void;
  onUpdate: (transaction: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  accounts: Account[];
  categories?: string[];
  recurringTransactions: RecurringTransaction[];
  currency: string;
}

const RecurringTransactionModal: React.FC<RecurringTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  accounts,
  categories = ['Salary', 'Freelance', 'Investment', 'Groceries', 'Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Recharge & Bills', 'Other'],
  recurringTransactions,
  currency
}) => {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: categories[0],
    type: 'expense' as 'income' | 'expense',
    accountId: '',
    frequency: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
    startDate: TimezoneManager.getInputDate(),
    endDate: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category: categories[0],
      type: 'expense',
      accountId: '',
      frequency: 'monthly',
      startDate: TimezoneManager.getInputDate(),
      endDate: ''
    });
    setEditingId(null);
  };

  const getNextETA = (rt: RecurringTransaction) => {
    const today = TimezoneManager.today();
    const lastProcessed = TimezoneManager.parseDate(rt.lastProcessedDate);
    
    // If already processed today, next occurrence is based on frequency
    if (TimezoneManager.isSameDay(lastProcessed, today)) {
      const nextDate = TimezoneManager.getNextOccurrence(today, rt.frequency);
      return TimezoneManager.formatDate(nextDate);
    } else {
      // If not processed today, next occurrence could be today or later
      const nextDate = TimezoneManager.getNextOccurrence(lastProcessed, rt.frequency);
      if (nextDate <= today) {
        return 'Due now';
      } else {
        return TimezoneManager.formatDate(nextDate);
      }
    }
  };

  const handleEditClick = (transaction: RecurringTransaction) => {
    setEditingId(transaction.id);
    setFormData({
      name: transaction.name,
      amount: Math.abs(transaction.amount).toString(),
      category: transaction.category,
      type: transaction.type,
      accountId: transaction.accountId || '',
      frequency: transaction.frequency,
      startDate: transaction.startDate,
      endDate: transaction.endDate || ''
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    const finalAmount = formData.type === 'expense' ? -amount : amount;

    const recurringTransactionData = {
      name: formData.name,
      amount: finalAmount,
      category: formData.category,
      type: formData.type,
      frequency: formData.frequency,
      startDate: formData.startDate,
      ...(formData.endDate && { endDate: formData.endDate }),
      ...(formData.accountId && { accountId: formData.accountId }),
    };

    if (editingId) {
        const originalTransaction = recurringTransactions.find(t => t.id === editingId);
        if(originalTransaction) {
            onUpdate({
                ...originalTransaction,
                ...recurringTransactionData
            });
        }
    } else {
      onSave(recurringTransactionData);
    }
    
    resetForm();
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
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl shadow-2xl max-h-[90vh] flex flex-col"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Repeat className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  Manage Recurring Transactions
                </h2>
              </div>
              <button onClick={onClose} className="text-gray-500 dark:text-[#888888] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">
                  {editingId ? 'Edit Transaction' : 'Add New Transaction'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2"><DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" /></span>
                        Name *
                    </label>
                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 px-3 transition-all" placeholder="e.g., Netflix, Rent" />
                  </div>
                  
                  {/* Amount & Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2"><DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" /></span>
                        Amount *
                      </label>
                      <input type="number" required step="0.01" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 px-3 transition-all" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2"><Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" /></span>
                        Type *
                      </label>
                      <AnimatedDropdown 
                        selectedValue={formData.type}
                        options={['expense', 'income']}
                        onChange={(value) => setFormData({ ...formData, type: value as 'income' | 'expense' })}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2"><Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" /></span>
                        Category *
                    </label>
                    <AnimatedDropdown 
                        selectedValue={formData.category}
                        options={categories}
                        onChange={(value) => setFormData({ ...formData, category: value })}
                    />
                  </div>

                  {/* Account */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2"><Briefcase className="h-4 w-4 text-blue-600 dark:text-blue-400" /></span>
                        Account
                    </label>
                    <AnimatedDropdown 
                        selectedValue={formData.accountId}
                        placeholder="Select an account"
                        options={accounts.map(acc => ({ value: acc.id, label: acc.name }))}
                        onChange={(value) => setFormData({ ...formData, accountId: value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2"><Repeat className="h-4 w-4 text-blue-600 dark:text-blue-400" /></span>
                        Frequency *
                    </label>
                    <AnimatedDropdown 
                        selectedValue={formData.frequency}
                        options={['daily', 'weekly', 'monthly', 'yearly']}
                        onChange={(value) => setFormData({ ...formData, frequency: value as 'daily' | 'weekly' | 'monthly' | 'yearly' })}
                    />
                  </div>

                  {/* Start & End Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2"><Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" /></span>
                        Start Date *
                      </label>
                      <input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 px-3 transition-all" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                        <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2"><Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" /></span>
                        End Date
                      </label>
                      <input type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 px-3 transition-all" placeholder="Optional" />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    {editingId && <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel Edit</button>}
                    <button type="submit" className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors shadow-md">{editingId ? 'Update Transaction' : 'Save Transaction'}</button>
                  </div>
                </form>
              </div>

              {/* List Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-600 pb-2">
                  Existing Transactions
                </h3>
                <div className="max-h-[60vh] lg:max-h-[calc(90vh-200px)] overflow-y-auto space-y-3 pr-2">
                  {recurringTransactions.length > 0 ? recurringTransactions.map(rt => (
                    <motion.div 
                        key={rt.id} 
                        className="p-4 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg flex justify-between items-start"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                    >
                      <div className="flex items-center">
                        <div className={`mr-3 p-2 rounded-full ${rt.type === 'income' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}>
                            <DollarSign size={16} className={`${rt.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">{rt.name}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {currency}{Math.abs(rt.amount)} / {rt.frequency}
                            </p>
                            <div className="flex items-center space-x-4 mt-1">
                              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock size={12} />
                                <span>Last: {TimezoneManager.formatDate(rt.lastProcessedDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                                <Calendar size={12} />
                                <span>Next: {getNextETA(rt)}</span>
                              </div>
                            </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-1">
                        <button onClick={() => handleEditClick(rt)} className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors"><Edit size={16} /></button>
                        <button onClick={() => onDelete(rt.id)} className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-10">
                        <Repeat size={40} className="mx-auto text-gray-400"/>
                        <p className="mt-2">No recurring transactions found.</p>
                        <p className="text-sm">Add one using the form on the left.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RecurringTransactionModal;