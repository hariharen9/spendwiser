import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Plus, Calendar, DollarSign, Search } from 'lucide-react';
import { Transaction, Loan } from '../../types/types';
import { modalVariants } from '../Common/AnimationVariants';

interface LinkLoanTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  loan: Loan;
  transactions: Transaction[];
  onLinkTransaction: (transactionId: string) => void;
  onCreateTransaction: (date: string) => void;
  currency: string;
}

const LinkLoanTransactionModal: React.FC<LinkLoanTransactionModalProps> = ({
  isOpen,
  onClose,
  loan,
  transactions,
  onLinkTransaction,
  onCreateTransaction,
  currency
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'link'>('create');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter for linkable transactions:
  // 1. Must be an expense
  // 2. Must NOT be linked to a loan already
  // 3. Sort by date (newest first)
  const linkableTransactions = useMemo(() => {
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        !t.loanId && 
        (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
         t.amount.toString().includes(searchTerm))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchTerm]);

  // Suggest transactions that match EMI amount (within 5% variance)
  const suggestedTransactions = useMemo(() => {
    return linkableTransactions.filter(t => {
      const amount = Math.abs(t.amount);
      const variance = loan.emi * 0.05;
      return amount >= (loan.emi - variance) && amount <= (loan.emi + variance);
    });
  }, [linkableTransactions, loan.emi]);

  const otherTransactions = useMemo(() => {
    return linkableTransactions.filter(t => !suggestedTransactions.includes(t));
  }, [linkableTransactions, suggestedTransactions]);

  const handleLink = () => {
    if (selectedTransactionId) {
      onLinkTransaction(selectedTransactionId);
      onClose();
    }
  };

  const handleCreate = () => {
    onCreateTransaction(paymentDate);
    onClose();
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
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-lg font-bold text-gray-900 dark:text-[#F5F5F5] flex items-center">
                <span className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </span>
                Record Payment
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 bg-gray-100 dark:bg-gray-900/50 space-x-2">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-[#242424] text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>New Transaction</span>
              </button>
              <button
                onClick={() => setActiveTab('link')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'link'
                    ? 'bg-white dark:bg-[#242424] text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Link className="h-4 w-4" />
                <span>Link Existing</span>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto flex-1">
              {activeTab === 'create' ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                      This will create a new expense transaction for <strong>{currency}{loan.emi.toLocaleString()}</strong>.
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-300">
                      Use this for future payments to keep your loan progress and bank balance in sync.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Date
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-4 w-4 text-gray-500" />
                      </div>
                      <input
                        type="date"
                        value={paymentDate}
                        onChange={(e) => setPaymentDate(e.target.value)}
                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 h-full flex flex-col">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search amount or name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-3 min-h-[200px]">
                    {suggestedTransactions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Suggested Matches
                        </h4>
                        <div className="space-y-2">
                          {suggestedTransactions.map(t => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTransactionId(t.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedTransactionId === t.id
                                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500'
                                  : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-700 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</p>
                                  <p className="text-xs text-gray-500">{t.date}</p>
                                </div>
                                <span className="font-bold text-red-500 dark:text-red-400 text-sm">
                                  {currency}{Math.abs(t.amount).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {otherTransactions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 mt-2">
                          Other Expenses
                        </h4>
                        <div className="space-y-2">
                          {otherTransactions.map(t => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTransactionId(t.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedTransactionId === t.id
                                  ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 ring-1 ring-blue-500'
                                  : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-700 hover:border-blue-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</p>
                                  <p className="text-xs text-gray-500">{t.date}</p>
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white text-sm">
                                  {currency}{Math.abs(t.amount).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {linkableTransactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        No unlinked expense transactions found.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={activeTab === 'create' ? handleCreate : handleLink}
                disabled={activeTab === 'link' && !selectedTransactionId}
                className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all ${
                  (activeTab === 'link' && !selectedTransactionId)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 transform hover:scale-105'
                }`}
              >
                {activeTab === 'create' ? 'Create & Pay' : 'Link Transaction'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LinkLoanTransactionModal;
