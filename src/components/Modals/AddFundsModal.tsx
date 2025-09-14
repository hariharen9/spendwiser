import React, { useState } from 'react';
import { Goal, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../components/Common/AnimationVariants';
import { X, PiggyBank, Wallet } from 'lucide-react';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFunds: (goal: Goal, amount: number, accountId: string) => void;
  goal: Goal | null;
  accounts: Account[];
}

const AddFundsModal: React.FC<AddFundsModalProps> = ({ isOpen, onClose, onAddFunds, goal, accounts }) => {
  const [amount, setAmount] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (goal && selectedAccount) {
      onAddFunds(goal, amount, selectedAccount);
      onClose();
    }
  };

  if (!goal) return null;

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
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5] flex items-center">
                <PiggyBank className="mr-2 h-6 w-6 text-green-500" />
                Add Funds to {goal.name}
              </h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="relative">
                <label htmlFor="add-funds-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <span className="bg-green-100 dark:bg-green-900/50 p-1 rounded mr-2">
                    <PiggyBank className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </span>
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-[#888888]">₹</span>
                  <input 
                    type="number" 
                    id="add-funds-amount" 
                    value={amount || ''} 
                    onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} 
                    className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white placeholder-gray-400 dark:placeholder-[#888888] focus:outline-none transition-all" 
                    placeholder="0.00"
                    required 
                  />
                </div>
              </div>
              <div className="relative">
                <label htmlFor="add-funds-account" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                  <span className="bg-green-100 dark:bg-green-900/50 p-1 rounded mr-2">
                    <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </span>
                  From Account
                </label>
                <select 
                  id="add-funds-account" 
                  value={selectedAccount || ''} 
                  onChange={(e) => setSelectedAccount(e.target.value)} 
                  className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all appearance-none"
                  required
                >
                  <option value="" disabled>Select an account</option>
                  {accounts.map(account => (
                    <option 
                      key={account.id} 
                      value={account.id}
                      className="dark:bg-[#1A1A1A] dark:text-white"
                    >
                      {formatAccountName(account)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-5 py-2.5 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center shadow-md hover:shadow-lg"
                >
                  Add Funds
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddFundsModal;