import React, { useState, useMemo } from 'react';
import { Loan } from '../../types/types';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInVariants } from '../../components/Common/AnimationVariants';
import { Plus, Landmark, ChevronsRight } from 'lucide-react';
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
          <div className="bg-white dark:bg-[#242424] rounded-lg shadow p-6 space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Strategy Simulator</h4>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input type="checkbox" id="extra-emi" checked={extraEmiPerYear} onChange={() => setExtraEmiPerYear(!extraEmiPerYear)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="extra-emi" className="ml-2 block text-sm text-gray-900 dark:text-white">Pay 1 Extra EMI Every Year</label>
              </div>
              <div className="flex items-center">
                <input type="number" id="emi-increase" value={annualEmiIncrease} onChange={(e) => setAnnualEmiIncrease(parseFloat(e.target.value) || 0)} className="w-20 px-2 py-1 text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:text-white" />
                <label htmlFor="emi-increase" className="ml-2 block text-sm text-gray-900 dark:text-white">% Annual EMI Increase</label>
              </div>
            </div>
          </div>

          {/* Loan Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-[#242424] rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Original Plan</h4>
              <p className="text-gray-900 dark:text-white">End Date: {originalLoanSummary.loanEndDate.toLocaleDateString()}</p>
              <p className="text-gray-900 dark:text-white">Total Interest: {currency}{originalLoanSummary.totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
            <div className="flex items-center justify-center">
              <ChevronsRight className="h-10 w-10 text-gray-400" />
            </div>
            <div className="bg-white dark:bg-[#242424] rounded-lg shadow p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">New Plan</h4>
              <p className="text-gray-900 dark:text-white">End Date: {newLoanSummary.loanEndDate.toLocaleDateString()}</p>
              <p className="text-gray-900 dark:text-white">Total Interest: {currency}{newLoanSummary.totalInterestPaid.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="bg-green-100 dark:bg-green-900 border-l-4 border-green-500 text-green-700 dark:text-green-200 p-4 rounded-lg">
            <p className="font-bold">Interest Saved: {currency}{interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p>You will be debt-free {Math.floor((originalLoanSummary.loanEndDate.getTime() - newLoanSummary.loanEndDate.getTime()) / (1000 * 3600 * 24 * 365.25))} years and {Math.floor(((originalLoanSummary.loanEndDate.getTime() - newLoanSummary.loanEndDate.getTime()) % (1000 * 3600 * 24 * 365.25)) / (1000 * 3600 * 24 * 30.44))} months earlier!</p>
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
