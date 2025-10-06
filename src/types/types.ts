export type Screen = 'dashboard' | 'transactions' | 'credit-cards' | 'budgets' | 'settings' | 'goals' | 'loans' | 'shortcuts';

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
  createdAt?: string;
}

export interface Budget {
  id: string;
  category: string;
  spent: number;
  limit: number;
  isMock?: boolean;
}

export type User = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  defaultAccountId?: string;
  currency?: string;
  themePreference?: 'dark' | 'light';
  fontPreference?: string;
  categories?: string[];
  feedbackStars?: number;
  feedbackText?: string;
  hasGivenFeedback?: boolean;
  transactionsAtLastFeedbackPrompt?: number;
};

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
  type?: 'home' | 'auto' | 'personal' | 'student' | 'other';
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

export interface Shortcut {
  id: string;
  keyword: string;
  name: string;
  category: string;
  type: 'income' | 'expense';
  accountId?: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  amountOwed: number;
  amountPaid: number;
}

export interface Group {
  id: string;
  name: string;
  participantIds: string[];
  createdAt?: Date;
  currency?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
  splitType: 'equal' | 'unequal' | 'percentage';
  splits: {
    participantId: string;
    amount: number;
    percentage?: number;
  }[];
  date: string;
  groupId?: string;
  createdAt?: Date;
  category?: string; // Add category field
}
