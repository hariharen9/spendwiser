
import React from 'react';
import { motion } from 'framer-motion';
import { Account, Loan } from '../../types/types';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { CircleDollarSign } from 'lucide-react';
import AnimatedNumber from '../Common/AnimatedNumber';

interface NetWorthWidgetProps {
  accounts: Account[];
  loans: Loan[];
  currency: string;
}

const NetWorthWidget: React.FC<NetWorthWidgetProps> = ({ accounts, loans, currency }) => {

  const assets = accounts
    .filter(acc => acc.type !== 'Credit Card')
    .reduce((sum, acc) => sum + acc.balance, 0);

  const liabilities =
    loans.reduce((sum, loan) => sum + loan.loanAmount, 0) +
    accounts
      .filter(acc => acc.type === 'Credit Card')
      .reduce((sum, acc) => sum + acc.balance, 0);

  const netWorth = assets - liabilities;

  const getStatus = () => {
    if (netWorth > 0) {
      return {
        color: 'text-green-500',
        icon: <FiTrendingUp className="w-6 h-6" />,
        message: 'Positive Net Worth',
      };
    } else if (netWorth < 0) {
      return {
        color: 'text-red-500',
        icon: <FiTrendingDown className="w-6 h-6" />,
        message: 'Negative Net Worth',
      };
    } else {
      return {
        color: 'text-gray-500',
        icon: <FiMinus className="w-6 h-6" />,
        message: 'Zero Net Worth',
      };
    }
  };

  const { color, icon, message } = getStatus();

  return (
    <motion.div
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center">
          <CircleDollarSign className="w-5 h-5 mr-2" />
          Net Worth
        </h3>
      </div>

      <div className="text-center mb-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className={`text-4xl font-bold ${color} flex items-center justify-center`}>
            {icon}
            <span className="ml-2">
              <AnimatedNumber
                value={Math.abs(netWorth)}
                currency={currency}
                decimals={0}
              />
            </span>
          </div>
          <p className="text-gray-500 dark:text-[#888888] mt-1">
            {message}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
          <p className="text-xs text-green-600 dark:text-green-400">Assets</p>
          <p className="text-sm font-medium text-green-600 dark:text-green-400">
            <AnimatedNumber
              value={assets}
              currency={currency}
              decimals={0}
            />
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
          <p className="text-xs text-red-600 dark:text-red-400">Liabilities</p>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            <AnimatedNumber
              value={liabilities}
              currency={currency}
              decimals={0}
            />
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default NetWorthWidget;
