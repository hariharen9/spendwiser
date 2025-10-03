import React, { useState, useEffect } from 'react';
import { Users, ArrowUpRight, ArrowDownLeft, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBillSplittingData } from '../../hooks/useBillSplittingData';
import { auth } from '../../firebaseConfig';
import { User as FirebaseUser } from 'firebase/auth';
import BillSplittingModal from '../Modals/BillSplittingModal';
import { Account, Transaction } from '../../types/types';

interface BillSplittingSummaryProps {
  accounts: Account[];
  creditCards?: Account[];
  defaultAccountId?: string | null;
  onAddTransaction?: (transaction: Omit<Transaction, 'id'>) => void;
}

const BillSplittingSummary: React.FC<BillSplittingSummaryProps> = ({ 
  accounts,
  creditCards,
  defaultAccountId,
  onAddTransaction
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { participants, expenses, loading } = useBillSplittingData(user, true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  // Calculate summary metrics using the same logic as BillSplittingModal
  const { totalOwedToUser, totalOwedByUser, netBalance } = (() => {
    if (loading || participants.length === 0) {
      return { totalOwedToUser: 0, totalOwedByUser: 0, netBalance: 0 };
    }

    // Find the "You" participant (always has id '1')
    const youParticipant = participants.find(p => p.id === '1');
    if (!youParticipant) {
      return { totalOwedToUser: 0, totalOwedByUser: 0, netBalance: 0 };
    }

    // Calculate balance using the same logic as SummaryView.tsx:
    // const balance = participant.amountPaid - participant.amountOwed;
    const balance = youParticipant.amountPaid - youParticipant.amountOwed;
    
    // If balance > 0, others owe you this amount
    // If balance < 0, you owe others this amount (as positive value)
    const totalOwedToUser = balance > 0 ? balance : 0;
    const totalOwedByUser = balance < 0 ? Math.abs(balance) : 0;
    const netBalance = balance;
    
    return {
      totalOwedToUser,
      totalOwedByUser,
      netBalance
    };
  })();

  const formatCurrency = (amount: number) => {
    return `₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const getCurrencySymbol = () => {
    // Default to ₹, but could be extended to support other currencies
    return '₹';
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Bill Splitting</h3>
        </div>
      </div>

      {loading ? (
        <div className="flex-grow flex flex-col justify-center space-y-4 animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      ) : (
        <div className="flex-grow">
          <div className="space-y-4">
            {/* Total owed to user */}
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/50">
              <div className="flex items-center space-x-2">
                <ArrowDownLeft className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Owed to You</span>
              </div>
              <span className="text-lg font-bold text-green-700 dark:text-green-300">
                {formatCurrency(totalOwedToUser)}
              </span>
            </div>

            {/* Total owed by user */}
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/50">
              <div className="flex items-center space-x-2">
                <ArrowUpRight className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">You Owe</span>
              </div>
              <span className="text-lg font-bold text-red-700 dark:text-red-300">
                {formatCurrency(totalOwedByUser)}
              </span>
            </div>

            {/* Net balance */}
            <div className={`flex items-center justify-between p-3 rounded-lg border ${
              netBalance > 0 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50' 
                : netBalance < 0 
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50' 
                  : 'bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center space-x-2">
                <DollarSign className={`h-5 w-5 ${
                  netBalance > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : netBalance < 0 
                      ? 'text-red-600 dark:text-red-400' 
                      : 'text-gray-600 dark:text-gray-400'
                }`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Balance</span>
              </div>
              <span className={`text-lg font-bold ${
                netBalance > 0 
                  ? 'text-green-700 dark:text-green-300' 
                  : netBalance < 0 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-gray-700 dark:text-gray-300'
              }`}>
                {netBalance >= 0 ? '+' : ''}{formatCurrency(netBalance)}
              </span>
            </div>
          </div>

          {/* Manage Splits Button */}
          <div className="mt-6">
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
            >
              <Users className="h-4 w-4 mr-2" />
              Manage Splits
            </button>
          </div>
        </div>
      )}

      {/* Bill Splitting Modal */}
      <BillSplittingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        accounts={accounts}
        creditCards={creditCards}
        defaultAccountId={defaultAccountId}
        onAddTransaction={onAddTransaction}
      />
    </div>
  );
};

export default BillSplittingSummary;