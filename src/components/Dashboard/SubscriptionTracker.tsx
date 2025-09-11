import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types/types';

interface SubscriptionTrackerProps {
  transactions: Transaction[];
}

interface Subscription {
  name: string;
  amount: number;
  lastDate: string;
}

const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ transactions }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const identifySubscriptions = () => {
      const potentialSubs: { [key: string]: Transaction[] } = {};

      transactions.forEach(t => {
        if (t.type === 'expense') {
          const normalizedName = t.name.toLowerCase().replace(/\d+/g, '').trim();
          if (!potentialSubs[normalizedName]) {
            potentialSubs[normalizedName] = [];
          }
          potentialSubs[normalizedName].push(t);
        }
      });

      const foundSubscriptions: Subscription[] = [];

      for (const name in potentialSubs) {
        const group = potentialSubs[name].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        if (group.length > 1) {
          for (let i = 0; i < group.length - 1; i++) {
            const date1 = new Date(group[i].date);
            const date2 = new Date(group[i + 1].date);
            const diffDays = (date1.getTime() - date2.getTime()) / (1000 * 3600 * 24);

            if (diffDays > 25 && diffDays < 35) {
              const amount1 = Math.abs(group[i].amount);
              const amount2 = Math.abs(group[i + 1].amount);
              if (Math.abs(amount1 - amount2) / amount2 < 0.15) { // 15% tolerance
                if (!foundSubscriptions.find(s => s.name === group[i].name)) {
                  foundSubscriptions.push({
                    name: group[i].name,
                    amount: amount1,
                    lastDate: group[i].date,
                  });
                }
              }
            }
          }
        }
      }
      setSubscriptions(foundSubscriptions);
    };

    identifySubscriptions();
  }, [transactions]);

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Recurring Subscriptions</h3>
      {subscriptions.length > 0 ? (
        <ul className="space-y-3">
          {subscriptions.map(sub => (
            <li key={sub.name} className="flex justify-between items-center">
              <span className="font-medium text-gray-800 dark:text-gray-200">{sub.name}</span>
              <span className="font-semibold text-gray-900 dark:text-white">₹{sub.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-[#888888]">No recurring subscriptions found.</p>
      )}
    </div>
  );
};

export default SubscriptionTracker;
