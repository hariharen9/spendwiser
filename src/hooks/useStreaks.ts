import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types/types';

interface StreakData {
  visitStreak: number;
  transactionStreak: number;
  lastVisitDate: string;
  lastTransactionDate: string;
}

const STORAGE_KEY = 'spendwise_streaks';

const getToday = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getYesterday = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

const isConsecutiveDay = (lastDate: string, checkDate: string): boolean => {
  const last = new Date(lastDate);
  const check = new Date(checkDate);
  const diffTime = check.getTime() - last.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays === 1;
};

const isSameDay = (date1: string, date2: string): boolean => {
  return date1 === date2;
};

export const useStreaks = (transactions: Transaction[], userId: string | undefined) => {
  const [streakData, setStreakData] = useState<StreakData>({
    visitStreak: 0,
    transactionStreak: 0,
    lastVisitDate: '',
    lastTransactionDate: '',
  });

  // Load streaks from localStorage
  const loadStreaks = useCallback((): StreakData | null => {
    if (!userId) return null;

    try {
      const stored = localStorage.getItem(`${STORAGE_KEY}_${userId}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading streaks:', error);
    }
    return null;
  }, [userId]);

  // Save streaks to localStorage
  const saveStreaks = useCallback((data: StreakData) => {
    if (!userId) return;

    try {
      localStorage.setItem(`${STORAGE_KEY}_${userId}`, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving streaks:', error);
    }
  }, [userId]);

  // Update visit streak
  useEffect(() => {
    if (!userId) return;

    const today = getToday();
    const yesterday = getYesterday();
    const stored = loadStreaks();

    let newVisitStreak = 1;
    let newLastVisitDate = today;

    if (stored) {
      if (isSameDay(stored.lastVisitDate, today)) {
        // Already visited today, keep current streak
        newVisitStreak = stored.visitStreak;
      } else if (isSameDay(stored.lastVisitDate, yesterday)) {
        // Visited yesterday, increment streak
        newVisitStreak = stored.visitStreak + 1;
      } else if (stored.lastVisitDate && stored.lastVisitDate < yesterday) {
        // Streak broken, reset to 1
        newVisitStreak = 1;
      }
    }

    const newData: StreakData = {
      visitStreak: newVisitStreak,
      transactionStreak: stored?.transactionStreak || 0,
      lastVisitDate: newLastVisitDate,
      lastTransactionDate: stored?.lastTransactionDate || '',
    };

    setStreakData(newData);
    saveStreaks(newData);
  }, [userId, loadStreaks, saveStreaks]);

  // Update transaction streak based on transactions
  useEffect(() => {
    if (!userId || transactions.length === 0) return;

    const today = getToday();
    const yesterday = getYesterday();

    // Find the most recent transaction date
    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Check if user has added any transactions today
    const hasTransactionToday = sortedTransactions.some(t => {
      const txDate = t.date.split('T')[0];
      return txDate === today;
    });

    // Calculate consecutive days with transactions (looking backwards)
    let transactionStreak = 0;
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) { // Check up to a year back
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasTransaction = sortedTransactions.some(t => {
        const txDate = t.date.split('T')[0];
        return txDate === dateStr;
      });

      if (hasTransaction) {
        transactionStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    setStreakData(prev => {
      const newData = {
        ...prev,
        transactionStreak,
        lastTransactionDate: hasTransactionToday ? today : prev.lastTransactionDate,
      };
      saveStreaks(newData);
      return newData;
    });
  }, [transactions, userId, saveStreaks]);

  return streakData;
};

export default useStreaks;
