import React, { useState, useMemo } from 'react';
import { Goal, Transaction, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeInVariants, modalVariants } from '../../components/Common/AnimationVariants';
import {
  Plus, Target, Edit, Trash2, TrendingUp, Calendar,
  CheckCircle, ArrowRight, DollarSign, Wallet
} from 'lucide-react';
import GoalDetailsModal from './GoalDetailsModal';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import Tabs from '../Common/Tabs';
import AnimatedNumber from '../Common/AnimatedNumber';

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

// --- Helper Components ---

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const GoalHealthGauge: React.FC<{ current: number; target: number; currency: string }> = ({ current, target, currency }) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  
  const size = 200;
  const strokeWidth = 15;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center py-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle className="text-gray-200 dark:text-gray-700 transition-colors" strokeWidth={strokeWidth} stroke="currentColor" fill="transparent" r={radius} cx={size / 2} cy={size / 2} />
          <circle 
            style={{ stroke: '#10b981', strokeDasharray: circumference, strokeDashoffset: offset }} 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
            fill="transparent" 
            r={radius} 
            cx={size / 2} 
            cy={size / 2} 
            className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest">Saved</span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
            <AnimatedNumber value={current} currency={currency} decimals={0} />
          </span>
          <div className="h-px w-12 bg-gray-300 dark:bg-gray-600 my-2"></div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Target: <AnimatedNumber value={target} currency={currency} decimals={0} />
          </span>
        </div>
      </div>
      <div className="mt-6 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full text-sm font-bold flex items-center">
        <CheckCircle className="w-4 h-4 mr-2" />
        {Math.round(percentage)}% Achieved
      </div>
    </div>
  );
};

