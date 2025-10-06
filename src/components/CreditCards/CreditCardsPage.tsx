import React, { useState, useMemo } from 'react';
import { CreditCard as CreditCardIcon, TrendingUp, Plus, X, Edit, Trash2, PlusCircle, List, Eye } from 'lucide-react';
import { Account, Transaction } from '../../types/types';
import MetricCard from '../Dashboard/MetricCard';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import AnimatedDropdown from '../Common/AnimatedDropdown';

interface CreditCardsPageProps {
  accounts: Account[];
  transactions: Transaction[];
  onAddAccount?: (accountData: Omit<Account, 'id'>) => void;
  onEditAccount?: (accountData: Account) => void;
  onDeleteAccount?: (id: string) => void;
  currency: string;
  onSaveTransaction?: (transaction: Omit<Transaction, 'id'>) => void;
}

const CreditCardsPage: React.FC<CreditCardsPageProps> = ({ 
  accounts, 
  transactions, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount, 
  currency,
  onSaveTransaction
}) => {
  // No need to filter credit cards here since they're already filtered in App.tsx
  const creditCards = accounts;

  const [selectedCardId, setSelectedCardId] = useState(creditCards[0]?.id || '');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<Account | null>(null);
  const [newCardForm, setNewCardForm] = useState({
    name: '',
    limit: ''
  });
  // Add state for transaction form
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    name: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Food & Dining',
    type: 'expense' as 'income' | 'expense',
    comments: ''
  });
  // Add state for view mode
  const [viewMode, setViewMode] = useState<'selected' | 'all'>('selected');

  const selectedCard = creditCards.find(card => card.id === selectedCardId);

  const cardTransactions = useMemo(() => 
    transactions.filter(t => t.accountId === selectedCardId), 
    [transactions, selectedCardId]
  );

  // All credit card transactions
  const allCreditCardTransactions = useMemo(() => 
    transactions.filter(t => creditCards.some(card => card.id === t.accountId)),
    [transactions, creditCards]
  );

  // Calculate total spend dynamically based on transactions
  const totalSpend = useMemo(() => {
    return cardTransactions.reduce((sum, transaction) => {
      return sum + Math.abs(transaction.amount);
    }, 0);
  }, [cardTransactions]);

  const limit = selectedCard?.limit || 0;

  const handleOpenAddCardModal = () => {
    setNewCardForm({ name: '', limit: '' });
    setShowAddCardModal(true);
  };

  const handleOpenEditCardModal = (card: Account) => {
    setEditingCard(card);
    setNewCardForm({ 
      name: card.name, 
      limit: card.limit?.toString() || '' 
    });
    setShowEditCardModal(true);
  };

  const handleCloseAddCardModal = () => {
    setShowAddCardModal(false);
    setNewCardForm({ name: '', limit: '' });
  };

  const handleCloseEditCardModal = () => {
    setShowEditCardModal(false);
    setEditingCard(null);
    setNewCardForm({ name: '', limit: '' });
  };

  // Transaction form handlers
  const handleOpenAddTransactionModal = () => {
    // Reset form with today's date and default category
    setTransactionForm({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Food & Dining',
      type: 'expense',
      comments: ''
    });
    setShowAddTransactionModal(true);
  };

  const handleCloseAddTransactionModal = () => {
    setShowAddTransactionModal(false);
    setTransactionForm({
      name: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Food & Dining',
      type: 'expense',
      comments: ''
    });
  };

  const handleSaveNewTransaction = () => {
    if (onSaveTransaction && transactionForm.name && transactionForm.amount && selectedCardId) {
      const amount = parseFloat(transactionForm.amount);
      const finalAmount = transactionForm.type === 'expense' ? -amount : amount;
      
      const transactionData: Omit<Transaction, 'id'> = {
        name: transactionForm.name,
        amount: finalAmount,
        date: transactionForm.date,
        category: transactionForm.category,
        type: transactionForm.type,
        accountId: selectedCardId,
        ...(transactionForm.comments && { comments: transactionForm.comments })
      };
      
      onSaveTransaction(transactionData);
      handleCloseAddTransactionModal();
    }
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

  const handleSaveEditedCard = () => {
    if (editingCard && newCardForm.name && newCardForm.limit && onEditAccount) {
      const updatedCard: Account = {
        ...editingCard,
        name: newCardForm.name,
        limit: parseFloat(newCardForm.limit)
      };
      
      onEditAccount(updatedCard);
      handleCloseEditCardModal();
    }
  };

  const handleDeleteCard = (id: string) => {
    if (onDeleteAccount) {
      onDeleteAccount(id);
      setShowDeleteConfirm(null);
      
      // If we deleted the selected card, select the first available card
      if (id === selectedCardId && creditCards.length > 1) {
        const remainingCards = creditCards.filter(card => card.id !== id);
        if (remainingCards.length > 0) {
          setSelectedCardId(remainingCards[0].id);
        }
      }
    }
  };

  // Get card name by ID for all transactions view
  const getCardName = (accountId: string) => {
    const card = creditCards.find(card => card.id === accountId);
    return card ? card.name : 'Unknown Card';
  };

  // Default categories for transactions
  const categories = [
    'Food & Dining', 'Groceries', 'Transportation', 'Shopping', 
    'Entertainment', 'Utilities', 'Healthcare', 'Travel', 
    'Education', 'Personal', 'Other'
  ];

  return (
    <div className="space-y-8">
      {/* Card Selector */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
              Select Credit Card
            </label>
            <AnimatedDropdown
              selectedValue={selectedCardId}
              options={creditCards.map(card => ({ value: card.id, label: card.name }))}
              onChange={setSelectedCardId}
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => selectedCard && handleOpenEditCardModal(selectedCard)}
              className="flex items-center justify-center px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-900 dark:text-[#F5F5F5] rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500 transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={handleOpenAddCardModal}
              className="flex items-center justify-center px-4 py-2 bg-[#00C9A7] text-white rounded-lg font-medium hover:bg-[#00B8A0] transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Credit Card
            </button>
          </div>
        </div>
      </div>

      {selectedCard && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard
              title="Total Spend"
              value={`${currency}${totalSpend.toLocaleString()}`}
              change={limit > 0 ? `${Math.round((totalSpend / limit) * 100)}% of limit` : ''}
              changeType="neutral"
              icon={CreditCardIcon}
              color="bg-[#007BFF]"
            />
            <MetricCard
              title="Remaining Limit"
              value={`${currency}${(limit - totalSpend).toLocaleString()}`}
              change={`${currency}${limit.toLocaleString()} total limit`}
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
                  {currency}{totalSpend.toLocaleString()} of {currency}{limit.toLocaleString()}
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">
                  {viewMode === 'selected' 
                    ? `Recent ${selectedCard.name} Transactions` 
                    : 'All Credit Card Transactions'}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('selected')}
                    className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
                      viewMode === 'selected'
                        ? 'bg-[#007BFF] text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-[#F5F5F5] hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    Selected Card
                  </button>
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-3 py-1 text-sm rounded-lg transition-all duration-200 ${
                      viewMode === 'all'
                        ? 'bg-[#007BFF] text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-[#F5F5F5] hover:bg-gray-300 dark:hover:bg-gray-600'
                    }`}
                  >
                    All Cards
                  </button>
                </div>
              </div>
              <button
                onClick={handleOpenAddTransactionModal}
                className="flex items-center justify-center px-4 py-2 bg-[#007BFF] text-white rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Transaction
              </button>
            </div>
            <div className="space-y-4">
              {(viewMode === 'selected' ? cardTransactions.slice(0, 5) : allCreditCardTransactions).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">{transaction.name}</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm text-gray-500 dark:text-[#888888]">{transaction.category}</p>
                      {viewMode === 'all' && (
                        <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                          {getCardName(transaction.accountId || '')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#DC3545]">
                      {currency}{Math.abs(transaction.amount)}
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

      {/* Credit Cards List */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6">All Credit Cards</h3>
        <div className="space-y-4">
          {creditCards.map((card) => (
            <motion.div
              key={card.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-gray-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">{card.name}</h4>
                <p className="text-sm text-gray-500 dark:text-[#888888]">Limit: {currency}{card.limit?.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button 
                  onClick={() => handleOpenEditCardModal(card)}
                  className="p-2 text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#242424] rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Edit className="h-4 w-4" />
                </motion.button>
                <motion.button 
                  onClick={() => setShowDeleteConfirm(card.id)}
                  className="p-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-[#DC3545] hover:bg-gray-100 dark:hover:bg-[#242424] rounded-lg transition-all duration-200"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Trash2 className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Credit Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAddCardModal}
          >
            <motion.div
              className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  Add New Credit Card
                </h2>
                <motion.button
                  onClick={handleCloseAddCardModal}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="p-6 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
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
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
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
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    onClick={handleCloseAddCardModal}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSaveNewCard}
                    className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Card
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Credit Card Modal */}
      <AnimatePresence>
        {showEditCardModal && editingCard && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseEditCardModal}
          >
            <motion.div
              className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  Edit Credit Card
                </h2>
                <motion.button
                  onClick={handleCloseEditCardModal}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="p-6 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
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
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
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
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.button
                    onClick={handleCloseEditCardModal}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSaveEditedCard}
                    className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Save Changes
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  Confirm Deletion
                </h2>
                <motion.button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="p-6 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete this credit card? This action cannot be undone and all associated transactions will be affected.
                </p>
                
                <motion.div 
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => handleDeleteCard(showDeleteConfirm)}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete Card
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Transaction Modal */}
      <AnimatePresence>
        {showAddTransactionModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseAddTransactionModal}
          >
            <motion.div
              className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div 
                className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                  Add Transaction for {selectedCard?.name}
                </h2>
                <motion.button
                  onClick={handleCloseAddTransactionModal}
                  className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </motion.div>
              
              <motion.div 
                className="p-6 space-y-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                    Transaction Name *
                  </label>
                  <input
                    type="text"
                    value={transactionForm.name}
                    onChange={(e) => setTransactionForm({ ...transactionForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder="e.g., Dinner at Restaurant"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(e) => setTransactionForm({ ...transactionForm, amount: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder="0.00"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={transactionForm.date}
                    onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                    Category
                  </label>
                  <select
                    value={transactionForm.category}
                    onChange={(e) => setTransactionForm({ ...transactionForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                    Type
                  </label>
                  <div className="flex space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={transactionForm.type === 'expense'}
                        onChange={() => setTransactionForm({ ...transactionForm, type: 'expense' })}
                        className="text-[#007BFF] focus:ring-[#007BFF]"
                      />
                      <span className="ml-2 text-gray-900 dark:text-[#F5F5F5]">Expense</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        checked={transactionForm.type === 'income'}
                        onChange={() => setTransactionForm({ ...transactionForm, type: 'income' })}
                        className="text-[#007BFF] focus:ring-[#007BFF]"
                      />
                      <span className="ml-2 text-gray-900 dark:text-[#F5F5F5]">Income</span>
                    </label>
                  </div>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                    Comments
                  </label>
                  <textarea
                    value={transactionForm.comments}
                    onChange={(e) => setTransactionForm({ ...transactionForm, comments: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder="Add any notes about this transaction"
                    rows={3}
                  />
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  <motion.button
                    onClick={handleCloseAddTransactionModal}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSaveNewTransaction}
                    disabled={!transactionForm.name || !transactionForm.amount}
                    className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                      !transactionForm.name || !transactionForm.amount
                        ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-[#007BFF] text-white hover:bg-[#0056b3]'
                    }`}
                    whileHover={!transactionForm.name || !transactionForm.amount ? {} : { scale: 1.05 }}
                    whileTap={!transactionForm.name || !transactionForm.amount ? {} : { scale: 0.95 }}
                  >
                    Add Transaction
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreditCardsPage;