
import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2 } from 'lucide-react';
import { Expense, Group, Participant } from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface HistoryViewProps {
  expenses: Expense[];
  groups: Group[];
  participants: Participant[];
  user: FirebaseUser | null;
  showToast: (message: string, type: 'success' | 'error') => void;
  selectedGroup: string | null;
  setSelectedGroup: (groupId: string | null) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ expenses, groups, participants, user, showToast, selectedGroup, setSelectedGroup }) => {


  const removeExpense = async (id: string) => {
    if (!user) return;
    
    const expense = expenses.find(e => e.id === id);
    if (!expense || !expense.groupId) return;
    
    try {
      await deleteDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', expense.groupId, 'expenses', id)
      );
      showToast('Expense removed.', 'success');
    } catch (error) {
      console.error('Error removing expense:', error);
      showToast('Error removing expense.', 'error');
    }
  };

  const filteredExpenses = useMemo(() => {
    if (!selectedGroup) return expenses;
    return expenses.filter(expense => expense.groupId === selectedGroup);
  }, [expenses, selectedGroup]);

  const getParticipantName = (id: string) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const getPaidByName = (id: string) => {
    if (id === '1') return 'You';
    return getParticipantName(id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 min-h-[500px]"
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Filter by Group
        </label>
        <select
          value={selectedGroup || ''}
          onChange={(e) => setSelectedGroup(e.target.value || null)}
          className="w-full md:w-1/3 px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
        >
          <option value="">All Expenses</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Expense History</h3>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-[#888888]">
            <History className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
            <p>No expenses recorded yet</p>
            <p className="text-sm mt-1">Add expenses to see your transaction history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...filteredExpenses].reverse().map((expense) => (
              <motion.div
                key={expense.id}
                className="bg-white dark:bg-[#242424] rounded-lg p-4 border border-gray-200 dark:border-gray-700"
                whileHover={{ scale: 1.01 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                      {expense.description}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-[#888888]">
                      Paid by {getPaidByName(expense.paidBy)} • {expense.date}
                      {expense.groupId && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                          {groups.find(g => g.id === expense.groupId)?.name || 'Group'}
                        </span>
                      )}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {expense.splits.map((split: Expense['splits'][0]) => (
                        <span 
                          key={split.participantId} 
                          className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full"
                        >
                          {getParticipantName(split.participantId)}: ₹{split.amount.toFixed(2)}
                          {expense.splitType === 'percentage' && split.percentage && ` (${split.percentage.toFixed(1)}%)`}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => removeExpense(expense.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
                <div className="mt-2 text-right font-semibold text-gray-900 dark:text-[#F5F5F5]">
                  ₹{expense.amount.toFixed(2)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default HistoryView;
