import React, { useState, useEffect, useMemo } from 'react';
import { Screen, Transaction, Account, Budget } from './types/types';
import { User, deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, writeBatch, getDocs } from 'firebase/firestore';
import { categories, getDefaultCategories, mockTransactions, mockAccounts, mockBudgets } from './data/mockData'; // Updated import

// Components
import LoginPage from './components/Login/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FAB from './components/Common/FAB';
import AnimatedToast from './components/Common/AnimatedToast';

// Pages
import DashboardPage from './components/Dashboard/DashboardPage';
import TransactionsPage from './components/Transactions/TransactionsPage';
import CreditCardsPage from './components/CreditCards/CreditCardsPage';
import BudgetsPage from './components/Budgets/BudgetsPage';
import SettingsPage from './components/Settings/SettingsPage';

// Modals
import AddTransactionModal from './components/Modals/AddTransactionModal';
import BudgetModal from './components/Modals/BudgetModal';
import ImportCSVModal from './components/Modals/ImportCSVModal';

// Icons
import { LogOut, DollarSign } from 'lucide-react';

// Framer Motion
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants } from './components/Common/AnimationVariants';

// Hooks
import { useToast } from './hooks/useToast';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state here
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>();
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('₹'); // Default currency
  const [isImportCSVModalOpen, setIsImportCSVModalOpen] = useState(false);
  const [userCategories, setUserCategories] = useState<string[]>(categories); // Add user categories state
  const [showReauthModal, setShowReauthModal] = useState(false);
  
  // Toast system
  const { toasts, showToast, removeToast } = useToast();
  
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
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            if (userData.defaultAccountId) {
              setDefaultAccountId(userData.defaultAccountId);
            }
            if (userData.currency) {
              setCurrency(userData.currency);
            }
            if (userData.themePreference) {
              setDarkMode(userData.themePreference === 'dark');
            }
            // Load user categories if they exist
            if (userData.categories) {
              setUserCategories(userData.categories);
            }
          }
        } catch (error) {
          console.error("Error fetching user settings: ", error);
        }
      }
      setLoading(false);
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
    
    // Save theme preference to Firebase
    if (user) {
      const userDocRef = doc(db, 'spenders', user.uid);
      setDoc(userDocRef, { themePreference: darkMode ? 'dark' : 'light' }, { merge: true });
    }
  }, [darkMode, user]);

  // Save categories to Firebase when they change
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'spenders', user.uid);
      setDoc(userDocRef, { categories: userCategories }, { merge: true });
    }
  }, [userCategories, user]);

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
        showToast('Transaction updated successfully!', 'success');
      } else {
        await addDoc(transactionsRef, transactionData);
        showToast('Transaction added successfully!', 'success');
      }
    } catch (error) {
      console.error("Error adding/updating transaction: ", error);
      showToast('Error adding/updating transaction', 'error');
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
      showToast('Transaction deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting transaction: ", error);
      showToast('Error deleting transaction', 'error');
    }
  };

  const handleAddAccount = async (accountData: Omit<Account, 'id'>) => {
    if (!user) return;
    try {
      const accountsRef = collection(db, 'spenders', user.uid, 'accounts');
      await addDoc(accountsRef, accountData);
      showToast('Account added successfully!', 'success');
    } catch (error) {
      console.error("Error adding account: ", error);
      showToast('Error adding account', 'error');
    }
  };

  const handleEditAccount = async (account: Account) => {
    if (!user) return;
    try {
      const accountDoc = doc(db, 'spenders', user.uid, 'accounts', account.id);
      const { id, ...accountData } = account;
      await updateDoc(accountDoc, accountData);
      showToast('Account updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating account: ", error);
      showToast('Error updating account', 'error');
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!user) return;
    try {
      const accountDoc = doc(db, 'spenders', user.uid, 'accounts', id);
      await deleteDoc(accountDoc);
      showToast('Account deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting account: ", error);
      showToast('Error deleting account', 'error');
    }
  };

  const handleUpdateCurrency = async (newCurrency: string) => {
    setCurrency(newCurrency);
    if (!user) return;
    try {
      const userDocRef = doc(db, 'spenders', user.uid);
      await updateDoc(userDocRef, { currency: newCurrency });
    } catch (error) {
      console.error("Error updating currency: ", error);
    }
  };

  // Add category management functions
  const handleAddCategory = (category: string) => {
    if (category && !userCategories.includes(category)) {
      setUserCategories([...userCategories, category]);
    }
  };

  const handleEditCategory = (oldCategory: string, newCategory: string) => {
    if (newCategory && newCategory !== oldCategory) {
      // Update the category in the user's list
      const updatedCategories = userCategories.map(cat => cat === oldCategory ? newCategory : cat);
      setUserCategories(updatedCategories);
      
      // Update all transactions with this category
      setTransactions(prevTransactions => 
        prevTransactions.map(tx => 
          tx.category === oldCategory ? { ...tx, category: newCategory } : tx
        )
      );
    }
  };

  const handleDeleteCategory = (category: string) => {
    if (userCategories.includes(category)) {
      // Remove the category from the user's list
      const updatedCategories = userCategories.filter(cat => cat !== category);
      setUserCategories(updatedCategories);
      
      // Update all transactions with this category to "Other"
      setTransactions(prevTransactions => 
        prevTransactions.map(tx => 
          tx.category === category ? { ...tx, category: 'Other' } : tx
        )
      );
    }
  };

  const handleResetCategories = () => {
    setUserCategories(getDefaultCategories());
  };

  // Add function to update category order
  const handleUpdateCategories = (categories: string[]) => {
    setUserCategories(categories);
  };

  const handleAddBudget = async (budgetData: Omit<Budget, 'id'>) => {
    if (!user) return;
    try {
      const budgetsRef = collection(db, 'spenders', user.uid, 'budgets');
      if (editingBudget) {
        const budgetDoc = doc(db, 'spenders', user.uid, 'budgets', editingBudget.id);
        await updateDoc(budgetDoc, budgetData);
        setEditingBudget(undefined);
        showToast('Budget updated successfully!', 'success');
      } else {
        await addDoc(budgetsRef, budgetData);
        showToast('Budget added successfully!', 'success');
      }
    } catch (error) {
      console.error("Error adding/updating budget: ", error);
      showToast('Error adding/updating budget', 'error');
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
      showToast('Budget deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting budget: ", error);
      showToast('Error deleting budget', 'error');
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Date', 'Name', 'Category', 'Amount', 'Type'],
      ...filteredTransactions.map(t => [
        t.date,
        t.name,
        t.category,
        t.amount,
        t.type
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions.csv';
    a.click();
  };

  const handleImportCSV = async (transactions: Omit<Transaction, 'id'>[]) => {
    if (!user) return;
    
    try {
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      const batch = writeBatch(db);
      
      // Add all transactions in a batch operation
      transactions.forEach(transaction => {
        const newTransactionRef = doc(transactionsRef);
        batch.set(newTransactionRef, transaction);
      });
      
      await batch.commit();
      showToast(`${transactions.length} transactions imported successfully!`, 'success');
    } catch (error) {
      console.error("Error importing transactions: ", error);
      showToast('Error importing transactions', 'error');
    }
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

  const handleLoadMockData = async () => {
    if (!user) return;
    
    try {
      // Clear existing mock data first
      await handleClearMockData();
      
      // Add mock transactions
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      const transactionBatch = writeBatch(db);
      mockTransactions.forEach(transaction => {
        const newTransactionRef = doc(transactionsRef);
        transactionBatch.set(newTransactionRef, transaction);
      });
      await transactionBatch.commit();
      
      // Add mock accounts
      const accountsRef = collection(db, 'spenders', user.uid, 'accounts');
      const accountBatch = writeBatch(db);
      mockAccounts.forEach(account => {
        const newAccountRef = doc(accountsRef);
        accountBatch.set(newAccountRef, account);
      });
      await accountBatch.commit();
      
      // Add mock budgets
      const budgetsRef = collection(db, 'spenders', user.uid, 'budgets');
      const budgetBatch = writeBatch(db);
      mockBudgets.forEach(budget => {
        const newBudgetRef = doc(budgetsRef);
        budgetBatch.set(newBudgetRef, budget);
      });
      await budgetBatch.commit();
      
      showToast('Mock data loaded successfully!', 'success');
    } catch (error) {
      console.error("Error loading mock data: ", error);
      showToast('Error loading mock data', 'error');
    }
  };

  const handleClearMockData = async () => {
    if (!user) return;
    
    try {
      // Get references to all collections
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      const accountsRef = collection(db, 'spenders', user.uid, 'accounts');
      const budgetsRef = collection(db, 'spenders', user.uid, 'budgets');
      
      // Get all documents in each collection
      const transactionsSnapshot = await getDocs(transactionsRef);
      const accountsSnapshot = await getDocs(accountsRef);
      const budgetsSnapshot = await getDocs(budgetsRef);
      
      // Delete only mock transactions
      const transactionBatch = writeBatch(db);
      transactionsSnapshot.docs.forEach(doc => {
        if (doc.data().isMock === true) {
          transactionBatch.delete(doc.ref);
        }
      });
      await transactionBatch.commit();
      
      // Delete only mock accounts
      const accountBatch = writeBatch(db);
      accountsSnapshot.docs.forEach(doc => {
        if (doc.data().isMock === true) {
          accountBatch.delete(doc.ref);
        }
      });
      await accountBatch.commit();
      
      // Delete only mock budgets
      const budgetBatch = writeBatch(db);
      budgetsSnapshot.docs.forEach(doc => {
        if (doc.data().isMock === true) {
          budgetBatch.delete(doc.ref);
        }
      });
      await budgetBatch.commit();
      
      showToast('Mock data cleared successfully!', 'success');
    } catch (error) {
      console.error("Error clearing mock data: ", error);
      showToast('Error clearing mock data', 'error');
    }
  };

  const handleReauthenticate = async () => {
    setShowReauthModal(false);
    if (!user) return;

    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      // If re-authentication is successful, retry deleting the user
      await handleDeleteUserAccount();
    } catch (reauthError) {
      console.error("Error during re-authentication: ", reauthError);
      showToast('Failed to re-authenticate. Please try again.', 'error');
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

  const getSecondaryActionButton = () => {
    if (currentScreen === 'transactions') {
      return {
        label: 'Import CSV',
        onClick: () => setIsImportCSVModalOpen(true),
        variant: 'primary' as const
      };
    }
    return undefined;
  };

  const renderCurrentPage = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <motion.div
            key="dashboard"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <DashboardPage
              transactions={transactions}
              accounts={regularAccounts}
              budgets={budgets}
              onViewAllTransactions={() => setCurrentScreen('transactions')}
              currency={currency}
            />
          </motion.div>
        );
      case 'transactions':
        return (
          <motion.div
            key="transactions"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
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
              categories={userCategories} // Use user categories
              currency={currency}
            />
          </motion.div>
        );
      case 'credit-cards':
        return (
          <motion.div
            key="credit-cards"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CreditCardsPage
              accounts={creditCards}
              transactions={transactions}
              onAddAccount={handleAddAccount}
              onEditAccount={handleEditAccount}
              onDeleteAccount={handleDeleteAccount}
              currency={currency}
            />
          </motion.div>
        );
      case 'budgets':
        return (
          <motion.div
            key="budgets"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <BudgetsPage 
              budgets={budgets} 
              transactions={transactions}
              onEditBudget={handleEditBudget}
              onAddBudget={() => setIsBudgetModalOpen(true)}
              onDeleteBudget={handleDeleteBudget}
              currency={currency}
            />
          </motion.div>
        );
      case 'settings':
        return (
          <motion.div
            key="settings"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
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
              currency={currency}
              categories={userCategories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              onResetCategories={handleResetCategories}
              onUpdateCategories={handleUpdateCategories}
              onLoadMockData={handleLoadMockData}
              onClearMockData={handleClearMockData}
              onDeleteUserAccount={handleDeleteUserAccount}
            />
          </motion.div>
        );
      default:
        return (
          <motion.div
            key="default"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <DashboardPage transactions={transactions} accounts={regularAccounts} budgets={budgets} onViewAllTransactions={() => setCurrentScreen('transactions')} currency={currency} />
          </motion.div>
        );
    }
  };

  const handleDeleteUserAccount = async () => {
    if (!user) return;

    try {
      // Delete all subcollections first
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      const accountsRef = collection(db, 'spenders', user.uid, 'accounts');
      const budgetsRef = collection(db, 'spenders', user.uid, 'budgets');

      const transactionsSnapshot = await getDocs(transactionsRef);
      const accountsSnapshot = await getDocs(accountsRef);
      const budgetsSnapshot = await getDocs(budgetsRef);

      const batch = writeBatch(db);

      transactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      accountsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      budgetsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

      await batch.commit();

      // Delete the main user document
      const userDocRef = doc(db, 'spenders', user.uid);
      await deleteDoc(userDocRef);

      // Delete the user from Firebase Authentication
      await deleteUser(user);

      // Sign out and reset state
      handleLogout();
      showToast('Your account has been permanently deleted.', 'success');
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setShowReauthModal(true);
      } else {
        console.error("Error deleting user account: ", error);
        showToast('Error deleting your account. Please try again.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <motion.div 
        className="min-h-screen bg-[#1A1A1A] flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div 
          className="text-[#F5F5F5]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div 
            className="flex items-center justify-center space-x-2"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div 
              className="bg-[#007BFF] p-2 rounded-lg"
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            >
              <DollarSign className="h-6 w-6 text-white" />
            </motion.div>
            <motion.span 
              className="text-xl font-semibold"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              Loading SpendWiser...
            </motion.span>
          </motion.div>
          <motion.div 
            className="mt-4 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <motion.div 
              className="rounded-full h-8 w-8 border-b-2 border-[#007BFF]"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </motion.div>
        
        {/* Footer with attribution */}
        <motion.div 
          className="absolute bottom-4 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <p className="text-sm text-[#888888]">
            Built with <span className="text-red-500">❤️</span> by <a href="https://hariharen9.site" target="_blank" rel="noopener noreferrer" className="text-[#007BFF] hover:underline">Hariharen</a> © 2025
          </p>
        </motion.div>
      </motion.div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#1A1A1A] overflow-hidden">
      {/* Toast notifications */}
      <AnimatePresence>
        {toasts.map((toast) => (
          <AnimatedToast
            key={toast.id}
            message={toast.message}
            type={toast.type === 'info' ? 'success' : toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>

      {/* Top Bar for Mobile */}
      <div className="md:hidden bg-white dark:bg-[#242424] border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-[#007BFF] p-2 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">SpendWiser</h1>
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
              secondaryActionButton={getSecondaryActionButton()}
              onAddTransaction={() => setIsAddTransactionModalOpen(true)}
            />
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            <AnimatePresence mode="wait">
              {renderCurrentPage()}
            </AnimatePresence>
          </main>
          
          {/* Footer with attribution */}
          <footer className="py-4 text-center text-sm text-gray-500 dark:text-[#888888]">
            <p>
              Built with <span className="text-red-500">❤️</span> by <a href="https://hariharen9.site" target="_blank" rel="noopener noreferrer" className="text-[#007BFF] hover:underline dark:text-[#007BFF]">Hariharen</a> © 2025
            </p>
          </footer>
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
        categories={userCategories} // Pass user categories to the modal
      />

      {/* Import CSV Modal */}
      <ImportCSVModal
        isOpen={isImportCSVModalOpen}
        onClose={() => setIsImportCSVModalOpen(false)}
        onImport={handleImportCSV}
        currency={currency}
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

      {/* Re-authentication Info Modal */}
      <AnimatePresence>
        {showReauthModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReauthModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">Security Check Required</h2>
                <motion.button
                  onClick={() => setShowReauthModal(false)}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </motion.div>

              <motion.div
                className="p-6 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-gray-700 dark:text-gray-300">
                  For your security, you need to re-authenticate to confirm your identity before deleting your account.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Please click "Continue" to sign in again.
                </p>

                <motion.div
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => setShowReauthModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleReauthenticate}
                    className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continue
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;