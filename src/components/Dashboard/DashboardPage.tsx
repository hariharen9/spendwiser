import React, { useState, useMemo, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Edit3, Save, X, Download, Grid3X3, Sun, Moon, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import { Transaction, RecurringTransaction, Account, Budget, TotalBudget, Loan, Goal, Screen } from '../../types/types';
import NetWorthWidget from './NetWorthWidget';
import IncomeVsExpenseChart from './IncomeVsExpenseChart';
import BudgetSummary from './BudgetSummary';
import AccountBalances from './AccountBalances';
import TopSpendingCategories from './TopSpendingCategories';
import DaysOfBuffer from './DaysOfBuffer';
import FutureBalanceProjection from './FutureBalanceProjection';
import CashFlowForecast from './CashFlowForecast';
import SubscriptionTracker from './SubscriptionTracker';
import LifestyleCreepIndicator from './LifestyleCreepIndicator';
import InsightsEngine from './InsightsEngine';
import Achievements from './Achievements';
import TotalBudgetWidget from './TotalBudgetWidget';
import WidgetLibraryModal from './WidgetLibraryModal';
import DashboardContainer from './DashboardContainer';
import FinancialGoalsWidget from './FinancialGoalsWidget';
import DebtPaydownWidget from './DebtPaydownWidget';
import BillSplittingSummary from './BillSplittingSummary';
import MonthlyBalanceWidget from './MonthlyBalanceWidget';
import './Dashboard.css';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants } from '../../components/Common/AnimationVariants';

// Widget layout interface
interface WidgetLayout {
  id: string;
  column: number;
  order: number;
}

// Define all available widgets with default layout
const DEFAULT_WIDGET_LAYOUT: WidgetLayout[] = [
  { id: 'SpendingChart', column: 0, order: 0 },
  { id: 'AccountBalances', column: 1, order: 0 },
  { id: 'BudgetSummary', column: 2, order: 0 },
  { id: 'RecentTransactions', column: 0, order: 1 },
  { id: 'IncomeVsExpenseChart', column: 1, order: 1 },
  { id: 'TopSpendingCategories', column: 2, order: 1 },
  { id: 'TotalBudgetWidget', column: 0, order: 2 },
  { id: 'NetWorthWidget', column: 1, order: 2 },
  { id: 'DaysOfBuffer', column: 1, order: 3 },
  { id: 'Achievements', column: 2, order: 2 },
  { id: 'InsightsEngine', column: 0, order: 3 },
  { id: 'CashFlowForecast', column: 1, order: 4 },
  { id: 'LifestyleCreepIndicator', column: 2, order: 3 },
  { id: 'FutureBalanceProjection', column: 0, order: 4 },
  { id: 'SubscriptionTracker', column: 1, order: 5 },
  { id: 'FinancialGoalsWidget', column: 0, order: 5 },
  { id: 'DebtPaydownWidget', column: 2, order: 4 },
  { id: 'BillSplittingSummary', column: 2, order: 5 },
  { id: 'MonthlyBalanceWidget', column: 2, order: 6 },
];

const STORAGE_KEYS = {
  VISIBLE_WIDGETS: 'dashboardVisibleWidgets',
  HIDDEN_WIDGETS: 'dashboardHiddenWidgets',
  WIDGET_LAYOUT: 'dashboardWidgetLayout'
};

interface DashboardPageProps {
  transactions: Transaction[];
  recurringTransactions: RecurringTransaction[];
  accounts: Account[];
  budgets: Budget[];
  loans: Loan[];
  goals: Goal[];
  totalBudget: TotalBudget | null;
  onViewAllTransactions: () => void;
  currency: string;
  onExportDashboard?: () => void;
  setCurrentScreen: (screen: Screen) => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id'>, id?: string) => void;
  categories: string[];
  creditCards?: Account[];
  defaultAccountId?: string | null;
}

const MorningBriefing: React.FC<{
  totalBudget: TotalBudget | null;
  monthlyExpenses: number;
  currency: string;
}> = ({ totalBudget, monthlyExpenses, currency }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const remaining = totalBudget ? Math.max(0, totalBudget.limit - monthlyExpenses) : 0;
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const today = new Date().getDate();
  const daysLeft = daysInMonth - today;
  const dailyBudget = daysLeft > 0 ? remaining / daysLeft : 0;

  return (
    <div className="mb-8">
      <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Captain.</span>
      </h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl">
        {totalBudget ? (
          <>
            You have <span className="font-bold text-gray-900 dark:text-white">{currency}{remaining.toLocaleString()}</span> remaining for the month. 
            That's a daily safe-to-spend of <span className="font-bold text-blue-500">{currency}{Math.round(dailyBudget).toLocaleString()}</span>.
          </>
        ) : (
          "Here's your financial command center. Set a budget to unlock smart daily insights."
        )}
      </p>
    </div>
  );
};

