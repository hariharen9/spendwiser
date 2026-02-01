import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link, Plus, Calendar, Search, CreditCard, Wallet } from 'lucide-react';
import { Transaction, Account } from '../../types/types';
import { modalVariants } from '../Common/AnimationVariants';

interface PayCreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditCard: Account;
  transactions: Transaction[];
  accounts: Account[]; // All accounts for selecting payment source
  onLinkTransaction: (transactionId: string) => void;
  onCreateTransaction: (amount: number, date: string, fromAccountId: string) => void;
  currency: string;
  outstandingBalance: number;
}

const PayCreditCardModal: React.FC<PayCreditCardModalProps> = ({
  isOpen,
  onClose,
  creditCard,
  transactions,
  accounts,
  onLinkTransaction,
  onCreateTransaction,
  currency,
  outstandingBalance
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'link'>('create');
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');

  // Get non-credit card accounts (bank accounts, cash, etc.)
  const paymentSourceAccounts = useMemo(() => {
    return accounts.filter(acc => acc.type !== 'Credit Card');
  }, [accounts]);

  // Set default account on first render
  useMemo(() => {
    if (paymentSourceAccounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(paymentSourceAccounts[0].id);
    }
  }, [paymentSourceAccounts, selectedAccountId]);

  // Filter for linkable transactions:
  // 1. Must be an expense transaction from a NON-CC account (bank account)
  // 2. Must NOT be linked to a credit card payment already
  // 3. Sort by date (newest first)
  const linkableTransactions = useMemo(() => {
    return transactions
      .filter(t =>
        t.accountId !== creditCard.id && // From a different account (bank)
        t.type === 'expense' &&
        !t.creditCardPaymentId &&
        (t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          Math.abs(t.amount).toString().includes(searchTerm))
      )
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, creditCard.id, searchTerm]);

  // Suggest transactions that match outstanding balance (within 5% variance)
  const suggestedTransactions = useMemo(() => {
    if (outstandingBalance <= 0) return [];
    return linkableTransactions.filter(t => {
      const amount = Math.abs(t.amount);
      const variance = outstandingBalance * 0.05;
      return amount >= (outstandingBalance - variance) && amount <= (outstandingBalance + variance);
    });
  }, [linkableTransactions, outstandingBalance]);

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
    const amount = parseFloat(paymentAmount);
    if (!isNaN(amount) && amount > 0 && selectedAccountId) {
      onCreateTransaction(amount, paymentDate, selectedAccountId);
      onClose();
    }
  };

  const handleAmountChange = (value: string) => {
    // Only allow valid number inputs
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setPaymentAmount(value);
    }
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
                <span className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg mr-3">
                  <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                </span>
                Pay Credit Card Bill
              </h2>
              <button
                onClick={onClose}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Card Info */}
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/30 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">{creditCard.name}</span>
                <div className="text-right">
                  <p className="text-xs text-gray-500 dark:text-gray-500">Outstanding Balance</p>
                  <p className={`text-lg font-bold ${outstandingBalance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                    {currency}{Math.abs(outstandingBalance).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex p-2 bg-gray-100 dark:bg-gray-900/50 space-x-2">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-[#242424] text-green-600 dark:text-green-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>New Payment</span>
              </button>
              <button
                onClick={() => setActiveTab('link')}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                  activeTab === 'link'
                    ? 'bg-white dark:bg-[#242424] text-green-600 dark:text-green-400 shadow-sm'
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
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-100 dark:border-green-800">
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                      Record a payment from your bank account to pay your credit card bill.
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-300">
                      You can pay any amount - partial payments are supported.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Pay From Account
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Wallet className="h-4 w-4 text-gray-500" />
                      </div>
                      <select
                        value={selectedAccountId}
                        onChange={(e) => setSelectedAccountId(e.target.value)}
                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-green-500 outline-none appearance-none"
                      >
                        {paymentSourceAccounts.map(acc => (
                          <option key={acc.id} value={acc.id}>
                            {acc.name} ({acc.type})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Payment Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500">{currency}</span>
                      </div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={paymentAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder={outstandingBalance > 0 ? outstandingBalance.toString() : '0.00'}
                        className="pl-8 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    {outstandingBalance > 0 && (
                      <button
                        onClick={() => setPaymentAmount(outstandingBalance.toString())}
                        className="mt-2 text-xs text-green-600 dark:text-green-400 hover:underline"
                      >
                        Pay full balance ({currency}{outstandingBalance.toLocaleString()})
                      </button>
                    )}
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
                        className="pl-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-green-500 outline-none"
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
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1A1A1A] text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 outline-none"
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
                                  ? 'bg-green-50 dark:bg-green-900/30 border-green-500 ring-1 ring-green-500'
                                  : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-700 hover:border-green-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</p>
                                  <p className="text-xs text-gray-500">{t.date}</p>
                                </div>
                                <span className="font-bold text-red-500 dark:text-red-400 text-sm">
                                  -{currency}{Math.abs(t.amount).toLocaleString()}
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
                          Other Bank Expenses
                        </h4>
                        <div className="space-y-2">
                          {otherTransactions.map(t => (
                            <div
                              key={t.id}
                              onClick={() => setSelectedTransactionId(t.id)}
                              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                                selectedTransactionId === t.id
                                  ? 'bg-green-50 dark:bg-green-900/30 border-green-500 ring-1 ring-green-500'
                                  : 'bg-white dark:bg-[#1A1A1A] border-gray-200 dark:border-gray-700 hover:border-green-300'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</p>
                                  <p className="text-xs text-gray-500">{t.date}</p>
                                </div>
                                <span className="font-bold text-red-500 dark:text-red-400 text-sm">
                                  -{currency}{Math.abs(t.amount).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {linkableTransactions.length === 0 && (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
                        No unlinked expense transactions found from your bank accounts.
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
                disabled={activeTab === 'create'
                  ? !paymentAmount || parseFloat(paymentAmount) <= 0 || !selectedAccountId
                  : !selectedTransactionId
                }
                className={`px-4 py-2 rounded-lg text-white font-medium shadow-sm transition-all ${
                  (activeTab === 'create' && (!paymentAmount || parseFloat(paymentAmount) <= 0 || !selectedAccountId)) ||
                  (activeTab === 'link' && !selectedTransactionId)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 transform hover:scale-105'
                }`}
              >
                {activeTab === 'create' ? 'Record Payment' : 'Link Transaction'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PayCreditCardModal;
