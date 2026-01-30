import { Transaction, Account, Budget, Loan } from '../types/types';
import { TimezoneManager } from './timezone';

/**
 * Filter transactions by month (YYYY-MM format)
 */
export function filterTransactionsByMonth(
  transactions: Transaction[],
  yearMonth: string
): Transaction[] {
  return transactions.filter(transaction => {
    const transactionDate = TimezoneManager.normalizeDate(transaction.date);
    const transactionYearMonth = transactionDate.substring(0, 7);
    return transactionYearMonth === yearMonth;
  });
}

/**
 * Calculate financial summary for a set of transactions
 */
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;
  incomeCount: number;
  expenseCount: number;
}

export function calculateSummary(transactions: Transaction[]): FinancialSummary {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const totalIncome = incomeTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  return {
    totalIncome,
    totalExpenses,
    netSavings,
    savingsRate,
    incomeCount: incomeTransactions.length,
    expenseCount: expenseTransactions.length,
  };
}

/**
 * Category breakdown with amounts, percentages, and counts
 */
export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  count: number;
  type: 'income' | 'expense';
}

export function calculateCategoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense' = 'expense'
): CategoryBreakdown[] {
  const filteredTransactions = transactions.filter(t => t.type === type);
  const total = filteredTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  filteredTransactions.forEach(t => {
    const existing = categoryMap.get(t.category) || { amount: 0, count: 0 };
    categoryMap.set(t.category, {
      amount: existing.amount + Math.abs(t.amount),
      count: existing.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, data]) => ({
      category,
      amount: data.amount,
      percentage: total > 0 ? (data.amount / total) * 100 : 0,
      count: data.count,
      type,
    }))
    .sort((a, b) => b.amount - a.amount);
}

/**
 * Credit card spending breakdown per card
 */
export interface CreditCardSpending {
  cardId: string;
  cardName: string;
  spending: number;
  limit: number;
  utilization: number;
  transactionCount: number;
  last4Digits?: string;
}

export function calculateCreditCardSpending(
  transactions: Transaction[],
  accounts: Account[]
): CreditCardSpending[] {
  const creditCards = accounts.filter(a => a.type === 'Credit Card');

  return creditCards.map(card => {
    const cardTransactions = transactions.filter(
      t => t.accountId === card.id && t.type === 'expense'
    );
    const spending = cardTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const limit = card.limit || 0;
    const utilization = limit > 0 ? (spending / limit) * 100 : 0;

    return {
      cardId: card.id,
      cardName: card.name,
      spending,
      limit,
      utilization,
      transactionCount: cardTransactions.length,
      last4Digits: card.last4Digits,
    };
  }).sort((a, b) => b.spending - a.spending);
}

/**
 * Loan payments made in a given month
 */
export interface LoanPayment {
  loanId: string;
  loanName: string;
  emi: number;
  paymentsMade: number;
  totalPaid: number;
  loanType?: string;
}

export function calculateLoanPayments(
  transactions: Transaction[],
  loans: Loan[]
): LoanPayment[] {
  return loans.map(loan => {
    const loanTransactions = transactions.filter(t => t.loanId === loan.id);
    const totalPaid = loanTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      loanId: loan.id,
      loanName: loan.name,
      emi: loan.emi,
      paymentsMade: loanTransactions.length,
      totalPaid,
      loanType: loan.type,
    };
  }).filter(lp => lp.paymentsMade > 0 || true); // Include all loans for reference
}

/**
 * Budget performance - spent vs limit for each budget
 */
export interface BudgetPerformance {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'near' | 'over';
}

export function calculateBudgetPerformance(
  transactions: Transaction[],
  budgets: Budget[]
): BudgetPerformance[] {
  return budgets.map(budget => {
    const categoryTransactions = transactions.filter(
      t => t.category === budget.category && t.type === 'expense'
    );
    const spent = categoryTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const remaining = budget.limit - spent;
    const percentage = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;

    let status: 'under' | 'near' | 'over';
    if (percentage >= 100) {
      status = 'over';
    } else if (percentage >= 80) {
      status = 'near';
    } else {
      status = 'under';
    }

    return {
      category: budget.category,
      limit: budget.limit,
      spent,
      remaining,
      percentage,
      status,
    };
  }).sort((a, b) => b.percentage - a.percentage);
}

/**
 * Financial insights from the month's transactions
 */
export interface MonthlyInsights {
  highestSpendingDay: {
    date: string;
    amount: number;
    transactionCount: number;
  } | null;
  mostUsedCategory: {
    category: string;
    count: number;
    amount: number;
  } | null;
  largestExpense: {
    name: string;
    amount: number;
    category: string;
    date: string;
  } | null;
  largestIncome: {
    name: string;
    amount: number;
    category: string;
    date: string;
  } | null;
  averageTransaction: number;
  averageDailySpending: number;
  transactionsPerDay: number;
  uniqueCategories: number;
  weekdayVsWeekend: {
    weekdaySpending: number;
    weekendSpending: number;
    weekdayCount: number;
    weekendCount: number;
  };
}

