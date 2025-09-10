export interface Transaction {
  id: string;
  name: string;
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
  creditCard?: string;
  comments?: string;
}

export interface CreditCard {
  id: string;
  name: string;
  totalSpend: number;
  limit: number;
}

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
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
}

export type Screen = 'login' | 'dashboard' | 'transactions' | 'credit-cards' | 'budgets' | 'settings';