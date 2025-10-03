
import React from 'react';
import { motion } from 'framer-motion';
import { User, Check } from 'lucide-react';
import { Participant, Expense } from '../../types/types';

interface SummaryViewProps {
  participants: Participant[];
  expenses: Expense[];
  calculateSettlements: () => { from: string; to: string; amount: number }[];
}

const SummaryView: React.FC<SummaryViewProps> = ({ participants, expenses, calculateSettlements }) => {
  const settlements = calculateSettlements();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 min-h-[500px]"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-800 dark:text-blue-200">Total Expenses</h3>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            ₹{expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <h3 className="font-semibold text-green-800 dark:text-green-200">Total Paid</h3>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            ₹{participants.reduce((sum, p) => sum + p.amountPaid, 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-purple-800 dark:text-purple-200">Participants</h3>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
            {participants.length}
          </p>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Participant Balances</h3>
        <div className="space-y-3">
          {participants.map((participant) => {
            const balance = participant.amountPaid - participant.amountOwed;
            return (
              <div 
                key={participant.id} 
                className="flex items-center justify-between p-3 bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                    <User className="h-4 w-4 text-gray-600 dark:text-[#888888]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                      {participant.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-[#888888]">
                      Paid: ₹{participant.amountPaid.toFixed(2)} | Owed: ₹{participant.amountOwed.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {balance >= 0 ? '+' : ''}₹{Math.abs(balance).toFixed(2)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
        <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Settlements</h3>
        <div className="space-y-2">
          {settlements.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-[#888888]">
              <Check className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p>All debts are settled!</p>
            </div>
          ) : (
            settlements.map(({ from, to, amount }, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 text-sm"
              >
                <div className="flex items-center space-x-2">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1.5">
                    <User className="h-4 w-4 text-red-600 dark:text-red-300" />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">{from}</span>
                </div>
                <div className="flex items-center space-x-2 font-medium text-gray-500 dark:text-[#888888]">
                   <span>pays</span>
                   <span className="font-bold text-base text-gray-800 dark:text-gray-200">₹{amount.toFixed(2)}</span>
                   <span>to</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">{to}</span>
                  <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1.5">
                    <User className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryView;
