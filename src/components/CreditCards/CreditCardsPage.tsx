import React, { useState, useMemo } from 'react';
import { CreditCard as CreditCardIcon, TrendingUp } from 'lucide-react';
import { Account, Transaction } from '../../types/types';
import MetricCard from '../Dashboard/MetricCard';

interface CreditCardsPageProps {
  accounts: Account[];
  transactions: Transaction[];
}

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ accounts, transactions }) => {
  const creditCards = useMemo(() => 
    accounts.filter(acc => acc.type === 'Credit Card'), 
    [accounts]
  );

  const [selectedCardId, setSelectedCardId] = useState(creditCards[0]?.id || '');

  const selectedCard = creditCards.find(card => card.id === selectedCardId);

  const totalSpend = selectedCard?.balance || 0;
  const limit = selectedCard?.limit || 0;

  const cardTransactions = useMemo(() => 
    transactions.filter(t => t.accountId === selectedCardId), 
    [transactions, selectedCardId]
  );

  return (
    <div className="space-y-8">
      {/* Card Selector */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
          Select Credit Card
        </label>
        <select
          value={selectedCardId}
          onChange={(e) => setSelectedCardId(e.target.value)}
          className="w-full md:w-64 px-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
        >
          {creditCards.map(card => (
            <option key={card.id} value={card.id}>{card.name}</option>
          ))}
        </select>
      </div>

      {selectedCard && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              title="Total Spend"
              value={`₹${totalSpend.toLocaleString()}`}
              change={limit > 0 ? `${Math.round((totalSpend / limit) * 100)}% of limit` : ''}
              changeType="neutral"
              icon={CreditCardIcon}
              color="bg-[#007BFF]"
            />
            <MetricCard
              title="Remaining Limit"
              value={`₹${(limit - totalSpend).toLocaleString()}`}
              change={`₹${limit.toLocaleString()} total limit`}
              changeType="neutral"
              icon={TrendingUp}
              color="bg-[#00C9A7]"
            />
          </div>

          {/* Usage Progress */}
          <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Credit Utilization</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-[#888888]">Used</span>
                <span className="text-gray-900 dark:text-[#F5F5F5]">
                  ₹{totalSpend.toLocaleString()} of ₹{limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#1A1A1A] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#007BFF] to-[#00C9A7] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalSpend / limit) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  limit > 0 && (totalSpend / limit) > 0.8 
                    ? 'text-[#DC3545]' 
                    : limit > 0 && (totalSpend / limit) > 0.6
                    ? 'text-[#FFC107]'
                    : 'text-[#28A745]'
                }`}>
                  {limit > 0 ? `${Math.round((totalSpend / limit) * 100)}% utilized` : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions for Selected Card */}
          <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6">
              Recent {selectedCard.name} Transactions
            </h3>
            <div className="space-y-4">
              {cardTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">{transaction.name}</p>
                    <p className="text-sm text-gray-500 dark:text-[#888888]">{transaction.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#DC3545]">
                      ₹{Math.abs(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-[#888888]">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CreditCardsPage;
