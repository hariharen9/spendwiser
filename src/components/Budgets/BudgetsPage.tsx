import React, { useState, useMemo } from 'react';
import { 
  Target, TrendingUp, Plus, Edit, Trash2, X, DollarSign, 
  PieChart as PieChartIcon, Activity, Calendar, AlertTriangle, CheckCircle, 
  TrendingDown, ArrowUpRight, ArrowDownRight, Search
} from 'lucide-react';
import { Budget, Transaction, TotalBudget } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants, modalVariants } from '../../components/Common/AnimationVariants';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import Tabs from '../Common/Tabs';

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

// --- Helper Components ---

const GlassCard: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white/70 dark:bg-gray-900/60 backdrop-blur-md border border-white/20 dark:border-gray-700/30 shadow-xl rounded-2xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const BudgetHealthGauge: React.FC<{ spent: number; limit: number; currency: string }> = ({ spent, limit, currency }) => {
  const percentage = Math.min((spent / limit) * 100, 100);
  const isOver = spent > limit;
  const isWarning = spent > limit * 0.85;
  const color = isOver ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
  
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
          <circle style={{ stroke: color, strokeDasharray: circumference, strokeDashoffset: offset }} strokeWidth={strokeWidth} strokeLinecap="round" fill="transparent" r={radius} cx={size / 2} cy={size / 2} className="transition-all duration-1000 ease-out" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-widest">Spent</span>
          <span className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{currency}{spent.toLocaleString()}</span>
          <div className="h-px w-12 bg-gray-300 dark:bg-gray-600 my-2"></div>
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">of {currency}{limit.toLocaleString()}</span>
        </div>
      </div>
      <div className={`mt-6 px-4 py-1.5 rounded-full text-sm font-bold border flex items-center ${isOver ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800' : isWarning ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'}`}>
        {isOver ? <AlertTriangle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
        {isOver ? 'Over Budget' : isWarning ? 'Nearing Limit' : 'On Track'}
      </div>
    </div>
  );
};

