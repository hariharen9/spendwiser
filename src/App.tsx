import React, { useState, useEffect, useMemo } from 'react';
import { Screen, Transaction, Account, Budget, TotalBudget } from './types/types';
import { User, deleteUser, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, writeBatch, getDocs } from 'firebase/firestore';
import { categories, getDefaultCategories, mockTransactions, mockAccounts, mockBudgets, mockCreditCards } from './data/mockData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
import ExportModal from './components/Modals/ExportModal';

// Icons
import { LogOut, DollarSign, X } from 'lucide-react';

// Framer Motion
import { AnimatePresence, motion } from 'framer-motion';
import { pageVariants, modalVariants } from './components/Common/AnimationVariants';

// Hooks
import { useToast } from './hooks/useToast';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Add loading state here
  const [authChecked, setAuthChecked] = useState(false);
  const [transactionsLoaded, setTransactionsLoaded] = useState(false);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [budgetsLoaded, setBudgetsLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [totalBudget, setTotalBudget] = useState<TotalBudget | null>(null);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>();
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('₹'); // Default currency
  const [isImportCSVModalOpen, setIsImportCSVModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [userCategories, setUserCategories] = useState<string[]>([]); // Add user categories state
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  
  // Toast system
  const { toasts, showToast, removeToast } = useToast();
  
  // Transaction filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [hasLoadedMockData, setHasLoadedMockData] = useState(false);
  const [hasShownMockDataReminder, setHasShownMockDataReminder] = useState(false);

  const checkIfMockDataExists = async (uid: string) => {
    const transactionsRef = collection(db, 'spenders', uid, 'transactions');
    const accountsRef = collection(db, 'spenders', uid, 'accounts');
    const budgetsRef = collection(db, 'spenders', uid, 'budgets');

    const transactionsSnapshot = await getDocs(transactionsRef);
    const accountsSnapshot = await getDocs(accountsRef);
    const budgetsSnapshot = await getDocs(budgetsRef);

    const hasMockTransactions = transactionsSnapshot.docs.some(doc => doc.data().isMock === true);
    const hasMockAccounts = accountsSnapshot.docs.some(doc => doc.data().isMock === true);
    const hasMockBudgets = budgetsSnapshot.docs.some(doc => doc.data().isMock === true);

    return hasMockTransactions || hasMockAccounts || hasMockBudgets;
  };

  useEffect(() => {
    const authUnsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setAuthChecked(true);
    });

    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    const allDataLoaded = transactionsLoaded && accountsLoaded && budgetsLoaded && categoriesLoaded;
    if (authChecked) {
      if (user && allDataLoaded) {
        setLoading(false);
      }
      if (!user) {
        setLoading(false);
      }
    }
  }, [user, authChecked, transactionsLoaded, accountsLoaded, budgetsLoaded, categoriesLoaded]);

  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, 'spenders', user.uid);
      const unsubscribe = onSnapshot(userDocRef, async (userDocSnap) => {
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
          // Load user categories if they exist, otherwise use default categories
          if (userData.categories) {
            setUserCategories(userData.categories);
          } else {
            setUserCategories(getDefaultCategories());
          }
        } else {
          // If the user document doesn't exist, create it with default categories
          const defaultCategories = getDefaultCategories();
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName,
            categories: defaultCategories,
          });
          setUserCategories(defaultCategories);
        }
        setCategoriesLoaded(true);
      }, (error) => {
        console.error("Error fetching user settings: ", error);
      });

      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      const unsubscribe = onSnapshot(transactionsRef, snapshot => {
        const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Transaction[];
        setTransactions(transactionsData);
        setTransactionsLoaded(true);
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
        setAccountsLoaded(true);
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
        setBudgetsLoaded(true);
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Total budget listener
  useEffect(() => {
    if (user) {
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');
      const unsubscribe = onSnapshot(totalBudgetRef, (doc) => {
        if (doc.exists()) {
          setTotalBudget({ id: doc.id, ...doc.data() } as TotalBudget);
        } else {
          setTotalBudget(null);
        }
      });
      return () => unsubscribe();
    }
  }, [user]);

  // Add total budget monitoring for toast notifications
  useEffect(() => {
    if (totalBudget && transactions.length > 0) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (totalBudget.month === currentMonth) {
        const monthlyExpenses = transactions
          .filter(t => {
            const txDate = new Date(t.date);
            return t.type === 'expense' && 
                   txDate.toISOString().slice(0, 7) === currentMonth;
          })
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        
        const percentageUsed = (monthlyExpenses / totalBudget.limit) * 100;
        
        if (percentageUsed >= 80 && percentageUsed < 100) {
          showToast(
            `You've used ${Math.round(percentageUsed)}% of your monthly budget. ${Math.round(totalBudget.limit - monthlyExpenses)} ${currency} remaining.`,
            'warning'
          );
        }
      }
    }
  }, [transactions, totalBudget, currency, showToast]);

  // Effect to load mock data if user has no data
  useEffect(() => {
    const allDataLoaded = transactionsLoaded && accountsLoaded && budgetsLoaded && categoriesLoaded;

    if (user && !loading && allDataLoaded && !hasLoadedMockData &&
        transactions.length === 0 && accounts.length === 0 && budgets.length === 0) {
      
      const loadMockData = async () => {
        await handleLoadMockData();
        setHasLoadedMockData(true);
        showToast(
          'Welcome! We\'ve loaded some mock data to get you started. You can clear it from Settings.',
          'info'
        );
      };

      loadMockData();
    }
  }, [user, loading, hasLoadedMockData, transactionsLoaded, accountsLoaded, budgetsLoaded, categoriesLoaded, transactions, accounts, budgets]);


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

  

  // Effect to show mock data reminder in settings
  useEffect(() => {
    const showReminder = async () => {
      if (user && currentScreen === 'settings' && !hasShownMockDataReminder) {
        const mockDataExists = await checkIfMockDataExists(user.uid);
        if (mockDataExists) {
          showToast(
            'Psst! Your financial journey awaits! Clear the mock data in Settings to start fresh.',
            'info'
          );
          setHasShownMockDataReminder(true);
        }
      }
    };
    showReminder();
  }, [user, currentScreen, hasShownMockDataReminder]);

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
    setHasLoadedMockData(false);
    setHasShownMockDataReminder(false);
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
  const handleAddCategory = async (category: string) => {
    if (category && !userCategories.includes(category)) {
      const newCategories = [...userCategories, category];
      setUserCategories(newCategories);
      if (user) {
        const userDocRef = doc(db, 'spenders', user.uid);
        await updateDoc(userDocRef, { categories: newCategories });
      }
    }
  };

  const handleEditCategory = async (oldCategory: string, newCategory: string) => {
    if (newCategory && newCategory !== oldCategory && user) {
      const updatedCategories = userCategories.map(cat => cat === oldCategory ? newCategory : cat);
      setUserCategories(updatedCategories);
  
      const userDocRef = doc(db, 'spenders', user.uid);
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
  
      try {
        const batch = writeBatch(db);
  
        // Update categories array in user document
        batch.update(userDocRef, { categories: updatedCategories });
  
        // Find all transactions with the old category and update them
        const transactionsToUpdate = transactions.filter(tx => tx.category === oldCategory);
        transactionsToUpdate.forEach(tx => {
          const transactionDocRef = doc(transactionsRef, tx.id);
          batch.update(transactionDocRef, { category: newCategory });
        });
  
        await batch.commit();
        showToast('Category and associated transactions updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating category and transactions: ", error);
        showToast('Error updating category.', 'error');
        // Revert UI changes on error
        setUserCategories(userCategories);
      }
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (userCategories.includes(category) && user) {
      const updatedCategories = userCategories.filter(cat => cat !== category);
      setUserCategories(updatedCategories);

      const userDocRef = doc(db, 'spenders', user.uid);
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');

      try {
        const batch = writeBatch(db);

        // Update categories array in user document
        batch.update(userDocRef, { categories: updatedCategories });

        // Find all transactions with the category and update them to "Other"
        const transactionsToUpdate = transactions.filter(tx => tx.category === category);
        transactionsToUpdate.forEach(tx => {
          const transactionDocRef = doc(transactionsRef, tx.id);
          batch.update(transactionDocRef, { category: 'Other' });
        });

        await batch.commit();
        showToast('Category deleted and transactions moved to "Other".', 'success');
      } catch (error) {
        console.error("Error deleting category and updating transactions: ", error);
        showToast('Error deleting category.', 'error');
        // Revert UI changes on error
        setUserCategories(userCategories);
      }
    }
  };

  const handleResetCategories = async () => {
    const defaultCategories = getDefaultCategories();
    setUserCategories(defaultCategories);
    if (user) {
      const userDocRef = doc(db, 'spenders', user.uid);
      await updateDoc(userDocRef, { categories: defaultCategories });
    }
  };

  // Add function to update category order
  const handleUpdateCategories = async (categories: string[]) => {
    setUserCategories(categories);
    if (user) {
      const userDocRef = doc(db, 'spenders', user.uid);
      await updateDoc(userDocRef, { categories: categories });
    }
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

  const handleSaveTotalBudget = async (limit: number) => {
    if (!user) return;
    
    try {
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const totalBudgetData: Omit<TotalBudget, 'id'> = {
        limit,
        month: currentMonth,
        isMock: false
      };
      
      await setDoc(totalBudgetRef, totalBudgetData);
      showToast('Total monthly budget set successfully!', 'success');
    } catch (error) {
      console.error("Error saving total budget: ", error);
      showToast('Error saving total budget', 'error');
    }
  };

  const handleDeleteTotalBudget = async () => {
    if (!user) return;
    
    try {
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');
      await deleteDoc(totalBudgetRef);
      setTotalBudget(null);
      showToast('Total monthly budget removed successfully!', 'success');
    } catch (error) {
      console.error("Error deleting total budget: ", error);
      showToast('Error deleting total budget', 'error');
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
      await setDoc(userDocRef, { defaultAccountId: accountId }, { merge: true });
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
      
      // Add mock accounts (including credit cards)
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
      
      // Add mock total budget
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');
      const mockTotalBudget: Omit<TotalBudget, 'id'> = {
        limit: 50000,
        month: new Date().toISOString().slice(0, 7),
        isMock: true
      };
      await setDoc(totalBudgetRef, mockTotalBudget);
      
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
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');
      
      // Get all documents in each collection
      const transactionsSnapshot = await getDocs(transactionsRef);
      const accountsSnapshot = await getDocs(accountsRef);
      const budgetsSnapshot = await getDocs(budgetsRef);
      const totalBudgetSnapshot = await getDoc(totalBudgetRef);
      
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
      
      // Delete mock total budget if it exists
      if (totalBudgetSnapshot.exists() && totalBudgetSnapshot.data().isMock === true) {
        await deleteDoc(totalBudgetRef);
      }
      
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

  const handleExportDashboard = async (format: 'pdf' | 'png') => {
    const dashboardElement = document.getElementById('dashboard-content');
    if (!dashboardElement) return;

    const canvas = await html2canvas(dashboardElement);
    if (format === 'png') {
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'dashboard.png';
      link.click();
    } else {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('dashboard.pdf');
    }
    setIsExportModalOpen(false);
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
            id="dashboard-content"
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
              totalBudget={totalBudget}
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
              totalBudget={totalBudget}
              onEditBudget={handleEditBudget}
              onAddBudget={() => setIsBudgetModalOpen(true)}
              onDeleteBudget={handleDeleteBudget}
              onSaveTotalBudget={handleSaveTotalBudget}
              onDeleteTotalBudget={handleDeleteTotalBudget}
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
              onBackupData={handleBackupData}
              onRestoreData={handleRestoreData}
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
            <DashboardPage 
              transactions={transactions} 
              accounts={regularAccounts} 
              budgets={budgets} 
              totalBudget={totalBudget}
              onViewAllTransactions={() => setCurrentScreen('transactions')} 
              currency={currency} 
            />
          </motion.div>
        );
    }
  };

  const handleBackupData = () => {
    if (!user) return;

    const backupData = {
      transactions,
      accounts,
      budgets,
      userCategories,
      settings: {
        darkMode,
        currency,
        defaultAccountId,
      },
      metadata: {
        backupDate: new Date().toISOString(),
        version: '1.0.0', // You can get this from package.json
      },
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spendwiser-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Data backup successful!', 'success');
  };

  const handleRestoreData = async (data: any) => {
    if (!user) return;

    try {
      // 1. Clear existing data
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

      // 2. Restore new data
      const restoreBatch = writeBatch(db);

      data.transactions.forEach((transaction: Transaction) => {
        const { id, ...transactionData } = transaction;
        const newTransactionRef = doc(transactionsRef, id);
        restoreBatch.set(newTransactionRef, transactionData);
      });

      data.accounts.forEach((account: Account) => {
        const { id, ...accountData } = account;
        const newAccountRef = doc(accountsRef, id);
        restoreBatch.set(newAccountRef, accountData);
      });

      data.budgets.forEach((budget: Budget) => {
        const { id, ...budgetData } = budget;
        const newBudgetRef = doc(budgetsRef, id);
        restoreBatch.set(newBudgetRef, budgetData);
      });

      await restoreBatch.commit();

      // 3. Restore settings
      if (data.settings) {
        setDarkMode(data.settings.darkMode);
        setCurrency(data.settings.currency);
        setDefaultAccountId(data.settings.defaultAccountId);
        const userDocRef = doc(db, 'spenders', user.uid);
        await setDoc(userDocRef, { 
          themePreference: data.settings.darkMode ? 'dark' : 'light',
          currency: data.settings.currency,
          defaultAccountId: data.settings.defaultAccountId
        }, { merge: true });
      }

      if (data.userCategories) {
        setUserCategories(data.userCategories);
        const userDocRef = doc(db, 'spenders', user.uid);
        await setDoc(userDocRef, { categories: data.userCategories }, { merge: true });
      }

      showToast('Data restored successfully!', 'success');
    } catch (error) {
      console.error("Error restoring data: ", error);
      showToast('Error restoring data', 'error');
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
        categories={userCategories}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportDashboard}
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