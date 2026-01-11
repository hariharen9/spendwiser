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
  Target,
  FileText,
  ShieldCheck,
  Zap,
  Info,
  Trash2
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
import PayoffChart from './PayoffChart';
import StrategySummaryTable from './StrategySummaryTable';

interface LoansPageProps {
  loans: Loan[];
  transactions: Transaction[];
  onAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onMarkEmiPaid: (loan: Loan) => void;
  currency: string;
}

// --- Premium Sub-components ---

const LoanDossier: React.FC<{ 
  loan: Loan; 
  status: LoanStatus; 
  currency: string;
}> = ({ loan, status, currency }) => {
  const isPaid = status.isFullyPaid;
  
  return (
    <div className="relative w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Texture & Accents */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-600"></div>
      <div className="absolute top-4 right-4 opacity-10 dark:opacity-20 text-gray-400">
        <Landmark size={80} />
      </div>
      
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold">Official Record</p>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{loan.name}</h3>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded uppercase">
                {loan.type || 'Personal'} Loan
              </span>
              <span className="text-gray-400 text-[10px]">ID: {loan.id.slice(-8).toUpperCase()}</span>
            </div>
          </div>
          
          {/* Status Stamp */}
          <div className={`rotate-12 border-4 px-3 py-1 rounded-md font-black text-xl uppercase tracking-tighter ${
            isPaid ? 'border-green-500/50 text-green-500/50' : 'border-blue-500/30 text-blue-500/30'
          }`}>
            {isPaid ? 'Settled' : 'Active'}
          </div>
        </div>

        {/* Circular Progress Section */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-40 h-40">
            {/* Background Circle */}
            <svg className="w-full h-full -rotate-90">
              <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100 dark:text-gray-800" />
              <circle 
                cx="80" 
                cy="80" 
                r="70" 
                stroke="currentColor" 
                strokeWidth="10" 
                fill="transparent" 
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * status.percentagePaid) / 100}
                strokeLinecap="round"
                className="text-blue-500 transition-all duration-1000 ease-out" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-gray-900 dark:text-white">{Math.round(status.percentagePaid)}%</span>
              <span className="text-[10px] uppercase font-bold text-gray-500">Principal Paid</span>
            </div>
          </div>
        </div>

        {/* Financial Details Ledger */}
        <div className="space-y-4 pt-4 border-t border-dashed border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Original Principal</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{currency}{loan.loanAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Interest Rate (Fixed)</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">{loan.interestRate}% P.A.</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500 font-medium">Monthly Installment</span>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{currency}{loan.emi.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <span className="text-xs font-bold text-gray-900 dark:text-white">Outstanding Balance</span>
            <span className="text-lg font-black text-gray-900 dark:text-white">{currency}{status.currentBalance.toLocaleString()}</span>
          </div>
        </div>
        
        {/* Verification Footer */}
        <div className="flex items-center justify-center gap-2 opacity-40">
          <ShieldCheck size={14} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Verified Statement</span>
        </div>
      </div>
    </div>
  );
};

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

  const monthsSaved = useMemo(() => {
     if (!originalLoanSummary || !newLoanSummary) return 0;
     return originalLoanSummary.amortizationSchedule.length - newLoanSummary.amortizationSchedule.length;
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
      className="space-y-8"
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
          <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Debt Center</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">
            Manage installments and simulate pre-payment strategies.
          </p>
        </div>
        <motion.button 
          onClick={onAddLoan}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5"/>
          <span className="font-bold">Add New Loan</span>
        </motion.button>
      </motion.div>

      {loans.length === 0 ? (
        <motion.div 
          className="text-center py-20 bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800"
          variants={fadeInVariants}
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Landmark className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No active loans found</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium">
            Track your mortgages, car loans, or personal debt to visualize your journey to financial freedom.
          </p>
          <button 
            onClick={onAddLoan}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
          >
            Get Started
          </button>
        </motion.div>
      ) : (
        <>
          {/* Active Selection Cards */}
          <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
            {loans.map(loan => {
              const loanStatus = calculateCurrentBalance(loan, transactions);
              const isActive = selectedLoan?.id === loan.id;
              return (
                <motion.div 
                  key={loan.id} 
                  className={`flex-shrink-0 w-64 p-5 bg-white dark:bg-[#242424] rounded-2xl border-2 transition-all cursor-pointer ${
                    isActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/5 shadow-lg' : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700'
                  }`}
                  onClick={() => setSelectedLoan(loan)}
                  whileHover={{ y: -4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-blue-500'}`}>
                      {getLoanIcon(loan.type)}
                    </div>
                    <div className="truncate">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{loan.name}</h3>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{loan.type || 'Personal'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
                      <span>Progress</span>
                      <span>{Math.round(loanStatus.percentagePaid)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                        style={{ width: `${loanStatus.percentagePaid}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {selectedLoan && selectedLoanStatus && originalLoanSummary && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Side: The Dossier */}
              <div className="lg:col-span-4 sticky top-6">
                <LoanDossier 
                  loan={selectedLoan} 
                  status={selectedLoanStatus} 
                  currency={currency} 
                />
                
                {/* Secondary Actions */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => onEditLoan(selectedLoan)}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-all group"
                    >
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <FileText size={20} className="text-gray-600 dark:text-gray-300" />
                        </div>
                        <span className="font-bold text-xs text-gray-900 dark:text-gray-200">Edit Details</span>
                    </button>
                    <button 
                        onClick={() => onDeleteLoan(selectedLoan.id)}
                        className="flex flex-col items-center justify-center p-4 bg-white dark:bg-[#242424] border border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/10 transition-all group"
                    >
                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full mb-2 group-hover:scale-110 transition-transform">
                            <Trash2 size={20} className="text-red-500" />
                        </div>
                        <span className="font-bold text-xs text-red-500">Delete Loan</span>
                    </button>
                </div>
              </div>

              {/* Right Side: Analytics & Simulator */}
              <div className="lg:col-span-8 space-y-8">
                
                {/* Interactive Payoff Mountain */}
                <PayoffChart 
                  originalLoanSummary={originalLoanSummary}
                  newLoanSummary={newLoanSummary}
                  currency={currency}
                  currentMonthProgress={selectedLoanStatus.paymentsMade}
                />

                {/* Strategy Simulator Control Panel */}
                <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-2xl p-8 overflow-hidden relative">
                  {/* Glowing Savings Badge */}
                  {(interestSaved > 0 || monthsSaved > 0) && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-8 right-8 px-4 py-2 bg-green-500 text-white rounded-full shadow-lg shadow-green-500/40 z-10 flex items-center gap-2"
                    >
                      <Zap size={16} className="fill-current" />
                      <div className="flex flex-col leading-none">
                        <span className="text-[10px] font-black uppercase">Savings unlocked</span>
                        <span className="text-sm font-bold">
                          {currency}{interestSaved.toLocaleString(undefined, {maximumFractionDigits: 0})} & {monthsSaved} months
                        </span>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center space-x-3 mb-8">
                    <div className="bg-blue-600 rounded-xl p-2.5">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 dark:text-white">Strategy Control Panel</h4>
                      <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">
                        Optimize your repayment flow to destroy debt faster.
                      </p>
                    </div>
                  </div>
                  
                  <Tabs tabs={strategyTabs} selectedTab={activeStrategyTab} onSelectTab={setActiveStrategyTab} />
                  
                  <div className="mt-8">
                    <AnimatePresence mode="wait">
                      {activeStrategyTab === 'extraEMI' && (
                        <motion.div key="extra" variants={fadeInVariants} initial="initial" animate="animate" exit="exit" className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                           <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <h5 className="font-bold text-gray-900 dark:text-white mb-1">Pay 1 Extra EMI Annually</h5>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Make one additional full payment every year to slash your interest cost.</p>
                              </div>
                              <div 
                                onClick={() => setExtraEmiPerYear(!extraEmiPerYear)}
                                className={`w-14 h-8 rounded-full transition-all cursor-pointer relative ${extraEmiPerYear ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                              >
                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${extraEmiPerYear ? 'left-7' : 'left-1'}`} />
                              </div>
                           </div>
                        </motion.div>
                      )}
                      
                      {activeStrategyTab === 'increaseEMI' && (
                        <motion.div key="increase" variants={fadeInVariants} initial="initial" animate="animate" exit="exit" className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                           <div className="flex justify-between items-center mb-6">
                             <h5 className="font-bold text-gray-900 dark:text-white">Annual Step-Up: <span className="text-blue-500">{annualEmiIncrease}%</span></h5>
                             <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-black rounded-full">RECOMMENDED</div>
                           </div>
                           <input 
                              type="range" value={annualEmiIncrease} onChange={(e) => setAnnualEmiIncrease(parseFloat(e.target.value))} 
                              className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"
                              min="0" max="30" step="1"
                           />
                           <p className="text-[10px] text-gray-400 font-bold uppercase text-center mt-2">Increase your EMI as your salary grows</p>
                        </motion.div>
                      )}
                      
                      {activeStrategyTab === 'lumpSum' && (
                        <motion.div key="lump" variants={fadeInVariants} initial="initial" animate="animate" exit="exit" className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Lump Sum Amount</label>
                              <div className="relative">
                                 <span className="absolute left-3 top-2.5 text-gray-400 text-sm">{currency}</span>
                                 <input 
                                    type="number" value={lumpSumAmount} onChange={(e) => setLumpSumAmount(parseFloat(e.target.value) || 0)} 
                                    className="w-full pl-8 p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0"
                                 />
                              </div>
                            </div>
                            <div>
                              <label className="block text-[10px] font-black uppercase text-gray-500 mb-2">Payment Month</label>
                              <select 
                                value={lumpSumTiming} onChange={(e) => setLumpSumTiming(parseInt(e.target.value))}
                                className="w-full p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm outline-none"
                              >
                                 <option value="6">Month 6</option>
                                 <option value="12">Year 1</option>
                                 <option value="24">Year 2</option>
                                 <option value="36">Year 3</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {activeStrategyTab === 'preClosure' && (
                        <motion.div key="pre" variants={fadeInVariants} initial="initial" animate="animate" exit="exit" className="bg-gray-50 dark:bg-gray-900/40 border border-gray-100 dark:border-gray-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4 p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                                <Info size={16} className="text-blue-500" />
                                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 leading-tight uppercase">Use this to find the exact payoff amount if you want to close the loan today.</p>
                            </div>
                            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-3">Close after EMI #{preClosureMonth}</label>
                            <input 
                              type="range" value={preClosureMonth} onChange={(e) => setPreClosureMonth(parseInt(e.target.value))} 
                              className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                              min={selectedLoanStatus.paymentsMade + 1} max={selectedLoanStatus.totalPayments}
                            />
                            {preClosureCalculation && (
                              <div className="mt-6 flex justify-between items-end">
                                <div>
                                   <p className="text-[10px] text-gray-500 font-black uppercase">Payoff Amount</p>
                                   <p className="text-2xl font-black text-gray-900 dark:text-white">{currency}{preClosureCalculation.payoffAmount.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[10px] text-green-500 font-black uppercase">Interest Saved</p>
                                   <p className="text-lg font-black text-green-500">{currency}{preClosureCalculation.interestSaved.toLocaleString()}</p>
                                </div>
                              </div>
                            )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Strategy Summary Table (Integrated) */}
                <StrategySummaryTable 
                   selectedLoan={selectedLoan} currency={currency} extraEmiPerYear={extraEmiPerYear}
                   annualEmiIncrease={annualEmiIncrease} lumpSumAmount={lumpSumAmount} lumpSumTiming={lumpSumTiming}
                />
                
                {/* Payment Schedule (Enhanced Accordion) */}
                <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    Amortization Ledger
                  </h4>
                  <div className="space-y-3">
                    {Object.entries(amortizationByYear).map(([year, entries]) => (
                      <div key={year} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                        <button
                          onClick={() => toggleYearExpansion(parseInt(year))}
                          className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800/30 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-900 dark:text-white">Year {year}</span>
                            <span className="text-[10px] font-black uppercase text-gray-400">{entries.filter(e => e.isPaid).length}/{entries.length} Paid</span>
                          </div>
                          {expandedYears.has(parseInt(year)) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        
                        <AnimatePresence>
                          {expandedYears.has(parseInt(year)) && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {entries.map((entry) => (
                                  <div key={entry.month} className={`flex items-center justify-between p-3 rounded-xl border ${entry.isPaid ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800'}`}>
                                    <div className="flex items-center gap-3">
                                      <div className={`p-1 rounded-full ${entry.isPaid ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'}`}>
                                        <CheckCircle size={14} />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white">EMI #{entry.month}</p>
                                        <p className="text-[10px] text-gray-500">P: {currency}{Math.round(entry.principal)} | I: {currency}{Math.round(entry.interest)}</p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-bold text-gray-900 dark:text-white">{currency}{Math.round(entry.totalPayment)}</p>
                                      {entry.isPaid && entry.paymentDate && <p className="text-[8px] font-black uppercase text-green-600">{entry.paymentDate}</p>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </motion.div>
  );
};

export default LoansPage;