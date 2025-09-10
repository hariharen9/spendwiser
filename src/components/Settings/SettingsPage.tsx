import React, { useState } from 'react';
import { User, Moon, Plus, Edit, Trash2, X, DollarSign } from 'lucide-react';
import { Account } from '../../types/types';
import { currencies } from '../../data/mockData';

interface SettingsPageProps {
  user: any;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateCurrency: (currency: string) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  user, 
  darkMode, 
  onToggleDarkMode, 
  accounts, 
  onAddAccount, 
  onEditAccount, 
  onDeleteAccount,
  onUpdateCurrency
}) => {
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountForm, setAccountForm] = useState({
    name: '',
    type: 'Checking',
    balance: '',
    limit: ''
  });

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

  return (
    <>
      <div className="space-y-8">
      {/* Profile Section */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Profile Settings</span>
        </h3>
        
        <div className="flex items-center space-x-6">
          <img
            src={user.photoURL} // Changed from avatar
            alt={user.displayName} // Changed from name
            className="h-20 w-20 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user.displayName} // Changed from name
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue={user.email}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                />
              </div>
            </div>
            <button className="mt-4 bg-[#007BFF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200">
              Update Profile
            </button>
          </div>
        </div>
      </div>

      {/* Currency Settings */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2">
          <DollarSign className="h-5 w-5" />
          <span>Currency Settings</span>
        </h3>
        
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-600 dark:text-[#888888] mb-2">
            Default Currency
          </label>
          <select
            value={user.currency} // This might need to be managed in state
            onChange={(e) => onUpdateCurrency(e.target.value)}
            className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.symbol}>
                {currency.symbol} - {currency.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2">
          <Moon className="h-5 w-5" />
          <span>Appearance</span>
        </h3>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-[#F5F5F5]">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-[#888888]">Use dark theme across the application</p>
          </div>
          <button
            onClick={onToggleDarkMode}
            className={`relative w-12 h-6 rounded-full transition-all duration-200 ${darkMode ? 'bg-[#007BFF]' : 'bg-gray-300'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-200 ${darkMode ? 'left-7' : 'left-1'}`} />
          </button>
        </div>
      </div>

      {/* Account Management */}
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5]">Financial Accounts</h3>
          <button 
            onClick={() => handleOpenModal(null)}
            className="flex items-center space-x-2 bg-[#00C9A7] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#00B8A0] transition-all duration-200">
            <Plus className="h-4 w-4" />
            <span>Add New Account</span>
          </button>
        </div>

        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-gray-600"
            >
              <div>
                <h4 className="font-medium text-gray-900 dark:text-[#F5F5F5]">{account.name}</h4>
                <p className="text-sm text-gray-500 dark:text-[#888888]">{account.type}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-[#F5F5F5]">
                    {user.currency}{account.balance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-[#888888]">Current Balance</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleOpenModal(account)}
                    className="p-2 text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#242424] rounded-lg transition-all duration-200">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => onDeleteAccount(account.id)}
                    className="p-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-[#DC3545] hover:bg-gray-100 dark:hover:bg-[#242424] rounded-lg transition-all duration-200">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      </div>

      {/* Add/Edit Account Modal */}
      {showAddAccountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                {editingAccount ? 'Edit Account' : 'Add New Account'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
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
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                  Account Type *
                </label>
                <select
                  value={accountForm.type}
                  onChange={(e) => setAccountForm({ ...accountForm, type: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF] appearance-none"
                >
                  <option value="Checking">Checking</option>
                  <option value="Savings">Savings</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Business Checking">Business Checking</option>
                  <option value="Investment">Investment</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-[#F5F5F5] mb-2">
                  {accountForm.type === 'Credit Card' ? 'Current Due' : 'Current Balance'} *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={accountForm.balance}
                  onChange={(e) => setAccountForm({ ...accountForm, balance: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                  placeholder="0.00"
                />
              </div>

              {accountForm.type === 'Credit Card' && (
                <div>
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
                </div>
              )}
              
              <div className="flex items-center justify-end space-x-4 pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAccount}
                  className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                >
                  {editingAccount ? 'Update Account' : 'Add Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SettingsPage;