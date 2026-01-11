import React, { useState } from 'react';
import { Goal, Transaction, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInVariants } from '../../components/Common/AnimationVariants';
import { Plus, Target, Trophy, Clock, Sparkles } from 'lucide-react';
import GoalDetailsModal from './GoalDetailsModal';
import confetti from 'canvas-confetti';

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

const GoalToken: React.FC<{
  goal: Goal;
  currency: string;
  onClick: () => void;
  onAddFunds: (e: React.MouseEvent) => void;
}> = ({ goal, currency, onClick, onAddFunds }) => {
  const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  const isCompleted = percentage >= 100;
  
  // Calculate time remaining
  const today = new Date();
  const targetDate = new Date(goal.targetDate);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // Theme based on progress
  const gradient = isCompleted 
    ? 'from-yellow-300 via-amber-400 to-yellow-500' // Gold
    : percentage > 75 
      ? 'from-slate-300 via-slate-400 to-slate-500' // Silver
      : percentage > 50
        ? 'from-orange-300 via-orange-400 to-orange-500' // Bronze
        : 'from-blue-400 via-blue-500 to-indigo-600'; // Standard Blue

  const handleMouseEnter = () => {
    if (isCompleted) {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#FFD700', '#F59E0B', '#FFFFFF'],
        disableForReducedMotion: true
      });
    }
  };

  return (
    <motion.div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`relative overflow-hidden rounded-3xl cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 group bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800`}
    >
      {/* Background Liquid/Progress */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-gray-900/50"></div>
      <motion.div 
        className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${gradient} opacity-20`}
        initial={{ height: 0 }}
        animate={{ height: `${percentage}%` }}
        transition={{ duration: 1.5, ease: "circOut" }}
      />

      <div className="relative p-6 z-10 flex flex-col h-full min-h-[220px]">
        <div className="flex justify-between items-start">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center text-2xl border border-gray-100 dark:border-gray-700">
            {goal.emoji || '🎯'}
          </div>
          {isCompleted && (
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full">
              <Trophy size={20} className="fill-current" />
            </div>
          )}
        </div>

        <div className="mt-4 flex-grow">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {goal.name}
          </h3>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Clock size={12} />
            {diffDays > 0 ? `${diffDays} days left` : 'Target date passed'}
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Saved</span>
              <p className="text-2xl font-black text-gray-900 dark:text-white">
                {currency}{goal.currentAmount.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Target</span>
              <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
                {currency}{goal.targetAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
              {Math.round(percentage)}% Complete
            </span>
            <button
              onClick={onAddFunds}
              className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1"
            >
              <Plus size={12} />
              Add Funds
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const GoalsPage: React.FC<GoalsPageProps> = ({ 
  goals, 
  onAddGoal, 
  onEditGoal, 
  onDeleteGoal, 
  onAddFunds, 
  currency, 
  transactions, 
  accounts 
}) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  // Calculate total savings across all goals
  const totalSavings = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalPercentage = totalTarget > 0 ? (totalSavings / totalTarget) * 100 : 0;

  return (
    <motion.div 
      className="space-y-8 pb-20"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">The Vault</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Track your dreams and milestones.</p>
        </div>
        <motion.button 
          onClick={onAddGoal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-all font-bold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5"/>
          <span>New Goal</span>
        </motion.button>
      </div>

      {goals.length > 0 && (
        <motion.div 
          variants={fadeInVariants}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 opacity-10">
            <Sparkles size={200} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-2">Total Savings</h2>
              <p className="text-5xl font-black">{currency}{totalSavings.toLocaleString()}</p>
              <p className="opacity-80 mt-2 font-medium">
                You've reached {Math.round(totalPercentage)}% of your lifetime targets!
              </p>
            </div>
            <div className="w-32 h-32 relative flex items-center justify-center">
               <svg className="w-full h-full -rotate-90">
                 <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none" className="text-white/20" />
                 <motion.circle 
                   cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="none"
                   strokeDasharray={351}
                   initial={{ strokeDashoffset: 351 }}
                   animate={{ strokeDashoffset: 351 - (351 * totalPercentage) / 100 }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                   className="text-white drop-shadow-lg"
                   strokeLinecap="round"
                 />
               </svg>
               <Trophy size={32} className="absolute text-white" />
            </div>
          </div>
        </motion.div>
      )}

      {goals.length === 0 ? (
        <motion.div 
          className="text-center py-20 bg-white dark:bg-[#1A1A1A] rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800"
          variants={fadeInVariants}
        >
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <Target className="h-10 w-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Start Dreaming</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto font-medium">
            Create your first financial goal to start tracking your progress towards what matters.
          </p>
          <button 
            onClick={onAddGoal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all"
          >
            Create Goal
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {goals.map(goal => (
            <GoalToken 
              key={goal.id} 
              goal={goal} 
              currency={currency}
              onClick={() => setSelectedGoal(goal)}
              onAddFunds={(e) => {
                e.stopPropagation();
                onAddFunds(goal);
              }}
            />
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
        onEdit={(goal) => {
          setSelectedGoal(null);
          onEditGoal(goal);
        }}
        onDelete={(id) => {
          setSelectedGoal(null);
          onDeleteGoal(id);
        }}
      />
    </motion.div>
  );
};

export default GoalsPage;