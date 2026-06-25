import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { LoanFund, LoanFundExpense } from '../types/types';

export const useLoanFunds = () => {
  const [loanFunds, setLoanFunds] = useState<LoanFund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const unsubscribeFunds = onSnapshot(
          collection(db, 'spenders', user.uid, 'loanFunds'),
          (snapshot) => {
            const fundsData: LoanFund[] = snapshot.docs.map(doc => ({
              ...(doc.data() as LoanFund),
              id: doc.id
            }));
            setLoanFunds(fundsData.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
            setLoading(false);
          },
          (err) => {
            console.error('Error fetching loan funds:', err);
            setError(err.message);
            setLoading(false);
          }
        );

        return () => {
          unsubscribeFunds();
        };
      } else {
        setLoanFunds([]);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const addLoanFund = async (fund: Omit<LoanFund, 'id' | 'expenses'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const newFundRef = doc(collection(db, 'spenders', user.uid, 'loanFunds'));
    const newFund: LoanFund = {
      ...fund,
      id: newFundRef.id,
      expenses: []
    };
    
    await setDoc(newFundRef, newFund);
    return newFund.id;
  };

  const updateLoanFund = async (id: string, updates: Partial<LoanFund>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const fundRef = doc(db, 'spenders', user.uid, 'loanFunds', id);
    await updateDoc(fundRef, updates);
  };

  const deleteLoanFund = async (id: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const fundRef = doc(db, 'spenders', user.uid, 'loanFunds', id);
    await deleteDoc(fundRef);
  };

  const addExpenseToFund = async (fundId: string, expense: Omit<LoanFundExpense, 'id'>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const fund = loanFunds.find(f => f.id === fundId);
    if (!fund) throw new Error('Fund not found');

    const newExpense: LoanFundExpense = {
      ...expense,
      id: Date.now().toString(),
    };

    const updatedExpenses = [newExpense, ...(fund.expenses || [])];
    
    const fundRef = doc(db, 'spenders', user.uid, 'loanFunds', fundId);
    await updateDoc(fundRef, { expenses: updatedExpenses });
  };

  const deleteExpenseFromFund = async (fundId: string, expenseId: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const fund = loanFunds.find(f => f.id === fundId);
    if (!fund) throw new Error('Fund not found');

    const updatedExpenses = (fund.expenses || []).filter(e => e.id !== expenseId);
    
    const fundRef = doc(db, 'spenders', user.uid, 'loanFunds', fundId);
    await updateDoc(fundRef, { expenses: updatedExpenses });
  };

  const updateExpenseInFund = async (fundId: string, expenseId: string, updates: Partial<LoanFundExpense>) => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const fund = loanFunds.find(f => f.id === fundId);
    if (!fund) throw new Error('Fund not found');

    const updatedExpenses = (fund.expenses || []).map(e => 
      e.id === expenseId ? { ...e, ...updates } : e
    );
    
    const fundRef = doc(db, 'spenders', user.uid, 'loanFunds', fundId);
    await updateDoc(fundRef, { expenses: updatedExpenses });
  };

  return {
    loanFunds,
    loading,
    error,
    addLoanFund,
    updateLoanFund,
    deleteLoanFund,
    addExpenseToFund,
    updateExpenseInFund,
    deleteExpenseFromFund
  };
};