const BudgetCard: React.FC<{ 
    budget: Budget; 
    transactions: Transaction[]; 
    currency: string; 
    onEdit: (b: Budget) => void; 
    onDelete: (id: string) => void;
}> = ({ budget, transactions, currency, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const currentMonthStr = new Date().toISOString().slice(0, 7);
    
    // Transactions for this budget this month
    const categoryTransactions = useMemo(() => 
        transactions
            .filter(t => t.type === 'expense' && t.category === budget.category && t.date.startsWith(currentMonthStr))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [transactions, budget.category, currentMonthStr]);

    const spent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const pct = Math.min((spent / budget.limit) * 100, 100);
    const isOver = spent > budget.limit;
    const isNear = pct > 85;

    // Outlier logic (largest single transaction)
    const outlier = categoryTransactions.length > 0 
        ? categoryTransactions.reduce((max, t) => Math.abs(t.amount) > Math.abs(max.amount) ? t : max, categoryTransactions[0])
        : null;

    return (
        <motion.div layout>
            <GlassCard 
                className={`group transition-all duration-300 border-l-4 ${isOver ? 'border-l-red-500' : isNear ? 'border-l-amber-500' : 'border-l-blue-500'} cursor-pointer hover:shadow-2xl`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg flex items-center">
                                {budget.category}
                                {isExpanded && <span className="ml-2 text-[10px] bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">DETAILS</span>}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Limit: {currency}{budget.limit.toLocaleString()}</p>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={(e) => { e.stopPropagation(); onEdit(budget); }} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500 transition-colors"><Edit className="w-4 h-4"/></button>
                            <button onClick={(e) => { e.stopPropagation(); onDelete(budget.id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-red-500 transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                        <motion.div 
                            className={`absolute top-0 left-0 h-full rounded-full ${isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-blue-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1 }}
                        />
                    </div>

                    <div className="flex justify-between items-end text-sm">
                        <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                            {currency}{spent.toLocaleString()}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 font-medium">
                            {Math.round(pct)}%
                        </span>
                    </div>

                    {/* Expanded Content */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="pt-4 mt-4 border-t border-gray-200/50 dark:border-gray-700/50 space-y-4">
                                    
                                    {/* Metrics Row */}
                                    {outlier && (
                                        <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-gray-200/50 dark:border-gray-700/30 flex justify-between items-center shadow-inner">
                                            <div>
                                                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Largest Single Expense</p>
                                                <span className="text-lg font-bold text-gray-900 dark:text-white">{currency}{Math.abs(outlier.amount).toLocaleString()}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 mb-1">Date</p>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{new Date(outlier.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Recent Transactions */}
                                    <div>
                                        <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 px-1">Recent Activity</p>
                                        {categoryTransactions.length > 0 ? (
                                            <div className="space-y-1">
                                                {categoryTransactions.slice(0, 3).map(t => (
                                                    <div key={t.id} className="flex justify-between items-center text-sm p-2.5 hover:bg-white/50 dark:hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/20 dark:hover:border-white/5">
                                                        <div className="flex items-center space-x-3 overflow-hidden">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 dark:bg-blue-400/50 flex-shrink-0 shadow-sm shadow-blue-500/20"></div>
                                                            <span className="truncate text-gray-700 dark:text-gray-300 font-medium">{t.name}</span>
                                                        </div>
                                                        <span className="font-bold text-gray-900 dark:text-white flex-shrink-0 tracking-tight">{currency}{Math.abs(t.amount).toLocaleString()}</span>
                                                    </div>
                                                ))}
                                                {categoryTransactions.length > 3 && (
                                                    <div className="pt-2 text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tighter">
                                                        +{categoryTransactions.length - 3} more transactions
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 bg-gray-50/50 dark:bg-black/10 rounded-xl border border-dashed border-gray-200 dark:border-gray-800">
                                                <p className="text-xs text-gray-400 italic">No transactions this month</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </GlassCard>
        </motion.div>
    );
};

// --- Analytics Charts ---

const DailySpendChart: React.FC<{ transactions: Transaction[]; currency: string }> = ({ transactions, currency }) => {
  const data = useMemo(() => {
    const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => ({
      day: (i + 1).toString(),
      spent: 0
    }));

    const currentMonth = new Date().toISOString().slice(0, 7);
    transactions.forEach(t => {
      if (t.type === 'expense' && t.date.startsWith(currentMonth)) {
        const day = parseInt(t.date.split('-')[2]) - 1;
        if (days[day]) days[day].spent += Math.abs(t.amount);
      }
    });

    return days;
  }, [transactions]);

  return (
    <div className="h-56 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} stroke="#9ca3af" interval={2} />
          <YAxis axisLine={false} tickLine={false} fontSize={10} stroke="#9ca3af" tickFormatter={(val) => `${val/1000}k`} />
          <RechartsTooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '8px', border: 'none', fontSize: '12px' }}
            formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Spent']}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Bar dataKey="spent" fill="#8b5cf6" radius={[2, 2, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const SpendingTrendChart: React.FC<{ transactions: Transaction[]; budgetLimit: number; currency: string }> = ({ transactions, budgetLimit, currency }) => {
  const data = useMemo(() => {
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        name: d.toLocaleString('default', { month: 'short' }),
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        spent: 0,
        budget: budgetLimit
      };
    });

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const tDate = t.date.slice(0, 7);
        const monthData = last6Months.find(m => m.key === tDate);
        if (monthData) monthData.spent += Math.abs(t.amount);
      }
    });

    return last6Months;
  }, [transactions, budgetLimit]);

  return (
    <div className="h-56 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" />
          <YAxis axisLine={false} tickLine={false} fontSize={12} stroke="#9ca3af" tickFormatter={(val) => `${val/1000}k`} />
          <RechartsTooltip 
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
            itemStyle={{ color: '#1f2937' }}
            formatter={(value: number) => [`${currency}${value.toLocaleString()}`, 'Spent']}
          />
          <Area type="monotone" dataKey="spent" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSpent)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const CategoryDistributionChart: React.FC<{ budgets: Budget[]; transactions: Transaction[]; currency: string }> = ({ budgets, transactions, currency }) => {
  const data = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return budgets.map(b => {
      const spent = transactions
        .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(currentMonth))
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      return { name: b.category, value: spent, limit: b.limit };
    }).filter(d => d.value > 0).sort((a, b) => b.value - a.value);
  }, [budgets, transactions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (data.length === 0) return <div className="h-56 flex items-center justify-center text-gray-400 text-sm">No spending data this month</div>;

  return (
    <div className="h-56 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
            ))}
          </Pie>
          <RechartsTooltip 
             content={({ active, payload }) => {
                if (active && payload && payload.length) {
                   const d = payload[0].payload;
                   const spent = d.value;
                   const limit = d.limit;
                   const remaining = limit - spent;
                   const spentPct = Math.round((spent / limit) * 100);
                   const remainingPct = Math.round((remaining / limit) * 100); 
                   
                   return (
                      <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 backdrop-blur-md text-sm">
                         <p className="font-bold text-gray-900 dark:text-white mb-2">{d.name}</p>
                         <div className="space-y-1.5">
                            <div className="flex justify-between items-center gap-4">
                               <span className="text-gray-500 dark:text-gray-400">Spent</span>
                               <span className="font-medium text-gray-900 dark:text-white">
                                  {currency}{spent.toLocaleString()} <span className="text-xs text-gray-400">({spentPct}%)</span>
                               </span>
                            </div>
                            <div className="flex justify-between items-center gap-4">
                               <span className="text-gray-500 dark:text-gray-400">Remaining</span>
                               <span className={`font-medium ${remaining < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                  {currency}{remaining.toLocaleString()} <span className="text-xs opacity-70">({remainingPct}%)</span>
                               </span>
                            </div>
                         </div>
                      </div>
                   );
                }
                return null;
             }}
          />
          <Legend verticalAlign="bottom" height={36} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

// --- Main Page Component ---

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
  const [activeTab, setActiveTab] = useState('distribution');

  // --- Calculations ---
  
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  
  const monthlyExpenses = useMemo(() => transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonthStr))
    .reduce((sum, t) => sum + Math.abs(t.amount), 0), 
  [transactions, currentMonthStr]);

  const budgetLimit = totalBudget?.limit || 0;
  const remaining = Math.max(0, budgetLimit - monthlyExpenses);
  
  // Forecasting
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const currentDay = today.getDate();
  const daysLeft = daysInMonth - currentDay;
  
  const dailyAverage = currentDay > 0 ? monthlyExpenses / currentDay : 0;
  const projectedSpend = dailyAverage * daysInMonth;
  const safeDailySpend = daysLeft > 0 ? remaining / daysLeft : 0;
  const status = projectedSpend > budgetLimit ? 'danger' : 'safe';

  // --- Handlers ---

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

  // --- Tabs for Analytics ---
  const analyticsTabs = [
      { id: 'distribution', label: 'Category Split' },
      { id: 'trends', label: '6-Month Trend' },
      { id: 'daily', label: 'Daily Spend' },
  ];

  return (
    <motion.div 
      className="space-y-8 pb-20 relative"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      {/* Background Accent */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-900/10 dark:to-transparent pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Smart Budgeting</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track spending, forecast costs, and save more.</p>
        </div>
        <div className="flex gap-3">
            {!totalBudget && (
                <button 
                    onClick={() => setShowTotalBudgetModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors shadow-md shadow-purple-500/20"
                >
                    <Plus className="w-4 h-4" />
                    <span>Set Monthly Limit</span>
                </button>
            )}
            <button 
                onClick={onAddBudget}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-md"
            >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Health & Quick Stats */}
        <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Health Card */}
            <GlassCard className="p-6 relative overflow-hidden">
                {/* Visual */}
                {totalBudget ? (
                    <>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Budget Health</h3>
                            <button onClick={() => setShowTotalBudgetModal(true)} className="text-gray-400 hover:text-purple-500 transition-colors">
                                <Edit className="w-4 h-4" />
                            </button>
                        </div>
                        <BudgetHealthGauge spent={monthlyExpenses} limit={budgetLimit} currency={currency} />
                    </>
                ) : (
                    <div className="text-center py-10">
                        <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full inline-flex items-center justify-center mb-4">
                            <Target className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Total Budget</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 mb-6">
                            Set a total monthly spending limit to unlock health metrics and forecasting.
                        </p>
                        <button 
                            onClick={() => setShowTotalBudgetModal(true)}
                            className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            Set Limit
                        </button>
                    </div>
                )}
            </GlassCard>

            {/* 2. Quick Insights (Only if budget set) */}
            {totalBudget && (
                <GlassCard className="p-5 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Smart Insights</h3>
                    
                    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                <Activity className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Daily Average</p>
                                <p className="font-bold text-gray-900 dark:text-white">{currency}{dailyAverage.toLocaleString(undefined, { maximumFractionDigits: 0 })} / day</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-lg ${status === 'safe' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                                <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Projected End-Month</p>
                                <p className={`font-bold ${status === 'safe' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                    {currency}{projectedSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {daysLeft > 0 && remaining > 0 && (
                        <div className="flex items-center justify-between p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                    <Calendar className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Safe Daily Spend</p>
                                    <p className="font-bold text-gray-900 dark:text-white">{currency}{safeDailySpend.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-xs font-normal opacity-60">for {daysLeft} days</span></p>
                                </div>
                            </div>
                        </div>
                    )}
                </GlassCard>
            )}
        </div>

        {/* RIGHT COLUMN: Analytics Panel */}
        <div className="lg:col-span-8">
            <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                        <PieChartIcon className="w-5 h-5 mr-2 text-purple-500" />
                        Analytics
                    </h3>
                </div>
                <Tabs tabs={analyticsTabs} selectedTab={activeTab} onSelectTab={setActiveTab} />
                <div className="mt-4">
                    {activeTab === 'distribution' && (
                        <CategoryDistributionChart budgets={budgets} transactions={transactions} currency={currency} />
                    )}
                    {activeTab === 'trends' && (
                        <SpendingTrendChart transactions={transactions} budgetLimit={budgetLimit} currency={currency} />
                    )}
                    {activeTab === 'daily' && (
                        <DailySpendChart transactions={transactions} currency={currency} />
                    )}
                </div>
                
                {/* Dynamic Insight Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-full mt-0.5">
                            <Activity className="w-3.5 h-3.5" />
                        </div>
                        <div>
                            {(() => {
                                const topCategory = budgets
                                    .map(b => ({
                                        name: b.category,
                                        amount: transactions
                                            .filter(t => t.type === 'expense' && t.category === b.category && t.date.startsWith(currentMonthStr))
                                            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                                    }))
                                    .sort((a, b) => b.amount - a.amount)[0];

                                if (topCategory && topCategory.amount > 0 && monthlyExpenses > 0) {
                                    const percent = Math.round((topCategory.amount / monthlyExpenses) * 100);
                                    return (
                                        <p>
                                            <span className="font-semibold text-gray-900 dark:text-white">{topCategory.name}</span> is your top expense this month, accounting for <span className="font-semibold text-gray-900 dark:text-white">{percent}%</span> of your spending.
                                        </p>
                                    );
                                }
                                return <p>Track your spending to see insights here.</p>;
                            })()}
                        </div>
                    </div>
                </div>
            </GlassCard>
        </div>
      </div>

      {/* BOTTOM SECTION: Budget Categories Grid */}
      <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center px-1">
              <Target className="w-6 h-6 mr-2 text-blue-500" />
              Budget Categories
          </h3>
          
          {budgets.length === 0 ? (
              <div className="text-center py-12 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No categories set. Create one to start tracking specific expenses.</p>
                  <button onClick={onAddBudget} className="mt-4 text-purple-600 font-medium hover:underline">Add Category</button>
              </div>
          ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {budgets.map((budget) => (
                      <BudgetCard 
                          key={budget.id} 
                          budget={budget} 
                          transactions={transactions} 
                          currency={currency} 
                          onEdit={onEditBudget}
                          onDelete={(id) => setShowDeleteConfirm(id)}
                      />
                  ))}
              </div>
          )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showTotalBudgetModal && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTotalBudgetModal(false)}
          >
            <motion.div 
              className="bg-white dark:bg-[#242424] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
              variants={modalVariants}
              initial="initial" animate="animate" exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  {totalBudget ? 'Edit Monthly Limit' : 'Set Monthly Limit'}
                </h3>
                <button 
                  onClick={() => setShowTotalBudgetModal(false)}
                  className="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Budget Amount
                  </label>
                  <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">{currency}</span>
                      <input
                        type="number"
                        value={totalBudgetInput}
                        onChange={(e) => setTotalBudgetInput(e.target.value)}
                        placeholder={totalBudget ? totalBudget.limit.toString() : "0.00"}
                        className="w-full pl-8 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-gray-900 dark:text-white"
                        autoFocus
                      />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <motion.button 
                    onClick={handleSaveTotalBudget}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-colors"
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Limit
                  </motion.button>
                  {totalBudget && (
                    <motion.button 
                      onClick={handleDeleteTotalBudget}
                      className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 rounded-xl font-medium transition-colors"
                      whileTap={{ scale: 0.98 }}
                    >
                      Remove
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div 
              className="bg-white dark:bg-[#242424] rounded-2xl p-6 w-full max-w-md shadow-2xl border border-gray-200 dark:border-gray-700"
              variants={modalVariants}
              initial="initial" animate="animate" exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Category?</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure? This will remove the budget category limit, but your transactions will remain.
              </p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleConfirmDeleteBudget(showDeleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
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