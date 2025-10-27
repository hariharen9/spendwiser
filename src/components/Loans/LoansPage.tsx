import React, { useState, useMemo, useEffect } from 'react';
import { Loan, Transaction } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInVariants } from '../../components/Common/AnimationVariants';
import { 
  Plus, 
  Landmark, 
  Home, 
  Car, 
  User, 
  GraduationCap, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Target
} from 'lucide-react';
import { 
  calculateLoanSummary, 
  applyPrepaymentStrategy, 
  calculateCurrentBalance, 
  calculatePreClosure,
  LoanStatus 
} from '../../lib/loanCalculations';
import AnimatedDropdown from '../Common/AnimatedDropdown';
import Tabs from '../Common/Tabs';

interface LoansPageProps {
  loans: Loan[];
  transactions: Transaction[];
  onAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onMarkEmiPaid: (loan: Loan) => void;
  currency: string;
}

const LoansPage: React.FC<LoansPageProps> = ({ 
  loans, 
  transactions, 
  onAddLoan, 
  onEditLoan, 
  onDeleteLoan, 
  onMarkEmiPaid, 
  currency 
}) => {
  const getLoanIcon = (type?: 'home' | 'auto' | 'personal' | 'student' | 'other') => {
    switch (type) {
      case 'home':
        return <Home className="h-5 w-5 text-blue-500" />;
      case 'auto':
        return <Car className="h-5 w-5 text-blue-500" />;
      case 'personal':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'student':
        return <GraduationCap className="h-5 w-5 text-blue-500" />;
      default:
        return <Landmark className="h-5 w-5 text-blue-500" />;
    }
  };

  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [extraEmiPerYear, setExtraEmiPerYear] = useState(false);
  const [annualEmiIncrease, setAnnualEmiIncrease] = useState(0);
  const [lumpSumAmount, setLumpSumAmount] = useState(0);
  const [lumpSumTiming, setLumpSumTiming] = useState(12);
  const [activeStrategyTab, setActiveStrategyTab] = useState('extraEMI');
  const [preClosureMonth, setPreClosureMonth] = useState(12);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  useEffect(() => {
    const isSelectedLoanInList = selectedLoan && loans.some(l => l.id === selectedLoan.id);

    if ((!selectedLoan || !isSelectedLoanInList) && loans.length > 0) {
      setSelectedLoan(loans[0]);
    } else if (loans.length === 0) {
      setSelectedLoan(null);
    }
  }, [loans, selectedLoan]);

  const strategyTabs = [
    { id: 'extraEMI', label: 'Extra EMI' },
    { id: 'increaseEMI', label: 'EMI Increase' },
    { id: 'lumpSum', label: 'Lump Sum' },
    { id: 'preClosure', label: 'Pre-Closure' },
  ];

  // Calculate loan status based on actual payments
  const selectedLoanStatus = useMemo((): LoanStatus | null => {
    if (!selectedLoan) return null;
    return calculateCurrentBalance(selectedLoan, transactions);
  }, [selectedLoan, transactions]);

  const originalLoanSummary = useMemo(() => {
    if (!selectedLoan) return null;
    return calculateLoanSummary(selectedLoan);
  }, [selectedLoan]);

  const newLoanSummary = useMemo(() => {
    if (!selectedLoan) return null;
    return applyPrepaymentStrategy(selectedLoan, extraEmiPerYear, annualEmiIncrease, lumpSumAmount, lumpSumTiming);
  }, [selectedLoan, extraEmiPerYear, annualEmiIncrease, lumpSumAmount, lumpSumTiming]);

  const preClosureCalculation = useMemo(() => {
    if (!selectedLoan) return null;
    return calculatePreClosure(selectedLoan, transactions, preClosureMonth);
  }, [selectedLoan, transactions, preClosureMonth]);

  const interestSaved = useMemo(() => {
    if (!originalLoanSummary || !newLoanSummary) return 0;
    return originalLoanSummary.totalInterestPaid - newLoanSummary.totalInterestPaid;
  }, [originalLoanSummary, newLoanSummary]);

  // Group amortization schedule by year
  const amortizationByYear = useMemo(() => {
    if (!originalLoanSummary || !selectedLoanStatus) return {};
    
    const grouped: { [year: number]: typeof originalLoanSummary.amortizationSchedule } = {};
    
    originalLoanSummary.amortizationSchedule.forEach((entry, index) => {
      const year = Math.ceil(entry.month / 12);
      if (!grouped[year]) grouped[year] = [];
      
      grouped[year].push({
        ...entry,
        isPaid: index < selectedLoanStatus.paymentsMade,
        paymentDate: index < selectedLoanStatus.paymentsMade ? 
          transactions.filter(t => t.loanId === selectedLoan?.id)[index]?.date : undefined,
      });
    });
    
    return grouped;
  }, [originalLoanSummary, selectedLoanStatus, transactions, selectedLoan]);

  const toggleYearExpansion = (year: number) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(year)) {
      newExpanded.delete(year);
    } else {
      newExpanded.add(year);
    }
    setExpandedYears(newExpanded);
  };

  return (
    <motion.div 
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        variants={fadeInVariants}
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-[#F5F5F5]">EMIs & Loans Tracker</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Track your loan payments manually and optimize your repayment strategy
          </p>
        </div>
        <motion.button 
          onClick={onAddLoan}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 shadow-lg transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5"/>
          <span className="font-medium">Add New Loan</span>
        </motion.button>
      </motion.div>

      {loans.length === 0 ? (
        <motion.div 
          className="text-center py-16 bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700"
          variants={fadeInVariants}
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Landmark className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No loans yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Start tracking your loans and EMIs to get insights into your repayment progress and optimization strategies.
          </p>
          <button 
            onClick={onAddLoan}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add Your First Loan
          </button>
        </motion.div>
      ) : (
        <>
          {/* Loans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loans.map(loan => {
              const loanStatus = calculateCurrentBalance(loan, transactions);
              return (
                <motion.div 
                  key={loan.id} 
                  className={`bg-white dark:bg-[#242424] rounded-xl shadow-sm border-2 transition-all cursor-pointer hover:shadow-md ${
                    selectedLoan?.id === loan.id 
                      ? 'border-blue-500 ring-2 ring-blue-500/20' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  variants={fadeInVariants}
                  onClick={() => setSelectedLoan(loan)}
                  whileHover={{ y: -2 }}
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                          {getLoanIcon(loan.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{loan.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {loan.type || 'other'} loan
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEditLoan(loan); }} 
                          className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDeleteLoan(loan.id); }} 
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Principal</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {currency}{loan.loanAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">EMI</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {currency}{loan.emi.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Interest Rate</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {loan.interestRate === 0 ? '0%' : `${loan.interestRate}%`}
                        </span>
                      </div>
                    </div>

                    {/* Progress Section */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {loanStatus.paymentsMade}/{loanStatus.totalPayments} EMIs
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <motion.div 
                          className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full flex items-center justify-end pr-1" 
                          initial={{ width: 0 }}
                          animate={{ width: `${loanStatus.percentagePaid}%` }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                          {loanStatus.percentagePaid > 15 && (
                            <span className="text-xs text-white font-medium">
                              {Math.round(loanStatus.percentagePaid)}%
                            </span>
                          )}
                        </motion.div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>Outstanding: {currency}{loanStatus.currentBalance.toLocaleString()}</span>
                        <span>{Math.round(loanStatus.percentagePaid)}% paid</span>
                      </div>
                      
                      {/* Mark as Paid Button */}
                      <div className="pt-2">
                        {!loanStatus.isFullyPaid && loanStatus.nextPaymentDue ? (
                          <button
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              onMarkEmiPaid(loan); 
                            }}
                            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Mark EMI #{loanStatus.nextPaymentDue} as Paid</span>
                          </button>
                        ) : loanStatus.isFullyPaid ? (
                          <div className="w-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Loan Fully Paid!</span>
                          </div>
                        ) : (
                          <div className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>No payments due</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Loan Details */}
          {selectedLoan && selectedLoanStatus && originalLoanSummary && (
            <motion.div className="space-y-8" variants={fadeInVariants}>
              {/* Loan Summary Header */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-500 p-3 rounded-xl">
                      {getLoanIcon(selectedLoan.type)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLoan.name}</h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {selectedLoanStatus.paymentsMade} of {selectedLoanStatus.totalPayments} EMIs paid
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    {!selectedLoanStatus.isFullyPaid && selectedLoanStatus.nextPaymentDue && (
                      <motion.button
                        onClick={() => onMarkEmiPaid(selectedLoan)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 shadow-lg transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckCircle className="h-5 w-5" />
                        <span>Mark EMI #{selectedLoanStatus.nextPaymentDue} as Paid</span>
                      </motion.button>
                    )}
                    
                    {selectedLoanStatus.isFullyPaid && (
                      <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-6 py-3 rounded-lg font-medium flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Loan Fully Paid!</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <DollarSign className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currency}{selectedLoanStatus.currentBalance.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <Calendar className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Progress</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {Math.round(selectedLoanStatus.percentagePaid)}%
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">EMI</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {currency}{selectedLoan.emi.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-1">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Interest</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {selectedLoan.interestRate}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Strategy Simulator */}
              <div className="bg-white dark:bg-[#242424] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-blue-500 rounded-lg p-2">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Repayment Strategy Simulator</h4>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Explore different strategies to optimize your loan repayment
                    </p>
                  </div>
                </div>
                
                <Tabs tabs={strategyTabs} selectedTab={activeStrategyTab} onSelectTab={setActiveStrategyTab} />
                
                <div className="mt-6">
                  {activeStrategyTab === 'extraEMI' && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg flex-shrink-0">
                          <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <input
                              type="checkbox"
                              id="extra-emi"
                              checked={extraEmiPerYear}
                              onChange={(e) => setExtraEmiPerYear(e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="extra-emi" className="ml-3 text-lg font-semibold text-gray-900 dark:text-white">
                              Pay 1 Extra EMI Every Year
                            </label>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            Make one additional EMI payment annually to significantly reduce your loan tenure and save on interest.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeStrategyTab === 'increaseEMI' && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg flex-shrink-0">
                          <TrendingDown className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
                            Annual EMI Increase: {annualEmiIncrease}%
                          </label>
                          <input 
                            type="range" 
                            value={annualEmiIncrease} 
                            onChange={(e) => setAnnualEmiIncrease(parseFloat(e.target.value))} 
                            className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500 mb-3"
                            min="0" 
                            max="30"
                            step="0.5"
                          />
                          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                            <span>0%</span>
                            <span>15%</span>
                            <span>30%</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            Gradually increase your EMI as your income grows to pay off the loan faster.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeStrategyTab === 'lumpSum' && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg flex-shrink-0">
                          <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Lump Sum Payment
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Amount ({currency})
                              </label>
                              <input 
                                type="number" 
                                value={lumpSumAmount} 
                                onChange={(e) => setLumpSumAmount(parseFloat(e.target.value) || 0)} 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:text-white dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter amount"
                                min="0"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Timing
                              </label>
                              <AnimatedDropdown
                                selectedValue={lumpSumTiming.toString()}
                                options={[
                                  { value: '6', label: 'After 6 months' },
                                  { value: '12', label: 'After 1 year' },
                                  { value: '24', label: 'After 2 years' },
                                  { value: '36', label: 'After 3 years' },
                                ]}
                                onChange={(value) => setLumpSumTiming(parseInt(value))}
                              />
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            Make a one-time extra payment to reduce principal and save on interest. Perfect for bonuses or windfalls!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {activeStrategyTab === 'preClosure' && preClosureCalculation && (
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-lg flex-shrink-0">
                          <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Pre-Closure Calculator
                          </label>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Close loan after month: {preClosureMonth}
                            </label>
                            <input 
                              type="range" 
                              value={preClosureMonth} 
                              onChange={(e) => setPreClosureMonth(parseInt(e.target.value))} 
                              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                              min={selectedLoanStatus.paymentsMade + 1} 
                              max={selectedLoanStatus.totalPayments}
                            />
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-1">
                              <span>Month {selectedLoanStatus.paymentsMade + 1}</span>
                              <span>Month {selectedLoanStatus.totalPayments}</span>
                            </div>
                          </div>
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <p className="text-blue-800 dark:text-blue-200 font-medium">
                              To pay off your loan in month {preClosureMonth}, you would need to pay{' '}
                              <span className="font-bold">{currency}{preClosureCalculation.payoffAmount.toLocaleString()}</span>.
                              This would save you{' '}
                              <span className="font-bold">{currency}{preClosureCalculation.interestSaved.toLocaleString()}</span>{' '}
                              in future interest and close your loan{' '}
                              <span className="font-bold">{preClosureCalculation.monthsEarly} months</span> early.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Strategy Results */}
                {newLoanSummary && (
                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800/30">
                      <h5 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Original Plan</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">End Date:</span>
                          <span className="font-medium text-blue-800 dark:text-blue-200">{originalLoanSummary.loanEndDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">Total Interest:</span>
                          <span className="font-medium text-blue-800 dark:text-blue-200">{currency}{originalLoanSummary.totalInterestPaid.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800/30">
                      <h5 className="font-semibold text-green-800 dark:text-green-200 mb-2">Optimized Plan</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-300">End Date:</span>
                          <span className="font-medium text-green-800 dark:text-green-200">{newLoanSummary.loanEndDate.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-700 dark:text-green-300">Total Interest:</span>
                          <span className="font-medium text-green-800 dark:text-green-200">{currency}{newLoanSummary.totalInterestPaid.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-green-800 dark:text-green-200 pt-2 border-t border-green-200 dark:border-green-800">
                          <span>Interest Saved:</span>
                          <span>{currency}{interestSaved.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Smart Amortization Schedule */}
              <div className="bg-white dark:bg-[#242424] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
                  <Calendar className="h-6 w-6 text-blue-500" />
                  <span>Payment Schedule</span>
                </h4>
                
                <div className="space-y-4">
                  {Object.entries(amortizationByYear).map(([year, entries]) => (
                    <div key={year} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleYearExpansion(parseInt(year))}
                        className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold text-gray-900 dark:text-white">Year {year}</span>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                            <span>{entries.filter(e => e.isPaid).length}/{entries.length} paid</span>
                            <span>
                              {currency}{entries.reduce((sum, e) => sum + e.totalPayment, 0).toLocaleString()} total
                            </span>
                          </div>
                        </div>
                        {expandedYears.has(parseInt(year)) ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                      
                      <AnimatePresence>
                        {expandedYears.has(parseInt(year)) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-white dark:bg-[#242424]">
                              {/* Desktop: 2-column grid */}
                              <div className="hidden md:grid md:grid-cols-2 gap-3">
                                {entries.map((entry) => (
                                  <div
                                    key={entry.month}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                      entry.isPaid
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-1 rounded-full ${
                                        entry.isPaid ? 'bg-green-500' : 'bg-gray-400'
                                      }`}>
                                        {entry.isPaid ? (
                                          <CheckCircle className="h-4 w-4 text-white" />
                                        ) : (
                                          <Clock className="h-4 w-4 text-white" />
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          EMI #{entry.month}
                                        </span>
                                        {entry.isPaid && entry.paymentDate && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Paid on {new Date(entry.paymentDate).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <div className="font-semibold text-gray-900 dark:text-white">
                                        {currency}{entry.totalPayment.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        P: {currency}{entry.principal.toLocaleString()} | 
                                        I: {currency}{entry.interest.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              
                              {/* Mobile: Single column */}
                              <div className="md:hidden grid gap-3">
                                {entries.map((entry) => (
                                  <div
                                    key={entry.month}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                      entry.isPaid
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                        : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                                    }`}
                                  >
                                    <div className="flex items-center space-x-3">
                                      <div className={`p-1 rounded-full ${
                                        entry.isPaid ? 'bg-green-500' : 'bg-gray-400'
                                      }`}>
                                        {entry.isPaid ? (
                                          <CheckCircle className="h-4 w-4 text-white" />
                                        ) : (
                                          <Clock className="h-4 w-4 text-white" />
                                        )}
                                      </div>
                                      <div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                          EMI #{entry.month}
                                        </span>
                                        {entry.isPaid && entry.paymentDate && (
                                          <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Paid on {new Date(entry.paymentDate).toLocaleDateString()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="text-right">
                                      <div className="font-semibold text-gray-900 dark:text-white">
                                        {currency}{entry.totalPayment.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        P: {currency}{entry.principal.toLocaleString()} | 
                                        I: {currency}{entry.interest.toLocaleString()}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default LoansPage;