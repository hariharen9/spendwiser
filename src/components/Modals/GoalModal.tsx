import React, { useState, useEffect } from 'react';
import { Goal } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../components/Common/AnimationVariants';
import { X, Target, Calendar, TrendingUp, PiggyBank, Flag } from 'lucide-react';

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
  const [monthlySavings, setMonthlySavings] = useState(0);

  // Calculate monthly savings needed
  useEffect(() => {
    if (targetAmount > 0 && currentAmount >= 0 && targetDate) {
      const today = new Date();
      const target = new Date(targetDate);
      const timeDiff = target.getTime() - today.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      
      if (daysDiff > 0) {
        const monthsDiff = Math.ceil(daysDiff / 30);
        const amountNeeded = targetAmount - currentAmount;
        const monthly = Math.max(0, amountNeeded / monthsDiff);
        setMonthlySavings(parseFloat(monthly.toFixed(2)));
      } else {
        setMonthlySavings(0);
      }
    } else {
      setMonthlySavings(0);
    }
  }, [targetAmount, currentAmount, targetDate]);

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

  // Calculate progress percentage
  const progressPercentage = targetAmount > 0 ? Math.min(100, (currentAmount / targetAmount) * 100) : 0;

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
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-md shadow-2xl"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5] flex items-center">
                <Target className="mr-2 h-6 w-6 text-blue-500" />
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h2>
              <button 
                onClick={onClose} 
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <label htmlFor="goal-name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <Flag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Goal Name
                  </label>
                  <input 
                    type="text" 
                    id="goal-name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                    placeholder="e.g., Vacation Fund, New Car"
                    required 
                  />
                </div>
                
                <div className="relative">
                  <label htmlFor="goal-emoji" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Emoji
                  </label>
                  <input 
                    type="text" 
                    id="goal-emoji" 
                    value={emoji} 
                    onChange={(e) => setEmoji(e.target.value)} 
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                    placeholder="🎯"
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <label htmlFor="goal-target-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                        <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Target Amount
                    </label>
                    <input 
                      type="number" 
                      id="goal-target-amount" 
                      value={targetAmount || ''} 
                      onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)} 
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required 
                    />
                  </div>
                  
                  <div className="relative">
                    <label htmlFor="goal-current-amount" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                      <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                        <PiggyBank className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      </span>
                      Current Amount
                    </label>
                    <input 
                      type="number" 
                      id="goal-current-amount" 
                      value={currentAmount || ''} 
                      onChange={(e) => setCurrentAmount(parseFloat(e.target.value) || 0)} 
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required 
                    />
                  </div>
                </div>
                
                {/* Progress visualization */}
                {targetAmount > 0 && (
                  <div className="relative">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="relative">
                  <label htmlFor="goal-target-date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center">
                    <span className="bg-blue-100 dark:bg-blue-900/50 p-1 rounded mr-2">
                      <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </span>
                    Target Date
                  </label>
                  <input 
                    type="date" 
                    id="goal-target-date" 
                    value={targetDate} 
                    onChange={(e) => setTargetDate(e.target.value)} 
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-3 px-4 transition-all" 
                    required 
                  />
                </div>
                
                {/* Monthly savings projection */}
                {monthlySavings > 0 && targetDate && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center">
                      <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
                      <h3 className="font-semibold text-blue-800 dark:text-blue-200">Savings Recommendation</h3>
                    </div>
                    <p className="mt-2 text-blue-700 dark:text-blue-300">
                      To reach your goal on time, save <span className="font-bold">₹{monthlySavings.toFixed(2)}</span> per month.
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="px-5 py-2.5 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center shadow-md hover:shadow-lg"
                >
                  {editingGoal ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GoalModal;