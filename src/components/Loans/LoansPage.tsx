import React, { useState, useMemo } from 'react';
import { Loan } from '../../types/types';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInVariants } from '../../components/Common/AnimationVariants';
import { Plus, Landmark, ChevronsRight, ChevronsDown } from 'lucide-react';
import { calculateLoanSummary, applyPrepaymentStrategy } from '../../lib/loanCalculations';

interface LoansPageProps {
  loans: Loan[];
  onAddLoan: () => void;
  onEditLoan: (loan: Loan) => void;
  onDeleteLoan: (id: string) => void;
  currency: string;
}

const LoansPage: React.FC<LoansPageProps> = ({ loans, onAddLoan, onEditLoan, onDeleteLoan, currency }) => {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [extraEmiPerYear, setExtraEmiPerYear] = useState(false);
  const [annualEmiIncrease, setAnnualEmiIncrease] = useState(0);

  const originalLoanSummary = useMemo(() => {
    if (!selectedLoan) return null;
    return calculateLoanSummary(selectedLoan);
  }, [selectedLoan]);

  const newLoanSummary = useMemo(() => {
    if (!selectedLoan) return null;
    return applyPrepaymentStrategy(selectedLoan, extraEmiPerYear, annualEmiIncrease);
  }, [selectedLoan, extraEmiPerYear, annualEmiIncrease]);

  const interestSaved = useMemo(() => {
    if (!originalLoanSummary || !newLoanSummary) return 0;
    return originalLoanSummary.totalInterestPaid - newLoanSummary.totalInterestPaid;
  }, [originalLoanSummary, newLoanSummary]);

  return (
    <motion.div 
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={fadeInVariants}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">Your Loans</h2>
        <motion.button 
          onClick={onAddLoan}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-5 w-5"/>
          <span>New Loan</span>
        </motion.button>
      </motion.div>

      {loans.length === 0 ? (
        <motion.div 
          className="text-center py-12 bg-white dark:bg-[#242424] rounded-lg"
          variants={fadeInVariants}
        >
          <Landmark className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No loans yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new loan.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loans.map(loan => (
            <motion.div 
              key={loan.id} 
              className={`bg-white dark:bg-[#242424] rounded-lg shadow p-6 space-y-4 cursor-pointer ${selectedLoan?.id === loan.id ? 'ring-2 ring-blue-500' : ''}`}
              variants={fadeInVariants}
              onClick={() => setSelectedLoan(loan)}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{loan.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                  <span>Loan Amount</span>
                  <span>{currency}{loan.loanAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                  <span>Interest Rate</span>
                  <span>{loan.interestRate}%</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                  <span>Tenure</span>
                  <span>{loan.tenure} years</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white">
                  <span>EMI</span>
                  <span>{currency}{loan.emi.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <button onClick={(e) => { e.stopPropagation(); onEditLoan(loan); }} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-lg text-sm">Edit</button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteLoan(loan.id); }} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {selectedLoan && originalLoanSummary && newLoanSummary && (
        <motion.div className="space-y-6" variants={fadeInVariants}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Loan Details: {selectedLoan.name}</h3>
          
          {/* Strategy Simulator */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg shadow p-6 space-y-6 border border-blue-200 dark:border-blue-800/40">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500 rounded-lg p-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 dark:text-white">Strategy Simulator</h4>
                <p className="text-gray-700 dark:text-gray-300 text-xs mt-1">
                  Experiment with different repayment strategies to see how much you can save in interest and time.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-2">
              <div className="bg-white dark:bg-[#242424] rounded-lg p-4 shadow border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:shadow-md flex flex-col justify-center">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center justify-center w-6 h-6">
                        <motion.div 
                          className="relative flex items-center justify-center w-6 h-6 cursor-pointer"
                          onClick={() => setExtraEmiPerYear(!extraEmiPerYear)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <motion.div 
                            className="absolute w-6 h-6 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
                            animate={{ 
                              backgroundColor: extraEmiPerYear ? '#3B82F6' : 'transparent',
                              borderColor: extraEmiPerYear ? '#3B82F6' : '#D1D5DB'
                            }}
                            transition={{ duration: 0.2 }}
                          />
                          <motion.svg 
                            className="absolute w-4 h-4 text-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            initial={false}
                            animate={{ pathLength: extraEmiPerYear ? 1 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <motion.path 
                              d="M5 13l4 4L19 7" 
                              initial={{ pathLength: 0 }}
                            />
                          </motion.svg>
                        </motion.div>
                      </div>
                      <label htmlFor="extra-emi" className="ml-2 block text-sm font-semibold text-gray-900 dark:text-white cursor-pointer">
                        Pay 1 Extra EMI Every Year
                      </label>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                      Make one additional EMI payment annually to significantly reduce your loan tenure.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#242424] rounded-lg p-4 shadow border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:shadow-md flex flex-col justify-center">
                <div className="flex items-start space-x-3">
                  <div className="mt-1 bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-full flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <label htmlFor="emi-increase" className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      Annual EMI Increase
                    </label>
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-900 dark:text-white">0%</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{annualEmiIncrease}%</span>
                        <span className="text-xs text-gray-900 dark:text-white">30%</span>
                      </div>
                      <input 
                        type="range" 
                        id="emi-increase" 
                        value={annualEmiIncrease} 
                        onChange={(e) => setAnnualEmiIncrease(parseFloat(e.target.value))} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                        min="0" 
                        max="30"
                        step="0.5"
                      />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
                      Gradually increase your EMI as your income grows to pay off the loan faster.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-start space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">Tip:</span> Combining both strategies can help you become debt-free years earlier while saving thousands in interest.
                </p>
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/10 rounded-lg shadow p-4 border border-blue-200 dark:border-blue-800/30">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-blue-500 rounded-md p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">Original Plan</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">End Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{originalLoanSummary.loanEndDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Total Interest:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{currency}{originalLoanSummary.totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="md:hidden w-full flex justify-center py-2">
                <ChevronsDown className="h-6 w-6 text-gray-400" />
              </div>
              <div className="hidden md:flex items-center justify-center h-full">
                <ChevronsRight className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/10 rounded-lg shadow p-4 border border-green-200 dark:border-green-800/30">
              <div className="flex items-center space-x-2 mb-3">
                <div className="bg-green-500 rounded-md p-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-gray-900 dark:text-white">New Plan</h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">End Date:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{newLoanSummary.loanEndDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">Total Interest:</span>
                  <span className="font-medium text-gray-900 dark:text-white text-sm">{currency}{newLoanSummary.totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="bg-green-50 dark:bg-green-900/10 rounded-lg shadow p-4 border border-green-200 dark:border-green-800/30">
            <div className="flex items-start space-x-2">
              <div className="bg-green-500 rounded-md p-1.5 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-green-800 dark:text-green-200 text-sm">Interest Saved: {currency}{interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  You will be debt-free <span className="font-medium">{Math.floor((originalLoanSummary.loanEndDate.getTime() - newLoanSummary.loanEndDate.getTime()) / (1000 * 3600 * 24 * 365.25))} years</span> and <span className="font-medium">{Math.floor(((originalLoanSummary.loanEndDate.getTime() - newLoanSummary.loanEndDate.getTime()) % (1000 * 3600 * 24 * 365.25)) / (1000 * 3600 * 24 * 30.44))} months</span> earlier!
                </p>
              </div>
            </div>
          </div>

          {/* Amortization Schedule */}
          <div className="bg-white dark:bg-[#242424] rounded-lg shadow p-6">
            <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Amortization Schedule</h4>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Principal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ending Balance</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#242424] divide-y divide-gray-200 dark:divide-gray-700">
                  {newLoanSummary.amortizationSchedule.map(entry => (
                    <tr key={entry.month}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{entry.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{currency}{entry.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{currency}{entry.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{currency}{entry.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{currency}{entry.endingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pro Tips */}
          <div className="bg-white dark:bg-[#242424] rounded-lg shadow p-6 space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Pro Tips</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-900 dark:text-white">
              <li>Even small extra payments toward principal make a BIG difference over time.</li>
              <li>Increasing EMI yearly is most effective if your salary/income goes up regularly.</li>
              <li>Combining strategies means you become debt-free fastest—plan for this if you expect regular hikes and lump sum windfalls.</li>
              <li>Check your loan statement for principal balance and EMI details.</li>
              <li>Plan for extra payments: Aim to make one extra EMI as a lump sum yearly. Time it with bonuses, incentives, or tax refunds.</li>
              <li>Set annual EMI increases: If your income rises, bump up the monthly EMI by 5-10% yearly. Notify your bank to adjust the standing instruction.</li>
              <li>Track progress annually: After each year, use an online loan calculator to check new tenure and total interest saved.</li>
            </ul>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default LoansPage;
