import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { History, Trash2, Edit3 } from 'lucide-react';
import { Expense, Group, Participant } from '../../types/types';
import { User as FirebaseUser } from 'firebase/auth';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ConfirmationDialog from './ConfirmationDialog';
import AnimatedDropdown from '../Common/AnimatedDropdown';

interface HistoryViewProps {
  expenses: Expense[];
  groups: Group[];
  participants: Participant[];
  user: FirebaseUser | null;
  showToast: (message: string, type: 'success' | 'error') => void;
  selectedGroup: string | null;
  setSelectedGroup: (groupId: string | null) => void;
  onEditExpense?: (expense: Expense) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ expenses, groups, participants, user, showToast, selectedGroup, setSelectedGroup, onEditExpense }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);

  const confirmDeleteExpense = (id: string) => {
    setExpenseToDelete(id);
    setShowDeleteConfirm(true);
  };

  const removeExpense = async () => {
    if (!expenseToDelete || !user) return;
    
    const expense = expenses.find(e => e.id === expenseToDelete);
    if (!expense || !expense.groupId) return;
    
    try {
      await deleteDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', expense.groupId, 'expenses', expenseToDelete)
      );
      showToast('Expense removed.', 'success');
    } catch (error) {
      console.error('Error removing expense:', error);
      showToast('Error removing expense.', 'error');
    } finally {
      setExpenseToDelete(null);
    }
  };

  const filteredExpenses = useMemo(() => {
    let result = [...expenses].sort((a, b) => {
      // Sort by date, newest first
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
    
    // Apply group filter
    if (selectedGroup) {
      result = result.filter(expense => expense.groupId === selectedGroup);
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(expense => 
        expense.description.toLowerCase().includes(term)
      );
    }
    
    // Apply date filters
    if (dateFrom) {
      result = result.filter(expense => expense.date >= dateFrom);
    }
    
    if (dateTo) {
      result = result.filter(expense => expense.date <= dateTo);
    }
    
    return result;
  }, [expenses, selectedGroup, searchTerm, dateFrom, dateTo]);

  // Group expenses by date
  const groupedExpenses = useMemo(() => {
    return filteredExpenses.reduce((groups, expense) => {
      const date = expense.date;
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(expense);
      return groups;
    }, {} as Record<string, Expense[]>);
  }, [filteredExpenses]);

  // Format date for display as header
  const formatHeaderDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getParticipantName = (id: string) => {
    const participant = participants.find(p => p.id === id);
    return participant ? participant.name : 'Unknown';
  };

  const getPaidByName = (id: string) => {
    if (id === '1') return 'You';
    return getParticipantName(id);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6 min-h-[500px]"
      >
        {/* Search and Filters Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Bar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Expenses
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by description..."
                className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
              />
            </div>
            
            {/* Group Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by Group
              </label>
              <AnimatedDropdown
                selectedValue={selectedGroup || ''}
                options={[{value: '', label: 'All Expenses'}, ...groups.map(group => ({value: group.id, label: group.name}))]}
                onChange={(value) => setSelectedGroup(value || null)}
                placeholder="Filter by group"
              />
            </div>
            
            {/* Date Filters Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date Range
              </label>
              <button 
                onClick={() => setShowDateFilters(!showDateFilters)}
                className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] text-left"
              >
                {showDateFilters ? 'Hide Date Range' : 'Show Date Range'}
              </button>
            </div>
          </div>
          
          {/* Date Filters - Collapsible */}
          {showDateFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">From</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">To</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                />
              </div>
              {(dateFrom || dateTo) && (
                <div className="md:col-span-2 flex justify-end">
                  <button 
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center"
                  >
                    Clear Dates
                  </button>
                </div>
              )}
            </div>
          )}
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
            <div className="space-y-0">
              {Object.entries(groupedExpenses).map(([date, dateExpenses]) => (
                <React.Fragment key={date}>
                  {/* Date Header Row */}
                  <div className="px-4 py-2">
                    <div className="flex items-center">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {formatHeaderDate(date)}
                      </div>
                      <div className="flex-grow border-t border-gray-300 dark:border-gray-600 ml-4"></div>
                    </div>
                  </div>
                  {/* Expense Rows */}
                  <div className="space-y-3 px-4 pb-4">
                    {dateExpenses.map((expense) => (
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
                              Paid by {getPaidByName(expense.paidBy)} • {new Date(expense.date).toLocaleDateString()}
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
                            {onEditExpense && (
                              <motion.button
                                onClick={() => onEditExpense(expense)}
                                className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <Edit3 className="h-4 w-4" />
                              </motion.button>
                            )}
                            <motion.button
                              onClick={() => confirmDeleteExpense(expense.id)}
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
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setExpenseToDelete(null);
        }}
        onConfirm={removeExpense}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
};

export default HistoryView;