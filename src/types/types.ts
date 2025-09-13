export type Screen = 'dashboard' | 'transactions' | 'credit-cards' | 'budgets' | 'settings';

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