import React, { useState, useMemo } from 'react';
import { CreditCard as CreditCardIcon, TrendingUp, Plus, X } from 'lucide-react';
import { Account, Transaction } from '../../types/types';
import MetricCard from '../Dashboard/MetricCard';

interface CreditCardsPageProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddAccount?: (accountData: Omit<Account, 'id'>) => void;
}

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ accounts, transactions, onAddAccount }) => {
  const creditCards = useMemo(() => 
    accounts.filter(acc => acc.type === 'Credit Card'), 
    [accounts]
  );

  const [selectedCardId, setSelectedCardId] = useState(creditCards[0]?.id || '');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCardForm, setNewCardForm] = useState({
    name: '',
    limit: ''
  });

  const selectedCard = creditCards.find(card => card.id === selectedCardId);

  const cardTransactions = useMemo(() => 
    transactions.filter(t => t.accountId === selectedCardId), 
    [transactions, selectedCardId]
  );

  // Calculate total spend dynamically based on transactions
  const totalSpend = useMemo(() => {
    return cardTransactions.reduce((sum, transaction) => {
      // For credit cards, expenses increase the balance (negative amounts)
      // and payments decrease the balance (positive amounts)
      return sum + Math.abs(transaction.amount);
    }, 0);
  }, [cardTransactions]);

  const limit = selectedCard?.limit || 0;

  const handleOpenAddCardModal = () => {
    setNewCardForm({ name: '', limit: '' });
    setShowAddCardModal(true);
  };

  const handleCloseAddCardModal = () => {
    setShowAddCardModal(false);
    setNewCardForm({ name: '', limit: '' });
  };

  const handleSaveNewCard = () => {
    if (newCardForm.name && newCardForm.limit && onAddAccount) {
      const accountData: Omit<Account, 'id'> = {
        name: newCardForm.name,
        type: 'Credit Card',
        balance: 0, // Set default balance to 0
        limit: parseFloat(newCardForm.limit)
      };
      
      onAddAccount(accountData);
      handleCloseAddCardModal();
    }
  };

  return (
    <div className="space-y-8">
      {/* Card Selector */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
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
          <button
            onClick={handleOpenAddCardModal}
            className="flex items-center justify-center px-4 py-2 bg-[#00C9A7] text-white rounded-lg font-medium hover:bg-[#00B8A0] transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Credit Card
          </button>
        </div>
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

      {/* Add Credit Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                Add New Credit Card
              </h2>
              <button
                onClick={handleCloseAddCardModal}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                  Card Name *
                </label>
                <input
                  type="text"
                  value={newCardForm.name}
                  onChange={(e) => setNewCardForm({ ...newCardForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                  placeholder="e.g., Chase Sapphire"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                  Credit Limit *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newCardForm.limit}
                  onChange={(e) => setNewCardForm({ ...newCardForm, limit: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                  placeholder="5000.00"
                />
              </div>
              
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  onClick={handleCloseAddCardModal}
                  className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewCard}
                  className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                >
                  Add Card
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCardsPage;