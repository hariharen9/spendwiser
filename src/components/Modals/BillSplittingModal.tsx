import React, { useState, useEffect } from 'react';
import { X, User, Users, Plus, Minus, Edit3, Trash2, Save, Calculator, Share2, History, PieChart, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  amountOwed: number;
  amountPaid: number;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string; // participant id
  splitType: 'equal' | 'unequal' | 'percentage';
  splits: {
    participantId: string;
    amount: number;
    percentage?: number;
  }[];
  date: string;
}

interface BillSplittingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
  onBack?: () => void; // For mobile navigation
}

const BillSplittingModal: React.FC<BillSplittingModalProps> = ({ 
  isOpen, 
  onClose, 
  isMobile = false,
  onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'summary' | 'history'>('expenses');
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', amountOwed: 0, amountPaid: 0 },
  ]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '1',
    splitType: 'equal' as 'equal' | 'unequal' | 'percentage',
  });
  const [expenseSplits, setExpenseSplits] = useState<Record<string, number>>({});
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);

  // Calculate balances for each participant
  useEffect(() => {
    // Reset participant balances
    const updatedParticipants = participants.map(p => ({
      ...p,
      amountOwed: 0,
      amountPaid: 0
    }));

    // Calculate amounts paid and owed
    expenses.forEach(expense => {
      // Add to payer's paid amount
      const payerIndex = updatedParticipants.findIndex(p => p.id === expense.paidBy);
      if (payerIndex !== -1) {
        updatedParticipants[payerIndex].amountPaid += expense.amount;
      }

      // Add to each participant's owed amount
      expense.splits.forEach(split => {
        const participantIndex = updatedParticipants.findIndex(p => p.id === split.participantId);
        if (participantIndex !== -1) {
          updatedParticipants[participantIndex].amountOwed += split.amount;
        }
      });
    });

    setParticipants(updatedParticipants);
  }, [expenses]);

  const addParticipant = () => {
    if (newParticipantName.trim()) {
      const newParticipant: Participant = {
        id: Date.now().toString(),
        name: newParticipantName.trim(),
        amountOwed: 0,
        amountPaid: 0,
      };
      setParticipants([...participants, newParticipant]);
      setNewParticipantName('');
      setShowAddParticipant(false);
    }
  };

  const removeParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p.id !== id));
      // Also remove this participant from any expense splits
      setExpenses(expenses.map(expense => ({
        ...expense,
        splits: expense.splits.filter(split => split.participantId !== id)
      })));
    }
  };

  const addExpense = () => {
    if (!newExpense.description || !newExpense.amount || parseFloat(newExpense.amount) <= 0) return;

    const amount = parseFloat(newExpense.amount);
    let splits: Expense['splits'] = [];

    if (newExpense.splitType === 'equal') {
      const equalAmount = amount / participants.length;
      splits = participants.map(participant => ({
        participantId: participant.id,
        amount: equalAmount,
      }));
    } else {
      // For unequal and percentage splits, we'll use the expenseSplits state
      splits = participants.map(participant => {
        const splitAmount = expenseSplits[participant.id] || 0;
        return {
          participantId: participant.id,
          amount: splitAmount,
          percentage: newExpense.splitType === 'percentage' ? 
            (splitAmount / amount) * 100 : undefined
        };
      });
    }

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount,
      paidBy: newExpense.paidBy,
      splitType: newExpense.splitType,
      splits,
      date: new Date().toISOString().split('T')[0],
    };

    setExpenses([...expenses, expense]);
    resetExpenseForm();
  };

  const resetExpenseForm = () => {
    setNewExpense({
      description: '',
      amount: '',
      paidBy: participants[0]?.id || '1',
      splitType: 'equal',
    });
    setExpenseSplits({});
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  const calculateSettlements = () => {
    // Simplified settlement calculation
    const balances: Record<string, number> = {};
    participants.forEach(participant => {
      balances[participant.id] = participant.amountPaid - participant.amountOwed;
    });

    // In a real implementation, this would calculate the minimal transactions
    // For now, we'll just show who owes what
    return Object.entries(balances)
      .filter(([_, balance]) => balance !== 0)
      .map(([id, balance]) => ({
        participant: participants.find(p => p.id === id)!,
        balance,
      }));
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
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${isMobile ? 'p-0' : 'p-4'}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isMobile ? undefined : onClose}
        >
          <motion.div
            className={`bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl shadow-2xl flex flex-col ${isMobile ? 'h-screen rounded-none' : 'max-h-[90vh]'}`}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex items-center space-x-3">
                {isMobile && onBack && (
                  <motion.button
                    onClick={onBack}
                    className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </motion.button>
                )}
                <motion.div 
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-2 bg-[#007BFF] rounded-lg">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                    Bill Splitting
                  </h2>
                </motion.div>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={onClose}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-5 w-5 md:h-6 md:w-6" />
                </motion.button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                className={`flex-1 py-4 px-2 text-center font-medium text-sm md:text-base flex items-center justify-center space-x-2 ${
                  activeTab === 'expenses'
                    ? 'text-[#007BFF] border-b-2 border-[#007BFF]'
                    : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'
                }`}
                onClick={() => setActiveTab('expenses')}
              >
                <Calculator className="h-4 w-4" />
                <span>Expenses</span>
              </button>
              <button
                className={`flex-1 py-4 px-2 text-center font-medium text-sm md:text-base flex items-center justify-center space-x-2 ${
                  activeTab === 'summary'
                    ? 'text-[#007BFF] border-b-2 border-[#007BFF]'
                    : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'
                }`}
                onClick={() => setActiveTab('summary')}
              >
                <PieChart className="h-4 w-4" />
                <span>Summary</span>
              </button>
              <button
                className={`flex-1 py-4 px-2 text-center font-medium text-sm md:text-base flex items-center justify-center space-x-2 ${
                  activeTab === 'history'
                    ? 'text-[#007BFF] border-b-2 border-[#007BFF]'
                    : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'
                }`}
                onClick={() => setActiveTab('history')}
              >
                <History className="h-4 w-4" />
                <span>History</span>
              </button>
            </div>

            {/* Content - Fixed height container to prevent modal shrinkage */}
            <div className="flex-grow overflow-y-auto p-4 md:p-6" style={{ minHeight: '500px' }}>
              {/* Expenses Tab */}
              {activeTab === 'expenses' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Participants Section */}
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5]">Participants</h3>
                      <motion.button
                        onClick={() => setShowAddParticipant(true)}
                        className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </motion.button>
                    </div>
                    
                    {showAddParticipant && (
                      <motion.div 
                        className="flex mb-3 space-x-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <input
                          type="text"
                          value={newParticipantName}
                          onChange={(e) => setNewParticipantName(e.target.value)}
                          placeholder="Participant name"
                          className="flex-grow px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                          onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                        />
                        <motion.button
                          onClick={addParticipant}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Check className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          onClick={() => setShowAddParticipant(false)}
                          className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <X className="h-4 w-4" />
                        </motion.button>
                      </motion.div>
                    )}
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {participants.map((participant) => (
                        <motion.div
                          key={participant.id}
                          className="flex items-center justify-between bg-white dark:bg-[#242424] rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                              <User className="h-4 w-4 text-gray-600 dark:text-[#888888]" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                              {participant.name}
                            </span>
                          </div>
                          {participant.id !== '1' && (
                            <motion.button
                              onClick={() => removeParticipant(participant.id)}
                              className="text-red-500 hover:text-red-700"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Add Expense Form */}
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">
                      {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
                    </h3>
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

                    {/* Split Details */}
                    {newExpense.splitType !== 'equal' && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                          {newExpense.splitType === 'percentage' ? 'Percentage Split' : 'Amount Split'}
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          {participants.map(participant => (
                            <div key={participant.id} className="flex items-center space-x-2">
                              <span className="text-sm text-gray-700 dark:text-gray-300 w-20 truncate">
                                {participant.name}
                              </span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={expenseSplits[participant.id] || ''}
                                onChange={(e) => setExpenseSplits({
                                  ...expenseSplits,
                                  [participant.id]: parseFloat(e.target.value) || 0
                                })}
                                className="flex-grow px-2 py-1 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                                placeholder={newExpense.splitType === 'percentage' ? '0%' : '0.00'}
                              />
                              {newExpense.splitType === 'percentage' && (
                                <span className="text-sm text-gray-500">%</span>
                              )}
                            </div>
                          ))}
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

                  {/* Expenses List */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">Recent Expenses</h3>
                    {expenses.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 dark:text-[#888888]">
                        <Calculator className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p>No expenses added yet</p>
                        <p className="text-sm mt-1">Add your first expense to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {[...expenses].reverse().map((expense) => (
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
                                </p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {expense.splits.map((split) => (
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
              )}

              {/* Summary Tab */}
              {activeTab === 'summary' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
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
                    <div className="space-y-3">
                      {calculateSettlements().map(({ participant, balance }, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-3 bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full p-2">
                              <User className="h-4 w-4 text-gray-600 dark:text-[#888888]" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">
                              {participant.name}
                            </span>
                          </div>
                          <div className={`font-semibold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {balance >= 0 ? 'gets back' : 'owes'} ₹{Math.abs(balance).toFixed(2)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center py-20 text-gray-500 dark:text-[#888888]">
                    <History className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                    <p>Expense history will appear here</p>
                    <p className="text-sm mt-1">Add expenses to see your transaction history</p>
                  </div>
                  {/* Adding invisible spacer content to maintain consistent height */}
                  <div className="invisible">
                    <div className="h-32"></div>
                    <div className="h-32"></div>
                    <div className="h-32"></div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500 dark:text-[#888888]">
                  {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BillSplittingModal;