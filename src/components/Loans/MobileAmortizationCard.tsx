
import React from 'react';
import { AmortizationEntry } from '../../lib/loanCalculations';

interface MobileAmortizationCardProps {
  entry: AmortizationEntry;
  currency: string;
}

const MobileAmortizationCard: React.FC<MobileAmortizationCardProps> = ({ entry, currency }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-bold text-gray-900 dark:text-white">Month: {entry.month}</span>
        <span className="text-sm font-medium text-gray-900 dark:text-white">{currency}{entry.endingBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Principal</p>
          <p className="text-gray-900 dark:text-white">{currency}{entry.principal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Interest</p>
          <p className="text-gray-900 dark:text-white">{currency}{entry.interest.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500 dark:text-gray-400">Total Payment</p>
          <p className="text-gray-900 dark:text-white">{currency}{entry.totalPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
        </div>
      </div>
    </div>
  );
};

export default MobileAmortizationCard;
