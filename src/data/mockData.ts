import { Transaction, Budget, User, Account } from '../types/types';

export const mockUser: User = {
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
  currency: '₹'
};

export const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
];

// Calculate dates for transactions (1-3 days before today)
const today = new Date();
const date1 = new Date(today);
date1.setDate(today.getDate() - 1);
const date2 = new Date(today);
date2.setDate(today.getDate() - 2);
const date3 = new Date(today);
date3.setDate(today.getDate() - 3);

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const dateString1 = formatDate(date1);
const dateString2 = formatDate(date2);
const dateString3 = formatDate(date3);

export const mockTransactions: Transaction[] = [
  // Income transactions
  {
    id: '1',
    name: 'Salary Deposit',
    amount: 5200,
    date: dateString1,
    category: 'Salary',
    type: 'income',
    isMock: true
  },
  {
    id: '2',
    name: 'Freelance Project',
    amount: 850,
    date: dateString2,
    category: 'Freelance',
    type: 'income',
    isMock: true
  },
  {
    id: '3',
    name: 'Dividend Payment',
    amount: 120,
    date: dateString3,
    category: 'Investment',
    type: 'income',
    isMock: true
  },
  {
    id: '4',
    name: 'Grocery Store',
    amount: -156.78,
    date: dateString1,
    category: 'Groceries',
    type: 'expense',
    creditCard: 'Chase Sapphire',
    isMock: true
  },
  {
    id: '5',
    name: 'Netflix Subscription',
    amount: -15.99,
    date: dateString1,
    category: 'Entertainment',
    type: 'expense',
    creditCard: 'Chase Sapphire',
    isMock: true
  },
  {
    id: '6',
    name: 'Gas Station',
    amount: -48.50,
    date: dateString1,
    category: 'Transportation',
    type: 'expense',
    creditCard: 'Amex Gold',
    isMock: true
  },
  {
    id: '7',
    name: 'Coffee Shop',
    amount: -12.45,
    date: dateString1,
    category: 'Food & Dining',
    type: 'expense',
    creditCard: 'Chase Sapphire',
    isMock: true
  },
  {
    id: '8',
    name: 'Uber Ride',
    amount: -23.50,
    date: dateString1,
    category: 'Transportation',
    type: 'expense',
    creditCard: 'Amex Gold',
    isMock: true
  },
  {
    id: '9',
    name: 'Amazon Purchase',
    amount: -89.99,
    date: dateString2,
    category: 'Shopping',
    type: 'expense',
    creditCard: 'Chase Sapphire',
    isMock: true
  },
  {
    id: '10',
    name: 'Electricity Bill',
    amount: -120.30,
    date: dateString2,
    category: 'Utilities',
    type: 'expense',
    isMock: true
  },
  {
    id: '11',
    name: 'Restaurant Dinner',
    amount: -65.40,
    date: dateString2,
    category: 'Food & Dining',
    type: 'expense',
    creditCard: 'Amex Gold',
    isMock: true
  },
  {
    id: '12',
    name: 'Pharmacy',
    amount: -32.15,
    date: dateString2,
    category: 'Healthcare',
    type: 'expense',
    creditCard: 'Chase Sapphire',
    isMock: true
  },
  {
    id: '13',
    name: 'Online Course',
    amount: -49.99,
    date: dateString3,
    category: 'Education',
    type: 'expense',
    isMock: true
  },
  {
    id: '14',
    name: 'Movie Tickets',
    amount: -28.50,
    date: dateString3,
    category: 'Entertainment',
    type: 'expense',
    creditCard: 'Amex Gold',
    isMock: true
  },
  {
    id: '15',
    name: 'Grocery Store',
    amount: -98.75,
    date: dateString3,
    category: 'Groceries',
    type: 'expense',
    creditCard: 'Chase Sapphire',
    isMock: true
  }
];

export const mockCreditCards: CreditCard[] = [
  {
    id: '1',
    name: 'Chase Sapphire Reserve',
    totalSpend: 1250.50,
    limit: 5000,
    isMock: true
  },
  {
    id: '2',
    name: 'American Express Gold',
    totalSpend: 890.25,
    limit: 3000,
    isMock: true
  },
  {
    id: '3',
    name: 'Capital One Venture',
    totalSpend: 450.75,
    limit: 2500,
    isMock: true
  },
  {
    id: '4',
    name: 'Citi Double Cash',
    totalSpend: 320.40,
    limit: 2000,
    isMock: true
  }
];

export const mockBudgets: Budget[] = [
  {
    id: '1',
    category: 'Groceries',
    spent: 255.53,
    limit: 400,
    isMock: true
  },
  {
    id: '2',
    category: 'Entertainment',
    spent: 44.49,
    limit: 200,
    isMock: true
  },
  {
    id: '3',
    category: 'Transportation',
    spent: 72.00,
    limit: 300,
    isMock: true
  },
  {
    id: '4',
    category: 'Food & Dining',
    spent: 77.85,
    limit: 350,
    isMock: true
  },
  {
    id: '5',
    category: 'Shopping',
    spent: 89.99,
    limit: 250,
    isMock: true
  },
  {
    id: '6',
    category: 'Utilities',
    spent: 120.30,
    limit: 150,
    isMock: true
  },
  {
    id: '7',
    category: 'Healthcare',
    spent: 32.15,
    limit: 100,
    isMock: true
  },
  {
    id: '8',
    category: 'Education',
    spent: 49.99,
    limit: 100,
    isMock: true
  }
];

export const mockAccounts: Account[] = [
    { id: 'acc1', name: 'Personal Checking', type: 'Checking', balance: 12750.50, isMock: true },
    { id: 'acc2', name: 'Business Account', type: 'Business Checking', balance: 45800.00, isMock: true },
    { id: 'acc3', name: 'Savings', type: 'Savings', balance: 8900.00, isMock: true },
    { id: 'acc4', name: 'Emergency Fund', type: 'Savings', balance: 15000.00, isMock: true },
    { id: 'acc5', name: 'Investment Account', type: 'Investment', balance: 32500.00, isMock: true },
];

export const categories = [
  'Salary',
  'Freelance',
  'Investment',
  'Groceries',
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Education',
  'Other'
];

// Add a function to get the default categories
export const getDefaultCategories = () => [
  'Salary',
  'Freelance',
  'Investment',
  'Groceries',
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Utilities',
  'Healthcare',
  'Education',
  'Other'
];