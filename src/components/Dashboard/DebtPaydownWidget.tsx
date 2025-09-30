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

  // A simple calculation for remaining balance. In a real app, this would be more complex.
  const calculateRemainingBalance = (loan: Loan) => {
    return loan.loanAmount - (loan.emi * 12); // Example: assuming one year of payments
  };

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700 h-full"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Debt Paydown</h3>
      {activeLoans.length > 0 ? (
        <div className="space-y-4">
          {activeLoans.map((loan, index) => {
            const remainingBalance = calculateRemainingBalance(loan);
            const progress = ((loan.loanAmount - remainingBalance) / loan.loanAmount) * 100;

            return (
              <motion.div 
                key={loan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{loan.name}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white">
                    {currency}{remainingBalance.toLocaleString()} / {currency}{loan.loanAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <motion.div
                    className="bg-orange-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
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
