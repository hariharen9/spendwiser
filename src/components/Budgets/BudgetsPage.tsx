import React, { useState } from 'react';
import { Target, TrendingUp, Plus, Edit, Trash2, X, DollarSign, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Budget, Transaction, TotalBudget } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants, cardHoverVariants, modalVariants } from '../../components/Common/AnimationVariants';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

interface BudgetsPageProps {
  budgets: Budget[];
  transactions: Transaction[];
  totalBudget: TotalBudget | null;
  onEditBudget: (budget: Budget) => void;
  onAddBudget: () => void;
  onDeleteBudget: (id: string) => void;
  onSaveTotalBudget: (limit: number) => void;
  onDeleteTotalBudget: () => void;
  currency: string;
}

// --- Premium Sub-components ---

const BudgetGauge: React.FC<{ 
  total: number; 
  spent: number; 
  currency: string; 
  onEdit: () => void;
}> = ({ total, spent, currency, onEdit }) => {
  const percentage = Math.min((spent / total) * 100, 100);
  const remaining = Math.max(0, total - spent);
  
  // Determine color based on usage
  const statusColor = percentage > 100 ? '#ef4444' : percentage > 85 ? '#f59e0b' : '#10b981';
  
  // Calculate stroke dashoffset for the semi-circle
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  // We only want a semi-circle (180 degrees), so we only show half the circumference
  const maxDash = circumference / 2; 
  const currentDash = maxDash - (maxDash * percentage) / 100;

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 rounded-3xl p-8 shadow-xl">
      {/* Background Gradient */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Activity size={20} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Monthly Cap</span>
          </div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
            {currency}{remaining.toLocaleString()}
            <span className="text-lg font-medium text-gray-400 ml-2">left</span>
          </h2>
          <p className="text-sm font-medium text-gray-500">
            You've spent <span className="text-gray-900 dark:text-white font-bold">{currency}{spent.toLocaleString()}</span> of your {currency}{total.toLocaleString()} limit.
          </p>
          <button 
            onClick={onEdit}
            className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-bold transition-all"
          >
            Adjust Limit
          </button>
        </div>

        {/* The Gauge */}
        <div className="relative w-64 h-32 flex justify-center overflow-hidden">
           <svg className="w-full h-full" viewBox="0 0 200 100">
             {/* Track */}
             <path 
               d="M 20 100 A 80 80 0 0 1 180 100" 
               fill="none" 
               stroke="currentColor" 
               strokeWidth="12" 
               strokeLinecap="round"
               className="text-gray-100 dark:text-gray-800"
             />
             {/* Progress */}
             <path 
               d="M 20 100 A 80 80 0 0 1 180 100" 
               fill="none" 
               stroke={statusColor} 
               strokeWidth="12" 
               strokeLinecap="round"
               strokeDasharray={maxDash * 2} // Use full circumference for calculation logic
               strokeDashoffset={maxDash + currentDash} // Offset to hide the right part correctly? 
               // Actually simpler SVG logic for semi circle:
               // Total length is roughly 251. 
             />
             {/* Re-doing the path for simpler React control */}
             <path 
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke={statusColor}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={251.2} // Pi * 80
                strokeDashoffset={251.2 * (1 - (percentage / 100))}
                className="transition-all duration-1000 ease-out"
             />
           </svg>
           
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
             <span className="text-3xl font-black text-gray-900 dark:text-white" style={{ color: statusColor }}>
               {Math.round(percentage)}%
             </span>
           </div>
        </div>
      </div>
    </div>
  );
};