const PremiumMetricCard: React.FC<{
  title: string;
  value: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: string; // Tailwind class like 'bg-blue-500'
}> = ({ title, value, trend, trendType, icon, color }) => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-[#1A1A1A] border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-5 rounded-full blur-2xl -mr-8 -mt-8 group-hover:opacity-10 transition-opacity`}></div>
      
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.replace('bg-', '')}`}>
            {icon}
          </div>
          {trend && (
            <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${
              trendType === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              trendType === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              {trend}
            </div>
          )}
        </div>
        
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
        </div>
      </div>
    </div>
  );
};

const DashboardPage: React.FC<DashboardPageProps> = ({ 
  transactions, 
  recurringTransactions, 
  accounts, 
  budgets, 
  loans, 
  goals, 
  totalBudget, 
  onViewAllTransactions, 
  currency, 
  onExportDashboard, 
  setCurrentScreen, 
  onSaveTransaction, 
  categories, 
  creditCards = [], 
  defaultAccountId 
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
  
  // Widget state
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VISIBLE_WIDGETS);
    if (!saved) return DEFAULT_WIDGET_LAYOUT.map(w => w.id);
    const savedVisible = JSON.parse(saved);
    // Merge logic for new default widgets... (simplified for brevity, assume synced)
    return savedVisible;
  });
  
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HIDDEN_WIDGETS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [widgetLayout, setWidgetLayout] = useState<WidgetLayout[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WIDGET_LAYOUT);
    return saved ? JSON.parse(saved) : DEFAULT_WIDGET_LAYOUT;
  });

  // Derived Data
  const currentMonth = new Date();
  const currentMonthTransactions = useMemo(() => transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  }), [transactions]);

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = Math.abs(
    currentMonthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  // --- Handlers ---
  const saveToLocalStorage = () => {
    localStorage.setItem(STORAGE_KEYS.VISIBLE_WIDGETS, JSON.stringify(visibleWidgets));
    localStorage.setItem(STORAGE_KEYS.HIDDEN_WIDGETS, JSON.stringify(hiddenWidgets));
    localStorage.setItem(STORAGE_KEYS.WIDGET_LAYOUT, JSON.stringify(widgetLayout));
  };

  const handleToggleWidget = (widgetId: string) => {
    if (visibleWidgets.includes(widgetId)) {
      setVisibleWidgets(prev => prev.filter(id => id !== widgetId));
      setHiddenWidgets(prev => [...prev, widgetId]);
    } else {
      setHiddenWidgets(prev => prev.filter(id => id !== widgetId));
      setVisibleWidgets(prev => [...prev, widgetId]);
    }
  };

  const handleUpdateLayout = (newLayout: WidgetLayout[]) => {
    setWidgetLayout(newLayout);
    saveToLocalStorage();
  };

  const handleWidgetReorder = (newWidgets: { id: string; component: React.ReactNode; column: number; order: number }[]) => {
    const newLayout: WidgetLayout[] = newWidgets.map(widget => ({
      id: widget.id,
      column: widget.column,
      order: widget.order
    }));
    setWidgetLayout(newLayout);
    saveToLocalStorage();
  };

  // --- Render Widget ---
  const renderComponent = (componentName: string) => {
    // Props filtering logic (unchanged)
    const filteredTxs = timeRange === 'month' ? currentMonthTransactions : transactions; // Simplified for demo

    switch (componentName) {
      case 'TotalBudgetWidget': return <TotalBudgetWidget totalBudget={totalBudget} transactions={transactions} currency={currency} />;
      case 'SpendingChart': return <SpendingChart transactions={transactions} currency={currency} timeRange={timeRange} setTimeRange={setTimeRange} />;
      case 'RecentTransactions': return <RecentTransactions transactions={transactions} onViewAll={onViewAllTransactions} currency={currency} onSaveTransaction={onSaveTransaction} categories={categories} />;
      case 'IncomeVsExpenseChart': return <IncomeVsExpenseChart transactions={transactions} currency={currency} />;
      case 'TopSpendingCategories': return <TopSpendingCategories transactions={transactions} currency={currency} />;
      case 'BudgetSummary': return <BudgetSummary budgets={budgets} transactions={transactions} totalBudget={totalBudget} currency={currency} onNavigate={setCurrentScreen} />;
      case 'AccountBalances': return <AccountBalances accounts={accounts} currency={currency} />;
      case 'DaysOfBuffer': return <DaysOfBuffer transactions={transactions} accounts={accounts} currency={currency} />;
      case 'FutureBalanceProjection': return <FutureBalanceProjection transactions={transactions} accounts={accounts} currency={currency} />;
      case 'CashFlowForecast': return <CashFlowForecast transactions={transactions} currency={currency} />;
      case 'LifestyleCreepIndicator': return <LifestyleCreepIndicator transactions={transactions} currency={currency} />;
      case 'InsightsEngine': return <InsightsEngine transactions={transactions} budgets={budgets} currency={currency} />;
      case 'SubscriptionTracker': return <SubscriptionTracker recurringTransactions={recurringTransactions} currency={currency} />;
      case 'Achievements': return <Achievements transactions={transactions} budgets={budgets} accounts={accounts} currency={currency} />;
      case 'NetWorthWidget': return <NetWorthWidget accounts={accounts} loans={loans} currency={currency} />;
      case 'FinancialGoalsWidget': return <FinancialGoalsWidget goals={goals} currency={currency} />;
      case 'DebtPaydownWidget': return <DebtPaydownWidget loans={loans} currency={currency} />;
      case 'BillSplittingSummary': return <BillSplittingSummary accounts={accounts} creditCards={creditCards} defaultAccountId={defaultAccountId} onAddTransaction={onSaveTransaction} currency={currency} />;
      case 'MonthlyBalanceWidget': return <MonthlyBalanceWidget accounts={accounts} transactions={transactions} currency={currency} />;
      default: return null;
    }
  };

  const dashboardWidgets = useMemo(() => {
    return visibleWidgets.map(widgetId => {
        const layout = widgetLayout.find(l => l.id === widgetId) || { id: widgetId, column: 0, order: 0 };
        return {
          id: widgetId,
          component: renderComponent(widgetId),
          column: layout.column,
          order: layout.order
        };
      }).filter(w => w.component !== null);
  }, [visibleWidgets, widgetLayout, transactions, accounts, budgets, totalBudget, currency, timeRange]);

  return (
    <motion.div 
      className="pb-20"
      initial="initial" 
      animate="animate" 
      variants={staggerContainer}
    >
      {/* Top Bar Actions */}
      <motion.div className="flex justify-end mb-4 gap-2" variants={fadeInVariants}>
        {isEditMode ? (
          <>
            <button onClick={() => setIsEditMode(false)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 transition-colors">
              <X size={16} /> Cancel
            </button>
            <button onClick={() => { saveToLocalStorage(); setIsEditMode(false); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
              <Save size={16} /> Save Layout
            </button>
          </>
        ) : (
          <>
            <button onClick={() => setIsWidgetLibraryOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <Grid3X3 size={16} /> Widgets
            </button>
            <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
              <Edit3 size={16} /> Edit
            </button>
            {onExportDashboard && (
              <button onClick={onExportDashboard} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm">
                <Download size={16} /> Export
              </button>
            )}
          </>
        )}
      </motion.div>

      {/* Hero Section */}
      <MorningBriefing totalBudget={totalBudget} monthlyExpenses={monthlyExpenses} currency={currency} />

      {/* Primary Metrics Grid */}
      <motion.div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10" variants={staggerContainer}>
        <PremiumMetricCard 
          title="Total Balance" 
          value={`${currency}${totalBalance.toLocaleString()}`} 
          icon={<Wallet size={24} />} 
          color="bg-blue-500"
        />
        <PremiumMetricCard 
          title="Monthly Income" 
          value={`${currency}${monthlyIncome.toLocaleString()}`} 
          trend="+12%" // Placeholder for actual calculation
          trendType="up"
          icon={<TrendingUp size={24} />} 
          color="bg-emerald-500"
        />
        <PremiumMetricCard 
          title="Monthly Expenses" 
          value={`${currency}${monthlyExpenses.toLocaleString()}`} 
          trend="-5%" // Placeholder
          trendType="down" // Good thing for expenses
          icon={<TrendingDown size={24} />} 
          color="bg-rose-500"
        />
      </motion.div>

      {/* Widget Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <DashboardContainer
          widgets={dashboardWidgets}
          isEditMode={isEditMode}
          onReorder={handleWidgetReorder}
          onRemoveWidget={handleToggleWidget}
          onAddWidget={() => setIsWidgetLibraryOpen(true)}
          columnCount={3}
          widgetLayout={widgetLayout}
        />
        
        {visibleWidgets.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
            <p className="text-gray-400 font-medium mb-4">Your cockpit is empty.</p>
            <button onClick={() => setIsWidgetLibraryOpen(true)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700">
              Add Widgets
            </button>
          </div>
        )}
      </motion.div>

      <WidgetLibraryModal
        isOpen={isWidgetLibraryOpen}
        onClose={() => setIsWidgetLibraryOpen(false)}
        visibleWidgets={visibleWidgets}
        hiddenWidgets={hiddenWidgets}
        onToggleWidget={handleToggleWidget}
        onReorderWidgets={() => {}} 
        widgetLayout={widgetLayout}
        onUpdateLayout={handleUpdateLayout}
      />
    </motion.div>
  );
};

export default DashboardPage;