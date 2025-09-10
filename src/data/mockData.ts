import { Transaction, CreditCard, Budget, User, Account } from '../types/types';

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

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    name: 'Salary Deposit',
    amount: 5200,
    date: '2024-01-15',
    category: 'Salary',
    type: 'income'
  },
  {
    id: '2',
    name: 'Grocery Store',
    amount: -156.78,
    date: '2024-01-14',
    category: 'Groceries',
    type: 'expense',
    creditCard: 'Chase Sapphire'
  },
  {
    id: '3',
    name: 'Netflix Subscription',
    amount: -15.99,
    date: '2024-01-13',
    category: 'Entertainment',
    type: 'expense',
    creditCard: 'Chase Sapphire'
  },
  {
    id: '4',
    name: 'Gas Station',
    amount: -48.50,
    date: '2024-01-12',
    category: 'Transportation',
    type: 'expense',
    creditCard: 'Amex Gold'
  },
  {
    id: '5',
    name: 'Freelance Project',
    amount: 850,
    date: '2024-01-11',
    category: 'Freelance',
    type: 'income'
  },
  {
    id: '6',
    name: 'Coffee Shop',
    amount: -12.45,
    date: '2024-01-11',
    category: 'Food & Dining',
    type: 'expense',
    creditCard: 'Chase Sapphire'
  },
  {
    id: '7',
    name: 'Uber Ride',
    amount: -23.50,
    date: '2024-01-10',
    category: 'Transportation',
    type: 'expense',
    creditCard: 'Amex Gold'
  },
  {
    id: '8',
    name: 'Amazon Purchase',
    amount: -89.99,
    date: '2024-01-09',
    category: 'Shopping',
    type: 'expense',
    creditCard: 'Chase Sapphire'
  }
];

export const mockCreditCards: CreditCard[] = [
  {
    id: '1',
    name: 'Chase Sapphire',
    totalSpend: 1250.50,
    limit: 5000
  },
  {
    id: '2',
    name: 'Amex Gold',
    totalSpend: 890.25,
    limit: 3000
  }
];

export const mockBudgets: Budget[] = [
  {
    id: '1',
    category: 'Groceries',
    spent: 320,
    limit: 400
  },
  {
    id: '2',
    category: 'Entertainment',
    spent: 125,
    limit: 200
  },
  {
    id: '3',
    category: 'Transportation',
    spent: 180,
    limit: 300
  },
  {
    id: '4',
    category: 'Food & Dining',
    spent: 240,
    limit: 350
  },
  {
    id: '5',
    category: 'Shopping',
    spent: 150,
    limit: 250
  }
];

export const mockAccounts: Account[] = [
    { id: 'acc1', name: 'Personal Checking', type: 'Checking', balance: 12750.50 },
    { id: 'acc2', name: 'Business Account', type: 'Business Checking', balance: 45800.00 },
    { id: 'acc3', name: 'Savings', type: 'Savings', balance: 8900.00 },
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
