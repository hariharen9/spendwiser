import React, { useState } from 'react';
import { Goal, Transaction, Account } from '../../types/types';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInVariants } from '../../components/Common/AnimationVariants';
import { Plus, Target } from 'lucide-react';
import GoalDetailsModal from './GoalDetailsModal';

interface GoalsPageProps {
  goals: Goal[];
  onAddGoal: () => void;
  onEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  onAddFunds: (goal: Goal) => void;
  currency: string;
  transactions: Transaction[];
  accounts: Account[];
}

const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onAddGoal, onEditGoal, onDeleteGoal, onAddFunds, currency, transactions, accounts }) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  return (
    <motion.div 
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.div 
        className="flex items-center justify-between"
        variants={fadeInVariants}
      >
        <h2 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">Your Goals</h2>
        <motion.button 
          onClick={onAddGoal}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="h-5 w-5"/>
          <span>New Goal</span>
        </motion.button>
      </motion.div>

      {goals.length === 0 ? (
        <motion.div 
          className="text-center py-12 bg-white dark:bg-[#242424] rounded-lg"
          variants={fadeInVariants}
        >
          <Target className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No goals yet</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new goal.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => (
            <motion.div 
              key={goal.id} 
              className="bg-white dark:bg-[#242424] rounded-lg shadow p-6 space-y-4 cursor-pointer"
              variants={fadeInVariants}
              onClick={() => setSelectedGoal(goal)}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{goal.emoji}</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{goal.name}</h3>
              </div>
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <motion.div 
                    className="bg-blue-500 h-2.5 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(goal.currentAmount / goal.targetAmount) * 100}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-500 dark:text-gray-400">
                  <span>{currency}{goal.currentAmount.toLocaleString()}</span>
                  <span>{currency}{goal.targetAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Target Date: {new Date(goal.targetDate).toLocaleDateString()}
              </div>
              <div className="flex space-x-2">
                <button onClick={(e) => {e.stopPropagation(); onAddFunds(goal)}} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm">Add Funds</button>
                <button onClick={(e) => {e.stopPropagation(); onEditGoal(goal)}} className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-1 rounded-lg text-sm">Edit</button>
                <button onClick={(e) => {e.stopPropagation(); onDeleteGoal(goal.id)}} className="bg-red-500 text-white px-3 py-1 rounded-lg text-sm">Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      <GoalDetailsModal 
        isOpen={selectedGoal !== null}
        onClose={() => setSelectedGoal(null)}
        goal={selectedGoal}
        transactions={transactions}
        accounts={accounts}
        currency={currency}
      />
    </motion.div>
  );
};
export default GoalsPage;
