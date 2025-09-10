import React, { useState, useEffect, useMemo } from 'react';
import { Screen, Transaction, Account } from './types/types';
import { mockUser, mockTransactions, mockCreditCards, mockBudgets, mockAccounts, categories } from './data/mockData';

// Components
import LoginPage from './components/Login/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FAB from './components/Common/FAB';

// Pages
import DashboardPage from './components/Dashboard/DashboardPage';
import TransactionsPage from './components/Transactions/TransactionsPage';
import CreditCardsPage from './components/CreditCards/CreditCardsPage';
import BudgetsPage from './components/Budgets/BudgetsPage';
import SettingsPage from './components/Settings/SettingsPage';

// Modals
import AddTransactionModal from './components/Modals/AddTransactionModal';
import BudgetModal from './components/Modals/BudgetModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [accounts, setAccounts] = useState(mockAccounts);
  const [budgets, setBudgets] = useState(mockBudgets);
  const [user, setUser] = useState(mockUser);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>();
  const [darkMode, setDarkMode] = useState(true);
  
  // Transaction filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = transactionType === 'all' || transaction.type === transactionType;
      
      const matchesCategory = selectedCategory === '' || transaction.category === selectedCategory;
      
      // Date filtering
      let matchesDate = true;
      if (startDate && endDate) {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        matchesDate = transactionDate >= start && transactionDate <= end;
      } else if (startDate) {
        const transactionDate = new Date(transaction.date);
        const start = new Date(startDate);
        matchesDate = transactionDate >= start;
      } else if (endDate) {
        const transactionDate = new Date(transaction.date);
        const end = new Date(endDate);
        matchesDate = transactionDate <= end;
      }

      return matchesSearch && matchesType && matchesCategory && matchesDate;
    });
  }, [transactions, searchTerm, transactionType, selectedCategory, startDate, endDate]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentScreen('dashboard');
  };

  const handleAddTransaction = (transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString()
    };

    if (editingTransaction) {
      setTransactions(prev => 
        prev.map(t => t.id === editingTransaction.id ? { ...newTransaction, id: editingTransaction.id } : t)
      );
      setEditingTransaction(undefined);
    } else {
      setTransactions(prev => [newTransaction, ...prev]);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddTransactionModalOpen(true);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddAccount = (accountData: any) => {
    const newAccount = {
      ...accountData,
      id: Date.now().toString()
    };
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleEditAccount = (account: any) => {
    setAccounts(prev => prev.map(a => a.id === account.id ? account : a));
  };

  const handleDeleteAccount = (id: string) => {
    setAccounts(prev => prev.filter(a => a.id !== id));
  };

  const handleUpdateCurrency = (currency: string) => {
    setUser(prev => ({ ...prev, currency }));
  };

  const handleAddBudget = (budgetData: any) => {
    const newBudget = {
      ...budgetData,
      id: Date.now().toString()
    };

    if (editingBudget) {
      setBudgets(prev => 
        prev.map(b => b.id === editingBudget.id ? { ...newBudget, id: editingBudget.id } : b)
      );
      setEditingBudget(undefined);
    } else {
      setBudgets(prev => [...prev, newBudget]);
    }
  };

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = (id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Name', 'Category', 'Amount', 'Type', 'Credit Card'],
      ...filteredTransactions.map(t => [
        t.date,
        t.name,
        t.category,
        t.amount,
        t.type,
        t.creditCard || ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  const getPageTitle = () => {
    switch (currentScreen) {
      case 'dashboard': return 'Dashboard';
      case 'transactions': return 'Transactions';
      case 'credit-cards': return 'Credit Cards';
      case 'budgets': return 'Budgets';
      case 'settings': return 'Settings';
      default: return 'Dashboard';
    }
  };

  const getActionButton = () => {
    if (currentScreen === 'transactions') {
      return {
        label: 'Export to CSV',
        onClick: handleExportCSV,
        variant: 'secondary' as const
      };
    }
    return undefined;
  };

  const renderCurrentPage = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <DashboardPage
            transactions={transactions}
            onViewAllTransactions={() => setCurrentScreen('transactions')}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage
            transactions={transactions}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            transactionType={transactionType}
            setTransactionType={setTransactionType}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            categories={categories}
          />
        );
      case 'credit-cards':
        return (
          <CreditCardsPage
            creditCards={mockCreditCards}
            transactions={transactions}
          />
        );
      case 'budgets':
        return (
          <BudgetsPage 
            budgets={budgets} 
            onEditBudget={handleEditBudget}
            onAddBudget={() => setIsBudgetModalOpen(true)}
            onDeleteBudget={handleDeleteBudget}
          />
        );
      case 'settings':
        return (
          <SettingsPage
            user={user}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            accounts={accounts}
            onAddAccount={handleAddAccount}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
            onUpdateCurrency={handleUpdateCurrency}
          />
        );
      default:
        return <DashboardPage transactions={transactions} onViewAllTransactions={() => setCurrentScreen('transactions')} />;
    }
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#1A1A1A] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        user={mockUser}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title={getPageTitle()}
          actionButton={getActionButton()}
          onAddTransaction={() => setIsAddTransactionModalOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-8">
          {renderCurrentPage()}
        </main>
      </div>

      {/* Floating Action Button */}
      <FAB onClick={() => setIsAddTransactionModalOpen(true)} />

      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddTransactionModalOpen}
        onClose={() => {
          setIsAddTransactionModalOpen(false);
          setEditingTransaction(undefined);
        }}
        onSave={handleAddTransaction}
        editingTransaction={editingTransaction}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setEditingBudget(undefined);
        }}
        onSave={handleAddBudget}
        editingBudget={editingBudget}
      />
    </div>
  );
}

export default App;