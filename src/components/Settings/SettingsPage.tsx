import React, { useState } from 'react';
import { User, Moon, Plus, Edit, Trash2, X, DollarSign } from 'lucide-react';
import { Account } from '../../types/types';
import { currencies } from '../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants, modalVariants } from '../../components/Common/AnimationVariants';

interface SettingsPageProps {
  user: User | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateCurrency: (currency: string) => void;
  defaultAccountId?: string | null;
  onSetDefaultAccount?: (accountId: string) => void;
  currency: string;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  user, 
  darkMode, 
  onToggleDarkMode, 
  accounts, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount,
  onUpdateCurrency,
  defaultAccountId,
  onSetDefaultAccount,
  currency
}) => {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'Checking',
    balance: '',
    limit: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleOpenModal = (account: Account | null) => {
    setEditingAccount(account);
    if (account) {
      setAccountForm({
        name: account.name,
        type: account.type,
        balance: account.balance.toString(),
        limit: account.limit?.toString() || ''
      });
    } else {
      setAccountForm({ name: '', type: 'Checking', balance: '', limit: '' });
    }
    setShowAddAccountModal(true);
  };

  const handleCloseModal = () => {
    setShowAddAccountModal(false);
    setEditingAccount(null);
    setAccountForm({ name: '', type: 'Checking', balance: '', limit: '' });
  };

  const handleSaveAccount = () => {
    if (accountForm.name && accountForm.balance) {
      const accountData: Omit<Account, 'id'> = {
        name: accountForm.name,
        type: accountForm.type,
        balance: parseFloat(accountForm.balance),
        ...(accountForm.type === 'Credit Card' && { limit: parseFloat(accountForm.limit) || 0 })
      };
      
      if (editingAccount) {
        onEditAccount({ ...accountData, id: editingAccount.id });
      } else {
        onAddAccount(accountData);
      }
      handleCloseModal();
    }
  };

  const handleConfirmDeleteAccount = (id: string) => {
    onDeleteAccount(id);
    setShowDeleteConfirm(null);
  };

  return (
    <>
      <motion.div 
        className="space-y-8"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
      {/* Profile Section */}
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
      >
        <motion.h3 
          className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <User className="h-5 w-5" />
          <span>Profile Settings</span>
        </motion.h3>
        
        <motion.div 
          className="flex items-center space-x-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.img
            src={user.photoURL} // Changed from avatar
            alt={user.displayName} // Changed from name
            className="h-20 w-20 rounded-full object-cover"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user.displayName} // Changed from name
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Currency Settings */}
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <motion.h3 
          className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DollarSign className="h-5 w-5" />
          <span>Currency Settings</span>
        </motion.h3>
        
        <motion.div 
          className="max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-2">
            Default Currency
          </label>
          <motion.select
            value={currency}
            onChange={(e) => onUpdateCurrency(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {currencies.map(currencyItem => (
              <option key={currencyItem.code} value={currencyItem.symbol}>
                {currencyItem.symbol} - {currencyItem.name}
              </option>
            ))}
          </motion.select>
        </motion.div>
      </motion.div>

      {/* Theme Settings */}
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.2 }}
      >
        <motion.h3 
          className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Moon className="h-5 w-5" />
          <span>Appearance</span>
        </motion.h3>
        
        <motion.div 
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div>
            <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-[#888888]">Use dark theme across the application</p>
          </div>
          <motion.button
            onClick={onToggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-all duration-200 ${darkMode ? 'bg-[#007BFF]' : 'bg-gray-300'}`}
            whileTap={{ scale: 0.9 }}
          >
            <motion.div 
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${darkMode ? 'left-7' : 'left-1'}`} 
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Default Account Settings */}
      {accounts.length > 1 && (
        <motion.div 
          className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.3 }}
        >
          <motion.h3 
            className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            Default Account
          </motion.h3>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
              Select Default Account
            </label>
            <p className="text-sm text-gray-500 dark:text-[#888888] mb-4">
              This account will be automatically selected when adding new transactions.
            </p>
            <motion.select
              value={defaultAccountId || ''}
              onChange={(e) => onSetDefaultAccount && onSetDefaultAccount(e.target.value)}
              className="w-full md:w-64 px-4 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <option value="">No default account</option>
              {accounts.map(account => (
                <option key={account.id} value={account.id}>{account.name}</option>
              ))}
            </motion.select>
          </motion.div>
        </motion.div>
      )}

      {/* Account Management */}
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.4 }}
      >
        <motion.div 
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Financial Accounts</h3>
          <motion.button 
            onClick={() => handleOpenModal(null)}
            className="flex items-center space-x-2 bg-[#00C9A7] text-white px-4 py-2 rounded-lg font-medium"
            variants={buttonHoverVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Account</span>
          </motion.button>
        </motion.div>

        <motion.div 
          className="space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-gray-600"
              variants={fadeInVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.1 * index }}
              whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">{account.name}</h4>
                <p className="text-sm text-gray-500 dark:text-[#888888]">{account.type}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                    ₹{account.balance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[#888888]">Current Balance</p>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button 
                    onClick={() => handleOpenModal(account)}
                    className="p-2 text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#242424] rounded-lg transition-all duration-200"
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Edit className="h-4 w-4" />
                  </motion.button>
                  <motion.button 
                    onClick={() => setShowDeleteConfirm(account.id)}
                    className="p-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-[#DC3545] hover:bg-gray-100 dark:hover:bg-[#242424] rounded-lg transition-all duration-200"
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
      </motion.div>

      {/* Add/Edit Account Modal */}
      <AnimatePresence>
        {showAddAccountModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
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
                  {editingAccount ? 'Edit Account' : 'Add New Account'}
                </h2>
                <motion.button
                  onClick={handleCloseModal}
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
                    Account Name *
                  </label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder="e.g., Personal, Business"
                  />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                    Account Type *
                  </label>
                  <motion.select
                    value={accountForm.type}
                    onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                    <option value="Business Checking">Business Checking</option>
                    <option value="Investment">Investment</option>
                    <option value="Credit Card">Credit Card</option>
                  </motion.select>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                    Current Balance *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={accountForm.balance}
                    onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder="0.00"
                  />
                </motion.div>

                {accountForm.type === 'Credit Card' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                      Credit Limit *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={accountForm.limit}
                      onChange={(e) => setAccountForm({ ...accountForm, limit: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                      placeholder="5000.00"
                    />
                  </motion.div>
                )}

                <motion.div 
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.button
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSaveAccount}
                    className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {editingAccount ? 'Update Account' : 'Add Account'}
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
                  Are you sure you want to delete this account? This action cannot be undone and all associated transactions will be affected.
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
                    onClick={() => handleConfirmDeleteAccount(showDeleteConfirm)}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete Account
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SettingsPage;