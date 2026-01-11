import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Wallet, CreditCard, TrendingUp, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants, modalVariants } from '../../Common/AnimationVariants';
import AnimatedDropdown from '../../Common/AnimatedDropdown';
import { Account } from '../../../types/types';

interface AccountManagementProps {
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  currency: string;
}

const AccountCard: React.FC<{ 
  account: Account; 
  currency: string; 
  onEdit: () => void; 
  onDelete: () => void; 
}> = ({ account, currency, onEdit, onDelete }) => {
  const getIcon = () => {
    switch (account.type) {
      case 'Credit Card': return <CreditCard className="text-purple-500" size={20} />;
      case 'Investment': return <TrendingUp className="text-green-500" size={20} />;
      case 'Business Checking': return <Briefcase className="text-blue-500" size={20} />;
      default: return <Wallet className="text-orange-500" size={20} />;
    }
  };

  const getBgColor = () => {
    switch (account.type) {
      case 'Credit Card': return 'bg-purple-50 dark:bg-purple-900/10 border-purple-100 dark:border-purple-900/30';
      case 'Investment': return 'bg-green-50 dark:bg-green-900/10 border-green-100 dark:border-green-900/30';
      case 'Business Checking': return 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30';
      default: return 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-900/30';
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ y: -2, scale: 1.01 }}
      className={`relative p-5 rounded-2xl border transition-all duration-300 group ${getBgColor()}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white dark:bg-[#1A1A1A] rounded-xl shadow-sm">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-base">{account.name}</h4>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide opacity-80">{account.type}</span>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-2 bg-white dark:bg-[#1A1A1A] rounded-lg text-gray-400 hover:text-blue-500 shadow-sm hover:shadow-md transition-all">
            <Edit size={14} />
          </button>
          <button onClick={onDelete} className="p-2 bg-white dark:bg-[#1A1A1A] rounded-lg text-gray-400 hover:text-red-500 shadow-sm hover:shadow-md transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
          {currency}{account.balance.toLocaleString()}
        </p>
        {account.limit && (
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-purple-500 h-full rounded-full" 
              style={{ width: `${Math.min((account.balance / account.limit) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

const AccountManagement: React.FC<AccountManagementProps> = ({ accounts, onAddAccount, onEditAccount, onDeleteAccount, currency }) => {
  const filteredAccounts = useMemo(() => accounts.filter(acc => acc.type !== 'Credit Card'), [accounts]);
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
        balance: parseFloat(accountForm.balance)
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
    <motion.div
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <motion.div
        className="flex items-center justify-between mb-8 relative z-10"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
            <Wallet size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Accounts</h3>
        </div>
        <motion.button
          onClick={() => handleOpenModal(null)}
          className="flex items-center space-x-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          variants={buttonHoverVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Plus size={16} />
          <span>Add Account</span>
        </motion.button>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {filteredAccounts.map((account, index) => (
          <AccountCard 
            key={account.id} 
            account={account} 
            currency={currency} 
            onEdit={() => handleOpenModal(account)}
            onDelete={() => setShowDeleteConfirm(account.id)}
          />
        ))}
      </motion.div>

      {/* Add/Edit Account Modal */}
      <AnimatePresence>
        {showAddAccountModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                <h2 className="text-xl font-black text-gray-900 dark:text-white">
                  {editingAccount ? 'Edit Account' : 'New Account'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Main Checking"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                    Type
                  </label>
                  <AnimatedDropdown
                    selectedValue={accountForm.type}
                    options={['Checking', 'Savings', 'Business Checking', 'Investment']}
                    onChange={(value) => setAccountForm({ ...accountForm, type: value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 ml-1">
                    Current Balance
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 font-bold">{currency}</span>
                    <input
                      type="number"
                      step="0.01"
                      value={accountForm.balance}
                      onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveAccount}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                  >
                    Save Account
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal (Simplified) */}
      <AnimatePresence>
        {showDeleteConfirm && (
            <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(null)}>
                <motion.div className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Account?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone.</p>
                    <div className="flex gap-3">
                        <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold">Cancel</button>
                        <button onClick={() => handleConfirmDeleteAccount(showDeleteConfirm!)} className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-bold">Delete</button>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AccountManagement;