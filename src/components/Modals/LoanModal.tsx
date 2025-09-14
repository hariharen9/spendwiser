import React, { useState, useEffect } from 'react';
import { Loan } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../components/Common/AnimationVariants';
import { X, Calculator, Calendar, CreditCard, Percent, Clock } from 'lucide-react';

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
  const [tenureInMonths, setTenureInMonths] = useState(0);
  const [isInMonths, setIsInMonths] = useState(false);
  const [emi, setEmi] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);

  // Calculate EMI based on loan amount, interest rate, and tenure
  const calculateEmi = (amount: number, rate: number, years: number, months: number = 0): number => {
    if (amount <= 0 || rate < 0 || (years <= 0 && months <= 0)) return 0;
    
    const totalMonths = isInMonths ? months : (years * 12);
    if (totalMonths <= 0) return 0;
    
    // For 0% interest loans, EMI is simply principal divided by number of months
    if (rate === 0) {
      return amount / totalMonths;
    }
    
    const monthlyRate = rate / 12 / 100;
    const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    return parseFloat(emi.toFixed(2));
  };

  // Auto-calculate EMI when loan amount, interest rate, or tenure changes
  useEffect(() => {
    if (!editingLoan && loanAmount > 0 && interestRate >= 0) {
      setIsCalculating(true);
      const calculatedEmi = calculateEmi(loanAmount, interestRate, tenure, tenureInMonths);
      setEmi(calculatedEmi);
      setTimeout(() => setIsCalculating(false), 300);
    }
  }, [loanAmount, interestRate, tenure, tenureInMonths, isInMonths, editingLoan]);

  useEffect(() => {
    if (editingLoan) {
      setName(editingLoan.name);
      setLoanAmount(editingLoan.loanAmount);
      setInterestRate(editingLoan.interestRate);
      setTenure(editingLoan.tenure);
      setTenureInMonths(editingLoan.tenureInMonths || 0);
      setIsInMonths(editingLoan.tenureInMonths !== undefined && editingLoan.tenureInMonths > 0);
      setEmi(editingLoan.emi);
      setStartDate(editingLoan.startDate);
    } else {
      setName('');
      setLoanAmount(0);
      setInterestRate(0);
      setTenure(0);
      setTenureInMonths(0);
      setIsInMonths(false);
      setEmi(0);
      setStartDate('');
    }
  }, [editingLoan, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const loanData = {
      name,
      loanAmount,
      interestRate,
      tenure: isInMonths ? 0 : tenure,
      tenureInMonths: isInMonths ? tenureInMonths : undefined,
      emi,
      startDate
    };
    onSave(loanData);
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
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl z-50"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5] flex items-center">
                <CreditCard className="mr-2 h-6 w-6 text-blue-500" />
                {editingLoan ? 'Edit Loan' : 'Add New Loan'}
              </h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="loan-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Loan Name
                  </label>
                  <input 
                    type="text" 
                    id="loan-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                    placeholder="e.g., Home Loan, Car Loan"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label htmlFor="loan-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                        <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Loan Amount
                    </label>
                    <input 
                      type="number" 
                      id="loan-amount" 
                      value={loanAmount || ''} 
                      onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)} 
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                      placeholder="0"
                      min="0"
                      required 
                    />
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="interest-rate" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                        <Percent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Interest Rate (%)
                    </label>
                    <input 
                      type="number" 
                      id="interest-rate" 
                      value={interestRate || ''} 
                      onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)} 
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required 
                    />
                    {interestRate === 0 && (
                      <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                        No interest loan - EMI will be principal divided by tenure
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Tenure
                    </label>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">In Months</span>
                      <div 
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isInMonths ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        onClick={() => setIsInMonths(!isInMonths)}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isInMonths ? 'translate-x-6' : 'translate-x-1'}`} />
                      </div>
                    </div>
                  </div>
                  
                  {isInMonths ? (
                    <input 
                      type="number" 
                      id="tenure-months" 
                      value={tenureInMonths || ''} 
                      onChange={(e) => setTenureInMonths(parseInt(e.target.value) || 0)} 
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                      placeholder="Enter months"
                      min="1"
                      max="360"
                      required 
                    />
                  ) : (
                    <input 
                      type="number" 
                      id="tenure" 
                      value={tenure || ''} 
                      onChange={(e) => setTenure(parseInt(e.target.value) || 0)} 
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                      placeholder="Enter years"
                      min="1"
                      required 
                    />
                  )}
                </div>
                
                <div className="relative">
                  <label htmlFor="emi" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <Calculator className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    EMI (Auto-calculated)
                  </label>
                  <div className="relative">
                    <input 
                      type="number" 
                      id="emi" 
                      value={emi || ''} 
                      onChange={(e) => setEmi(parseFloat(e.target.value) || 0)} 
                      className={`w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all ${!editingLoan ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`} 
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required 
                      readOnly={!editingLoan}
                    />
                    {isCalculating && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <label htmlFor="start-date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Start Date
                  </label>
                  <input 
                    type="date" 
                    id="start-date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                    required 
                  />
                </div>
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
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center shadow-md hover:shadow-lg"
                >
                  {editingLoan ? 'Save Changes' : 'Add Loan'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoanModal;