import { Transaction, Budget, User, Account, CreditCard } from '../types/types';

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

const today = new Date();

const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Dates for recent transactions
const dateRecent1 = formatDate(new Date(today.setDate(today.getDate() - 1)));
const dateRecent2 = formatDate(new Date(today.setDate(today.getDate() - 2)));
const dateRecent3 = formatDate(new Date(today.setDate(today.getDate() - 3)));

// Dates for a couple of months back
const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
const dateTwoMonthsAgo1 = formatDate(new Date(twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 5)));
const dateTwoMonthsAgo2 = formatDate(new Date(twoMonthsAgo.setDate(twoMonthsAgo.getDate() - 10)));

// Dates for five months back
const fiveMonthsAgo = new Date();
fiveMonthsAgo.setMonth(fiveMonthsAgo.getMonth() - 5);
const dateFiveMonthsAgo1 = formatDate(new Date(fiveMonthsAgo.setDate(fiveMonthsAgo.getDate() - 7)));
const dateFiveMonthsAgo2 = formatDate(new Date(fiveMonthsAgo.setDate(fiveMonthsAgo.getDate() - 12)));


export const mockTransactions: Transaction[] = [
  // Recent Income transactions
  {
    id: '1',
    name: 'Monthly Salary',
    amount: 75000,
    date: dateRecent1,
    category: 'Salary',
    type: 'income',
    isMock: true
  },
  {
    id: '2',
    name: 'Freelance Project Payment',
    amount: 25000,
    date: dateRecent2,
    category: 'Freelance',
    type: 'income',
    isMock: true
  },
  {
    id: '3',
    name: 'Investment Dividend',
    amount: 1500,
    date: dateRecent3,
    category: 'Investment',
    type: 'income',
    isMock: true
  },
  // Recent Expense transactions
  {
    id: '4',
    name: 'Grocery Shopping',
    amount: -2500,
    date: dateRecent1,
    category: 'Groceries',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },
  {
    id: '5',
    name: 'Netflix Subscription',
    amount: -649,
    date: dateRecent1,
    category: 'Entertainment',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },
  {
    id: '6',
    name: 'Fuel for Car',
    amount: -1800,
    date: dateRecent1,
    category: 'Transportation',
    type: 'expense',
    accountId: 'acc2',
    isMock: true
  },
  {
    id: '7',
    name: 'Coffee with Friends',
    amount: -450,
    date: dateRecent1,
    category: 'Food & Dining',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },
  {
    id: '8',
    name: 'Uber Ride to Office',
    amount: -220,
    date: dateRecent1,
    category: 'Transportation',
    type: 'expense',
    accountId: 'acc2',
    isMock: true
  },
  {
    id: '9',
    name: 'Amazon Online Purchase',
    amount: -3500,
    date: dateRecent2,
    category: 'Shopping',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },
  {
    id: '10',
    name: 'Electricity Bill',
    amount: -1200,
    date: dateRecent2,
    category: 'Utilities',
    type: 'expense',
    isMock: true
  },
  {
    id: '11',
    name: 'Restaurant Dinner',
    amount: -1800,
    date: dateRecent2,
    category: 'Food & Dining',
    type: 'expense',
    accountId: 'acc2',
    isMock: true
  },
  {
    id: '12',
    name: 'Pharmacy Purchase',
    amount: -750,
    date: dateRecent2,
    category: 'Healthcare',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },
  {
    id: '13',
    name: 'Online Course Fee',
    amount: -4999,
    date: dateRecent3,
    category: 'Education',
    type: 'expense',
    isMock: true
  },
  {
    id: '14',
    name: 'Movie Tickets',
    amount: -700,
    date: dateRecent3,
    category: 'Entertainment',
    type: 'expense',
    accountId: 'acc2',
    isMock: true
  },
  {
    id: '15',
    name: 'Weekly Groceries',
    amount: -1800,
    date: dateRecent3,
    category: 'Groceries',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },

  // Transactions from two months ago
  {
    id: '16',
    name: 'Salary (2 months ago)',
    amount: 72000,
    date: dateTwoMonthsAgo1,
    category: 'Salary',
    type: 'income',
    isMock: true
  },
  {
    id: '17',
    name: 'Rent Payment',
    amount: -15000,
    date: dateTwoMonthsAgo1,
    category: 'Housing',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },
  {
    id: '18',
    name: 'Internet Bill',
    amount: -999,
    date: dateTwoMonthsAgo1,
    category: 'Utilities',
    type: 'expense',
    isMock: true
  },
  {
    id: '19',
    name: 'Gym Membership',
    amount: -1200,
    date: dateTwoMonthsAgo2,
    category: 'Health',
    type: 'expense',
    accountId: 'acc2',
    isMock: true
  },
  {
    id: '20',
    name: 'New Clothes',
    amount: -4500,
    date: dateTwoMonthsAgo2,
    category: 'Shopping',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },

  // Transactions from five months ago
  {
    id: '21',
    name: 'Bonus Payment',
    amount: 10000,
    date: dateFiveMonthsAgo1,
    category: 'Salary',
    type: 'income',
    isMock: true
  },
  {
    id: '22',
    name: 'Flight Ticket',
    amount: -8000,
    date: dateFiveMonthsAgo1,
    category: 'Travel',
    type: 'expense',
    accountId: 'acc2',
    isMock: true
  },
  {
    id: '23',
    name: 'Hotel Stay',
    amount: -6000,
    date: dateFiveMonthsAgo1,
    category: 'Travel',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },
  {
    id: '24',
    name: 'Car Service',
    amount: -3000,
    date: dateFiveMonthsAgo2,
    category: 'Transportation',
    type: 'expense',
    accountId: 'acc2',
    isMock: true
  },
  {
    id: '25',
    name: 'Gift Purchase',
    amount: -1500,
    date: dateFiveMonthsAgo2,
    category: 'Shopping',
    type: 'expense',
    accountId: 'acc1',
    isMock: true
  },
  
  // Mock Credit Card Transactions
  {
    id: '26',
    name: 'Online Shopping',
    amount: -4200,
    date: dateRecent1,
    category: 'Shopping',
    type: 'expense',
    accountId: 'cc1',
    isMock: true
  },
  {
    id: '27',
    name: 'Dinner at Restaurant',
    amount: -1850,
    date: dateRecent1,
    category: 'Food & Dining',
    type: 'expense',
    accountId: 'cc1',
    isMock: true
  },
  {
    id: '28',
    name: 'Gas Station',
    amount: -2100,
    date: dateRecent2,
    category: 'Transportation',
    type: 'expense',
    accountId: 'cc1',
    isMock: true
  },
  {
    id: '29',
    name: 'Grocery Shopping',
    amount: -3200,
    date: dateRecent2,
    category: 'Groceries',
    type: 'expense',
    accountId: 'cc2',
    isMock: true
  },
  {
    id: '30',
    name: 'Movie Streaming',
    amount: -1299,
    date: dateRecent3,
    category: 'Entertainment',
    type: 'expense',
    accountId: 'cc2',
    isMock: true
  },
  {
    id: '31',
    name: 'Online Course',
    amount: -2999,
    date: dateTwoMonthsAgo1,
    category: 'Education',
    type: 'expense',
    accountId: 'cc3',
    isMock: true
  },
  {
    id: '32',
    name: 'Clothing Store',
    amount: -5500,
    date: dateTwoMonthsAgo2,
    category: 'Shopping',
    type: 'expense',
    accountId: 'cc3',
    isMock: true
  }
];

