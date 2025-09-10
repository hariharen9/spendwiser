import React, { useState, useEffect, useMemo } from 'react';
import { Screen, Transaction, Account, Budget } from './types/types';
import { User } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { mockCreditCards, categories } from './data/mockData'; // Keep these for now

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
  const [user, setUser] = useState<User | null>(null);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
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
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      if (user) {
        // Ensure a user document exists in the 'spenders' collection
        const userDocRef = doc(db, 'spenders', user.uid);
        await setDoc(userDocRef, { email: user.email, name: user.displayName }, { merge: true });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      const unsubscribe = onSnapshot(transactionsRef, snapshot => {
        const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
        setTransactions(transactionsData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const accountsRef = collection(db, 'spenders', user.uid, 'accounts');
      const unsubscribe = onSnapshot(accountsRef, snapshot => {
        const accountsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Account[];
        setAccounts(accountsData);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const budgetsRef = collection(db, 'spenders', user.uid, 'budgets');
      const unsubscribe = onSnapshot(budgetsRef, snapshot => {
        const budgetsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Budget[];
        setBudgets(budgetsData);
      });
      return () => unsubscribe();
    }
  }, [user]);


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

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    auth.signOut();
    setUser(null);
    setCurrentScreen('dashboard');
  };

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id'>) => {
    if (!user) return;
    try {
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      if (editingTransaction) {
        const transactionDoc = doc(db, 'spenders', user.uid, 'transactions', editingTransaction.id);
        await updateDoc(transactionDoc, transactionData);
        setEditingTransaction(undefined);
      } else {
        await addDoc(transactionsRef, transactionData);
      }
    } catch (error) {
      console.error("Error adding/updating transaction: ", error);
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsAddTransactionModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      const transactionDoc = doc(db, 'spenders', user.uid, 'transactions', id);
      await deleteDoc(transactionDoc);
    } catch (error) {
      console.error("Error deleting transaction: ", error);
    }
  };

  const handleAddAccount = async (accountData: Omit<Account, 'id'>) => {
    if (!user) return;
    try {
      const accountsRef = collection(db, 'spenders', user.uid, 'accounts');
      await addDoc(accountsRef, accountData);
    } catch (error) {
      console.error("Error adding account: ", error);
    }
  };

  const handleEditAccount = async (account: Account) => {
    if (!user) return;
    try {
      const accountDoc = doc(db, 'spenders', user.uid, 'accounts', account.id);
      await updateDoc(accountDoc, account);
    } catch (error) {
      console.error("Error updating account: ", error);
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!user) return;
    try {
      const accountDoc = doc(db, 'spenders', user.uid, 'accounts', id);
      await deleteDoc(accountDoc);
    } catch (error) {
      console.error("Error deleting account: ", error);
    }
  };

  const handleUpdateCurrency = (currency: string) => {
    // This will need to be updated to work with the new user object
    // For now, it will throw an error
    // setUser(prev => ({ ...prev, currency }));
  };

  const handleAddBudget = async (budgetData: Omit<Budget, 'id'>) => {
    if (!user) return;
    try {
      const budgetsRef = collection(db, 'spenders', user.uid, 'budgets');
      if (editingBudget) {
        const budgetDoc = doc(db, 'spenders', user.uid, 'budgets', editingBudget.id);
        await updateDoc(budgetDoc, budgetData);
        setEditingBudget(undefined);
      } else {
        await addDoc(budgetsRef, budgetData);
      }
    } catch (error) {
      console.error("Error adding/updating budget: ", error);
    }
  };

  const handleEditBudget = (budget: any) => {
    setEditingBudget(budget);
    setIsBudgetModalOpen(true);
  };

  const handleDeleteBudget = async (id: string) => {
    if (!user) return;
    try {
      const budgetDoc = doc(db, 'spenders', user.uid, 'budgets', id);
      await deleteDoc(budgetDoc);
    } catch (error) {
      console.error("Error deleting budget: ", error);
    }
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

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#1A1A1A] overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onScreenChange={setCurrentScreen}
        user={user}
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
