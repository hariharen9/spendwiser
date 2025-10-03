import React, { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, Edit3, Save, X, Download, Grid3X3, Eye } from 'lucide-react';
import MetricCard from './MetricCard';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import { Transaction, RecurringTransaction, Account, Budget, TotalBudget, Loan, Goal } from '../../types/types';
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
import './Dashboard.css';
import { motion, Transition } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants } from '../../components/Common/AnimationVariants';

// Add this new animation variant for the breathing effect
const breathingAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
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
  onExportDashboard?: () => void; // Add export function prop
  setCurrentScreen: (screen: string) => void;
  onSaveTransaction: (transaction: Omit<Transaction, 'id'>, id?: string) => void;
  categories: string[];
  creditCards?: Account[];
  defaultAccountId?: string | null;
}

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
  { id: 'BillSplittingSummary', column: 2, order: 5 }, // Add BillSplittingSummary widget
];

// Widget layout storage keys
const STORAGE_KEYS = {
  VISIBLE_WIDGETS: 'dashboardVisibleWidgets',
  HIDDEN_WIDGETS: 'dashboardHiddenWidgets',
  WIDGET_LAYOUT: 'dashboardWidgetLayout'
};

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions, recurringTransactions, accounts, budgets, loans, goals, totalBudget, onViewAllTransactions, currency, onExportDashboard, setCurrentScreen, onSaveTransaction, categories, creditCards = [], defaultAccountId }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  
  // Widget visibility and layout
  const [visibleWidgets, setVisibleWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.VISIBLE_WIDGETS);
    if (!saved) return DEFAULT_WIDGET_LAYOUT.map(w => w.id);

    const savedVisible = JSON.parse(saved);
    const allKnownDefaultWidgets = new Set(DEFAULT_WIDGET_LAYOUT.map(w => w.id));
    const savedHidden = JSON.parse(localStorage.getItem(STORAGE_KEYS.HIDDEN_WIDGETS) || '[]');
    const allSavedWidgets = new Set([...savedVisible, ...savedHidden]);

    for (const defaultWidget of allKnownDefaultWidgets) {
      if (!allSavedWidgets.has(defaultWidget)) {
        savedVisible.push(defaultWidget);
      }
    }
    return savedVisible;
  });
  
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HIDDEN_WIDGETS);
    return saved ? JSON.parse(saved) : [];
  });
  
  const [widgetLayout, setWidgetLayout] = useState<WidgetLayout[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WIDGET_LAYOUT);
    if (!saved) return DEFAULT_WIDGET_LAYOUT;

    const savedLayout = JSON.parse(saved);
    const layoutWidgetIds = new Set(savedLayout.map((w: WidgetLayout) => w.id));

    const newWidgetsLayout = DEFAULT_WIDGET_LAYOUT.filter(w => !layoutWidgetIds.has(w.id));
    return [...savedLayout, ...newWidgetsLayout];
  });

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    let txs = transactions.filter(t => t.type === 'expense');

    if (timeRange === 'month') {
      txs = txs.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      });
    } else if (timeRange === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      txs = txs.filter(t => {
        const txDate = new Date(t.date);
        const txQuarter = Math.floor(txDate.getMonth() / 3);
        return txQuarter === currentQuarter && txDate.getFullYear() === now.getFullYear();
      });
    } else if (timeRange === 'year') {
      txs = txs.filter(t => {
        const txDate = new Date(t.date);
        return txDate.getFullYear() === now.getFullYear();
      });
    }

    return txs;
  }, [transactions, timeRange]);
  
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  const currentMonthTxs = transactions.filter(t => {
    const txDate = new Date(t.date);
    const today = new Date();
    return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear();
  });

  const monthlyIncome = currentMonthTxs
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = Math.abs(
    currentMonthTxs
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  );

  // Save state to localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem(STORAGE_KEYS.VISIBLE_WIDGETS, JSON.stringify(visibleWidgets));
    localStorage.setItem(STORAGE_KEYS.HIDDEN_WIDGETS, JSON.stringify(hiddenWidgets));
    localStorage.setItem(STORAGE_KEYS.WIDGET_LAYOUT, JSON.stringify(widgetLayout));
  };

  // Toggle widget visibility
  const handleToggleWidget = (widgetId: string) => {
    if (visibleWidgets.includes(widgetId)) {
      // Hide widget
      setVisibleWidgets(prev => prev.filter(id => id !== widgetId));
      setHiddenWidgets(prev => [...prev, widgetId]);
    } else {
      // Show widget
      setHiddenWidgets(prev => prev.filter(id => id !== widgetId));
      setVisibleWidgets(prev => [...prev, widgetId]);
    }
  };

  // Update layout from modal
  const handleUpdateLayout = (newLayout: WidgetLayout[]) => {
    setWidgetLayout(newLayout);
    saveToLocalStorage();
  };

  // Handle widget reordering from DnD (updated to work with layout changes)
  const handleWidgetReorder = (newWidgets: { id: string; component: React.ReactNode; column: number; order: number }[]) => {
    // Extract layout information from reordered widgets
    const newLayout: WidgetLayout[] = newWidgets.map(widget => ({
      id: widget.id,
      column: widget.column,
      order: widget.order
    }));
    
    // Update the widget layout
    setWidgetLayout(newLayout);
    saveToLocalStorage();
  };

  // Render component by name
  const renderComponent = (componentName: string) => {
    switch (componentName) {
      case 'TotalBudgetWidget':
        return <TotalBudgetWidget totalBudget={totalBudget} transactions={transactions} currency={currency} />;
      case 'SpendingChart':
        return <SpendingChart transactions={filteredTransactions} currency={currency} timeRange={timeRange} setTimeRange={setTimeRange} />;
      case 'RecentTransactions':
        return <RecentTransactions transactions={transactions} onViewAll={onViewAllTransactions} currency={currency} onSaveTransaction={onSaveTransaction} categories={categories} />;
      case 'IncomeVsExpenseChart':
        return <IncomeVsExpenseChart transactions={transactions} currency={currency} />;
      case 'TopSpendingCategories':
        return <TopSpendingCategories transactions={transactions} currency={currency} />;
      case 'BudgetSummary':
        return <BudgetSummary budgets={budgets} transactions={transactions} totalBudget={totalBudget} currency={currency} onNavigate={setCurrentScreen} />;
      case 'AccountBalances':
        return <AccountBalances accounts={accounts} currency={currency} />;
      case 'DaysOfBuffer':
        return <DaysOfBuffer transactions={transactions} accounts={accounts} currency={currency} />;
      case 'FutureBalanceProjection':
        return <FutureBalanceProjection transactions={transactions} accounts={accounts} currency={currency} />;
      case 'CashFlowForecast':
        return <CashFlowForecast transactions={transactions} currency={currency} />;
      case 'LifestyleCreepIndicator':
        return <LifestyleCreepIndicator transactions={transactions} currency={currency} />;
      case 'InsightsEngine':
        return <InsightsEngine transactions={transactions} budgets={budgets} currency={currency} />;
      case 'SubscriptionTracker':
        return <SubscriptionTracker recurringTransactions={recurringTransactions} currency={currency} />;
      case 'Achievements':
        return <Achievements transactions={transactions} budgets={budgets} accounts={accounts} currency={currency} />;
      case 'NetWorthWidget':
        return <NetWorthWidget accounts={accounts} loans={loans} currency={currency} />;
      case 'FinancialGoalsWidget':
        return <FinancialGoalsWidget goals={goals} currency={currency} />;
      case 'DebtPaydownWidget':
        return <DebtPaydownWidget loans={loans} currency={currency} />;
      case 'BillSplittingSummary': // Add BillSplittingSummary component
        return <BillSplittingSummary 
          accounts={accounts} 
          creditCards={creditCards} 
          defaultAccountId={defaultAccountId} 
          onAddTransaction={onSaveTransaction} 
        />;
      default:
        return null;
    }
  };

  // Prepare widgets for DnD container (with order field)
  const dashboardWidgets = useMemo(() => {
    return visibleWidgets
      .map(widgetId => {
        const layout = widgetLayout.find(l => l.id === widgetId) || { id: widgetId, column: 0, order: 0 };
        return {
          id: widgetId,
          component: renderComponent(widgetId),
          column: layout.column,
          order: layout.order
        };
      })
      .filter(widget => widget.component !== null);
  }, [visibleWidgets, widgetLayout, transactions, accounts, budgets, totalBudget, currency, timeRange, creditCards, defaultAccountId]);

  // Toggle edit mode
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    if (isEditMode) {
      // Exiting edit mode - save changes
      saveToLocalStorage();
    }
  };

  // Save layout
  const saveLayout = () => {
    saveToLocalStorage();
    setIsEditMode(false);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    // Revert to saved state
    const savedVisible = localStorage.getItem(STORAGE_KEYS.VISIBLE_WIDGETS);
    const savedHidden = localStorage.getItem(STORAGE_KEYS.HIDDEN_WIDGETS);
    
    if (savedVisible) setVisibleWidgets(JSON.parse(savedVisible));
    if (savedHidden) setHiddenWidgets(JSON.parse(savedHidden));
    
    setIsEditMode(false);
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
      <motion.div 
        className="hidden md:flex justify-end mb-6 gap-2"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
      >
        {/* Widget Library button */}
        {!isEditMode && (
          <motion.button
            onClick={() => setIsWidgetLibraryOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Grid3X3 size={14} />
            Widgets
          </motion.button>
        )}
        
        {/* Export button */}
        {onExportDashboard && !isEditMode && (
          <motion.button
            onClick={onExportDashboard}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Download size={14} />
            Export
          </motion.button>
        )}
        
        {isEditMode ? (
          <>
            <motion.button
              onClick={cancelEdit}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <X size={14} />
              Cancel
            </motion.button>
            <motion.button
              onClick={saveLayout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Save size={14} />
              Save
            </motion.button>
          </>
        ) : (
          <motion.button
            onClick={toggleEditMode}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Edit3 size={14} />
            Edit
          </motion.button>
        )}
      </motion.div>

      <motion.div 
        className="grid grid-cols-3 gap-2 md:gap-4 mb-4 md:mb-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={fadeInVariants} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
          <MetricCard
            title="Total Balance"
            value={`${currency}${totalBalance.toLocaleString()}`}
            icon={DollarSign}
            color="bg-[#007BFF]"
          />
        </motion.div>
        <motion.div variants={fadeInVariants} initial="initial" animate="animate" transition={{ delay: 0.2 }}>
          <MetricCard
            title="This Month's Income"
            value={`${currency}${monthlyIncome.toLocaleString()}`}
            icon={TrendingUp}
            color="bg-[#28A745]"
            mobileTitle="Income"
          />
        </motion.div>
        <motion.div variants={fadeInVariants} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <MetricCard
            title="This Month's Expenses"
            value={`${currency}${monthlyExpenses.toLocaleString()}`}
            icon={TrendingDown}
            color="bg-[#DC3545]"
            mobileTitle="Expenses"
          />
        </motion.div>
      </motion.div>

      {/* Separator line between metrics and widgets */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
      
      {/* Welcome heading for mobile only */}
      <div className="md:hidden text-center mt-4 mb-0">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Welcome to <motion.span 
          className='text-[#007BFF]' 
          animate={{ 
            scale: [1, 1.05, 1],
            textShadow: [
              "0 0 0px rgba(0, 123, 255, 0)",
              "0 0 10px rgba(0, 123, 255, 0.5)",
              "0 0 0px rgba(0, 123, 255, 0)"
            ]
          }} 
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut"
          }}
        >SpendWiser!</motion.span></h2>
        <h4 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
          Let's Start <span className="underline" style={{ color: '#28A745' }}>Tracking..</span>
        </h4>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
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
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <Grid3X3 size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No widgets to display
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Add some widgets to customize your dashboard
            </p>
            <motion.button
              onClick={() => setIsWidgetLibraryOpen(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Add Widgets
            </motion.button>
          </div>
        )}
      </motion.div>
      
      {/* Widget Library Modal */}
      <WidgetLibraryModal
        isOpen={isWidgetLibraryOpen}
        onClose={() => setIsWidgetLibraryOpen(false)}
        visibleWidgets={visibleWidgets}
        hiddenWidgets={hiddenWidgets}
        onToggleWidget={handleToggleWidget}
        onReorderWidgets={() => {}} // Not needed with new layout
        widgetLayout={widgetLayout}
        onUpdateLayout={handleUpdateLayout}
      />
    </motion.div>
  );
};

export default DashboardPage;