const GoalCard: React.FC<{ 
    goal: Goal; 
    currency: string; 
    onEdit: (g: Goal) => void; 
    onDelete: (id: string) => void;
    onAddFunds: (g: Goal) => void;
    onClick: () => void;
}> = ({ goal, currency, onEdit, onDelete, onAddFunds, onClick }) => {
    const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    const isCompleted = percentage >= 100;
    
    // Time remaining
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const monthsLeft = Math.max(0, (targetDate.getFullYear() - today.getFullYear()) * 12 + (targetDate.getMonth() - today.getMonth()));
    const daysLeft = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    // Required monthly
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    const monthlyReq = monthsLeft > 0 ? remainingAmount / monthsLeft : remainingAmount;

    return (
        <motion.div layout onClick={onClick}>
            <GlassCard className={`group cursor-pointer hover:shadow-2xl transition-all duration-300 border-l-4 ${isCompleted ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                            <span className="text-3xl filter drop-shadow-sm">{goal.emoji}</span>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white text-lg">{goal.name}</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" />
                                    Target: {new Date(goal.targetDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(goal); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 transition-colors"><Edit className="w-4 h-4"/></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-gray-700 dark:text-gray-300">{currency}{goal.currentAmount.toLocaleString()}</span>
                            <span className="text-gray-500 dark:text-gray-400">{currency}{goal.targetAmount.toLocaleString()}</span>
                        </div>
                        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div 
                                className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 1 }}
                            />
                        </div>
                    </div>

                    {!isCompleted && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                <p>Save <span className="font-bold text-gray-900 dark:text-white">{currency}{monthlyReq.toLocaleString(undefined, {maximumFractionDigits: 0})}</span> / mo</p>
                                <p>{monthsLeft > 0 ? `${monthsLeft} months left` : `${daysLeft} days left`}</p>
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); onAddFunds(goal); }}
                                className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Funds
                            </button>
                        </div>
                    )}
                </div>
            </GlassCard>
        </motion.div>
    );
};

// --- Analytics Charts ---

const GoalsProgressChart: React.FC<{ goals: Goal[]; currency: string }> = ({ goals, currency }) => {
    const data = goals.map(g => ({
        name: g.name,
        saved: g.currentAmount,
        remaining: Math.max(0, g.targetAmount - g.currentAmount),
        target: g.targetAmount
    }));

    if (data.length === 0) return <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No goals to display</div>;

    return (
        <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12, fill: '#9ca3af'}} axisLine={false} tickLine={false} />
                    <RechartsTooltip 
                        cursor={{fill: 'transparent'}}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                const savedPct = Math.round((d.saved / d.target) * 100);
                                const remainingPct = 100 - savedPct;
                                
                                return (
                                    <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-md text-sm z-50">
                                        <p className="font-bold text-gray-900 dark:text-white mb-2">{d.name}</p>
                                        <div className="space-y-1.5 min-w-[150px]">
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></div>
                                                    Saved
                                                </span>
                                                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                                    {currency}{d.saved.toLocaleString()} <span className="text-xs opacity-70">({savedPct}%)</span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center gap-4">
                                                <span className="text-gray-500 dark:text-gray-400 flex items-center">
                                                    <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></div>
                                                    Remaining
                                                </span>
                                                <span className="font-medium text-gray-600 dark:text-gray-300">
                                                    {currency}{d.remaining.toLocaleString()} <span className="text-xs opacity-70">({remainingPct}%)</span>
                                                </span>
                                            </div>
                                            <div className="pt-2 mt-1 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
                                                <span className="text-xs text-gray-400">Target</span>
                                                <span className="font-bold text-gray-900 dark:text-white">{currency}{d.target.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar dataKey="saved" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                    <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

// --- Main Page Component ---

const GoalsPage: React.FC<GoalsPageProps> = ({ goals, onAddGoal, onEditGoal, onDeleteGoal, onAddFunds, currency, transactions, accounts }) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState('progress');

  // Stats
  const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
  const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;

  const analyticsTabs = [
      { id: 'progress', label: 'Progress Overview' },
      // { id: 'timeline', label: 'Growth Timeline' }, // Placeholder for future implementation
  ];

  return (
    <motion.div 
      className="space-y-8 pb-20 relative"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Background Accent */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Financial Goals</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Visualize your dreams and track your savings journey.</p>
        </div>
        <button 
            onClick={onAddGoal}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
        >
            <Plus className="w-4 h-4" />
            <span>New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Health & Stats */}
        <div className="lg:col-span-4 space-y-6">
            <GlassCard className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Total Savings</h3>
                <GoalHealthGauge current={totalSaved} target={totalTarget} currency={currency} />
            </GlassCard>

            <GlassCard className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-bold uppercase mb-1">Active Goals</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{goals.length}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase mb-1">Completed</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedGoals}</p>
                    </div>
                </div>
            </GlassCard>
        </div>

        {/* RIGHT COLUMN: Analytics */}
        <div className="lg:col-span-8">
            <GlassCard className="p-6 h-full">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-emerald-500" />
                        Analytics
                    </h3>
                </div>
                <Tabs tabs={analyticsTabs} selectedTab={activeTab} onSelectTab={setActiveTab} />
                <div className="min-h-[220px]">
                    {activeTab === 'progress' && (
                        <GoalsProgressChart goals={goals} currency={currency} />
                    )}
                </div>
            </GlassCard>
        </div>
      </div>

      {/* BOTTOM SECTION: Goal Cards */}
      <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center px-1">
              <Target className="w-6 h-6 mr-2 text-emerald-500" />
              Your Goals
          </h3>
          
          {goals.length === 0 ? (
              <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No goals set yet. Start saving for something special!</p>
                  <button onClick={onAddGoal} className="mt-4 text-emerald-600 font-medium hover:underline">Create Goal</button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {goals.map((goal) => (
                      <GoalCard 
                          key={goal.id} 
                          goal={goal} 
                          currency={currency} 
                          onEdit={onEditGoal}
                          onDelete={onDeleteGoal}
                          onAddFunds={onAddFunds}
                          onClick={() => setSelectedGoal(goal)}
                      />
                  ))}
              </div>
          )}
      </div>

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
