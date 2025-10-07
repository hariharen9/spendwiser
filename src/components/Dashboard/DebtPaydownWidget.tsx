import React from 'react';
import { Loan } from '../../types/types';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../Common/AnimationVariants';
import { Landmark } from 'lucide-react';

interface DebtPaydownWidgetProps {
  loans: Loan[];
  currency: string;
}

const DebtPaydownWidget: React.FC<DebtPaydownWidgetProps> = ({ loans, currency }) => {
  const activeLoans = loans.slice(0, 3);

  // Calculate remaining balance based on loan tenure and EMIs paid
  const calculateRemainingBalance = (loan: Loan) => {
    // Calculate total months for the loan
    const totalMonths = loan.tenureInMonths ? loan.tenureInMonths : loan.tenure * 12;
    
    // Calculate start date in months
    const startDate = new Date(loan.startDate);
    const currentDate = new Date();
    
    // Calculate months elapsed since loan start
    let monthsElapsed = (currentDate.getFullYear() - startDate.getFullYear()) * 12;
    monthsElapsed += currentDate.getMonth() - startDate.getMonth();
    
    // If the loan hasn't started yet, show full balance
    if (monthsElapsed < 0) {
      return loan.loanAmount;
    }
    
    // Calculate total EMIs that should have been paid
    const emisPaid = Math.min(monthsElapsed, totalMonths);
    const amountPaid = emisPaid * loan.emi;
    
    // Calculate remaining balance (ensure it doesn't go below 0)
    const remainingBalance = Math.max(0, loan.loanAmount - amountPaid);
    
    return remainingBalance;
  };

  // Calculate progress percentage with bounds checking
  const calculateProgress = (loan: Loan) => {
    const remainingBalance = calculateRemainingBalance(loan);
    // Handle case where loanAmount is 0 to prevent division by zero
    if (loan.loanAmount === 0) return 100;
    
    const progress = ((loan.loanAmount - remainingBalance) / loan.loanAmount) * 100;
    // Ensure progress is between 0 and 100
    return Math.min(100, Math.max(0, progress));
  };

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-full overflow-hidden"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4 flex items-center"><Landmark className="w-5 h-5 mr-2" />Debt Paydown</h3>
      {activeLoans.length > 0 ? (
        <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2">
          {activeLoans.map((loan, index) => {
            const remainingBalance = calculateRemainingBalance(loan);
            const progress = calculateProgress(loan);

            return (
              <motion.div 
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="overflow-hidden"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate max-w-[120px]">{loan.name}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white whitespace-nowrap">
                    {currency}{Math.round(remainingBalance).toLocaleString()} / {currency}{loan.loanAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                  <motion.div
                    className="bg-orange-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                  />
                </div>
                <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">~{progress.toFixed(1)}% Paid Off</p>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6">
          <Landmark className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-[#888888] mb-2">No active loans</p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Your loans will appear here.</p>
        </div>
      )}
    </motion.div>
  );
};

export default DebtPaydownWidget;