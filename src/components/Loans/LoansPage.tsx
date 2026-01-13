import React, { useState, useMemo, useEffect } from 'react';
import { Loan, Transaction } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInVariants, modalVariants } from '../../components/Common/AnimationVariants';
import { 
  Plus, Landmark, Home, Car, User, GraduationCap, CheckCircle, Clock, 
  ChevronDown, ChevronUp, TrendingDown, Calendar, DollarSign, Target,
  Edit, Trash2, PieChart as PieChartIcon, ArrowRight, Wallet
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
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend 
} from 'recharts';
import ConfirmationDialog from '../BillSplitting/ConfirmationDialog';

interface LoansPageProps {
  loans: Loan[];
  transactions: Transaction[];
  onAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  onMarkEmiPaid: (loan: Loan) => void;
  currency: string;
}

// --- Helper Components ---

const LoanTypeIcon: React.FC<{ type?: string, className?: string }> = ({ type, className = "w-6 h-6" }) => {
  switch (type) {
    case 'home': return <Home className={className} />;
    case 'auto': return <Car className={className} />;
    case 'personal': return <User className={className} />;
    case 'student': return <GraduationCap className={className} />;
    default: return <Landmark className={className} />;
  }
};

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const LoanProgressRing: React.FC<{ percentage: number; size?: number; strokeWidth?: number; color?: string }> = ({ 
  percentage, size = 60, strokeWidth = 6, color = "text-blue-500" 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`${color} transition-all duration-1000 ease-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-xs font-bold text-gray-700 dark:text-gray-300">{Math.round(percentage)}%</span>
    </div>
  );
};

// --- Main Page Component ---

const LoansPage: React.FC<LoansPageProps> = ({ 
  loans, 
  transactions, 
  onAddLoan, 
  onEditLoan, 
  onDeleteLoan, 
  onMarkEmiPaid, 
  currency 
}) => {
  const [selectedLoanId, setSelectedLoanId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Strategy State
  const [extraEmiPerYear, setExtraEmiPerYear] = useState(false);
  const [annualEmiIncrease, setAnnualEmiIncrease] = useState(0);
  const [lumpSumAmount, setLumpSumAmount] = useState(0);
  const [lumpSumTiming, setLumpSumTiming] = useState(12);
  const [activeStrategyTab, setActiveStrategyTab] = useState('extraEMI');
  const [preClosureMonth, setPreClosureMonth] = useState(12);
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  // Auto-select first loan
  useEffect(() => {
    if (loans.length > 0 && !selectedLoanId) {
      setSelectedLoanId(loans[0].id);
    } else if (loans.length === 0) {
      setSelectedLoanId(null);
    } else if (selectedLoanId && !loans.find(l => l.id === selectedLoanId)) {
       setSelectedLoanId(loans[0].id);
    }
  }, [loans, selectedLoanId]);

  const selectedLoan = useMemo(() => loans.find(l => l.id === selectedLoanId) || null, [loans, selectedLoanId]);

  // Calculations
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

  const strategyTabs = [
    { id: 'extraEMI', label: 'Extra EMI' },
    { id: 'increaseEMI', label: 'Step Up' },
    { id: 'lumpSum', label: 'Lump Sum' },
    { id: 'preClosure', label: 'Pre-Closure' },
  ];

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
    if (newExpanded.has(year)) newExpanded.delete(year);
    else newExpanded.add(year);
    setExpandedYears(newExpanded);
  };

  const pieData = useMemo(() => {
      if(!selectedLoanStatus || !originalLoanSummary) return [];
      const paidPrincipal = originalLoanSummary.totalPrincipal - selectedLoanStatus.currentBalance;
      // Simplification for chart:
      return [
          { name: 'Paid Principal', value: paidPrincipal > 0 ? paidPrincipal : 0, color: '#10b981' },
          { name: 'Outstanding', value: selectedLoanStatus.currentBalance, color: '#ef4444' },
      ];
  }, [selectedLoanStatus, originalLoanSummary]);

  // --- Render Empty State ---
  if (loans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="p-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30">
          <Landmark className="w-16 h-16 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Start Your Debt-Free Journey</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md">
            Add your loans to track payments, visualize progress, and simulate payoff strategies.
          </p>
        </div>
        <button
          onClick={onAddLoan}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add First Loan
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 relative">
      
      {/* Page Background Accent */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10 dark:to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Loan Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage liabilities and optimize your repayment path.</p>
        </div>
        <button 
           onClick={onAddLoan}
           className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
        >
           <Plus className="w-4 h-4" />
           <span>New Loan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar: Loan List / Selection */}
        <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-1">Your Portfolio</h3>
            <div className="flex overflow-x-auto snap-x snap-mandatory lg:flex-col lg:overflow-visible space-x-4 lg:space-x-0 lg:space-y-3 pb-6 lg:pb-0 no-scrollbar">
                {loans.map(loan => {
                    const status = calculateCurrentBalance(loan, transactions);
                    const isSelected = selectedLoanId === loan.id;
                    return (
                        <motion.div 
                            key={loan.id}
                            layoutId={loan.id}
                            onClick={() => setSelectedLoanId(loan.id)}
                            className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 border flex-shrink-0 w-[85vw] sm:w-[60vw] lg:w-full snap-center ${
                                isSelected 
                                ? 'bg-white dark:bg-gray-800 border-blue-500/50 ring-2 ring-blue-500/20 shadow-lg' 
                                : 'bg-white/40 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-700/50 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${isSelected ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                                        <LoanTypeIcon type={loan.type} className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className={`font-semibold ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>{loan.name}</h4>
                                        <p className="text-xs text-gray-500">{loan.interestRate}% APR</p>
                                    </div>
                                </div>
                                <LoanProgressRing percentage={status.percentagePaid} size={40} strokeWidth={4} color={isSelected ? 'text-blue-500' : 'text-gray-400'} />
                            </div>
                            <div className="flex justify-between items-end mt-2">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Outstanding</p>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{currency}{status.currentBalance.toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                     <p className="text-[10px] text-gray-500 uppercase tracking-wide">EMI</p>
                                     <p className="text-sm font-medium text-gray-900 dark:text-white">{currency}{loan.emi.toLocaleString()}</p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Total Debt Summary (Mini) */}
            <div className="mt-8 p-5 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-black dark:to-gray-900 rounded-2xl text-white shadow-xl">
                 <div className="flex items-center space-x-2 mb-4 opacity-80">
                     <Wallet className="w-5 h-5" />
                     <span className="text-sm font-medium tracking-wide">TOTAL DEBT LOAD</span>
                 </div>
                 <div className="text-3xl font-bold mb-1">
                     {currency}{loans.reduce((acc, loan) => acc + calculateCurrentBalance(loan, transactions).currentBalance, 0).toLocaleString()}
                 </div>
                 <p className="text-sm opacity-60">Across {loans.length} active loans</p>
            </div>
        </div>

        {/* Right Content: Details & Simulator */}
        <div className="lg:col-span-8 space-y-6">
            <AnimatePresence mode="wait">
                {selectedLoan && selectedLoanStatus && (
                    <motion.div 
                        key={selectedLoan.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Main Status Card */}
                        <GlassCard className="p-6 md:p-8 relative overflow-hidden group">
                             {/* Decorative blurred blobs */}
                             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-500"></div>
                             
                             <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 mb-8 gap-4">
                                 <div className="flex-1">
                                     <div className="flex items-center justify-between md:justify-start gap-4">
                                         <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                                             {selectedLoan.name}
                                         </h2>
                                         <div className="flex items-center space-x-2">
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); onEditLoan(selectedLoan); }} 
                                                className="p-2.5 md:p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-all border border-blue-100/50 dark:border-blue-800/50 shadow-sm"
                                                title="Edit Loan"
                                             >
                                                 <Edit className="w-5 h-5 md:w-4 md:h-4"/>
                                             </button>
                                             <button 
                                                onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }} 
                                                className="p-2.5 md:p-2 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-all border border-red-100/50 dark:border-red-800/50 shadow-sm"
                                                title="Delete Loan"
                                             >
                                                 <Trash2 className="w-5 h-5 md:w-4 md:h-4"/>
                                             </button>
                                         </div>
                                     </div>
                                     <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 flex items-center gap-2">
                                         <span className="font-semibold text-gray-700 dark:text-gray-300">{currency}{selectedLoan.loanAmount.toLocaleString()}</span>
                                         <span className="opacity-30">•</span>
                                         <span>
                                             {originalLoanSummary?.amortizationSchedule.length} Months 
                                             {originalLoanSummary?.amortizationSchedule.length && originalLoanSummary.amortizationSchedule.length >= 12 && (
                                                 <span className="ml-1 opacity-70">
                                                     ({(originalLoanSummary.amortizationSchedule.length / 12).toFixed(1).replace(/\.0$/, '')} Years)
                                                 </span>
                                             )}
                                         </span>
                                         <span className="opacity-30 md:inline hidden">•</span>
                                         <span className="md:inline hidden">Started {new Date(selectedLoan.startDate).toLocaleDateString()}</span>
                                     </p>
                                 </div>
                                 <div className="mt-4 md:mt-0 flex gap-3">
                                     {!selectedLoanStatus.isFullyPaid && selectedLoanStatus.nextPaymentDue && (
                                         <button 
                                            onClick={() => onMarkEmiPaid(selectedLoan)}
                                            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2"
                                         >
                                             <CheckCircle className="w-4 h-4" />
                                             <span>Pay EMI #{selectedLoanStatus.nextPaymentDue}</span>
                                         </button>
                                     )}
                                     {selectedLoanStatus.isFullyPaid && (
                                         <div className="px-5 py-2.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg font-medium flex items-center space-x-2">
                                             <CheckCircle className="w-4 h-4" />
                                             <span>Paid Off</span>
                                         </div>
                                     )}
                                 </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                 <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Total Outstanding</p>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{currency}{selectedLoanStatus.currentBalance.toLocaleString()}</p>
                                 </div>
                                 <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Interest Rate</p>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedLoan.interestRate}%</p>
                                 </div>
                                 <div className="p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                     <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Monthly EMI</p>
                                     <p className="text-2xl font-bold text-gray-900 dark:text-white">{currency}{selectedLoan.emi.toLocaleString()}</p>
                                 </div>
                             </div>

                             {/* Breakdown Chart embedded in card */}
                             <div className="flex items-center space-x-6 p-4 bg-gray-50/80 dark:bg-gray-800/50 rounded-xl">
                                  <div className="w-16 h-16 flex-shrink-0">
                                      <ResponsiveContainer width="100%" height="100%">
                                          <PieChart>
                                              <Pie data={pieData} innerRadius={20} outerRadius={30} paddingAngle={2} dataKey="value">
                                                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                              </Pie>
                                          </PieChart>
                                      </ResponsiveContainer>
                                  </div>
                                  <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                          <div className="flex items-center space-x-2 mb-1">
                                              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                              <span className="text-gray-500 dark:text-gray-400">Paid Principal</span>
                                          </div>
                                          <p className="font-semibold text-gray-900 dark:text-white pl-4">{currency}{pieData[0].value.toLocaleString(undefined, { maximumFractionDigits:0 })}</p>
                                      </div>
                                      <div>
                                          <div className="flex items-center space-x-2 mb-1">
                                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                              <span className="text-gray-500 dark:text-gray-400">Remaining</span>
                                          </div>
                                          <p className="font-semibold text-gray-900 dark:text-white pl-4">{currency}{pieData[1].value.toLocaleString(undefined, { maximumFractionDigits:0 })}</p>
                                      </div>
                                  </div>
                             </div>
                        </GlassCard>

                        {/* Interactive Tools Grid */}
                        <div className="grid grid-cols-1 gap-6">
                            {/* Strategy Simulator */}
                            <GlassCard className="p-6">
                                <div className="flex items-center space-x-3 mb-6">
                                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                        <TrendingDown className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payoff Accelerator</h3>
                                </div>
                                
                                <Tabs tabs={strategyTabs} selectedTab={activeStrategyTab} onSelectTab={setActiveStrategyTab} />

                                <div className="mt-6 p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50">
                                    {activeStrategyTab === 'extraEMI' && (
                                        <div className="flex items-center justify-between">
                                            <label className="text-gray-700 dark:text-gray-300 font-medium">Pay 1 Extra EMI / Year</label>
                                            <input 
                                                type="checkbox" 
                                                checked={extraEmiPerYear} 
                                                onChange={e => setExtraEmiPerYear(e.target.checked)}
                                                className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500" 
                                            />
                                        </div>
                                    )}
                                    {activeStrategyTab === 'increaseEMI' && (
                                        <div className="space-y-4">
                                            <div className="flex justify-between text-sm font-medium">
                                                <span className="text-gray-700 dark:text-gray-300">Annual Increase</span>
                                                <span className="text-blue-600">{annualEmiIncrease}%</span>
                                            </div>
                                            <input type="range" min="0" max="25" step="1" value={annualEmiIncrease} onChange={e => setAnnualEmiIncrease(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500" />
                                        </div>
                                    )}
                                    {activeStrategyTab === 'lumpSum' && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</label>
                                                <div className="relative mt-1">
                                                    <span className="absolute left-3 top-2 text-gray-400 dark:text-gray-500">{currency}</span>
                                                    <input 
                                                        type="number" 
                                                        value={lumpSumAmount} 
                                                        onChange={e => setLumpSumAmount(Number(e.target.value))} 
                                                        className="w-full pl-8 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50" 
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Timing (Months)</label>
                                                <input 
                                                    type="number" 
                                                    value={lumpSumTiming} 
                                                    onChange={e => setLumpSumTiming(Number(e.target.value))} 
                                                    className="w-full mt-1 py-2 px-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500/50" 
                                                    placeholder="12"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {activeStrategyTab === 'preClosure' && (
                                        <div className="space-y-4">
                                             <div className="flex justify-between text-sm font-medium">
                                                <span className="text-gray-700 dark:text-gray-300">Close After Month</span>
                                                <span className="text-blue-600">{preClosureMonth}</span>
                                            </div>
                                            <input type="range" min={selectedLoanStatus.paymentsMade + 1} max={selectedLoanStatus.totalPayments} value={preClosureMonth} onChange={e => setPreClosureMonth(Number(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500" />
                                            {preClosureCalculation && (
                                                <div className="text-sm text-center text-gray-600 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                                                    Pay <strong>{currency}{preClosureCalculation.payoffAmount.toLocaleString()}</strong> to save <strong>{currency}{preClosureCalculation.interestSaved.toLocaleString()}</strong> in interest.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {newLoanSummary && (
                                    <div className="mt-6 flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                                        <div>
                                            <p className="text-xs text-green-700 dark:text-green-300 uppercase font-bold">Projected Saving</p>
                                            <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                                {currency}{(originalLoanSummary?.totalInterestPaid - newLoanSummary.totalInterestPaid).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                             <p className="text-xs text-green-700 dark:text-green-300 uppercase font-bold">Time Saved</p>
                                             <p className="text-lg font-bold text-green-800 dark:text-green-200">
                                                 {Math.max(0, originalLoanSummary?.amortizationSchedule.length - newLoanSummary.amortizationSchedule.length)} Months
                                             </p>
                                        </div>
                                    </div>
                                )}
                            </GlassCard>
                        </div>

                        {/* Amortization Schedule (Full Width) */}
                        <GlassCard className="p-6 lg:col-span-12">
                            <div className="flex items-center space-x-3 mb-6">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Payment Schedule</h3>
                            </div>
                            <div className="space-y-3">
                                {Object.entries(amortizationByYear).map(([year, entries]) => (
                                    <div key={year} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                        <button 
                                            onClick={() => toggleYearExpansion(parseInt(year))}
                                            className="w-full flex items-center justify-between p-4 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <span className="font-semibold text-gray-800 dark:text-white">Year {year}</span>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs text-gray-500 font-medium">{entries.filter(e => e.isPaid).length}/{entries.length} Paid</span>
                                                {expandedYears.has(parseInt(year)) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                            </div>
                                        </button>
                                        <AnimatePresence>
                                            {expandedYears.has(parseInt(year)) && (
                                                <motion.div 
                                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} 
                                                    className="overflow-hidden bg-white dark:bg-gray-900"
                                                >
                                                    <div className="p-3 grid gap-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                                        {entries.map(entry => (
                                                            <div key={entry.month} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 text-sm hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                                <div className="flex items-center space-x-3">
                                                                    {entry.isPaid ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Clock className="w-4 h-4 text-gray-300" />}
                                                                    <span className="font-medium text-gray-700 dark:text-gray-300">Month {entry.month}</span>
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className="block font-bold text-gray-900 dark:text-white">{currency}{entry.totalPayment.toLocaleString()}</span>
                                                                    <span className="text-[10px] text-gray-400">P: {Math.round(entry.principal)} • I: {Math.round(entry.interest)}</span>
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
                        </GlassCard>
                        <ConfirmationDialog 
                            isOpen={showDeleteConfirm}
                            onClose={() => setShowDeleteConfirm(false)}
                            onConfirm={() => {
                                if(selectedLoanId) onDeleteLoan(selectedLoanId);
                                setShowDeleteConfirm(false);
                            }}
                            title="Delete Loan?"
                            message="Are you sure you want to delete this loan account? This action cannot be undone."
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LoansPage;