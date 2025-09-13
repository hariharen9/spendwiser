import React, { useState, useMemo } from 'react';
import Masonry from 'react-masonry-css';
import { DollarSign, TrendingUp, TrendingDown, Edit3, Save, X, Download } from 'lucide-react';
import MetricCard from './MetricCard';
import SpendingChart from './SpendingChart';
import RecentTransactions from './RecentTransactions';
import { Transaction, Account, Budget, TotalBudget } from '../../types/types';
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
import './Dashboard.css';
import { motion } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants } from '../../components/Common/AnimationVariants';

interface DashboardPageProps {
  transactions: Transaction[];
  accounts: Account[];
  budgets: Budget[];
  totalBudget: TotalBudget | null;
  onViewAllTransactions: () => void;
  currency: string;
  onExportDashboard?: () => void; // Add export function prop
}

// Define the order of components
const DEFAULT_COMPONENT_ORDER = [
  'SpendingChart',
  'RecentTransactions',
  'IncomeVsExpenseChart',
  'TopSpendingCategories',
  'BudgetSummary',
  'AccountBalances',
  'DaysOfBuffer',
  'FutureBalanceProjection',
  'CashFlowForecast',
  'LifestyleCreepIndicator',
  'InsightsEngine',
  'SubscriptionTracker',
  'Achievements',
  'TotalBudgetWidget'
];

const DashboardPage: React.FC<DashboardPageProps> = ({ transactions, accounts, budgets, totalBudget, onViewAllTransactions, currency, onExportDashboard }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [componentOrder, setComponentOrder] = useState<string[]>(() => {
    const savedOrder = localStorage.getItem('dashboardComponentOrder');
    return savedOrder ? JSON.parse(savedOrder) : DEFAULT_COMPONENT_ORDER;
  });
  const [tempComponentOrder, setTempComponentOrder] = useState<string[]>(() => {
    const savedOrder = localStorage.getItem('dashboardComponentOrder');
    return savedOrder ? JSON.parse(savedOrder) : DEFAULT_COMPONENT_ORDER;
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

  const breakpointColumnsObj = {
    default: 3,
    1100: 2,
    700: 1
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, componentName: string) => {
    if (!isEditMode) return;
    e.dataTransfer.setData('text/plain', componentName);
    e.currentTarget.classList.add('opacity-50');
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditMode) return;
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetComponent: string) => {
    if (!isEditMode) return;
    e.preventDefault();
    
    const draggedComponent = e.dataTransfer.getData('text/plain');
    if (draggedComponent === targetComponent) return;
    
    const newOrder = [...tempComponentOrder];
    const draggedIndex = newOrder.indexOf(draggedComponent);
    const targetIndex = newOrder.indexOf(targetComponent);
    
    // Remove the dragged component
    newOrder.splice(draggedIndex, 1);
    // Insert at the new position
    newOrder.splice(targetIndex, 0, draggedComponent);
    
    setTempComponentOrder(newOrder);
    
    // Reset opacity
    e.currentTarget.classList.remove('opacity-50');
  };

  // Handle drag end
  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  // Render component by name
  const renderComponent = (componentName: string) => {
    const commonProps = {
      draggable: isEditMode,
      onDragStart: (e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, componentName),
      onDragOver: handleDragOver,
      onDrop: (e: React.DragEvent<HTMLDivElement>) => handleDrop(e, componentName),
      onDragEnd: handleDragEnd,
      className: isEditMode ? 'cursor-move animate-pulse' : ''
    };

    switch (componentName) {
      case 'TotalBudgetWidget':
        return <div {...commonProps} key="TotalBudgetWidget"><TotalBudgetWidget totalBudget={totalBudget} transactions={transactions} currency={currency} /></div>;
      case 'SpendingChart':
        return <div {...commonProps} key="SpendingChart"><SpendingChart transactions={filteredTransactions} currency={currency} timeRange={timeRange} setTimeRange={setTimeRange} /></div>;
      case 'RecentTransactions':
        return <div {...commonProps} key="RecentTransactions"><RecentTransactions transactions={transactions} onViewAll={onViewAllTransactions} currency={currency} /></div>;
      case 'IncomeVsExpenseChart':
        return <div {...commonProps} key="IncomeVsExpenseChart"><IncomeVsExpenseChart transactions={transactions} currency={currency} /></div>;
      case 'TopSpendingCategories':
        return <div {...commonProps} key="TopSpendingCategories"><TopSpendingCategories transactions={transactions} currency={currency} /></div>;
      case 'BudgetSummary':
        return <div {...commonProps} key="BudgetSummary"><BudgetSummary budgets={budgets} transactions={transactions} totalBudget={totalBudget} currency={currency} /></div>;
      case 'AccountBalances':
        return <div {...commonProps} key="AccountBalances"><AccountBalances accounts={accounts} currency={currency} /></div>;
      case 'DaysOfBuffer':
        return <div {...commonProps} key="DaysOfBuffer"><DaysOfBuffer transactions={transactions} accounts={accounts} currency={currency} /></div>;
      case 'FutureBalanceProjection':
        return <div {...commonProps} key="FutureBalanceProjection"><FutureBalanceProjection transactions={transactions} accounts={accounts} currency={currency} /></div>;
      case 'CashFlowForecast':
        return <div {...commonProps} key="CashFlowForecast"><CashFlowForecast transactions={transactions} currency={currency} /></div>;
      case 'LifestyleCreepIndicator':
        return <div {...commonProps} key="LifestyleCreepIndicator"><LifestyleCreepIndicator transactions={transactions} currency={currency} /></div>;
      case 'InsightsEngine':
        return <div {...commonProps} key="InsightsEngine"><InsightsEngine transactions={transactions} budgets={budgets} currency={currency} /></div>;
      case 'SubscriptionTracker':
        return <div {...commonProps} key="SubscriptionTracker"><SubscriptionTracker transactions={transactions} currency={currency} /></div>;
      case 'Achievements':
        return <div {...commonProps} key="Achievements"><Achievements transactions={transactions} budgets={budgets} accounts={accounts} currency={currency} /></div>;
      default:
        return null;
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (!isEditMode) {
      // Enter edit mode - save current order to temp
      setTempComponentOrder([...componentOrder]);
    }
    setIsEditMode(!isEditMode);
  };

  // Save layout
  const saveLayout = () => {
    setComponentOrder([...tempComponentOrder]);
    localStorage.setItem('dashboardComponentOrder', JSON.stringify(tempComponentOrder));
    setIsEditMode(false);
  };

  // Cancel edit mode
  const cancelEdit = () => {
    // Revert to saved order
    setTempComponentOrder([...componentOrder]);
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
        {/* Export button - moved to be near edit button */}
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
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
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
          />
        </motion.div>
        <motion.div variants={fadeInVariants} initial="initial" animate="animate" transition={{ delay: 0.3 }}>
          <MetricCard
            title="This Month's Expenses"
            value={`${currency}${monthlyExpenses.toLocaleString()}`}
            icon={TrendingDown}
            color="bg-[#DC3545]"
          />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {isEditMode 
            ? tempComponentOrder.map((componentName, index) => (
                <motion.div
                  key={componentName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {renderComponent(componentName)}
                </motion.div>
              ))
            : componentOrder.map((componentName, index) => (
                <motion.div
                  key={componentName}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  {renderComponent(componentName)}
                </motion.div>
              ))
          }
        </Masonry>
      </motion.div>
    </motion.div>
  );
};

export default DashboardPage;