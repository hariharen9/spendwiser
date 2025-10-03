
import { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { User as FirebaseUser } from 'firebase/auth';
import { Participant, Group, Expense } from '../types/types';
import React from 'react';

export const useBillSplittingData = (user: FirebaseUser | null, isOpen: boolean) => {
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'You', amountOwed: 0, amountPaid: 0 },
  ]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [expensesByGroup, setExpensesByGroup] = useState<Record<string, Expense[]>>({});
  const expenses = useMemo(() => Object.values(expensesByGroup).flat(), [expensesByGroup]);
  const [groupParticipants, setGroupParticipants] = useState<Record<string, string[]>>({}); // Group ID -> participant IDs
  const [loading, setLoading] = useState(true);
  const expenseListenersRef = React.useRef<Record<string, () => void>>({});

  useEffect(() => {
    if (!user || !isOpen) {
      Object.values(expenseListenersRef.current).forEach(unsub => unsub());
      expenseListenersRef.current = {};
      setExpensesByGroup({});
      setGroups([]);
      setGroupParticipants({});
      setParticipants([{ id: '1', name: 'You', amountOwed: 0, amountPaid: 0 }]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const masterUnsubscribes: (() => void)[] = [];

    const participantsQuery = query(collection(db, 'spenders', user.uid, 'billSplittingParticipants'));
    const unsubscribeParticipants = onSnapshot(participantsQuery, (snapshot) => {
      const firestoreParticipants: Participant[] = [{ id: '1', name: 'You', amountOwed: 0, amountPaid: 0 }];
      snapshot.forEach((doc) => {
        firestoreParticipants.push({ id: doc.id, ...doc.data(), amountOwed: 0, amountPaid: 0 } as Participant);
      });
      setParticipants(firestoreParticipants);
    });
    masterUnsubscribes.push(unsubscribeParticipants);

    const groupsQuery = query(collection(db, 'spenders', user.uid, 'billSplittingGroups'));
    const unsubscribeGroups = onSnapshot(groupsQuery, (groupSnapshot) => {
      const firestoreGroups: Group[] = [];
      const newGroupParticipants: Record<string, string[]> = {};
      const currentGroupIds = groupSnapshot.docs.map(d => d.id);

      groupSnapshot.forEach(doc => {
        const data = doc.data();
        firestoreGroups.push({
          id: doc.id,
          name: data.name,
          participantIds: data.participantIds || [],
          createdAt: data.createdAt?.toDate(),
          currency: data.currency || '₹'
        });
        newGroupParticipants[doc.id] = data.participantIds || [];
      });
      setGroups(firestoreGroups);
      setGroupParticipants(newGroupParticipants);

      const currentListeners = expenseListenersRef.current;
      Object.keys(currentListeners).forEach(groupId => {
        if (!currentGroupIds.includes(groupId)) {
          currentListeners[groupId]();
          delete currentListeners[groupId];
          setExpensesByGroup(prev => {
            const next = { ...prev };
            delete next[groupId];
            return next;
          });
        }
      });

      currentGroupIds.forEach(groupId => {
        if (!currentListeners[groupId]) {
          const expensesQuery = query(collection(db, 'spenders', user.uid, 'billSplittingGroups', groupId, 'expenses'));
          currentListeners[groupId] = onSnapshot(expensesQuery, expenseSnapshot => {
            const groupExpenses: Expense[] = [];
            expenseSnapshot.forEach(expDoc => {
              const data = expDoc.data();
              groupExpenses.push({
                id: expDoc.id,
                ...data,
                groupId: groupId,
                createdAt: data.createdAt?.toDate()
              } as Expense);
            });
            setExpensesByGroup(prev => ({ ...prev, [groupId]: groupExpenses }));
          });
        }
      });
      setLoading(false);
    });
    masterUnsubscribes.push(unsubscribeGroups);

    return () => {
      masterUnsubscribes.forEach(unsub => unsub());
      Object.values(expenseListenersRef.current).forEach(unsub => unsub());
      expenseListenersRef.current = {};
    };
  }, [user, isOpen]);

  useEffect(() => {
    const updatedParticipants = participants.map(p => ({
      ...p,
      amountOwed: 0,
      amountPaid: 0
    }));

    expenses.forEach(expense => {
      const payerIndex = updatedParticipants.findIndex(p => p.id === expense.paidBy);
      if (payerIndex !== -1) {
        updatedParticipants[payerIndex].amountPaid += expense.amount;
      }

      expense.splits.forEach(split => {
        const participantIndex = updatedParticipants.findIndex(p => p.id === split.participantId);
        if (participantIndex !== -1) {
          updatedParticipants[participantIndex].amountOwed += split.amount;
        }
      });
    });

    setParticipants(updatedParticipants);
  }, [expenses]);

  return { participants, setParticipants, groups, expenses, loading, expensesByGroup, groupParticipants, setGroupParticipants };
};
