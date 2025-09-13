import React, { useState, useEffect } from 'react';
import { Goal } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../components/Common/AnimationVariants';
import { X } from 'lucide-react';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id'>) => void;
  editingGoal?: Goal;
}

const GoalModal: React.FC<GoalModalProps> = ({ isOpen, onClose, onSave, editingGoal }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [targetDate, setTargetDate] = useState('');
  const [emoji, setEmoji] = useState('🎯');

  useEffect(() => {
    if (editingGoal) {
      setName(editingGoal.name);
      setTargetAmount(editingGoal.targetAmount);
      setCurrentAmount(editingGoal.currentAmount);
      setTargetDate(editingGoal.targetDate);
      setEmoji(editingGoal.emoji);
    } else {
      setName('');
      setTargetAmount(0);
      setCurrentAmount(0);
      setTargetDate('');
      setEmoji('🎯');
    }
  }, [editingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ name, targetAmount, currentAmount, targetDate, emoji });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">{editingGoal ? 'Edit Goal' : 'Add New Goal'}</h2>
              <button onClick={onClose} className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5]">
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="goal-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Goal Name</label>
                <input type="text" id="goal-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="goal-emoji" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Emoji</label>
                <input type="text" id="goal-emoji" value={emoji} onChange={(e) => setEmoji(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="goal-target-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount</label>
                <input type="number" id="goal-target-amount" value={targetAmount} onChange={(e) => setTargetAmount(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="goal-current-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Current Amount</label>
                <input type="number" id="goal-current-amount" value={currentAmount} onChange={(e) => setCurrentAmount(parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div>
                <label htmlFor="goal-target-date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Target Date</label>
                <input type="date" id="goal-target-date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white" required />
              </div>
              <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5]">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600">{editingGoal ? 'Save Changes' : 'Add Goal'}</button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalModal;
