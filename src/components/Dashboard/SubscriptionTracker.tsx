import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { RecurringTransaction } from '../../types/types';

interface SubscriptionTrackerProps {
  recurringTransactions: RecurringTransaction[];
  currency: string;
}

const calculateDuration = (startDate: string): string => {
  const start = new Date(startDate);
  const now = new Date();

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years === 0 && months === 0) {
    return "Less than a month";
  }

  let duration = "";
  if (years > 0) {
    duration += `${years} year${years > 1 ? 's' : ''}`;
  }
  if (months > 0) {
    duration += `${years > 0 ? ', ' : ''}${months} month${months > 1 ? 's' : ''}`;
  }
  return duration.trim();
};

const calculateTotalPaid = (subscription: RecurringTransaction): number => {
  const start = new Date(subscription.startDate);
  const end = subscription.endDate ? new Date(subscription.endDate) : new Date();
  let totalPaid = 0;

  let current = new Date(start);
  while (current <= end) {
    totalPaid += subscription.amount;
    switch (subscription.frequency) {
      case 'daily':
        current.setDate(current.getDate() + 1);
        break;
      case 'weekly':
        current.setDate(current.getDate() + 7);
        break;
      case 'monthly':
        current.setMonth(current.getMonth() + 1);
        break;
      case 'yearly':
        current.setFullYear(current.getFullYear() + 1);
        break;
    }
  }
  return totalPaid;
};

const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ recurringTransactions, currency }) => {

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Recurring Subscriptions</h3>
      {recurringTransactions.length > 0 ? (
        <ul className="space-y-3">
          {recurringTransactions.map(sub => {
            const duration = calculateDuration(sub.startDate);
            const totalPaid = calculateTotalPaid(sub);
            return (
              <li key={sub.id} className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-800 dark:text-gray-200">{sub.name}</span>
                  <p className="text-sm text-gray-500 dark:text-[#888888]">{sub.frequency} - {sub.category}</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Duration: {duration}</p>
                  <p className="text-xs text-gray-500 dark:text-[#888888]">Total Paid: {currency}{totalPaid.toFixed(2)}</p>
                </div>
                <span className={`font-semibold ${sub.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>{sub.type === 'expense' ? '-' : '+'}{currency}{Math.abs(sub.amount).toLocaleString()}</span>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-gray-500 dark:text-[#888888]">No recurring subscriptions found.</p>
      )}
    </motion.div>
  );
};

export default SubscriptionTracker;