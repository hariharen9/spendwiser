import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Users, Plus, Minus, Edit3, Trash2, Save, Calculator, Share2, History, PieChart, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
// Add Firebase imports
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { User as FirebaseUser } from 'firebase/auth';

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  amountOwed: number;
  amountPaid: number;
}

interface Group {
  id: string;
  name: string;
  participantIds: string[]; // Array of participant IDs in this group
  createdAt?: Date; // Add createdAt for Firestore
  currency?: string; // Add currency for Firestore
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
  groupId?: string; // Optional group association
  createdAt?: Date; // Add createdAt for Firestore
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
  const [user, setUser] = useState<FirebaseUser | null>(null); // Use Firebase User type
  const [activeTab, setActiveTab] = useState<'expenses' | 'summary' | 'history'>('expenses');
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', amountOwed: 0, amountPaid: 0 },
  ]);
  const [expensesByGroup, setExpensesByGroup] = useState<Record<string, Expense[]>>({});
  const expenses = useMemo(() => Object.values(expensesByGroup).flat(), [expensesByGroup]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    paidBy: '1',
    splitType: 'equal' as 'equal' | 'unequal' | 'percentage',
    groupId: '' as string, // Group selection
  });
  const [expenseSplits, setExpenseSplits] = useState<Record<string, number>>({});
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
// Add this new state for tracking manual edits
  const [manuallyEditedParticipants, setManuallyEditedParticipants] = useState<Record<string, boolean>>({});

  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupParticipants, setGroupParticipants] = useState<Record<string, string[]>>({}); // Group ID -> participant IDs
  const [loading, setLoading] = useState(true); // Add loading state
  const [localToast, setLocalToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const expenseListenersRef = React.useRef<Record<string, () => void>>({});

  const showLocalToast = (message: string, type: 'success' | 'error') => {
    setLocalToast({ message, type });
    setTimeout(() => setLocalToast(null), 3000);
  };

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  // Combined data loading effect
  useEffect(() => {
    if (!user || !isOpen) {
      // Cleanup when modal closes or user logs out
      Object.values(expenseListenersRef.current).forEach(unsub => unsub());
      expenseListenersRef.current = {};
      setExpensesByGroup({});
      setGroups([]);
      setGroupParticipants({});
      setParticipants([{ id: '1', name: 'You', amountOwed: 0, amountPaid: 0 }]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const masterUnsubscribes: (() => void)[] = [];

    // 1. Load Global Participants
    const participantsQuery = query(collection(db, 'spenders', user.uid, 'billSplittingParticipants'));
    const unsubscribeParticipants = onSnapshot(participantsQuery, (snapshot) => {
      const firestoreParticipants: Participant[] = [{ id: '1', name: 'You', amountOwed: 0, amountPaid: 0 }];
      snapshot.forEach((doc) => {
        firestoreParticipants.push({ id: doc.id, name: doc.data().name, amountOwed: 0, amountPaid: 0 });
      });
      setParticipants(firestoreParticipants);
    });
    masterUnsubscribes.push(unsubscribeParticipants);

    // 2. Load Groups and set up expense listeners
    const groupsQuery = query(collection(db, 'spenders', user.uid, 'billSplittingGroups'));
    const unsubscribeGroups = onSnapshot(groupsQuery, (groupSnapshot) => {
      const firestoreGroups: Group[] = [];
      const newGroupParticipants: Record<string, string[]> = {};
      const currentGroupIds = groupSnapshot.docs.map(d => d.id);

      groupSnapshot.forEach(doc => {
        const data = doc.data();
        firestoreGroups.push({
          id: doc.id,
          name: data.name,
          participantIds: data.participantIds || [],
          createdAt: data.createdAt?.toDate(),
          currency: data.currency || '₹'
        });
        newGroupParticipants[doc.id] = data.participantIds || [];
      });
      setGroups(firestoreGroups);
      setGroupParticipants(newGroupParticipants);

      const currentListeners = expenseListenersRef.current;
      // Unsubscribe from deleted groups
      Object.keys(currentListeners).forEach(groupId => {
        if (!currentGroupIds.includes(groupId)) {
          currentListeners[groupId]();
          delete currentListeners[groupId];
          setExpensesByGroup(prev => {
            const next = { ...prev };
            delete next[groupId];
            return next;
          });
        }
      });

      // Subscribe to new groups
      currentGroupIds.forEach(groupId => {
        if (!currentListeners[groupId]) {
          const expensesQuery = query(collection(db, 'spenders', user.uid, 'billSplittingGroups', groupId, 'expenses'));
          currentListeners[groupId] = onSnapshot(expensesQuery, expenseSnapshot => {
            const groupExpenses: Expense[] = [];
            expenseSnapshot.forEach(expDoc => {
              const data = expDoc.data();
              groupExpenses.push({
                id: expDoc.id,
                description: data.description,
                amount: data.amount,
                paidBy: data.paidBy,
                splitType: data.splitType,
                splits: data.splits || [],
                date: data.date,
                groupId: groupId,
                createdAt: data.createdAt?.toDate()
              });
            });
            setExpensesByGroup(prev => ({ ...prev, [groupId]: groupExpenses }));
          });
        }
      });
      setLoading(false);
    });
    masterUnsubscribes.push(unsubscribeGroups);

    return () => {
      masterUnsubscribes.forEach(unsub => unsub());
      Object.values(expenseListenersRef.current).forEach(unsub => unsub());
      expenseListenersRef.current = {};
    };
  }, [user, isOpen]);

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

  const addParticipant = async () => {
    if (!newParticipantName.trim() || !user) {
      showLocalToast('Participant name cannot be empty.', 'error');
      return;
    }

    try {
      // Add participant to Firestore at the global level
      const participantRef = await addDoc(
        collection(db, 'spenders', user.uid, 'billSplittingParticipants'),
        {
          name: newParticipantName.trim(),
          createdAt: Timestamp.now()
        }
      );

      // Update local state
      const newParticipant: Participant = {
        id: participantRef.id,
        name: newParticipantName.trim(),
        amountOwed: 0,
        amountPaid: 0,
      };
      
      setParticipants([...participants, newParticipant]);
      setNewParticipantName('');
      setShowAddParticipant(false);
      showLocalToast('Participant added!', 'success');
    } catch (error) {
      console.error('Error adding participant:', error);
      showLocalToast('Error adding participant.', 'error');
    }
  };

  const removeParticipant = async (id: string) => {
    if (participants.length <= 1 || !user) return;

    try {
      // Remove participant from Firestore
      await deleteDoc(
        doc(db, 'spenders', user.uid, 'billSplittingParticipants', id)
      );

      // Update local state
      setParticipants(participants.filter(p => p.id !== id));
      
      // Also remove this participant from any expense splits
      // Note: A robust implementation would require updating all relevant expense documents in Firestore.
      // The current real-time setup will overwrite this client-only change on the next data sync.
      // setExpenses(expenses.map(expense => ({
      //   ...expense,
      //   splits: expense.splits.filter(split => split.participantId !== id)
      // })));
      
      // Update group participants mapping for all groups
      setGroupParticipants(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(groupId => {
          updated[groupId] = updated[groupId].filter(pid => pid !== id);
        });
        return updated;
      });
      showLocalToast('Participant removed.', 'success');
    } catch (error) {
      console.error('Error removing participant:', error);
      showLocalToast('Error removing participant.', 'error');
    }
  };

  // Group management functions
  const addGroup = async () => {
    if (!newGroupName.trim() || !user) {
      showLocalToast('Group name cannot be empty.', 'error');
      return;
    }
    
    try {
      // Add group to Firestore
      const groupRef = await addDoc(
        collection(db, 'spenders', user.uid, 'billSplittingGroups'),
        {
          name: newGroupName.trim(),
          participantIds: [],
          createdAt: Timestamp.now(),
          currency: '₹' // Default currency
        }
      );

      // Update local state
      const newGroup: Group = {
        id: groupRef.id,
        name: newGroupName.trim(),
        participantIds: [],
        createdAt: new Date(),
        currency: '₹'
      };
      
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setShowAddGroup(false);
      showLocalToast('Group added successfully!', 'success');
    } catch (error) {
      console.error('Error adding group:', error);
      showLocalToast('Error adding group.', 'error');
    }
  };

  const removeGroup = async (id: string) => {
    if (!user) return;
    
    try {
      // Remove group from Firestore
      await deleteDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', id)
      );

      // Update local state
      setGroups(groups.filter(group => group.id !== id));
      
      // If the removed group was selected, clear selection
      if (selectedGroup === id) {
        setSelectedGroup(null);
      }
      showLocalToast('Group removed.', 'success');
    } catch (error) {
      console.error('Error removing group:', error);
      showLocalToast('Error removing group.', 'error');
    }
  };

  const addParticipantToGroup = async (groupId: string, participantId: string) => {
    if (!user) return;
    
    try {
      // Update group in Firestore
      const currentParticipants = groupParticipants[groupId] || [];
      if (!currentParticipants.includes(participantId)) {
        await updateDoc(
          doc(db, 'spenders', user.uid, 'billSplittingGroups', groupId),
          {
            participantIds: [...currentParticipants, participantId]
          }
        );
        
        // Update local state
        setGroupParticipants({
          ...groupParticipants,
          [groupId]: [...currentParticipants, participantId]
        });
        showLocalToast('Participant added to group.', 'success');
      }
    } catch (error) {
      console.error('Error adding participant to group:', error);
      showLocalToast('Error adding participant to group.', 'error');
    }
  };

  const removeParticipantFromGroup = async (groupId: string, participantId: string) => {
    if (!user) return;
    
    try {
      // Update group in Firestore
      const currentParticipants = groupParticipants[groupId] || [];
      const updatedParticipants = currentParticipants.filter(id => id !== participantId);
      
      await updateDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', groupId),
        {
          participantIds: updatedParticipants
        }
      );
      
      // Update local state
      setGroupParticipants({
        ...groupParticipants,
        [groupId]: updatedParticipants
      });
      showLocalToast('Participant removed from group.', 'success');
    } catch (error) {
      console.error('Error removing participant from group:', error);
      showLocalToast('Error removing participant from group.', 'error');
    }
  };

  // Get participants for a specific group
  const getGroupParticipants = (groupId: string) => {
    const participantIds = groupParticipants[groupId] || [];
    return participants.filter(participant => participantIds.includes(participant.id));
  };

  // Get available participants for a group (not yet added to the group)
  const getAvailableParticipantsForGroup = (groupId: string) => {
    const participantIds = groupParticipants[groupId] || [];
    return participants.filter(participant => !participantIds.includes(participant.id));
  };

  const addExpense = async () => {
    if (!newExpense.description || !newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      showLocalToast('Please fill out the description and amount.', 'error');
      return;
    }
    if (!user) {
      showLocalToast('You must be logged in to add an expense.', 'error');
      return;
    }

    // Check if a group is selected
    const currentGroupId = newExpense.groupId || selectedGroup;
    if (!currentGroupId || currentGroupId === '') {
      showLocalToast('Please select a group to add the expense to.', 'error');
      return;
    }

    try {
      const amount = parseFloat(newExpense.amount);
      let splits: Expense['splits'] = [];

      // Filter participants to only include those in the selected group
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
        // For unequal and percentage splits, we'll use the expenseSplits state
        splits = groupParticipantsList.map(participant => {
          const splitValue = expenseSplits[participant.id] || 0;
          // For percentage splits, calculate the actual amount from the percentage
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

      // Create the expense data
      const expenseData = {
        description: newExpense.description,
        amount: amount,
        paidBy: newExpense.paidBy,
        splitType: newExpense.splitType,
        splits: splits,
        date: new Date().toISOString().split('T')[0],
        createdAt: Timestamp.now()
      };
      
      // Add expense to Firestore in the selected group's expenses collection
      await addDoc(
        collection(db, 'spenders', user.uid, 'billSplittingGroups', currentGroupId, 'expenses'),
        expenseData
      );

      showLocalToast('Expense added successfully!', 'success');
      
      resetExpenseForm();
    } catch (error) {
      console.error('Error adding expense:', error);
      showLocalToast('Error adding expense. Please try again.', 'error');
    }
  };

  const resetExpenseForm = () => {
    setNewExpense({
      description: '',
      amount: '',
      paidBy: participants[0]?.id || '1',
      splitType: 'equal',
      groupId: selectedGroup || '',
    });
    setExpenseSplits({});
  };

  const removeExpense = async (id: string) => {
    if (!user) return;
    
    // Find the expense to get its groupId
    const expense = expenses.find(e => e.id === id);
    if (!expense || !expense.groupId) return;
    
    try {
      // Remove expense from Firestore
      await deleteDoc(
        doc(db, 'spenders', user.uid, 'billSplittingGroups', expense.groupId, 'expenses', id)
      );

      // Update local state
      // The listener will automatically update the state.
      // setExpenses(expenses.filter(expense => expense.id !== id));
      showLocalToast('Expense removed.', 'success');
    } catch (error) {
      console.error('Error removing expense:', error);
      showLocalToast('Error removing expense.', 'error');
    }
  };

  // Filter expenses based on selected group
  const filteredExpenses = useMemo(() => {
    if (!selectedGroup) return expenses;
    return expenses.filter(expense => expense.groupId === selectedGroup);
  }, [expenses, selectedGroup]);

  const calculateSettlements = () => {
    const balances = participants.map(p => ({
      participant: p,
      balance: p.amountPaid - p.amountOwed,
    }));

    const debtors = balances.filter(item => item.balance < 0).map(item => ({...item})); // Create copies
    const creditors = balances.filter(item => item.balance > 0).map(item => ({...item})); // Create copies

    const settlements: { from: string; to: string; amount: number }[] = [];

    while (debtors.length > 0 && creditors.length > 0) {
      debtors.sort((a, b) => a.balance - b.balance);
      creditors.sort((a, b) => b.balance - a.balance);

      const debtor = debtors[0];
      const creditor = creditors[0];
      const amountToSettle = Math.min(Math.abs(debtor.balance), creditor.balance);

      if (amountToSettle < 0.01) {
          // If the amount is negligible, break to avoid infinite loops on floating point dust
          break;
      }

      settlements.push({
        from: debtor.participant.name,
        to: creditor.participant.name,
        amount: amountToSettle,
      });

      debtor.balance += amountToSettle;
      creditor.balance -= amountToSettle;

      if (Math.abs(debtor.balance) < 0.01) {
        debtors.shift();
      }
      if (creditor.balance < 0.01) {
        creditors.shift();
      }
    }

    return settlements;
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
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                      Bill Splitting
                    </h2>
                    <p className="text-sm text-blue-500 font-medium">*Split*wise within SpendWise 😉</p>
                  </div>
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
                {expenses.length > 0 && (
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] text-xs font-medium px-1.5 py-0.5 rounded-full">
                    {expenses.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-4 md:p-6">
              {loading ? (
                <div className="space-y-6 animate-pulse">
                  {/* Skeleton for Participants */}
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                  {/* Skeleton for Groups */}
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
                  {/* Skeleton for Add Expense */}
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Expenses Tab */}
                  {activeTab === 'expenses' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6 min-h-[500px]"
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

                      {/* Groups Section */}
                      <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5]">Groups</h3>
                          <motion.button
                            onClick={() => setShowAddGroup(true)}
                            className="flex items-center text-sm bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Group
                          </motion.button>
                        </div>
                        
                        {showAddGroup && (
                          <motion.div 
                            className="flex mb-3 space-x-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <input
                              type="text"
                              value={newGroupName}
                              onChange={(e) => setNewGroupName(e.target.value)}
                              placeholder="Group name"
                              className="flex-grow px-3 py-2 bg-white dark:bg-[#242424] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                              onKeyPress={(e) => e.key === 'Enter' && addGroup()}
                            />
                            <motion.button
                              onClick={addGroup}
                              className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Check className="h-4 w-4" />
                            </motion.button>
                            <motion.button
                              onClick={() => setShowAddGroup(false)}
                              className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <X className="h-4 w-4" />
                            </motion.button>
                          </motion.div>
                        )}
                        
                        {groups.length > 0 ? (
                          <div className="space-y-3">
                            {groups.map((group) => (
                              <div key={group.id} className="bg-white dark:bg-[#242424] rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                  <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">{group.name}</h4>
                                  <motion.button
                                    onClick={() => removeGroup(group.id)}
                                    className="text-red-500 hover:text-red-700"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </motion.button>
                                </div>
                                
                                <div className="mb-2">
                                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Participants in group:</h5>
                                  {getGroupParticipants(group.id).length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                      {getGroupParticipants(group.id).map((participant) => (
                                        <span 
                                          key={participant.id} 
                                          className="inline-flex items-center bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs"
                                        >
                                          {participant.name}
                                          <button 
                                            onClick={() => removeParticipantFromGroup(group.id, participant.id)}
                                            className="ml-1 text-blue-800 dark:text-blue-200 hover:text-red-500"
                                          >
                                            <X className="h-3 w-3" />
                                          </button>
                                        </span>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-gray-500 dark:text-[#888888]">No participants in this group</p>
                                  )}
                                </div>
                                
                                {getAvailableParticipantsForGroup(group.id).length > 0 && (
                                  <div>
                                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Add participants:</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {getAvailableParticipantsForGroup(group.id).map((participant) => (
                                        <motion.button
                                          key={participant.id}
                                          onClick={() => addParticipantToGroup(group.id, participant.id)}
                                          className="inline-flex items-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-[#F5F5F5] px-2 py-1 rounded-full text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                        >
                                          <Plus className="h-3 w-3 mr-1" />
                                          {participant.name}
                                        </motion.button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 dark:text-[#888888] text-sm">No groups created yet. Add a group to organize participants.</p>
                        )}
                      </div>

                      {/* Add Expense Form */}
                      <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 dark:text-[#F5F5F5] mb-3">
                          {editingExpenseId ? 'Edit Expense' : 'Add New Expense'}
                        </h3>
                        {/* Group Selection */}
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

                        {/* Split Details */}
                        {(newExpense.splitType === 'unequal' || newExpense.splitType === 'percentage') && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                              {newExpense.splitType === 'percentage' ? 'Percentage Split' : 'Amount Split'}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                              {(() => {
                                // Determine which participants to show based on group selection
                                const currentGroupId = newExpense.groupId || selectedGroup;
                                let participantsToShow = participants;
                                
                                // If a group is selected, filter participants to only show group members
                                if (currentGroupId) {
                                  const groupParticipantIds = groupParticipants[currentGroupId] || [];
                                  participantsToShow = participants.filter(participant => 
                                    participant.id === '1' || groupParticipantIds.includes(participant.id)
                                  );
                                }
                                
                                // Handle automatic percentage distribution
                                const handlePercentageChange = (participantId: string, value: string) => {
                                  if (newExpense.splitType !== 'percentage') return;
                                  
                                  const newValue = parseFloat(value) || 0;
                                  
                                  // Mark this participant as manually edited
                                  setManuallyEditedParticipants(prev => ({
                                    ...prev,
                                    [participantId]: true
                                  }));
                                  
                                  // Update the value for this participant
                                  const updatedSplits = {
                                    ...expenseSplits,
                                    [participantId]: newValue
                                  };
                                  
                                  // Calculate total of manually edited values
                                  const manuallyEditedIds = Object.keys(manuallyEditedParticipants)
                                    .filter(id => manuallyEditedParticipants[id] && id !== participantId);
                                  
                                  const manuallyEditedTotal = manuallyEditedIds.reduce(
                                    (sum, id) => sum + (updatedSplits[id] || 0), 
                                    0
                                  );
                                  
                                  // Add the current edited value
                                  const totalWithCurrent = manuallyEditedTotal + newValue;
                                  
                                  // Find participants that haven't been manually edited (excluding current)
                                  const autoParticipants = participantsToShow.filter(
                                    p => p.id !== participantId && !manuallyEditedParticipants[p.id]
                                  );
                                  
                                  // Distribute remaining percentage among auto participants
                                  if (autoParticipants.length > 0) {
                                    const remaining = Math.max(0, 100 - totalWithCurrent);
                                    const equalShare = remaining / autoParticipants.length;
                                    
                                    autoParticipants.forEach(p => {
                                      updatedSplits[p.id] = parseFloat(equalShare.toFixed(1));
                                    });
                                  }
                                  
                                  // Adjust if total exceeds 100
                                  const finalTotal = Object.values(updatedSplits).reduce((sum, val) => sum + val, 0);
                                  if (finalTotal > 100) {
                                    // Find the last manually edited participant (other than current) to adjust
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


                    </motion.div>
                  )}

                                {/* Summary Tab */}
                                {activeTab === 'summary' && (() => {
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
                                })()}
                  {/* History Tab */}
                  {activeTab === 'history' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6 min-h-[500px]"
                    >
                      {/* Group Filter */}
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
                      
                      {/* Expenses List */}
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
                  )}
                </>
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

            <AnimatePresence>
              {localToast && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg
                    ${localToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {localToast.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BillSplittingModal;