import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';
import { RecurringTransaction } from '../../types/types';
import { FiRefreshCw, FiDollarSign, FiCalendar, FiTrendingUp, FiAlertCircle, FiCheck, FiX, FiPlus, FiSettings } from 'react-icons/fi';

interface SubscriptionTrackerProps {
  recurringTransactions: RecurringTransaction[];
  currency: string;
  onManageSubscriptions?: () => void;
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

const SubscriptionTracker: React.FC<SubscriptionTrackerProps> = ({ recurringTransactions, currency, onManageSubscriptions }) => {
  const [sortBy, setSortBy] = useState<'amount' | 'duration' | 'name'>('amount');
  const [showInactive, setShowInactive] = useState(false);

  const activeSubscriptions = recurringTransactions.filter(sub => !sub.endDate || new Date(sub.endDate) > new Date());
  const inactiveSubscriptions = recurringTransactions.filter(sub => sub.endDate && new Date(sub.endDate) <= new Date());

  const totalMonthlyAmount = activeSubscriptions.reduce((sum, sub) => {
    let monthlyAmount = sub.amount;
    switch (sub.frequency) {
      case 'daily':
        monthlyAmount = sub.amount * 30;
        break;
      case 'weekly':
        monthlyAmount = sub.amount * 4.33;
        break;
      case 'yearly':
        monthlyAmount = sub.amount / 12;
        break;
    }
    return sum + monthlyAmount;
  }, 0);

  const sortedSubscriptions = [...(showInactive ? recurringTransactions : activeSubscriptions)].sort((a, b) => {
    switch (sortBy) {
      case 'amount':
        return Math.abs(b.amount) - Math.abs(a.amount);
      case 'duration':
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'daily': return <FiRefreshCw className="w-3 h-3" />;
      case 'weekly': return <FiCalendar className="w-3 h-3" />;
      case 'monthly': return <FiCalendar className="w-3 h-3" />;
      case 'yearly': return <FiCalendar className="w-3 h-3" />;
      default: return <FiRefreshCw className="w-3 h-3" />;
    }
  };

  const isExpiringSoon = (sub: RecurringTransaction) => {
    if (!sub.endDate) return false;
    const endDate = new Date(sub.endDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return endDate <= thirtyDaysFromNow && endDate > new Date();
  };

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] flex items-center">
          <FiRefreshCw className="w-5 h-5 mr-2" />
          Subscriptions
        </h3>
        <div className="flex items-center space-x-2">
          {onManageSubscriptions && (
            <>
              <button
                onClick={onManageSubscriptions}
                className="flex items-center px-2 py-1 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
                title="Add Subscription"
              >
                <FiPlus className="w-3 h-3 mr-1" />
                Add
              </button>
              <button
                onClick={onManageSubscriptions}
                className="flex items-center px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                title="Manage Subscriptions"
              >
                <FiSettings className="w-3 h-3 mr-1" />
                Manage
              </button>
            </>
          )}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'amount' | 'duration' | 'name')}
            className="text-xs bg-gray-100 dark:bg-gray-700 border-0 rounded-lg px-2 py-1 text-gray-700 dark:text-gray-300"
          >
            <option value="amount">By Amount</option>
            <option value="duration">By Duration</option>
            <option value="name">By Name</option>
          </select>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className={`px-2 py-1 text-xs rounded-lg transition-colors ${
              showInactive 
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
            }`}
          >
            {showInactive ? 'All' : 'Active'}
          </button>
        </div>
      </div>

      {activeSubscriptions.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Monthly</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                {currency}{totalMonthlyAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Subscriptions</p>
              <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">{activeSubscriptions.length}</p>
            </div>
          </div>
        </div>
      )}

      {sortedSubscriptions.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {sortedSubscriptions.map((sub, index) => {
              const duration = calculateDuration(sub.startDate);
              const totalPaid = calculateTotalPaid(sub);
              const isActive = !sub.endDate || new Date(sub.endDate) > new Date();
              const expiringSoon = isExpiringSoon(sub);

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border transition-colors ${
                    isActive 
                      ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-75'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-gray-800 dark:text-gray-200">{sub.name}</span>
                        {isActive ? (
                          <FiCheck className="w-4 h-4 text-green-500" />
                        ) : (
                          <FiX className="w-4 h-4 text-gray-400" />
                        )}
                        {expiringSoon && (
                          <FiAlertCircle className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-1">
                          {getFrequencyIcon(sub.frequency)}
                          <span>{sub.frequency}</span>
                        </div>
                        <span>{sub.category}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Duration: {duration}</span>
                        <span>Total: {currency}{totalPaid.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-semibold text-lg ${sub.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                        {sub.type === 'expense' ? '-' : '+'}{currency}{Math.abs(sub.amount).toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">per {sub.frequency.slice(0, -2)}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-8">
          <FiRefreshCw className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-[#888888]">No recurring subscriptions found.</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">
            Add recurring transactions to track your subscriptions
          </p>
          {onManageSubscriptions && (
            <button
              onClick={onManageSubscriptions}
              className="mt-4 flex items-center justify-center mx-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add Subscription
            </button>
          )}
        </div>
      )}

      {inactiveSubscriptions.length > 0 && !showInactive && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowInactive(true)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            Show {inactiveSubscriptions.length} inactive subscription{inactiveSubscriptions.length > 1 ? 's' : ''}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default SubscriptionTracker;