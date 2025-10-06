import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Check, X, Calendar, TrendingUp, DollarSign } from 'lucide-react';
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

interface EnhancedParticipant extends Participant {
  netBalance: number;
}

interface SummaryViewProps {
  participants: Participant[];
  expenses: Expense[];
  calculateSettlements: () => { from: string; to: string; amount: number }[];
  calculateSettlementsWithSettled: (settledPayments: { from: string; to: string; amount: number }[]) => { from: string; to: string; amount: number }[];
  user: FirebaseUser | null;
  groupId: string;
  showToast: (message: string, type: 'success' | 'error') => void;
  currency?: string; // Add currency prop
}

const SummaryView: React.FC<SummaryViewProps> = ({ participants, expenses, calculateSettlements, calculateSettlementsWithSettled, user, groupId, showToast, currency = '₹' }) => {
  const [settledPayments, setSettledPayments] = useState<Settlement[]>([]);
  const [activeTab, setActiveTab] = useState<'balances' | 'settlements' | 'history'>('balances');

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
    amount: parseFloat(sp.amount.toFixed(2)) // Ensure precision
  })));

  // Calculate updated participant balances that account for settled payments
  const updatedParticipants = useMemo(() => {
    // Start with original participant data
    const updated: EnhancedParticipant[] = participants.map(p => ({
      ...p,
      // Calculate net balance (paid - owed)
      netBalance: p.amountPaid - p.amountOwed
    }));

    // Adjust balances based on settled payments
    settledPayments.forEach(payment => {
      const fromParticipant = updated.find(p => p.name === payment.from);
      const toParticipant = updated.find(p => p.name === payment.to);
      
      if (fromParticipant && toParticipant) {
        // When a payment is settled:
        // 1. The payer (from) has effectively paid more (reduces what they owe or increases what they're owed)
        // 2. The receiver (to) has effectively received payment (reduces what they're owed or increases what they've paid)
        fromParticipant.netBalance += payment.amount;
        toParticipant.netBalance -= payment.amount;
      }
    });

    return updated;
  }, [participants, settledPayments]);

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
          amount: parseFloat(amount.toFixed(2)), // Ensure precision
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

  const getParticipantName = (id: string) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const truncateName = (name: string) => {
    if (name.length >= 8) {
      return name.substring(0, 6) + '..';
    }
    return name;
  };

  const getPaidByName = (id: string) => {
    if (id === '1') return 'You';
    return truncateName(getParticipantName(id));
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Calculate statistics using updated participants
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const totalPaid = participants.reduce((sum, p) => sum + p.amountPaid, 0);
  const totalOwed = participants.reduce((sum, p) => sum + p.amountOwed, 0);
  const settledAmount = settledPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  // Calculate additional statistics using updated participants
  const avgExpensePerPerson = totalExpenses / participants.length || 0;
  const mostActiveParticipant = participants.reduce((max, participant) => 
    (participant.amountPaid + participant.amountOwed) > (max.amountPaid + max.amountOwed) ? participant : max, 
    participants[0] || { name: 'None', amountPaid: 0, amountOwed: 0 }
  );
  
  const highestExpense = expenses.reduce((max, expense) => 
    expense.amount > max.amount ? expense : max, 
    expenses[0] || { description: 'None', amount: 0 }
  );
  
  // Group expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    acc[category] = (acc[category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  // Get top 3 categories
  const topCategories = Object.entries(expensesByCategory)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Group expenses by date for timeline
  const groupedExpensesByDate = expenses.reduce((groups, expense) => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
    return groups;
  }, {} as Record<string, Expense[]>);
  


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 min-h-[500px]"
    >
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center">
            <DollarSign className="h-5 w-5 text-blue-500 dark:text-blue-400 mr-2" />
            <h3 className="font-semibold text-blue-800 dark:text-blue-200">Total Expenses</h3>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
            {currency}{totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-500 dark:text-green-400 mr-2" />
            <h3 className="font-semibold text-green-800 dark:text-green-200">Total Paid</h3>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
            {currency}{totalPaid.toFixed(2)}
          </p>
        </div>
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center">
            <User className="h-5 w-5 text-purple-500 dark:text-purple-400 mr-2" />
            <h3 className="font-semibold text-purple-800 dark:text-purple-200">Participants</h3>
          </div>
          <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
            {participants.length}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
          <div className="flex items-center">
            <Check className="h-5 w-5 text-orange-500 dark:text-orange-400 mr-2" />
            <h3 className="font-semibold text-orange-800 dark:text-orange-200">Settled</h3>
          </div>
          <p className="text-2xl font-bold text-orange-900 dark:text-orange-100 mt-1">
            {currency}{settledAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-2">Average per Person</h4>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {currency}{avgExpensePerPerson.toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">
            Per participant share
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-2">Most Active</h4>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {mostActiveParticipant.name}
          </p>
          <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">
            Highest involvement
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-2">Largest Expense</h4>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-200 truncate" title={highestExpense.description}>
            {highestExpense.description.length > 15 
              ? highestExpense.description.substring(0, 15) + '...' 
              : highestExpense.description}
          </p>
          <p className="text-sm text-gray-500 dark:text-[#888888] mt-1">
            {currency}{highestExpense.amount.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Top Categories */}
      {topCategories.length > 0 && (
        <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Top Categories</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topCategories.map(([category, amount], index) => (
              <div key={category} className="bg-white dark:bg-[#242424] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">{category}</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {currency}{amount.toFixed(2)}
                  </span>
                </div>
                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${(amount / totalExpenses) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'balances' ? 'text-[#007BFF] border-b-2 border-[#007BFF]' : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'}`}
          onClick={() => setActiveTab('balances')}
        >
          Current Balances
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'settlements' ? 'text-[#007BFF] border-b-2 border-[#007BFF]' : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'}`}
          onClick={() => setActiveTab('settlements')}
        >
          Pending Settlements
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm ${activeTab === 'history' ? 'text-[#007BFF] border-b-2 border-[#007BFF]' : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'}`}
          onClick={() => setActiveTab('history')}
        >
          Settlement History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'balances' && (
        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Current Participant Balances</h3>
            <div className="space-y-3">
              {updatedParticipants.map((participant) => {
                const balance = participant.netBalance;
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
                        <p className="font-medium text-gray-900 dark:text-[#F5F5F5] truncate max-w-[150px]" title={participant.name}>
                          {participant.name.length >= 8 ? participant.name.substring(0, 6) + '..' : participant.name}
                        </p>
                        <div className="text-sm text-gray-500 dark:text-[#888888]">
                          <p>Paid: {currency}{participant.amountPaid.toFixed(2)}</p>
                          <p>Owed: {currency}{participant.amountOwed.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balance >= 0 ? '+' : ''}{currency}{Math.abs(balance).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Balance Breakdown */}
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Balance Breakdown (Including Settled Payments)</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Participant</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Paid</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Owed</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Net Balance</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#242424] divide-y divide-gray-200 dark:divide-gray-700">
                  {updatedParticipants.map((participant) => {
                    const balance = participant.netBalance;
                    return (
                      <tr key={participant.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-[#F5F5F5]">{participant.name}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-[#888888]">{currency}{participant.amountPaid.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-[#888888]">{currency}{participant.amountOwed.toFixed(2)}</td>
                        <td className={`px-4 py-2 whitespace-nowrap text-sm font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {balance >= 0 ? '+' : ''}{currency}{Math.abs(balance).toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            balance > 0.01 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' 
                              : balance < -0.01 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' 
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {balance > 0.01 ? 'Owed Money' : balance < -0.01 ? 'Owes Money' : 'Settled'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settlements' && (
        <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Pending Settlements</h3>
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
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border text-sm space-y-2 sm:space-y-0 ${
                      isSettled 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                        : 'bg-white dark:bg-[#242424] border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-1.5">
                        <User className="h-4 w-4 text-red-600 dark:text-red-300" />
                      </div>
                      <span className="font-medium text-gray-900 dark:text-[#F5F5F5] truncate max-w-[120px]" title={from}>
                        {from.length >= 8 ? from.substring(0, 6) + '..' : from}
                      </span>
                    </div>
                    <div className="flex items-center justify-center sm:justify-start space-x-2 font-medium text-gray-500 dark:text-[#888888]">
                      <span>pays</span>
                      <span className="font-bold text-base text-gray-800 dark:text-gray-200">{currency}{amount.toFixed(2)}</span>
                      <span>to</span>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end space-x-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900 dark:text-[#F5F5F5] truncate max-w-[120px]" title={to}>
                          {to.length >= 8 ? to.substring(0, 6) + '..' : to}
                        </span>
                        <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-1.5">
                          <User className="h-4 w-4 text-green-600 dark:text-green-300" />
                        </div>
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
      )}

      {activeTab === 'history' && (
        <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Settlement History</h3>
          {settledPayments.length === 0 ? (
            <div className="text-center py-4 text-gray-500 dark:text-[#888888]">
              <Calendar className="h-8 w-8 mx-auto text-gray-400 mb-2" />
              <p>No settlements recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {[...settledPayments]
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((payment) => (
                  <div 
                    key={payment.id} 
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-2">
                        <Check className="h-4 w-4 text-green-600 dark:text-green-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                          {payment.from} → {payment.to}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-[#888888]">
                          {formatDate(payment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-0 font-semibold text-green-600 dark:text-green-400">
                      {currency}{payment.amount.toFixed(2)}
                    </div>
                    <button
                      onClick={() => removeSettledPayment(payment.id)}
                      className="mt-2 sm:mt-0 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                      title="Remove from history"
                    >
                      Remove
                    </button>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default SummaryView;