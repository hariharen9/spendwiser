import React, { useState, useEffect, useMemo } from 'react';
import { Screen, Transaction, Account, Budget, TotalBudget, Goal, Loan, RecurringTransaction, Shortcut } from './types/types';
import { User, deleteUser, GoogleAuthProvider, reauthenticateWithPopup, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, setDoc, getDoc, writeBatch, getDocs, increment } from 'firebase/firestore';
import { categories, getDefaultCategories, mockTransactions, mockAccounts, mockBudgets, mockCreditCards, mockGoals, mockLoans } from './data/mockData';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Components
import LoginPage from './components/Login/LoginPage';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FAB from './components/Common/FAB';
import HelpFAB from './components/Common/HelpFAB';
import AnimatedToast from './components/Common/AnimatedToast';
import ConnectionStatus from './components/Common/ConnectionStatus';

// Pages
import DashboardPage from './components/Dashboard/DashboardPage';
import TransactionsPage from './components/Transactions/TransactionsPage';
import CreditCardsPage from './components/CreditCards/CreditCardsPage';
import BudgetsPage from './components/Budgets/BudgetsPage';
import GoalsPage from './components/Goals/GoalsPage';
import SettingsPage from './components/Settings/SettingsPage';
import LoansPage from './components/Loans/LoansPage';

// Modals
import AddTransactionModal from './components/Modals/AddTransactionModal';
import BudgetModal from './components/Modals/BudgetModal';
import GoalModal from './components/Modals/GoalModal';
import AddFundsModal from './components/Modals/AddFundsModal';
import HelpModal from './components/Modals/HelpModal';
import ImportCSVModal from './components/Modals/ImportCSVModal';
import ExportModal from './components/Modals/ExportModal';
import LoanModal from './components/Modals/LoanModal';
import RecurringTransactionModal from './components/Modals/RecurringTransactionModal';
import FeedbackModal from './components/Modals/FeedbackModal';
import ShortcutModal from './components/Modals/ShortcutModal';

