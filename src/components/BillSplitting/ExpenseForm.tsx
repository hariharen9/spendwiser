import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Save } from 'lucide-react';
import { Expense, Participant, Group } from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { addDoc, collection, Timestamp, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import AnimatedDropdown from '../Common/AnimatedDropdown';

interface ExpenseFormProps {
  user: FirebaseUser | null;
  participants: Participant[];
  groups: Group[];
  groupParticipants: Record<string, string[]>;
  selectedGroup: string | null;
  showToast: (message: string, type: 'success' | 'error') => void;
  editingExpense: Expense | null;
  resetEditingExpense: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ 
  user, 
  participants, 
  groups, 
  groupParticipants, 
  selectedGroup, 
  showToast,
  editingExpense,
  resetEditingExpense
}) => {
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '1',
    splitType: 'equal' as 'equal' | 'unequal' | 'percentage',
    groupId: '' as string,
    date: new Date().toISOString().split('T')[0], // Add date field, default to today
  });
  const [expenseSplits, setExpenseSplits] = useState<Record<string, number>>({});
  const [manuallyEditedParticipants, setManuallyEditedParticipants] = useState<Record<string, boolean>>({});

  // Populate form when editingExpense changes
  useEffect(() => {
    if (editingExpense) {
      setNewExpense({
        description: editingExpense.description,
        amount: editingExpense.amount.toString(),
        paidBy: editingExpense.paidBy,
        splitType: editingExpense.splitType,
        groupId: editingExpense.groupId || '',
        date: editingExpense.date || new Date().toISOString().split('T')[0], // Add date field
      });
      
      // Populate expense splits
      const splits: Record<string, number> = {};
      const manuallyEdited: Record<string, boolean> = {};
      editingExpense.splits.forEach(split => {
        if (editingExpense.splitType === 'percentage' && split.percentage !== undefined) {
          splits[split.participantId] = split.percentage;
          manuallyEdited[split.participantId] = true; // Mark as manually edited since it has a value
        } else {
          splits[split.participantId] = split.amount;
        }
      });
      setExpenseSplits(splits);
      setManuallyEditedParticipants(manuallyEdited);
    } else {
      // Reset form when not editing
      resetExpenseForm();
    }
  }, [editingExpense]);

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
      date: new Date().toISOString().split('T')[0], // Reset to today's date
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
        date: newExpense.date, // Use selected date instead of current date
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

  const updateExpense = async () => {
    if (!editingExpense || !editingExpense.id || !editingExpense.groupId) {
      showToast('No expense to update.', 'error');
      return;
    }
    
    if (!newExpense.description || !newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      showToast('Please fill out the description and amount.', 'error');
      return;
    }
    
    if (!user) {
      showToast('You must be logged in to update an expense.', 'error');
      return;
    }

    const currentGroupId = newExpense.groupId || selectedGroup;
    if (!currentGroupId || currentGroupId === '') {
      showToast('Please select a group to update the expense in.', 'error');
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
        date: newExpense.date, // Use selected date instead of current date
        updatedAt: Timestamp.now()
      };
      
      await updateDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', currentGroupId, 'expenses', editingExpense.id),
        expenseData
      );

      showToast('Expense updated successfully!', 'success');
      resetEditingExpense();
      resetExpenseForm();
    } catch (error) {
      console.error('Error updating expense:', error);
      showToast('Error updating expense. Please try again.', 'error');
    }
  };

  const handleSubmit = () => {
    if (editingExpense) {
      updateExpense();
    } else {
      addExpense();
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
      <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">
        {editingExpense ? 'Edit Expense' : 'Add New Expense'}
      </h3>
      <div className='mb-4'>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Group
        </label>
        <AnimatedDropdown
          selectedValue={newExpense.groupId}
          options={[{value: '', label: 'Please select a group'}, ...groups.map(group => ({value: group.id, label: group.name}))]}
          onChange={(value) => setNewExpense({...newExpense, groupId: value})}
          placeholder="Please select a group"
        />
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
          <AnimatedDropdown
            selectedValue={newExpense.paidBy}
            options={participants.map(participant => ({value: participant.id, label: participant.name}))}
            onChange={(value) => setNewExpense({...newExpense, paidBy: value})}
            placeholder="Select who paid"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
            className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Split Type
          </label>
          <AnimatedDropdown
            selectedValue={newExpense.splitType}
            options={[{value: 'equal', label: 'Equal Split'}, {value: 'unequal', label: 'Unequal Split'}, {value: 'percentage', label: 'Percentage Split'}]}
            onChange={(value) => setNewExpense({...newExpense, splitType: value as 'equal' | 'unequal' | 'percentage'})}
            placeholder="Select split type"
          />
        </div>
      </div>

      {(newExpense.splitType === 'unequal' || newExpense.splitType === 'percentage') && (
        <div className="mt-4">
          <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
            {newExpense.splitType === 'percentage' ? 'Percentage Split' : 'Amount Split'}
          </h4>
          
          {/* Progress bar for percentage splits */}
          {newExpense.splitType === 'percentage' && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Allocation Progress</span>
                <span>
                  {Object.values(expenseSplits).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0).toFixed(1)}% of 100%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, Object.values(expenseSplits).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0))}%` 
                  }}
                ></div>
              </div>
              {Object.values(expenseSplits).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0) > 100 && (
                <div className="text-red-500 text-sm mt-1">
                  Total exceeds 100%! Please adjust values.
                </div>
              )}
            </div>
          )}
          
          {/* Running totals for amount splits */}
          {newExpense.splitType === 'unequal' && newExpense.amount && parseFloat(newExpense.amount) > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Allocated: ₹{Object.values(expenseSplits).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0).toFixed(2)}</span>
                <span>Remaining: ₹{(parseFloat(newExpense.amount) - Object.values(expenseSplits).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0)).toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (Object.values(expenseSplits).reduce((sum, val) => sum + (parseFloat(val.toString()) || 0), 0) / parseFloat(newExpense.amount)) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          )}
          
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
              
              // Calculate suggested percentage for each participant
              const calculateSuggestedPercentage = (participantId: string) => {
                if (newExpense.splitType !== 'percentage') return '';
                
                // If this participant has a manually entered value, use that
                if (manuallyEditedParticipants[participantId] || expenseSplits[participantId] !== undefined) {
                  return expenseSplits[participantId]?.toString() || '';
                }
                
                // Calculate suggested value based on remaining participants
                const manuallyEditedIds = Object.keys(manuallyEditedParticipants)
                  .filter(id => manuallyEditedParticipants[id]);
                
                const manuallyEditedTotal = manuallyEditedIds.reduce(
                  (sum, id) => sum + (expenseSplits[id] || 0), 
                  0
                );
                
                const autoParticipants = participantsToShow.filter(
                  p => !manuallyEditedParticipants[p.id]
                );
                
                if (autoParticipants.length > 0) {
                  const remaining = Math.max(0, 100 - manuallyEditedTotal);
                  const equalShare = remaining / autoParticipants.length;
                  
                  if (autoParticipants.some(p => p.id === participantId)) {
                    return equalShare.toFixed(1);
                  }
                }
                
                return '';
              };
              
              const handlePercentageChange = (participantId: string, value: string) => {
                if (newExpense.splitType !== 'percentage') return;
                
                const newValue = parseFloat(value) || 0;
                
                // Mark this participant as manually edited
                setManuallyEditedParticipants(prev => ({ ...prev, [participantId]: true }));
                
                // Update the expense splits
                setExpenseSplits(prev => ({
                  ...prev,
                  [participantId]: newValue
                }));
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
                    placeholder={newExpense.splitType === 'percentage' ? `${calculateSuggestedPercentage(participant.id)}%` : '0.00'}
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
        {editingExpense && (
          <motion.button
            onClick={resetEditingExpense}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Cancel
          </motion.button>
        )}
        <motion.button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {editingExpense ? (
            <>
              <Save className="h-4 w-4 mr-1" />
              Update Expense
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-1" />
              Add Expense
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default ExpenseForm;