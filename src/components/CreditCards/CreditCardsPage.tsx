import React, { useState } from 'react';
import { CreditCard as CreditCardIcon, TrendingUp } from 'lucide-react';
import { CreditCard, Transaction } from '../../types/types';
import MetricCard from '../Dashboard/MetricCard';

interface CreditCardsPageProps {
  creditCards: CreditCard[];
  transactions: Transaction[];
}

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ creditCards, transactions }) => {
  const [selectedCard, setSelectedCard] = useState(creditCards[0]?.id || '');

  const currentCard = creditCards.find(card => card.id === selectedCard);
  const cardTransactions = transactions.filter(t => t.creditCard === currentCard?.name);

  return (
    <div className="space-y-8">
      {/* Card Selector */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
          Select Credit Card
        </label>
        <select
          value={selectedCard}
          onChange={(e) => setSelectedCard(e.target.value)}
          className="w-full md:w-64 px-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
        >
          {creditCards.map(card => (
            <option key={card.id} value={card.id}>{card.name}</option>
          ))}
        </select>
      </div>

      {currentCard && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              title="Total Spend"
              value={`₹${currentCard.totalSpend.toLocaleString()}`}
              change={`${Math.round((currentCard.totalSpend / currentCard.limit) * 100)}% of limit`}
              changeType="neutral"
              icon={CreditCardIcon}
              color="bg-[#007BFF]"
            />
            <MetricCard
              title="Remaining Limit"
              value={`₹${(currentCard.limit - currentCard.totalSpend).toLocaleString()}`}
              change={`₹${currentCard.limit.toLocaleString()} total limit`}
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
                  ₹{currentCard.totalSpend.toLocaleString()} of ₹{currentCard.limit.toLocaleString()}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-[#1A1A1A] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#007BFF] to-[#00C9A7] h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((currentCard.totalSpend / currentCard.limit) * 100, 100)}%` }}
                ></div>
              </div>
              <div className="text-right">
                <span className={`text-sm font-medium ${
                  (currentCard.totalSpend / currentCard.limit) > 0.8 
                    ? 'text-[#DC3545]' 
                    : (currentCard.totalSpend / currentCard.limit) > 0.6
                    ? 'text-[#FFC107]'
                    : 'text-[#28A745]'
                }`}>
                  {Math.round((currentCard.totalSpend / currentCard.limit) * 100)}% utilized
                </span>
              </div>
            </div>
          </div>

          {/* Recent Transactions for Selected Card */}
          <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6">
              Recent {currentCard.name} Transactions
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