const LiquidBudgetCard: React.FC<{
  budget: Budget;
  spent: number;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  transactions: Transaction[]; // Pass transactions for sparkline
}> = ({ budget, spent, currency, onEdit, onDelete, transactions }) => {
  const percentage = Math.min((spent / budget.limit) * 100, 100);
  const isOver = spent > budget.limit;
  const isDanger = percentage > 85;
  
  // Theme based on status
  const theme = isOver 
    ? 'from-red-500 to-rose-600' 
    : isDanger 
      ? 'from-amber-400 to-orange-500' 
      : 'from-emerald-400 to-teal-500';
      
  const bgTheme = isOver 
    ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30' 
    : 'bg-white dark:bg-[#1A1A1A] border-gray-100 dark:border-gray-800';

  // Calculate sparkline data (last 30 days spending for this category)
  const sparklineData = React.useMemo(() => {
    const data = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dayStr = d.toISOString().split('T')[0];
        
        const daySpend = transactions
            .filter(t => t.category === budget.category && t.date === dayStr && t.type === 'expense')
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
            
        data.push({ day: i, amount: daySpend });
    }
    return data;
  }, [transactions, budget.category]);

  return (
    <motion.div 
      className={`relative overflow-hidden rounded-2xl border ${bgTheme} transition-all duration-300 group hover:shadow-lg`}
      whileHover={{ y: -4 }}
    >
      {/* Liquid Fill Background Animation */}
      <div 
        className={`absolute bottom-0 left-0 w-full bg-gradient-to-t ${theme} opacity-10 transition-all duration-1000`}
        style={{ height: `${percentage}%` }}
      ></div>
      
      <div className="relative p-5 z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{budget.category}</h3>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {currency}{budget.limit.toLocaleString()} Limit
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={onEdit} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-500">
              <Edit size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="flex items-end justify-between mb-4">
          <div>
            <span className={`text-2xl font-black ${isOver ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {currency}{spent.toLocaleString()}
            </span>
            {isOver && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase mt-1">
                <AlertTriangle size={12} />
                <span>Over Limit</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-gray-400">Remaining</span>
            <p className={`font-bold ${isOver ? 'text-red-500' : 'text-emerald-500'}`}>
              {currency}{Math.max(0, budget.limit - spent).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mb-4">
          <motion.div 
            className={`h-full rounded-full bg-gradient-to-r ${theme}`}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>

        {/* Sparkline */}
        <div className="h-10 w-full opacity-50">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                    <defs>
                        <linearGradient id={`gradient-${budget.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area 
                        type="monotone" 
                        dataKey="amount" 
                        stroke={isOver ? '#ef4444' : '#6366f1'} 
                        strokeWidth={2} 
                        fill={`url(#gradient-${budget.id})`} 
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};

const BudgetsPage: React.FC<BudgetsPageProps> = ({ 
  budgets, 
  transactions, 
  totalBudget,
  onEditBudget, 
  onAddBudget, 
  onDeleteBudget, 
  onSaveTotalBudget,
  onDeleteTotalBudget,
  currency 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showTotalBudgetModal, setShowTotalBudgetModal] = useState(false);
  const [totalBudgetInput, setTotalBudgetInput] = useState('');

  const handleConfirmDeleteBudget = (id: string) => {
    onDeleteBudget(id);
    setShowDeleteConfirm(null);
  };

  const handleSaveTotalBudget = () => {
    const limit = parseFloat(totalBudgetInput);
    if (!isNaN(limit) && limit > 0) {
      onSaveTotalBudget(limit);
      setShowTotalBudgetModal(false);
      setTotalBudgetInput('');
    }
  };

  const handleDeleteTotalBudget = () => {
    onDeleteTotalBudget();
    setShowTotalBudgetModal(false);
  };

  // Calculate monthly expenses for total budget
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyExpenses = transactions
    .filter(t => {
      const txDate = new Date(t.date);
      return t.type === 'expense' && 
             txDate.toISOString().slice(0, 7) === currentMonth;
    })
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  // Safe to Spend Calculation
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, daysInMonth - today.getDate());
  const remainingBudget = totalBudget ? Math.max(0, totalBudget.limit - monthlyExpenses) : 0;
  const dailySafeSpend = remainingBudget / daysRemaining;

  return (
    <motion.div 
      className="space-y-8 pb-20"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Control Center</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">Monitor limits and spending velocity.</p>
        </div>
        <motion.button 
          onClick={onAddBudget}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center space-x-2 shadow-lg shadow-blue-500/20 transition-all font-bold"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="h-5 w-5"/>
          <span>New Budget</span>
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: The Gauge & Daily Safe */}
        <div className="lg:col-span-2 space-y-6">
          {totalBudget ? (
            <BudgetGauge 
              total={totalBudget.limit} 
              spent={monthlyExpenses} 
              currency={currency} 
              onEdit={() => setShowTotalBudgetModal(true)}
            />
          ) : (
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl p-8 text-white flex flex-col items-start justify-center shadow-xl h-64">
              <ShieldCheck size={48} className="mb-4 opacity-50" />
              <h2 className="text-2xl font-bold mb-2">Set a Monthly Cap</h2>
              <p className="opacity-80 mb-6 max-w-md">Take control of your finances by setting a global spending limit for the month.</p>
              <button 
                onClick={() => setShowTotalBudgetModal(true)}
                className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors"
              >
                Set Total Budget
              </button>
            </div>
          )}

          {totalBudget && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex items-center gap-4">
                   <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl">
                      <DollarSign size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Daily Safe-to-Spend</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">{currency}{dailySafeSpend.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
                   </div>
                </div>
                <div className="bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-800 p-5 rounded-2xl flex items-center gap-4">
                   <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl">
                      <Target size={24} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Days Remaining</p>
                      <p className="text-xl font-black text-gray-900 dark:text-white">{daysRemaining} Days</p>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Right Column: Budget Breakdown Grid */}
        <div className="lg:col-span-3">
           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
             <TrendingUp size={20} className="text-blue-500" />
             Category Envelopes
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {budgets.map(budget => {
                 const categorySpent = transactions
                    .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(currentMonth))
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                 
                 return (
                    <LiquidBudgetCard 
                       key={budget.id}
                       budget={budget}
                       spent={categorySpent}
                       currency={currency}
                       onEdit={() => onEditBudget(budget)}
                       onDelete={() => setShowDeleteConfirm(budget.id)}
                       transactions={transactions}
                    />
                 );
              })}
              
              {budgets.length === 0 && (
                 <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl">
                    <p className="text-gray-400 font-medium">No category budgets set yet.</p>
                 </div>
              )}
           </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTotalBudgetModal && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowTotalBudgetModal(false)}
          >
            <motion.div 
              className="bg-white dark:bg-[#242424] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {totalBudget ? 'Edit Monthly Cap' : 'Set Monthly Cap'}
                </h3>
                <button 
                  onClick={() => setShowTotalBudgetModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                    Monthly Limit ({currency})
                  </label>
                  <input
                    type="number"
                    value={totalBudgetInput}
                    onChange={(e) => setTotalBudgetInput(e.target.value)}
                    placeholder={totalBudget ? totalBudget.limit.toString() : "e.g. 5000"}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-bold text-gray-900 dark:text-white"
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  {totalBudget && (
                    <button 
                      onClick={handleDeleteTotalBudget}
                      className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                  <button 
                    onClick={handleSaveTotalBudget}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all"
                  >
                    Save Limit
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div 
              className="bg-white dark:bg-[#242424] rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-gray-200 dark:border-gray-700"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Budget?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                This will remove the tracking for this category. Transactions won't be deleted.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleConfirmDeleteBudget(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default BudgetsPage;