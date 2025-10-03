import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Users, Plus, Minus, Edit3, Trash2, Save, Calculator, Share2, History, PieChart, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import { auth } from '../../firebaseConfig';
import { User as FirebaseUser } from 'firebase/auth';

import { useBillSplittingData } from '../../hooks/useBillSplittingData';
import ParticipantManager from '../BillSplitting/ParticipantManager.tsx';
import GroupManager from '../BillSplitting/GroupManager';
import ExpenseForm from '../BillSplitting/ExpenseForm';
import SummaryView from '../BillSplitting/SummaryView';
import HistoryView from '../BillSplitting/HistoryView';

interface BillSplittingModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
  onBack?: () => void;
}

const BillSplittingModal: React.FC<BillSplittingModalProps> = ({ 
  isOpen, 
  onClose, 
  isMobile = false,
  onBack 
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [activeTab, setActiveTab] = useState<'expenses' | 'summary' | 'history'>('expenses');
  const [localToast, setLocalToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  const { participants, setParticipants, groups, expenses, loading, groupParticipants, setGroupParticipants } = useBillSplittingData(user, isOpen);

  const showLocalToast = (message: string, type: 'success' | 'error') => {
    setLocalToast({ message, type });
    setTimeout(() => setLocalToast(null), 3000);
  };

  const calculateSettlements = () => {
    const balances = participants.map(p => ({
      participant: p,
      balance: p.amountPaid - p.amountOwed,
    }));

    const debtors = balances.filter(item => item.balance < 0).map(item => ({...item}));
    const creditors = balances.filter(item => item.balance > 0).map(item => ({...item}));

    const settlements: { from: string; to: string; amount: number }[] = [];

    while (debtors.length > 0 && creditors.length > 0) {
      debtors.sort((a, b) => a.balance - b.balance);
      creditors.sort((a, b) => b.balance - a.balance);

      const debtor = debtors[0];
      const creditor = creditors[0];
      const amountToSettle = Math.min(Math.abs(debtor.balance), creditor.balance);

      if (amountToSettle < 0.01) {
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

            <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button
                className={`flex-1 py-4 px-2 text-center font-medium text-sm md:text-base flex items-center justify-center space-x-2 ${activeTab === 'expenses' ? 'text-[#007BFF] border-b-2 border-[#007BFF]' : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'}`}
                onClick={() => setActiveTab('expenses')}
              >
                <Calculator className="h-4 w-4" />
                <span>Expenses</span>
              </button>
              <button
                className={`flex-1 py-4 px-2 text-center font-medium text-sm md:text-base flex items-center justify-center space-x-2 ${activeTab === 'summary' ? 'text-[#007BFF] border-b-2 border-[#007BFF]' : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'}`}
                onClick={() => setActiveTab('summary')}
              >
                <PieChart className="h-4 w-4" />
                <span>Summary</span>
              </button>
              <button
                className={`flex-1 py-4 px-2 text-center font-medium text-sm md:text-base flex items-center justify-center space-x-2 ${activeTab === 'history' ? 'text-[#007BFF] border-b-2 border-[#007BFF]' : 'text-gray-500 dark:text-[#888888] hover:text-gray-700 dark:hover:text-[#F5F5F5]'}`}
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

            <div className="flex-grow overflow-y-auto p-4 md:p-6">
              {loading ? (
                <div className="space-y-6 animate-pulse">
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                      <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4">
                    <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                  </div>
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
                  {activeTab === 'expenses' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="space-y-6 min-h-[500px]"
                    >
                      <ParticipantManager participants={participants} setParticipants={setParticipants} user={user} showToast={showLocalToast} />
                      <GroupManager groups={groups} participants={participants} groupParticipants={groupParticipants} setGroupParticipants={setGroupParticipants} user={user} showToast={showLocalToast} />
                      <ExpenseForm user={user} participants={participants} groups={groups} groupParticipants={groupParticipants} selectedGroup={null} showToast={showLocalToast} />
                    </motion.div>
                  )}

                  {activeTab === 'summary' && (
                    <SummaryView participants={participants} expenses={expenses} calculateSettlements={calculateSettlements} />
                  )}

                  {activeTab === 'history' && (
                    <HistoryView expenses={expenses} groups={groups} participants={participants} user={user} showToast={showLocalToast} />
                  )}
                </>
              )}
            </div>

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
                  className={`absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg ${localToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
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