export const mockCreditCards: CreditCard[] = [
  {
    id: 'cc1',
    name: 'Axis Bank My Zone',
    totalSpend: 12500,
    limit: 50000,
    isMock: true
  },
  {
    id: 'cc2',
    name: 'HDFC Bank MoneyBack',
    totalSpend: 8900,
    limit: 30000,
    isMock: true
  },
  {
    id: 'cc3',
    name: 'SBI SimplyCLICK',
    totalSpend: 4500,
    limit: 25000,
    isMock: true
  }
];

export const mockBudgets: Budget[] = [
  {
    id: 'b1',
    category: 'Groceries',
    spent: 4300, // Sum of recent groceries
    limit: 8000,
    isMock: true
  },
  {
    id: 'b2',
    category: 'Entertainment',
    spent: 1349, // Netflix + Movie Tickets
    limit: 3000,
    isMock: true
  },
  {
    id: 'b3',
    category: 'Transportation',
    spent: 2020, // Fuel + Uber
    limit: 5000,
    isMock: true
  },
  {
    id: 'b4',
    category: 'Food & Dining',
    spent: 2250, // Coffee + Restaurant
    limit: 6000,
    isMock: true
  },
  {
    id: 'b5',
    category: 'Shopping',
    spent: 3500, // Amazon
    limit: 7000,
    isMock: true
  },
  {
    id: 'b6',
    category: 'Utilities',
    spent: 2199, // Electricity + Internet
    limit: 4000,
    isMock: true
  },
  {
    id: 'b7',
    category: 'Healthcare',
    spent: 750, // Pharmacy
    limit: 2000,
    isMock: true
  },
  {
    id: 'b8',
    category: 'Education',
    spent: 4999, // Online Course
    limit: 5000,
    isMock: true
  },
  {
    id: 'b9',
    category: 'Housing',
    spent: 15000, // Rent
    limit: 15000,
    isMock: true
  },
  {
    id: 'b10',
    category: 'Health',
    spent: 1200, // Gym
    limit: 2000,
    isMock: true
  },
  {
    id: 'b11',
    category: 'Travel',
    spent: 14000, // Flight + Hotel
    limit: 15000,
    isMock: true
  }
];

export const mockAccounts: Account[] = [
    { id: 'acc1', name: 'Personal Checking', type: 'Checking', balance: 125000, isMock: true },
    { id: 'acc2', name: 'Savings Account', type: 'Savings', balance: 85000, isMock: true },
    { id: 'acc3', name: 'Investment Portfolio', type: 'Investment', balance: 250000, isMock: true },
    { id: 'acc4', name: 'Emergency Fund', type: 'Savings', balance: 50000, isMock: true },
    // Credit cards are stored as accounts with type "Credit Card"
    { id: 'cc1', name: 'Axis Bank My Zone', type: 'Credit Card', balance: 0, limit: 50000, isMock: true },
    { id: 'cc2', name: 'HDFC Bank MoneyBack', type: 'Credit Card', balance: 0, limit: 30000, isMock: true },
    { id: 'cc3', name: 'SBI SimplyCLICK', type: 'Credit Card', balance: 0, limit: 25000, isMock: true }
];

export const categories = [
  'Home',
  'Groceries',
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Personal',
  'Fuel',
  'Utilities',
  'Healthcare',
  'Education',
  'Rent & Housing',
  'Investment',
  'Travel',
  'Other'
];

// Add a function to get the default categories
export const getDefaultCategories = () => [
  'Home',
  'Groceries',
  'Food & Dining',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Personal',
  'Fuel',
  'Utilities',
  'Healthcare',
  'Education',
  'Rent & Housing',
  'Investment',
  'Travel',
  'Other'
];