export function generateInsights(
  transactions: Transaction[],
  yearMonth: string
): MonthlyInsights {
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');

  // Highest spending day
  const dailySpending = new Map<string, { amount: number; count: number }>();
  expenses.forEach(t => {
    const date = TimezoneManager.normalizeDate(t.date);
    const existing = dailySpending.get(date) || { amount: 0, count: 0 };
    dailySpending.set(date, {
      amount: existing.amount + Math.abs(t.amount),
      count: existing.count + 1,
    });
  });

  let highestSpendingDay: MonthlyInsights['highestSpendingDay'] = null;
  dailySpending.forEach((data, date) => {
    if (!highestSpendingDay || data.amount > highestSpendingDay.amount) {
      highestSpendingDay = {
        date,
        amount: data.amount,
        transactionCount: data.count,
      };
    }
  });

  // Most used category (by transaction count)
  const categoryUsage = new Map<string, { count: number; amount: number }>();
  expenses.forEach(t => {
    const existing = categoryUsage.get(t.category) || { count: 0, amount: 0 };
    categoryUsage.set(t.category, {
      count: existing.count + 1,
      amount: existing.amount + Math.abs(t.amount),
    });
  });

  let mostUsedCategory: MonthlyInsights['mostUsedCategory'] = null;
  categoryUsage.forEach((data, category) => {
    if (!mostUsedCategory || data.count > mostUsedCategory.count) {
      mostUsedCategory = {
        category,
        count: data.count,
        amount: data.amount,
      };
    }
  });

  // Largest expense
  const largestExpenseTransaction = expenses.reduce<Transaction | null>(
    (max, t) => (!max || Math.abs(t.amount) > Math.abs(max.amount) ? t : max),
    null
  );
  const largestExpense = largestExpenseTransaction
    ? {
        name: largestExpenseTransaction.name,
        amount: Math.abs(largestExpenseTransaction.amount),
        category: largestExpenseTransaction.category,
        date: largestExpenseTransaction.date,
      }
    : null;

  // Largest income
  const largestIncomeTransaction = incomes.reduce<Transaction | null>(
    (max, t) => (!max || Math.abs(t.amount) > Math.abs(max.amount) ? t : max),
    null
  );
  const largestIncome = largestIncomeTransaction
    ? {
        name: largestIncomeTransaction.name,
        amount: Math.abs(largestIncomeTransaction.amount),
        category: largestIncomeTransaction.category,
        date: largestIncomeTransaction.date,
      }
    : null;

  // Average transaction
  const totalExpenseAmount = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const averageTransaction = expenses.length > 0 ? totalExpenseAmount / expenses.length : 0;

  // Days in month
  const [year, month] = yearMonth.split('-').map(Number);
  const daysInMonth = new Date(year, month, 0).getDate();
  const averageDailySpending = totalExpenseAmount / daysInMonth;
  const transactionsPerDay = transactions.length / daysInMonth;

  // Unique categories
  const uniqueCategories = new Set(transactions.map(t => t.category)).size;

  // Weekday vs Weekend
  let weekdaySpending = 0;
  let weekendSpending = 0;
  let weekdayCount = 0;
  let weekendCount = 0;

  expenses.forEach(t => {
    const date = new Date(TimezoneManager.normalizeDate(t.date));
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekend) {
      weekendSpending += Math.abs(t.amount);
      weekendCount++;
    } else {
      weekdaySpending += Math.abs(t.amount);
      weekdayCount++;
    }
  });

  return {
    highestSpendingDay,
    mostUsedCategory,
    largestExpense,
    largestIncome,
    averageTransaction,
    averageDailySpending,
    transactionsPerDay,
    uniqueCategories,
    weekdayVsWeekend: {
      weekdaySpending,
      weekendSpending,
      weekdayCount,
      weekendCount,
    },
  };
}

/**
 * Generate month options for the selector (current + past 12 months)
 */
export function generateMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const today = TimezoneManager.today();

  for (let i = 0; i < 13; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }

  return options;
}

/**
 * Format currency with proper locale
 */
export function formatCurrency(amount: number, currency: string): string {
  const absAmount = Math.abs(amount);
  if (currency === '₹') {
    // Indian numbering format (lakhs, crores)
    if (absAmount >= 10000000) {
      return `${currency}${(absAmount / 10000000).toFixed(2)} Cr`;
    } else if (absAmount >= 100000) {
      return `${currency}${(absAmount / 100000).toFixed(2)} L`;
    }
  }
  return `${currency}${absAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Get color for a category based on index
 */
const CATEGORY_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#84CC16', // lime
  '#6366F1', // indigo
  '#14B8A6', // teal
  '#A855F7', // purple
];

export function getCategoryColor(index: number): string {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

/**
 * Group transactions by date
 */
export function groupTransactionsByDate(
  transactions: Transaction[]
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach(t => {
    const date = TimezoneManager.normalizeDate(t.date);
    const existing = grouped.get(date) || [];
    existing.push(t);
    grouped.set(date, existing);
  });

  // Sort dates in descending order
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => b.localeCompare(a));
  const sortedMap = new Map<string, Transaction[]>();
  sortedKeys.forEach(key => {
    sortedMap.set(key, grouped.get(key)!);
  });

  return sortedMap;
}

/**
 * Group transactions by category
 */
export function groupTransactionsByCategory(
  transactions: Transaction[]
): Map<string, Transaction[]> {
  const grouped = new Map<string, Transaction[]>();

  transactions.forEach(t => {
    const existing = grouped.get(t.category) || [];
    existing.push(t);
    grouped.set(t.category, existing);
  });

  // Sort categories by total amount
  const sortedKeys = Array.from(grouped.keys()).sort((a, b) => {
    const totalA = grouped.get(a)!.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const totalB = grouped.get(b)!.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    return totalB - totalA;
  });

  const sortedMap = new Map<string, Transaction[]>();
  sortedKeys.forEach(key => {
    sortedMap.set(key, grouped.get(key)!);
  });

  return sortedMap;
}
