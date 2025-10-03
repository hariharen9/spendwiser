
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Expense, Participant, Group } from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

interface ExpenseFormProps {
  user: FirebaseUser | null;
  participants: Participant[];
  groups: Group[];
  groupParticipants: Record<string, string[]>;
  selectedGroup: string | null;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  user, 
  participants, 
  groups, 
  groupParticipants, 
  selectedGroup, 
  showToast 
}) => {
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '1',
    splitType: 'equal' as 'equal' | 'unequal' | 'percentage',
    groupId: '' as string,
  });
  const [expenseSplits, setExpenseSplits] = useState<Record<string, number>>({});
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [manuallyEditedParticipants, setManuallyEditedParticipants] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNewExpense(prev => ({ ...prev, groupId: selectedGroup || '' }));
  }, [selectedGroup]);

  const resetExpenseForm = () => {
    setNewExpense({
      description: '',
      amount: '',
      paidBy: participants[0]?.id || '1',
      splitType: 'equal',
      groupId: selectedGroup || '',
    });
    setExpenseSplits({});
    setManuallyEditedParticipants({});
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      showToast('Please fill out the description and amount.', 'error');
      return;
    }
    if (!user) {
      showToast('You must be logged in to add an expense.', 'error');
      return;
    }

    const currentGroupId = newExpense.groupId || selectedGroup;
    if (!currentGroupId || currentGroupId === '') {
      showToast('Please select a group to add the expense to.', 'error');
      return;
    }

    try {
      const amount = parseFloat(newExpense.amount);
      let splits: Expense['splits'] = [];

      const groupParticipantIds = groupParticipants[currentGroupId] || [];
      const groupParticipantsList = participants.filter(p => 
        p.id === '1' || groupParticipantIds.includes(p.id)
      );

      if (newExpense.splitType === 'equal') {
        const participantCount = groupParticipantsList.length;
        if (participantCount > 0) {
          const equalAmount = amount / participantCount;
          splits = groupParticipantsList.map(participant => ({
            participantId: participant.id,
            amount: equalAmount,
          }));
        }
      } else {
        splits = groupParticipantsList.map(participant => {
          const splitValue = expenseSplits[participant.id] || 0;
          const actualAmount = newExpense.splitType === 'percentage' ? 
            (splitValue / 100) * amount : 
            splitValue;
            
          return {
            participantId: participant.id,
            amount: actualAmount,
            percentage: newExpense.splitType === 'percentage' ? 
              splitValue : undefined
          };
        });
      }

      const expenseData = {
        description: newExpense.description,
        amount: amount,
        paidBy: newExpense.paidBy,
        splitType: newExpense.splitType,
        splits: splits,
        date: new Date().toISOString().split('T')[0],
        createdAt: Timestamp.now()
      };
      
      await addDoc(
        collection(db, 'spenders', user.uid, 'billSplittingGroups', currentGroupId, 'expenses'),
        expenseData
      );

      showToast('Expense added successfully!', 'success');
      resetExpenseForm();
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast('Error adding expense. Please try again.', 'error');
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">
        {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      <div className='mb-4'>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Group
        </label>
        <select
          value={newExpense.groupId}
          onChange={(e) => setNewExpense({...newExpense, groupId: e.target.value})}
          className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
          disabled={groups.length === 0}
        >
          <option value="">Please select a group</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
          {groups.length === 0 && (
            <option disabled>No groups available, Add before proceeding</option>
          )}
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <input
            type="text"
            value={newExpense.description}
            onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
            className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
            placeholder="Dinner, Groceries, etc."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
            className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Paid By
          </label>
          <select
            value={newExpense.paidBy}
            onChange={(e) => setNewExpense({...newExpense, paidBy: e.target.value})}
            className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
          >
            {participants.map(participant => (
              <option key={participant.id} value={participant.id}>
                {participant.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Split Type
          </label>
          <select
            value={newExpense.splitType}
            onChange={(e) => setNewExpense({...newExpense, splitType: e.target.value as any})}
            className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
          >
            <option value="equal">Equal Split</option>
            <option value="unequal">Unequal Split</option>
            <option value="percentage">Percentage Split</option>
          </select>
        </div>
      </div>

      {(newExpense.splitType === 'unequal' || newExpense.splitType === 'percentage') && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
            {newExpense.splitType === 'percentage' ? 'Percentage Split' : 'Amount Split'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {(() => {
              const currentGroupId = newExpense.groupId || selectedGroup;
              let participantsToShow = participants;
              
              if (currentGroupId) {
                const groupParticipantIds = groupParticipants[currentGroupId] || [];
                participantsToShow = participants.filter(participant => 
                  participant.id === '1' || groupParticipantIds.includes(participant.id)
                );
              }
              
              const handlePercentageChange = (participantId: string, value: string) => {
                if (newExpense.splitType !== 'percentage') return;
                
                const newValue = parseFloat(value) || 0;
                
                setManuallyEditedParticipants(prev => ({ ...prev, [participantId]: true }));
                
                const updatedSplits = { ...expenseSplits, [participantId]: newValue };
                
                const manuallyEditedIds = Object.keys(manuallyEditedParticipants)
                  .filter(id => manuallyEditedParticipants[id] && id !== participantId);
                
                const manuallyEditedTotal = manuallyEditedIds.reduce(
                  (sum, id) => sum + (updatedSplits[id] || 0), 
                  0
                );
                
                const totalWithCurrent = manuallyEditedTotal + newValue;
                
                const autoParticipants = participantsToShow.filter(
                  p => p.id !== participantId && !manuallyEditedParticipants[p.id]
                );
                
                if (autoParticipants.length > 0) {
                  const remaining = Math.max(0, 100 - totalWithCurrent);
                  const equalShare = remaining / autoParticipants.length;
                  
                  autoParticipants.forEach(p => {
                    updatedSplits[p.id] = parseFloat(equalShare.toFixed(1));
                  });
                }
                
                const finalTotal = Object.values(updatedSplits).reduce((sum, val) => sum + val, 0);
                if (finalTotal > 100) {
                  const lastManuallyEdited = manuallyEditedIds[manuallyEditedIds.length - 1];
                  if (lastManuallyEdited && lastManuallyEdited !== participantId) {
                    const adjustment = finalTotal - 100;
                    updatedSplits[lastManuallyEdited] = Math.max(0, 
                      parseFloat((updatedSplits[lastManuallyEdited] - adjustment).toFixed(1))
                    );
                  }
                }
                
                setExpenseSplits(updatedSplits);
              };
              
              return participantsToShow.map(participant => (
                <div key={participant.id} className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700 dark:text-gray-300 w-20 truncate">
                    {participant.name}
                  </span>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={expenseSplits[participant.id] || ''}
                    onChange={(e) => {
                      if (newExpense.splitType === 'percentage') {
                        handlePercentageChange(participant.id, e.target.value);
                      } else {
                        setExpenseSplits({
                          ...expenseSplits,
                          [participant.id]: parseFloat(e.target.value) || 0
                        });
                      }
                    }}
                    className="flex-grow px-2 py-1 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder={newExpense.splitType === 'percentage' ? '0%' : '0.00'}
                  />
                  {newExpense.splitType === 'percentage' && (
                    <span className="text-sm text-gray-500">%</span>
                  )}
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      <div className="mt-4 flex justify-end space-x-2">
        {editingExpenseId && (
          <motion.button
            onClick={() => setEditingExpenseId(null)}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        )}
        <motion.button
          onClick={addExpense}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-4 w-4 mr-1" />
          {editingExpenseId ? 'Update' : 'Add'} Expense
        </motion.button>
      </div>
    </div>
  );
};

export default ExpenseForm;
