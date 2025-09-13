import React, { useState, useEffect } from 'react';
import { Loan } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../components/Common/AnimationVariants';
import { X } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (loan: Omit<Loan, 'id'>) => void;
  editingLoan?: Loan;
}

const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, onSave, editingLoan }) => {
  const [name, setName] = useState('');
  const [loanAmount, setLoanAmount] = useState(0);
  const [interestRate, setInterestRate] = useState(0);
  const [tenure, setTenure] = useState(0);
  const [emi, setEmi] = useState(0);
  const [startDate, setStartDate] = useState('');

  useEffect(() => {
    if (editingLoan) {
      setName(editingLoan.name);
      setLoanAmount(editingLoan.loanAmount);
      setInterestRate(editingLoan.interestRate);
      setTenure(editingLoan.tenure);
      setEmi(editingLoan.emi);
      setStartDate(editingLoan.startDate);
    } else {
      setName('');
      setLoanAmount(0);
      setInterestRate(0);
      setTenure(0);
      setEmi(0);
      setStartDate('');
    }
  }, [editingLoan, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, loanAmount, interestRate, tenure, emi, startDate });
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
            className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">{editingLoan ? 'Edit Loan' : 'Add New Loan'}</h2>
              <button onClick={onClose} className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5]">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="loan-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loan Name</label>
                <input type="text" id="loan-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="loan-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Loan Amount</label>
                <input type="number" id="loan-amount" value={loanAmount} onChange={(e) => setLoanAmount(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="interest-rate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Interest Rate (%)</label>
                <input type="number" id="interest-rate" value={interestRate} onChange={(e) => setInterestRate(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="tenure" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tenure (Years)</label>
                <input type="number" id="tenure" value={tenure} onChange={(e) => setTenure(parseInt(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="emi" className="block text-sm font-medium text-gray-700 dark:text-gray-300">EMI</label>
                <input type="number" id="emi" value={emi} onChange={(e) => setEmi(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                <input type="date" id="start-date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">{editingLoan ? 'Save Changes' : 'Add Loan'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoanModal;
