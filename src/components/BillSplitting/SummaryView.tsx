import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Check, X } from 'lucide-react';
import { Participant, Expense } from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface Settlement {
  id: string;
  from: string;
  to: string;
  amount: number;
  groupId: string;
  createdAt: Date;
}

interface SummaryViewProps {
  participants: Participant[];
  expenses: Expense[];
  calculateSettlements: () => { from: string; to: string; amount: number }[];
  calculateSettlementsWithSettled: (settledPayments: { from: string; to: string; amount: number }[]) => { from: string; to: string; amount: number }[];
  user: FirebaseUser | null;
  groupId: string;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ participants, expenses, calculateSettlements, calculateSettlementsWithSettled, user, groupId, showToast }) => {
  const [settledPayments, setSettledPayments] = useState<Settlement[]>([]);

  // Fetch settled payments
  useEffect(() => {
    if (!user || !groupId) return;

    const q = query(
      collection(db, 'spenders', user.uid, 'billSplittingGroups', groupId, 'settledPayments'),
      where('groupId', '==', groupId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const settledData: Settlement[] = [];
      snapshot.forEach((doc) => {
        settledData.push({ id: doc.id, ...(doc.data() as Omit<Settlement, 'id'>) });
      });
      setSettledPayments(settledData);
    });

    return () => unsubscribe();
  }, [user, groupId]);

  // Calculate settlements excluding settled payments
  const settlements = calculateSettlementsWithSettled(settledPayments.map(sp => ({
    from: sp.from,
    to: sp.to,
    amount: sp.amount
  })));

  // Check if a settlement is already marked as settled
  const isSettlementSettled = (from: string, to: string, amount: number) => {
    return settledPayments.some(settlement => 
      settlement.from === from && 
      settlement.to === to && 
      Math.abs(settlement.amount - amount) < 0.01
    );
  };

  // Mark a settlement as settled
  const markAsSettled = async (from: string, to: string, amount: number) => {
    if (!user || !groupId) {
      showToast('You must be logged in to mark settlements.', 'error');
      return;
    }

    try {
      await addDoc(
        collection(db, 'spenders', user.uid, 'billSplittingGroups', groupId, 'settledPayments'),
        {
          from,
          to,
          amount,
          groupId,
          createdAt: new Date()
        }
      );
      showToast('Settlement marked as settled!', 'success');
    } catch (error) {
      console.error('Error marking settlement as settled:', error);
      showToast('Error marking settlement as settled.', 'error');
    }
  };

  // Remove a settled payment
  const removeSettledPayment = async (id: string) => {
    if (!user || !groupId) {
      showToast('You must be logged in to modify settlements.', 'error');
      return;
    }

    try {
      await deleteDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', groupId, 'settledPayments', id)
      );
      showToast('Settlement removed.', 'success');
    } catch (error) {
      console.error('Error removing settled payment:', error);
      showToast('Error removing settled payment.', 'error');
    }
  };

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
            settlements.map(({ from, to, amount }, index) => {
              const isSettled = isSettlementSettled(from, to, amount);
              return (
                <div 
                  key={index} 
                  className={`flex items-center justify-between p-3 rounded-lg border text-sm ${
                    isSettled 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                      : 'bg-white dark:bg-[#242424] border-gray-200 dark:border-gray-700'
                  }`}
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
                    {isSettled ? (
                      <button
                        onClick={() => {
                          // Find the settled payment to remove
                          const settledPayment = settledPayments.find(sp => 
                            sp.from === from && sp.to === to && Math.abs(sp.amount - amount) < 0.01
                          );
                          if (settledPayment) {
                            removeSettledPayment(settledPayment.id);
                          }
                        }}
                        className="ml-2 p-1 text-green-600 hover:text-green-800 dark:hover:text-green-200"
                        title="Mark as unsettled"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => markAsSettled(from, to, amount)}
                        className="ml-2 px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SummaryView;