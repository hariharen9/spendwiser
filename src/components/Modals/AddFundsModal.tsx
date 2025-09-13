import React, { useState } from 'react';
import { Goal, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../components/Common/AnimationVariants';
import { X } from 'lucide-react';

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
            className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">Add Funds to {goal.name}</h2>
              <button onClick={onClose} className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5]">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="add-funds-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amount</label>
                <input type="number" id="add-funds-amount" value={amount} onChange={(e) => setAmount(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="add-funds-account" className="block text-sm font-medium text-gray-700 dark:text-gray-300">From Account</label>
                <select id="add-funds-account" value={selectedAccount || ''} onChange={(e) => setSelectedAccount(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required>
                  <option value="" disabled>Select an account</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>{account.name} ({account.balance})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600">Add Funds</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddFundsModal;
