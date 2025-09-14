export type Screen = 'dashboard' | 'transactions' | 'credit-cards' | 'budgets' | 'settings' | 'goals' | 'loans';

export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  accountId?: string;
  comments?: string;
  isMock?: boolean;
}

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  isMock?: boolean;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
  currency: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  limit?: number;
  isMock?: boolean;
}

export interface CreditCard {
  id: string;
  name: string;
  totalSpend: number;
  limit: number;
  isMock?: boolean;
}

export interface TotalBudget {
  id: string;
  limit: number;
  month: string; // Format: YYYY-MM
  isMock?: boolean;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  emoji: string;
  isMock?: boolean;
}

export interface Loan {
  id: string;
  name: string;
  loanAmount: number;
  interestRate: number;
  tenure: number; // in years
  emi: number;
  startDate: string;
  isMock?: boolean;
  tenureInMonths?: number; // New field to support months for small items
}

export interface RecurringTransaction {
  id: string;
  name: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  lastProcessedDate: string;
  accountId?: string;
  isMock?: boolean;
}