import React, { useState, useEffect, useMemo } from 'react';
import { Screen, Transaction, Account, Budget } from './types/types';
import { User } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';
import { categories } from './data/mockData'; // Keep these for now

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

// Icons
import { LogOut, DollarSign } from 'lucide-react';

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
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);
  
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
        
        // Fetch default account setting
        try {
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists() && userDocSnap.data().defaultAccountId) {
            setDefaultAccountId(userDocSnap.data().defaultAccountId);
          }
        } catch (error) {
          console.error("Error fetching user settings: ", error);
        }
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

  // Calculate account balances dynamically based on transactions
  const accountsWithDynamicBalances = useMemo(() => {
    return accounts.map(account => {
      // For credit cards, we calculate spend based on transactions
      if (account.type === 'Credit Card') {
        const cardTransactions = transactions.filter(t => t.accountId === account.id);
        const totalSpend = cardTransactions.reduce((sum, transaction) => {
          return sum + Math.abs(transaction.amount);
        }, 0);
        return {
          ...account,
          balance: totalSpend // For credit cards, balance represents total spend
        };
      } 
      // For other account types, calculate balance based on income/expense transactions
      else {
        const accountTransactions = transactions.filter(t => t.accountId === account.id);
        const dynamicBalance = accountTransactions.reduce((balance, transaction) => {
          // Since expenses are already negative and income positive from the transaction modal,
          // we simply add them to the balance
          return balance + transaction.amount;
        }, account.balance); // Start with initial balance
        return {
          ...account,
          balance: dynamicBalance
        };
      }
    });
  }, [accounts, transactions]);

  // Separate credit cards from other accounts
  const creditCards = useMemo(() => 
    accountsWithDynamicBalances.filter(acc => acc.type === 'Credit Card'), 
    [accountsWithDynamicBalances]
  );

  const regularAccounts = useMemo(() => 
    accountsWithDynamicBalances.filter(acc => acc.type !== 'Credit Card'), 
    [accountsWithDynamicBalances]
  );

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

  const handleSetDefaultAccount = async (accountId: string) => {
    if (!user) return;
    try {
      setDefaultAccountId(accountId);
      const userDocRef = doc(db, 'spenders', user.uid);
      await updateDoc(userDocRef, { defaultAccountId: accountId });
    } catch (error) {
      console.error("Error setting default account: ", error);
    }
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
            accounts={regularAccounts}
            budgets={budgets}
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
            accounts={creditCards}
            transactions={transactions}
            onAddAccount={handleAddAccount}
            onEditAccount={handleEditAccount}
          />
        );
      case 'budgets':
        return (
          <BudgetsPage 
            budgets={budgets} 
            transactions={transactions}
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
            accounts={regularAccounts}
            onAddAccount={handleAddAccount}
            onEditAccount={handleEditAccount}
            onDeleteAccount={handleDeleteAccount}
            onUpdateCurrency={handleUpdateCurrency}
            defaultAccountId={defaultAccountId}
            onSetDefaultAccount={handleSetDefaultAccount}
          />
        );
      default:
        return <DashboardPage transactions={transactions} accounts={regularAccounts} budgets={budgets} onViewAllTransactions={() => setCurrentScreen('transactions')} />;
    }
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#1A1A1A] overflow-hidden">
      {/* Top Bar for Mobile */}
      <div className="md:hidden bg-white dark:bg-[#242424] border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#007BFF] p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">SpendWise</h1>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-3">
              <img
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                className="h-8 w-8 rounded-full object-cover"
              />
              <button
                onClick={handleLogout}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5]"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar for Desktop */}
        <div className="hidden md:block w-64">
          <Sidebar
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
            user={user}
            onLogout={handleLogout}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header for Desktop */}
          <div className="hidden md:block">
            <Header
              title={getPageTitle()}
              actionButton={getActionButton()}
              onAddTransaction={() => setIsAddTransactionModalOpen(true)}
            />
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            {renderCurrentPage()}
          </main>
        </div>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden bg-white dark:bg-[#242424] border-t border-gray-200 dark:border-gray-700 fixed bottom-0 w-full">
        <div className="flex justify-around">
          <Sidebar
            currentScreen={currentScreen}
            onScreenChange={setCurrentScreen}
            user={null} // We don't need user info in mobile bottom nav
            onLogout={handleLogout}
          />
        </div>
      </div>

      {/* Floating Action Button - Visible on all screens, positioned appropriately for each */}
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
        accounts={regularAccounts}
        creditCards={creditCards}
        defaultAccountId={defaultAccountId}
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