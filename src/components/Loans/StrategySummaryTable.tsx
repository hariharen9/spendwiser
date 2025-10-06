
import React, { useMemo } from 'react';
import { Loan } from '../../types/types';
import { calculateLoanSummary, applyPrepaymentStrategy } from '../../lib/loanCalculations';

interface StrategySummaryTableProps {
  selectedLoan: Loan;
  currency: string;
  extraEmiPerYear: boolean;
  annualEmiIncrease: number;
  lumpSumAmount: number;
  lumpSumTiming: number;
}

const StrategySummaryTable: React.FC<StrategySummaryTableProps> = ({ 
  selectedLoan, 
  currency, 
  extraEmiPerYear, 
  annualEmiIncrease, 
  lumpSumAmount, 
  lumpSumTiming 
}) => {

  const originalLoanSummary = useMemo(() => calculateLoanSummary(selectedLoan), [selectedLoan]);

  const getTimeSaved = (newEndDate: Date) => {
    const baselineDate = new Date(originalLoanSummary.loanEndDate);
    const strategyDate = new Date(newEndDate);
    let years = baselineDate.getFullYear() - strategyDate.getFullYear();
    let months = baselineDate.getMonth() - strategyDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return { years, months };
  };

  const strategies = useMemo(() => {
    const extraEmiOnly = applyPrepaymentStrategy(selectedLoan, true, 0, 0, 0);
    const increaseEmiOnly = applyPrepaymentStrategy(selectedLoan, false, 5, 0, 0); // 5% increase as default
    const lumpSumOnly = applyPrepaymentStrategy(selectedLoan, false, 0, selectedLoan.loanAmount * 0.1, 12); // 10% lump sum at 1 year
    const combined = applyPrepaymentStrategy(selectedLoan, extraEmiPerYear, annualEmiIncrease, lumpSumAmount, lumpSumTiming);

    return [
      { name: 'Extra EMI Only', summary: extraEmiOnly },
      { name: '5% EMI Increase Only', summary: increaseEmiOnly },
      { name: '10% Lump Sum Only', summary: lumpSumOnly },
      { name: 'Your Combined Plan', summary: combined, isCombined: true },
    ];
  }, [selectedLoan, extraEmiPerYear, annualEmiIncrease, lumpSumAmount, lumpSumTiming]);

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg shadow p-6 mt-6">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">'What-If' Strategy Summary</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Strategy</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interest Saved</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Saved</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#242424] divide-y divide-gray-200 dark:divide-gray-700">
            {strategies.map(strategy => {
              const interestSaved = originalLoanSummary.totalInterestPaid - strategy.summary.totalInterestPaid;
              const { years, months } = getTimeSaved(strategy.summary.loanEndDate);
              return (
                <tr key={strategy.name} className={strategy.isCombined ? 'bg-blue-50 dark:bg-blue-900/20' : ''}>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${strategy.isCombined ? 'text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-white'}`}>{strategy.name}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${strategy.isCombined ? 'text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-white'}`}>{currency}{interestSaved.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm ${strategy.isCombined ? 'text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-white'}`}>
                    {`${years} yr, ${months} mo`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StrategySummaryTable;