// Icons
import { LogOut, DollarSign, X, Sun, Moon } from 'lucide-react';

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
  const [goalsLoaded, setGoalsLoaded] = useState(false);
  const [loansLoaded, setLoansLoaded] = useState(false);
  const [recurringTransactionsLoaded, setRecurringTransactionsLoaded] = useState(false);
  const [shortcutsLoaded, setShortcutsLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [totalBudget, setTotalBudget] = useState<TotalBudget | null>(null);
  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>();
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | undefined>();
  const [isRecurringTransactionModalOpen, setIsRecurringTransactionModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [helpModalPage, setHelpModalPage] = useState('transactions'); // Add this state for help modal page
  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState<Shortcut | undefined>();
  const [darkMode, setDarkMode] = useState(true); // Default to dark mode
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [defaultAccountId, setDefaultAccountId] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('₹'); // Default currency
  const [isImportCSVModalOpen, setIsImportCSVModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [userCategories, setUserCategories] = useState<string[]>([]); // Add user categories state
  const [showReauthModal, setShowReauthModal] = useState(false);
  const [showPasswordReauthModal, setShowPasswordReauthModal] = useState(false);
  const [reauthPassword, setReauthPassword] = useState('');
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [selectedFont, setSelectedFont] = useState<string>('Montserrat'); // Default font
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackPromptTransactionCount, setFeedbackPromptTransactionCount] = useState(0);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  
  // Toast system
  const { toasts, showToast, removeToast } = useToast();

  // Analytics document reference
  const analyticsGlobalRef = doc(db, 'analytics', 'global');
  
  // Transaction filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [transactionType, setTransactionType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return firstDay.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0];
  });
  const [sortOption, setSortOption] = useState('date');

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
    const authUnsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      setAuthChecked(true);

      // Initialize global analytics document if it doesn't exist
      if (user) { // Only attempt if a user is logged in
        const analyticsSnap = await getDoc(analyticsGlobalRef);
        if (!analyticsSnap.exists()) {
          await setDoc(analyticsGlobalRef, {
            totalUsers: 0,
            totalTransactions: 0,
            totalIncome: 0.00,
            totalExpenses: 0.00,
            totalAccounts: 0,
            totalBudgets: 0,
            totalGoals: 0,
            totalLoans: 0,
            totalRecurringTransactions: 0,
            totalCSVImports: 0,
            totalCSVExports: 0,
            totalPDFExports: 0,
            totalBackups: 0,
            totalRestores: 0,
            totalMockDataLoads: 0,
            totalMockDataClears: 0,
          });
        }
      }
    });

    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    const allDataLoaded = transactionsLoaded && accountsLoaded && budgetsLoaded && categoriesLoaded && goalsLoaded && loansLoaded && recurringTransactionsLoaded && shortcutsLoaded;
    if (authChecked) {
      if (user && allDataLoaded) {
        setLoading(false);
      }
      if (!user) {
        setLoading(false);
      }
    }
  }, [user, authChecked, transactionsLoaded, accountsLoaded, budgetsLoaded, categoriesLoaded, goalsLoaded, loansLoaded, shortcutsLoaded]);

  useEffect(() => {
    if (user) {
      const shortcutsRef = collection(db, 'spenders', user.uid, 'shortcuts');
      const unsubscribe = onSnapshot(shortcutsRef, snapshot => {
        const shortcutsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Shortcut[];
        setShortcuts(shortcutsData);
        setShortcutsLoaded(true);
      });
      return () => unsubscribe();
    }
  }, [user]);

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
          } else {
            // If themePreference doesn't exist, set it to dark mode by default for existing users
            setDarkMode(true);
          }
          if (userData.fontPreference) {
            setSelectedFont(userData.fontPreference);
          } else {
            setSelectedFont('Montserrat'); // Default font for existing users
          }
          setThemeLoaded(true);
          // Load user categories if they exist, otherwise use default categories
          if (userData.categories) {
            setUserCategories(userData.categories);
          } else {
            setUserCategories(getDefaultCategories());
          }
        } else {
          // If the user document doesn't exist, create it with default categories and dark theme
          const defaultCategories = getDefaultCategories();
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName,
            categories: defaultCategories,
            themePreference: 'dark', // Set dark theme for new users
            fontPreference: 'Montserrat', // Set default font for new users
          });
          // Increment totalUsers analytics
          await updateDoc(analyticsGlobalRef, {
              totalUsers: increment(1)
          });
          setUserCategories(defaultCategories);
          setDarkMode(true);
          setThemeLoaded(true);
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

  // Apply font preference to the document body
  useEffect(() => {
    document.body.style.fontFamily = `'${selectedFont}', sans-serif`;
  }, [selectedFont]);

  const onUpdateFont = async (font: string) => {
    if (user) {
      const userDocRef = doc(db, 'spenders', user.uid);
      await updateDoc(userDocRef, {
        fontPreference: font,
      });
      setSelectedFont(font);
      showToast('Font preference updated!', 'success');
    }
  };

  const onToggleDarkMode = async () => {
    if (user) {
      const userDocRef = doc(db, 'spenders', user.uid);
      await updateDoc(userDocRef, {
        themePreference: !darkMode ? 'dark' : 'light',
      });
      setDarkMode(!darkMode);
    }
  };

  const onAddAccount = async (account: Omit<Account, 'id'>) => {
    if (user) {
      await addDoc(collection(db, 'spenders', user.uid, 'accounts'), {
        ...account,
        userId: user.uid,
      });
      showToast('Account added successfully!', 'success');
    }
  };

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

  useEffect(() => {
    if (user) {
      const goalsRef = collection(db, 'spenders', user.uid, 'goals');
      const unsubscribe = onSnapshot(goalsRef, snapshot => {
        const goalsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Goal[];
        setGoals(goalsData);
        setGoalsLoaded(true);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const loansRef = collection(db, 'spenders', user.uid, 'loans');
      const unsubscribe = onSnapshot(loansRef, snapshot => {
        const loansData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Loan[];
        setLoans(loansData);
        setLoansLoaded(true);
      });
      return () => unsubscribe();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const recurringTransactionsRef = collection(db, 'spenders', user.uid, 'recurring_transactions');
      const unsubscribe = onSnapshot(recurringTransactionsRef, snapshot => {
        const recurringTransactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RecurringTransaction[];
        setRecurringTransactions(recurringTransactionsData);
        setRecurringTransactionsLoaded(true);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const processRecurringTransactions = async () => {
    if (!user || !recurringTransactionsLoaded) return;

    const batch = writeBatch(db);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    for (const rt of recurringTransactions) {
      let lastProcessed = new Date(rt.lastProcessedDate);
      lastProcessed.setHours(0, 0, 0, 0);
      
      let nextTransactionDate = new Date(lastProcessed);

      while (nextTransactionDate < today) {
        switch (rt.frequency) {
          case 'daily':
            nextTransactionDate.setDate(nextTransactionDate.getDate() + 1);
            break;
          case 'weekly':
            nextTransactionDate.setDate(nextTransactionDate.getDate() + 7);
            break;
          case 'monthly':
            nextTransactionDate.setMonth(nextTransactionDate.getMonth() + 1);
            break;
          case 'yearly':
            nextTransactionDate.setFullYear(nextTransactionDate.getFullYear() + 1);
            break;
        }

        if (nextTransactionDate < today && (!rt.endDate || nextTransactionDate < new Date(rt.endDate))) {
          const newTransactionData = {
            name: rt.name,
            amount: rt.amount,
            date: nextTransactionDate.toISOString().split('T')[0],
            category: rt.category,
            type: rt.type,
            accountId: rt.accountId,
          };
          const newTransactionRef = doc(collection(db, 'spenders', user.uid, 'transactions'));
          batch.set(newTransactionRef, newTransactionData);
        }
      }

      const recurringTransactionRef = doc(db, 'spenders', user.uid, 'recurring_transactions', rt.id);
      batch.update(recurringTransactionRef, { lastProcessedDate: today.toISOString().split('T')[0] });
    }

    try {
      await batch.commit();
    } catch (error) {
      console.error("Error processing recurring transactions: ", error);
    }
  };

  useEffect(() => {
    if(user && recurringTransactionsLoaded) {
        processRecurringTransactions();
    }
  }, [user, recurringTransactionsLoaded]);

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
        
        if (percentageUsed >= 90 && percentageUsed < 100) {
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
    const allDataLoaded = transactionsLoaded && accountsLoaded && budgetsLoaded && categoriesLoaded && goalsLoaded && loansLoaded;

    if (user && !loading && allDataLoaded && !hasLoadedMockData &&
        transactions.length === 0 && accounts.length === 0 && budgets.length === 0 && goals.length === 0 && loans.length === 0) {
      
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
  }, [user, loading, hasLoadedMockData, transactionsLoaded, accountsLoaded, budgetsLoaded, categoriesLoaded, goalsLoaded, loansLoaded, transactions, accounts, budgets, goals, loans]);


  useEffect(() => {
    if (!themeLoaded) return;
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
  }, [darkMode, user, themeLoaded]);

  

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
    const filtered = transactions.filter(transaction => {
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

    let sorted = [...filtered];
    switch (sortOption) {
      case 'highest':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'lowest':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
      case 'category':
        sorted.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'date':
      default:
        sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    return sorted;
  }, [transactions, searchTerm, transactionType, selectedCategory, startDate, endDate, sortOption]);

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

  const handleAddTransaction = async (transactionData: Omit<Transaction, 'id'>, id?: string) => {
    if (!user) return;
    try {
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      // Add createdAt timestamp for new transactions
      const transactionWithTimestamp = id || editingTransaction ? 
        transactionData : 
        { ...transactionData, createdAt: new Date().toISOString() };
      
      if (id) {
        const transactionDoc = doc(db, 'spenders', user.uid, 'transactions', id);
        await updateDoc(transactionDoc, transactionWithTimestamp);
        showToast('Transaction updated successfully!', 'success');
      } else if (editingTransaction) {
        const transactionDoc = doc(db, 'spenders', user.uid, 'transactions', editingTransaction.id);
        await updateDoc(transactionDoc, transactionWithTimestamp);
        setEditingTransaction(undefined);
        showToast('Transaction updated successfully!', 'success');
      } else {
        await addDoc(transactionsRef, transactionWithTimestamp);
        showToast('Transaction added successfully!', 'success');
        // Increment global analytics
        await updateDoc(analyticsGlobalRef, {
            totalTransactions: increment(1),
            totalIncome: transactionWithTimestamp.type === 'income' ? increment(transactionWithTimestamp.amount) : increment(0),
            totalExpenses: transactionWithTimestamp.type === 'expense' ? increment(Math.abs(transactionWithTimestamp.amount)) : increment(0),
        });
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
      // Increment global analytics
      await updateDoc(analyticsGlobalRef, {
          totalAccounts: increment(1)
      });
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
        // Increment global analytics
        await updateDoc(analyticsGlobalRef, {
            totalBudgets: increment(1)
        });
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

  const handleAddGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (!user) return;
    try {
      const goalsRef = collection(db, 'spenders', user.uid, 'goals');
      await addDoc(goalsRef, goalData);
      showToast('Goal added successfully!', 'success');
      // Increment global analytics
      await updateDoc(analyticsGlobalRef, {
          totalGoals: increment(1)
      });
    } catch (error) {
      console.error("Error adding goal: ", error);
      showToast('Error adding goal', 'error');
    }
  };

  const handleEditGoal = async (goal: Goal) => {
    if (!user) return;
    try {
      const goalDoc = doc(db, 'spenders', user.uid, 'goals', goal.id);
      const { id, ...goalData } = goal;
      await updateDoc(goalDoc, goalData);
      showToast('Goal updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating goal: ", error);
      showToast('Error updating goal', 'error');
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!user) return;
    try {
      const goalDoc = doc(db, 'spenders', user.uid, 'goals', id);
      await deleteDoc(goalDoc);
      showToast('Goal deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting goal: ", error);
      showToast('Error deleting goal', 'error');
    }
  };

  const handleAddFundsToGoal = async (goal: Goal, amount: number, accountId: string) => {
    if (!user) return;
    try {
      const updatedGoal = { ...goal, currentAmount: goal.currentAmount + amount };
      await handleEditGoal(updatedGoal);

      const transactionData = {
        name: `Contribution to ${goal.name}`,
        amount: -amount, // Expense
        date: new Date().toISOString().split('T')[0],
        category: 'Goal Contribution',
        type: 'expense' as const,
        accountId: accountId,
      };
      await handleAddTransaction(transactionData);

      showToast(`Successfully added funds to ${goal.name}!`, 'success');
    } catch (error) {
      console.error('Error adding funds to goal: ', error);
      showToast('Error adding funds to goal', 'error');
    }
  };

  const handleAddLoan = async (loanData: Omit<Loan, 'id'>) => {
    if (!user) return;
    try {
      // Filter out undefined values to prevent Firebase errors
      const filteredLoanData = Object.fromEntries(
        Object.entries(loanData).filter(([_, value]) => value !== undefined)
      );
      
      const loansRef = collection(db, 'spenders', user.uid, 'loans');
      await addDoc(loansRef, filteredLoanData);
      showToast('Loan added successfully!', 'success');
      // Increment global analytics
      await updateDoc(analyticsGlobalRef, {
          totalLoans: increment(1)
      });
    } catch (error) {
      console.error("Error adding loan: ", error);
      showToast('Error adding loan', 'error');
    }
  };

  const handleEditLoan = async (loan: Loan) => {
    if (!user) return;
    try {
      const loanDoc = doc(db, 'spenders', user.uid, 'loans', loan.id);
      const { id, ...loanData } = loan;
      await updateDoc(loanDoc, loanData);
      showToast('Loan updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating loan: ", error);
      showToast('Error updating loan', 'error');
    }
  };

  const handleDeleteLoan = async (id: string) => {
    if (!user) return;
    try {
      const loanDoc = doc(db, 'spenders', user.uid, 'loans', id);
      await deleteDoc(loanDoc);
      showToast('Loan deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting loan: ", error);
      showToast('Error deleting loan', 'error');
    }
  };

  const handleSaveRecurringTransaction = async (recurringTransactionData: Omit<RecurringTransaction, 'id' | 'lastProcessedDate'>) => {
    if (!user) return;
    try {
      const recurringTransactionsRef = collection(db, 'spenders', user.uid, 'recurring_transactions');
      await addDoc(recurringTransactionsRef, {
        ...recurringTransactionData,
        lastProcessedDate: new Date().toISOString().split('T')[0],
      });
      showToast('Recurring transaction added successfully!', 'success');
      // Increment global analytics
      await updateDoc(analyticsGlobalRef, {
          totalRecurringTransactions: increment(1)
      });
    } catch (error) {
      console.error("Error adding recurring transaction: ", error);
      showToast('Error adding recurring transaction', 'error');
    }
  };

  const handleUpdateRecurringTransaction = async (recurringTransaction: RecurringTransaction) => {
    if (!user) return;
    try {
      const recurringTransactionDoc = doc(db, 'spenders', user.uid, 'recurring_transactions', recurringTransaction.id);
      const { id, ...recurringTransactionData } = recurringTransaction;
      await updateDoc(recurringTransactionDoc, recurringTransactionData);
      showToast('Recurring transaction updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating recurring transaction: ", error);
      showToast('Error updating recurring transaction', 'error');
    }
  };

  const handleDeleteRecurringTransaction = async (id: string) => {
    if (!user) return;
    try {
      const recurringTransactionDoc = doc(db, 'spenders', user.uid, 'recurring_transactions', id);
      await deleteDoc(recurringTransactionDoc);
      showToast('Recurring transaction deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting recurring transaction: ", error);
      showToast('Error deleting recurring transaction', 'error');
    }
  };

  const handleAddShortcut = async (shortcutData: Omit<Shortcut, 'id'>) => {
    if (!user) return;
    try {
      const shortcutsRef = collection(db, 'spenders', user.uid, 'shortcuts');
      await addDoc(shortcutsRef, shortcutData);
      showToast('Shortcut added successfully!', 'success');
    } catch (error) {
      console.error("Error adding shortcut: ", error);
      showToast('Error adding shortcut', 'error');
    }
  };

  const handleUpdateShortcut = async (shortcut: Shortcut) => {
    if (!user) return;
    try {
      const shortcutDoc = doc(db, 'spenders', user.uid, 'shortcuts', shortcut.id);
      const { id, ...shortcutData } = shortcut;
      await updateDoc(shortcutDoc, shortcutData);
      showToast('Shortcut updated successfully!', 'success');
    } catch (error) {
      console.error("Error updating shortcut: ", error);
      showToast('Error updating shortcut', 'error');
    }
  };

  const handleDeleteShortcut = async (id: string) => {
    if (!user) return;
    try {
      const shortcutDoc = doc(db, 'spenders', user.uid, 'shortcuts', id);
      await deleteDoc(shortcutDoc);
      showToast('Shortcut deleted successfully!', 'success');
    } catch (error) {
      console.error("Error deleting shortcut: ", error);
      showToast('Error deleting shortcut', 'error');
    }
  };

  // Add this new function for opening shortcut help
  const handleOpenShortcutHelp = () => {
    setHelpModalPage('shortcuts');
    setIsHelpModalOpen(true);
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
      // Increment global analytics
      await updateDoc(analyticsGlobalRef, {
          totalCSVImports: increment(1)
      });
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
      
      // Add mock goals
      const goalsRef = collection(db, 'spenders', user.uid, 'goals');
      const goalBatch = writeBatch(db);
      mockGoals.forEach(goal => {
        const newGoalRef = doc(goalsRef);
        goalBatch.set(newGoalRef, goal);
      });
      await goalBatch.commit();

      // Add mock loans
      const loansRef = collection(db, 'spenders', user.uid, 'loans');
      const loanBatch = writeBatch(db);
      mockLoans.forEach(loan => {
        const newLoanRef = doc(loansRef);
        loanBatch.set(newLoanRef, loan);
      });
      await loanBatch.commit();
      
      // Add mock total budget
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');
      const mockTotalBudget: Omit<TotalBudget, 'id'> = {
        limit: 50000,
        month: new Date().toISOString().slice(0, 7),
        isMock: true
      };
      await setDoc(totalBudgetRef, mockTotalBudget);
      
      showToast('Mock data loaded successfully!', 'success');
      // Increment global analytics
      await updateDoc(analyticsGlobalRef, {
          totalMockDataLoads: increment(1)
      });

      // After loading mock data, update transactionsAtLastFeedbackPrompt
      // to prevent immediate feedback modal popup for mock transactions.
      const userDocRef = doc(db, 'spenders', user.uid);
      await updateDoc(userDocRef, {
        transactionsAtLastFeedbackPrompt: transactions.length, // Set to current count (including mock data)
      });
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
      const goalsRef = collection(db, 'spenders', user.uid, 'goals');
      const loansRef = collection(db, 'spenders', user.uid, 'loans');
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');
      
      // Get all documents in each collection
      const transactionsSnapshot = await getDocs(transactionsRef);
      const accountsSnapshot = await getDocs(accountsRef);
      const budgetsSnapshot = await getDocs(budgetsRef);
      const goalsSnapshot = await getDocs(goalsRef);
      const loansSnapshot = await getDocs(loansRef);
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
      
      // Delete only mock goals
      const goalBatch = writeBatch(db);
      goalsSnapshot.docs.forEach(doc => {
        if (doc.data().isMock === true) {
          goalBatch.delete(doc.ref);
        }
      });
      await goalBatch.commit();

      // Delete only mock loans
      const loanBatch = writeBatch(db);
      loansSnapshot.docs.forEach(doc => {
        if (doc.data().isMock === true) {
          loanBatch.delete(doc.ref);
        }
      });
      await loanBatch.commit();
      
      // Delete mock total budget if it exists
      if (totalBudgetSnapshot.exists() && totalBudgetSnapshot.data().isMock === true) {
        await deleteDoc(totalBudgetRef);
      }
      
      showToast('Mock data cleared successfully!', 'success');
      // Increment global analytics
      await updateDoc(analyticsGlobalRef, {
          totalMockDataClears: increment(1)
      });
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

  const handlePasswordReauthenticate = async () => {
    if (!user || !reauthPassword) return;

    try {
      const credential = EmailAuthProvider.credential(user.email!, reauthPassword);
      await reauthenticateWithCredential(user, credential);
      setShowPasswordReauthModal(false);
      setReauthPassword('');
      await handleDeleteUserAccount();
    } catch (error) {
      console.error("Error during password re-authentication: ", error);
      showToast('Incorrect password. Please try again.', 'error');
    }
  };

  const handleUpdateUser = async (name: string) => {
    if (user) {
      try {
        await updateProfile(user, { displayName: name });
        const userDocRef = doc(db, 'spenders', user.uid);
        await updateDoc(userDocRef, { name: name });
        showToast('Profile updated successfully!', 'success');
      } catch (error) {
        console.error("Error updating profile: ", error);
        showToast('Error updating profile', 'error');
      }
    }
  };

  const handleFeedbackSubmit = async (rating: number, feedback: string) => {
    if (!user) return;
    setIsFeedbackSubmitting(true);
    try {
      const userDocRef = doc(db, 'spenders', user.uid);
      const analyticsSnap = await getDoc(analyticsGlobalRef);
      const analyticsData = analyticsSnap.exists() ? analyticsSnap.data() : {};

      // Update user document
      await updateDoc(userDocRef, {
        feedbackStars: rating,
        feedbackText: feedback,
        hasGivenFeedback: true,
      });

      // Update global analytics
      const currentTotalFeedbackSum = analyticsData.totalFeedbackSum || 0;
      const currentTotalFeedbackCount = analyticsData.totalFeedbackCount || 0;
      const currentTotalUsersGivenFeedback = analyticsData.totalUsersGivenFeedback || 0;

      await updateDoc(analyticsGlobalRef, {
        totalUsersGivenFeedback: increment(1),
        totalFeedbackSum: increment(rating),
        totalFeedbackCount: increment(1),
        totalAverageFeedbackStars: (currentTotalFeedbackSum + rating) / (currentTotalFeedbackCount + 1),
      });

      showToast('Thank you for your feedback!', 'success');
      setIsFeedbackModalOpen(false); // Close modal after submission
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      showToast('Error submitting feedback', 'error');
    } finally {
      setIsFeedbackSubmitting(false);
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
      case 'goals': return 'Goals';
      case 'loans': return 'Loans';
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
              recurringTransactions={recurringTransactions}
              accounts={regularAccounts} 
              budgets={budgets} 
              loans={loans}
              goals={goals}
              totalBudget={totalBudget}
              onViewAllTransactions={() => setCurrentScreen('transactions')} 
              currency={currency} 
              setCurrentScreen={setCurrentScreen}
              onSaveTransaction={handleAddTransaction}
              categories={userCategories}
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
              transactions={filteredTransactions}
              onEditTransaction={handleEditTransaction}
              onSaveTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenRecurringModal={() => setIsRecurringTransactionModalOpen(true)}
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
              sortOption={sortOption}
              setSortOption={setSortOption}
              accounts={accountsWithDynamicBalances} // Pass accounts data for credit card identification
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
      case 'goals':
        return (
          <motion.div
            key="goals"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
                          <GoalsPage
                          goals={goals}
                          onAddGoal={() => setIsGoalModalOpen(true)}
                          onEditGoal={(goal) => {
                            setEditingGoal(goal);
                            setIsGoalModalOpen(true);
                          }}
                          onDeleteGoal={handleDeleteGoal}
                          onAddFunds={(goal) => {
                            setSelectedGoal(goal);
                            setIsAddFundsModalOpen(true);
                          }}
                          currency={currency}
                          transactions={transactions}
                          accounts={accounts}
                        />          </motion.div>
        );
      case 'loans':
        return (
          <motion.div
            key="loans"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LoansPage 
              loans={loans}
              onAddLoan={() => setIsLoanModalOpen(true)}
              onEditLoan={(loan) => {
                setEditingLoan(loan);
                setIsLoanModalOpen(true);
              }}
              onDeleteLoan={handleDeleteLoan}
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
              onToggleDarkMode={onToggleDarkMode}
              accounts={accounts}
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
              onExportPDF={handleExportPDF}
              onRestoreData={handleRestoreData}
              selectedFont={selectedFont}
              onUpdateFont={onUpdateFont}
              onUpdateUser={handleUpdateUser}
              onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
              shortcuts={shortcuts}
              onOpenShortcutModal={() => setIsShortcutModalOpen(true)}
              onEditShortcut={(shortcut) => {
                setEditingShortcut(shortcut);
                setIsShortcutModalOpen(true);
              }}
              onOpenShortcutHelp={handleOpenShortcutHelp}
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
              recurringTransactions={recurringTransactions}
              accounts={regularAccounts} 
              budgets={budgets} 
              loans={loans}
              goals={goals}
              totalBudget={totalBudget}
              onViewAllTransactions={() => setCurrentScreen('transactions')} 
              currency={currency} 
              setCurrentScreen={setCurrentScreen}
              onSaveTransaction={handleAddTransaction}
              categories={userCategories}
            />
          </motion.div>
        );
    }
  };

  const handleBackupData = async () => {
    if (!user) return;

    const backupData = {
      transactions,
      accounts,
      budgets,
      goals,
      loans,
      recurringTransactions,
      totalBudget,
      userCategories,
      settings: {
        darkMode,
        currency,
        defaultAccountId,
        fontPreference: selectedFont,
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
    // Increment global analytics
    await updateDoc(analyticsGlobalRef, {
        totalBackups: increment(1)
    });
  };

  const handleExportPDF = async () => {
    if (!user) return;

    // Create backup data (same as handleBackupData)
    const backupData = {
      transactions,
      accounts,
      budgets,
      goals,
      loans,
      recurringTransactions,
      totalBudget,
      userCategories,
      settings: {
        darkMode,
        currency,
        defaultAccountId,
        fontPreference: selectedFont,
      },
      metadata: {
        backupDate: new Date().toISOString(),
        version: '1.0.0',
      },
    };

    // Create a new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `SpendWiser Backup - ${new Date().toISOString().split('T')[0]}`,
      subject: 'Financial Data Backup',
      author: 'SpendWiser',
      keywords: 'finance, budget, transactions, backup',
      creator: 'SpendWiser'
    });

    // Add header
    doc.setFontSize(22);
    doc.setTextColor(0, 123, 255); // Blue color
    doc.text('SpendWiser Financial Statement', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`User: ${user.email}`, 20, 37);
    
    // Add a line separator
    doc.setDrawColor(0, 123, 255);
    doc.line(20, 42, 190, 42);
    
    // Add summary section
    doc.setFontSize(16);
    doc.setTextColor(0, 123, 255);
    doc.text('Account Summary', 20, 52);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 62;
    
    // Add account information
    accounts.forEach((account, index) => {
      if (yPosition > 270) { // If we're near the bottom of the page, add a new page
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text(`${account.name} (${account.type})`, 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(`${currency}${account.balance.toLocaleString()}`, 180, yPosition, { align: 'right' });
      yPosition += 7;
    });
    
    // Add budgets section
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 10;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 123, 255);
    doc.text('Budgets', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Add budgets table headers
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (budgets.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Category', 20, yPosition);
      doc.text('Limit', 80, yPosition);
      doc.text('Spent', 120, yPosition);
      doc.text('Remaining', 160, yPosition, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      yPosition += 5;
      
      // Add a line under headers
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Add budgets
      budgets.forEach((budget, index) => {
        if (yPosition > 270) { // If we're near the bottom of the page, add a new page
          doc.addPage();
          yPosition = 20;
          
          // Re-add headers on new page
          doc.setFont('helvetica', 'bold');
          doc.text('Category', 20, yPosition);
          doc.text('Limit', 80, yPosition);
          doc.text('Spent', 120, yPosition);
          doc.text('Remaining', 160, yPosition, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 5;
        }
        
        doc.text(budget.category, 20, yPosition);
        doc.text(`${currency}${budget.limit.toLocaleString()}`, 80, yPosition);
        
        // Calculate spent amount for this budget
        const spent = transactions
          .filter(t => t.category === budget.category && t.type === 'expense')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);
        doc.text(`${currency}${spent.toLocaleString()}`, 120, yPosition);
        
        const remaining = budget.limit - spent;
        doc.text(`${currency}${remaining.toLocaleString()}`, 160, yPosition, { align: 'right' });
        
        yPosition += 7;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No budgets set up', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 7;
    }
    
    // Add loans section
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 10;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 123, 255);
    doc.text('Loans', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Add loans table headers
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (loans.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Loan Name', 20, yPosition);
      doc.text('Principal', 70, yPosition);
      doc.text('Interest Rate', 110, yPosition);
      doc.text('Term', 150, yPosition);
      doc.text('Balance', 190, yPosition, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      yPosition += 5;
      
      // Add a line under headers
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Add loans
      loans.forEach((loan, index) => {
        if (yPosition > 270) { // If we're near the bottom of the page, add a new page
          doc.addPage();
          yPosition = 20;
          
          // Re-add headers on new page
          doc.setFont('helvetica', 'bold');
          doc.text('Loan Name', 20, yPosition);
          doc.text('Principal', 70, yPosition);
          doc.text('Interest Rate', 110, yPosition);
          doc.text('Term', 150, yPosition);
          doc.text('Balance', 190, yPosition, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 5;
        }
        
        doc.text(loan.name, 20, yPosition);
        doc.text(`${currency}${loan.loanAmount.toLocaleString()}`, 70, yPosition);
        doc.text(`${loan.interestRate}%`, 110, yPosition);
        doc.text(`${loan.tenure} years`, 150, yPosition);
        doc.text(`${currency}${loan.emi.toLocaleString()}`, 190, yPosition, { align: 'right' });
        
        yPosition += 7;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No loans set up', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 7;
    }
    
    // Add goals section
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 10;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 123, 255);
    doc.text('Financial Goals', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Add goals table headers
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    if (goals.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.text('Goal Name', 20, yPosition);
      doc.text('Target', 80, yPosition);
      doc.text('Current', 120, yPosition);
      doc.text('Progress', 160, yPosition, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      yPosition += 5;
      
      // Add a line under headers
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Add goals
      goals.forEach((goal, index) => {
        if (yPosition > 270) { // If we're near the bottom of the page, add a new page
          doc.addPage();
          yPosition = 20;
          
          // Re-add headers on new page
          doc.setFont('helvetica', 'bold');
          doc.text('Goal Name', 20, yPosition);
          doc.text('Target', 80, yPosition);
          doc.text('Current', 120, yPosition);
          doc.text('Progress', 160, yPosition, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          yPosition += 5;
          doc.line(20, yPosition, 190, yPosition);
          yPosition += 5;
        }
        
        doc.text(goal.name, 20, yPosition);
        doc.text(`${currency}${goal.targetAmount.toLocaleString()}`, 80, yPosition);
        doc.text(`${currency}${goal.currentAmount.toLocaleString()}`, 120, yPosition);
        
        const progress = Math.round((goal.currentAmount / goal.targetAmount) * 100);
        doc.text(`${progress}%`, 160, yPosition, { align: 'right' });
        
        yPosition += 7;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.text('No financial goals set up', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition += 7;
    }
    
    // Add credit card transactions section
    const creditCardAccounts = accounts.filter(account => account.type === 'Credit Card');
    if (creditCardAccounts.length > 0) {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      } else {
        yPosition += 10;
      }
      
      doc.setFontSize(16);
      doc.setTextColor(0, 123, 255);
      doc.text('Credit Card Transactions', 20, yPosition);
      yPosition += 10;
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      
      // Add table headers
      if (yPosition > 260) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.text('Date', 20, yPosition);
      doc.text('Description', 45, yPosition);
      doc.text('Card', 100, yPosition);
      doc.text('Category', 130, yPosition);
      doc.text('Amount', 190, yPosition, { align: 'right' });
      doc.setFont('helvetica', 'normal');
      yPosition += 5;
      
      // Add a line under headers
      doc.line(20, yPosition, 190, yPosition);
      yPosition += 5;
      
      // Get credit card transactions
      const creditCardTransactions = transactions.filter(transaction => 
        creditCardAccounts.some(card => card.id === transaction.accountId)
      );
      
      if (creditCardTransactions.length > 0) {
        // Add credit card transactions (limit to 50 for performance)
        const limitedCCTransactions = creditCardTransactions.slice(0, 50);
        limitedCCTransactions.forEach((transaction, index) => {
          if (yPosition > 270) { // If we're near the bottom of the page, add a new page
            doc.addPage();
            yPosition = 20;
            
            // Re-add headers on new page
            doc.setFont('helvetica', 'bold');
            doc.text('Date', 20, yPosition);
            doc.text('Description', 45, yPosition);
            doc.text('Card', 100, yPosition);
            doc.text('Category', 130, yPosition);
            doc.text('Amount', 190, yPosition, { align: 'right' });
            doc.setFont('helvetica', 'normal');
            yPosition += 5;
            doc.line(20, yPosition, 190, yPosition);
            yPosition += 5;
          }
          
          doc.text(transaction.date, 20, yPosition);
          doc.text(transaction.name.length > 15 ? transaction.name.substring(0, 15) + '...' : transaction.name, 45, yPosition);
          
          const card = creditCardAccounts.find(c => c.id === transaction.accountId);
          doc.text(card ? card.name : 'Unknown Card', 100, yPosition);
          
          doc.text(transaction.category, 130, yPosition);
          
          // Color code amounts (expenses in red)
          doc.setTextColor(220, 53, 69); // Red for expenses
          doc.text(`${currency}${Math.abs(transaction.amount).toLocaleString()}`, 190, yPosition, { align: 'right' });
          doc.setTextColor(0, 0, 0); // Reset to black
          
          yPosition += 7;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.text('No credit card transactions', 20, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 7;
      }
    }
    
    // Add transactions section
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    } else {
      yPosition += 10;
    }
    
    doc.setFontSize(16);
    doc.setTextColor(0, 123, 255);
    doc.text('All Transactions', 20, yPosition);
    yPosition += 10;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    
    // Add table headers
    if (yPosition > 260) {
      doc.addPage();
      yPosition = 20;
    }
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 20, yPosition);
    doc.text('Description', 45, yPosition);
    doc.text('Category', 100, yPosition);
    doc.text('Type', 140, yPosition);
    doc.text('Amount', 180, yPosition, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    yPosition += 5;
    
    // Add a line under headers
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;
    
    // Add transactions (limit to 100 for performance)
    const limitedTransactions = transactions.slice(0, 100);
    limitedTransactions.forEach((transaction, index) => {
      if (yPosition > 270) { // If we're near the bottom of the page, add a new page
        doc.addPage();
        yPosition = 20;
        
        // Re-add headers on new page
        doc.setFont('helvetica', 'bold');
        doc.text('Date', 20, yPosition);
        doc.text('Description', 45, yPosition);
        doc.text('Category', 100, yPosition);
        doc.text('Type', 140, yPosition);
        doc.text('Amount', 180, yPosition, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        yPosition += 5;
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 5;
      }
      
      doc.text(transaction.date, 20, yPosition);
      doc.text(transaction.name.length > 20 ? transaction.name.substring(0, 20) + '...' : transaction.name, 45, yPosition);
      doc.text(transaction.category, 100, yPosition);
      doc.text(transaction.type, 140, yPosition);
      
      // Color code amounts
      if (transaction.type === 'income') {
        doc.setTextColor(40, 167, 69); // Green for income
      } else {
        doc.setTextColor(220, 53, 69); // Red for expenses
      }
      
      doc.text(`${currency}${Math.abs(transaction.amount).toLocaleString()}`, 180, yPosition, { align: 'right' });
      doc.setTextColor(0, 0, 0); // Reset to black
      
      yPosition += 7;
    });
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }
    
    // Save the PDF
    doc.save(`spendwiser-statement-${new Date().toISOString().split('T')[0]}.pdf`);
    showToast('PDF export successful!', 'success');
    // Increment global analytics
    await updateDoc(analyticsGlobalRef, {
        totalPDFExports: increment(1)
    });
  };

  const handleRestoreData = async (data: any) => {
    if (!user) return;

    try {
      // 1. Clear existing data
      const transactionsRef = collection(db, 'spenders', user.uid, 'transactions');
      const accountsRef = collection(db, 'spenders', user.uid, 'accounts');
      const budgetsRef = collection(db, 'spenders', user.uid, 'budgets');
      const goalsRef = collection(db, 'spenders', user.uid, 'goals');
      const loansRef = collection(db, 'spenders', user.uid, 'loans');
      const recurringTransactionsRef = collection(db, 'spenders', user.uid, 'recurring_transactions');
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');

      const transactionsSnapshot = await getDocs(transactionsRef);
      const accountsSnapshot = await getDocs(accountsRef);
      const budgetsSnapshot = await getDocs(budgetsRef);
      const goalsSnapshot = await getDocs(goalsRef);
      const loansSnapshot = await getDocs(loansRef);
      const recurringTransactionsSnapshot = await getDocs(recurringTransactionsRef);

      const batch = writeBatch(db);

      transactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      accountsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      budgetsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      goalsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      loansSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      recurringTransactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete total budget if it exists
      batch.delete(totalBudgetRef);

      await batch.commit();

      // 2. Restore new data
      const restoreBatch = writeBatch(db);

      data.transactions?.forEach((transaction: Transaction) => {
        const { id, ...transactionData } = transaction;
        const newTransactionRef = doc(transactionsRef, id);
        restoreBatch.set(newTransactionRef, transactionData);
      });

      data.accounts?.forEach((account: Account) => {
        const { id, ...accountData } = account;
        const newAccountRef = doc(accountsRef, id);
        restoreBatch.set(newAccountRef, accountData);
      });

      data.budgets?.forEach((budget: Budget) => {
        const { id, ...budgetData } = budget;
        const newBudgetRef = doc(budgetsRef, id);
        restoreBatch.set(newBudgetRef, budgetData);
      });

      data.goals?.forEach((goal: Goal) => {
        const { id, ...goalData } = goal;
        const newGoalRef = doc(goalsRef, id);
        restoreBatch.set(newGoalRef, goalData);
      });

      data.loans?.forEach((loan: Loan) => {
        const { id, ...loanData } = loan;
        // Filter out undefined values to prevent Firebase errors
        const filteredLoanData = Object.fromEntries(
          Object.entries(loanData).filter(([_, value]) => value !== undefined)
        );
        const newLoanRef = doc(loansRef, id);
        restoreBatch.set(newLoanRef, filteredLoanData);
      });

      data.recurringTransactions?.forEach((recurringTransaction: RecurringTransaction) => {
        const { id, ...recurringTransactionData } = recurringTransaction;
        const newRecurringTransactionRef = doc(recurringTransactionsRef, id);
        restoreBatch.set(newRecurringTransactionRef, recurringTransactionData);
      });

      // Restore total budget if it exists
      if (data.totalBudget) {
        const { id, ...totalBudgetData } = data.totalBudget;
        restoreBatch.set(totalBudgetRef, totalBudgetData);
      }

      await restoreBatch.commit();

      // 3. Restore settings
      if (data.settings) {
        setDarkMode(data.settings.darkMode);
        setCurrency(data.settings.currency);
        setDefaultAccountId(data.settings.defaultAccountId);
        setSelectedFont(data.settings.fontPreference || 'Montserrat');
        const userDocRef = doc(db, 'spenders', user.uid);
        await setDoc(userDocRef, { 
          themePreference: data.settings.darkMode ? 'dark' : 'light',
          currency: data.settings.currency,
          defaultAccountId: data.settings.defaultAccountId,
          fontPreference: data.settings.fontPreference || 'Montserrat'
        }, { merge: true });
      }

      if (data.userCategories) {
        setUserCategories(data.userCategories);
        const userDocRef = doc(db, 'spenders', user.uid);
        await setDoc(userDocRef, { categories: data.userCategories }, { merge: true });
      }

      // Update state variables
      if (data.goals) setGoals(data.goals);
      if (data.loans) setLoans(data.loans);
      if (data.recurringTransactions) setRecurringTransactions(data.recurringTransactions);
      if (data.totalBudget) setTotalBudget(data.totalBudget);

      showToast('Data restored successfully!', 'success');
      // Increment global analytics
      await updateDoc(analyticsGlobalRef, {
          totalRestores: increment(1)
      });
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
      const goalsRef = collection(db, 'spenders', user.uid, 'goals');
      const loansRef = collection(db, 'spenders', user.uid, 'loans');
      const recurringTransactionsRef = collection(db, 'spenders', user.uid, 'recurring_transactions');
      const totalBudgetRef = doc(db, 'spenders', user.uid, 'totalBudget', 'current');

      const transactionsSnapshot = await getDocs(transactionsRef);
      const accountsSnapshot = await getDocs(accountsRef);
      const budgetsSnapshot = await getDocs(budgetsRef);
      const goalsSnapshot = await getDocs(goalsRef);
      const loansSnapshot = await getDocs(loansRef);
      const recurringTransactionsSnapshot = await getDocs(recurringTransactionsRef);

      const batch = writeBatch(db);

      transactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      accountsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      budgetsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      goalsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      loansSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      recurringTransactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
      
      // Delete total budget if it exists
      batch.delete(totalBudgetRef);

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
        const providerId = user.providerData[0].providerId;
        if (providerId === 'password') {
          setShowPasswordReauthModal(true);
        } else {
          setShowReauthModal(true);
        }
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
              <img src="/icon-money.svg" alt="SpendWiser Logo" className="h-8 w-8" />
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
      <ConnectionStatus />
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
        <ConnectionStatus />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* <div className="bg-[#007BFF] p-2 rounded-lg"> */}
              <img src="/icon-money.svg" alt="SpendWiser Logo" className="h-10 w-10" />
            {/* </div> */}
            <div>
              <a href="https://hariharen9.site" target="_blank" rel="noopener noreferrer">
                <h1 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">SpendWiser</h1>
              </a>
              <p className="text-xs text-gray-500 dark:text-gray-400">By <span className="text-blue-500 underline">Hariharen</span></p>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <img
                src={user.photoURL || undefined}
                alt={user.displayName || 'User'}
                className="h-8 w-8 rounded-full object-cover"
              />
              <button
                onClick={onToggleDarkMode}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5]"
                aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {darkMode ? (
                  <Sun className="h-5 w-5 text-yellow-500" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-700" />
                )}
              </button>
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
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
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
          {currentScreen !== 'settings' && (
            <footer className="py-4 text-center text-sm text-gray-500 dark:text-[#888888]">
              <p>
                Built with <span className="text-red-500">❤️</span> by <a href="https://hariharen9.site" target="_blank" rel="noopener noreferrer" className="text-[#007BFF] hover:underline dark:text-[#007BFF]">Hariharen</a> © 2025
              </p>
            </footer>
          )}
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
            darkMode={darkMode}
            onToggleDarkMode={onToggleDarkMode}
          />
        </div>
      </div>

      {/* Floating Action Button - Visible on all screens, positioned appropriately for each */}
      <FAB onClick={() => setIsAddTransactionModalOpen(true)} />

      {/* Help FAB - Visible on specific screens */}
      {['transactions', 'credit-cards', 'budgets', 'goals', 'loans'].includes(currentScreen) && (
        <HelpFAB onClick={() => setIsHelpModalOpen(true)} />
      )}

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
        shortcuts={shortcuts}
      />

      {/* Import CSV Modal */}
      <ImportCSVModal
        isOpen={isImportCSVModalOpen}
        onClose={() => setIsImportCSVModalOpen(false)}
        onImport={handleImportCSV}
        currency={currency}
      />

      <RecurringTransactionModal
        isOpen={isRecurringTransactionModalOpen}
        onClose={() => setIsRecurringTransactionModalOpen(false)}
        onSave={handleSaveRecurringTransaction}
        onUpdate={handleUpdateRecurringTransaction}
        onDelete={handleDeleteRecurringTransaction}
        accounts={regularAccounts}
        categories={userCategories}
        recurringTransactions={recurringTransactions}
        currency={currency}
      />

      {isShortcutModalOpen && (
        <ShortcutModal
          isOpen={isShortcutModalOpen}
          onClose={() => {
            setIsShortcutModalOpen(false);
            setEditingShortcut(undefined);
          }}
          onSave={handleAddShortcut}
          onUpdate={handleUpdateShortcut}
          onDelete={handleDeleteShortcut}
          onEditShortcut={(shortcut) => {
            setEditingShortcut(shortcut);
          }}
          editingShortcut={editingShortcut}
          shortcuts={shortcuts}
          categories={userCategories}
          accounts={accounts}
        />
      )}

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

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(undefined);
        }}
        onSave={(goalData) => {
          if (editingGoal) {
            handleEditGoal({ ...editingGoal, ...goalData });
          } else {
            handleAddGoal(goalData);
          }
        }}
        editingGoal={editingGoal}
      />

      <LoanModal
        isOpen={isLoanModalOpen}
        onClose={() => {
          setIsLoanModalOpen(false);
          setEditingLoan(undefined);
        }}
        onSave={(loanData) => {
          if (editingLoan) {
            handleEditLoan({ ...editingLoan, ...loanData });
          } else {
            handleAddLoan(loanData);
          }
        }}
        editingLoan={editingLoan}
      />

      <AddFundsModal
        isOpen={isAddFundsModalOpen}
        onClose={() => setIsAddFundsModalOpen(false)}
        onAddFunds={handleAddFundsToGoal}
        goal={selectedGoal}
        accounts={regularAccounts}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
        page={helpModalPage} // Add this prop
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

      {/* Password Re-authentication Modal */}
      <AnimatePresence>
        {showPasswordReauthModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordReauthModal(false)}
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">Enter Password to Continue</h2>
                <motion.button
                  onClick={() => setShowPasswordReauthModal(false)}
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
                  For your security, please enter your password to confirm your identity before deleting your account.
                </p>
                <input
                  type="password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                  placeholder="Password"
                />

                <motion.div
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => setShowPasswordReauthModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handlePasswordReauthenticate}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!reauthPassword}
                  >
                    Confirm
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
        isLoading={isFeedbackSubmitting}
      />
    </div>
  );
}

export default App;
