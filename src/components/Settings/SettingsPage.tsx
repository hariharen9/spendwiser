import React, { useState } from 'react';
import { User, Moon, Plus, Edit, Trash2, X, DollarSign, Tag, RotateCcw, Settings } from 'lucide-react';
import { Account } from '../../types/types';
import { currencies, getDefaultCategories } from '../../data/mockData';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, staggerContainer, buttonHoverVariants, modalVariants } from '../../components/Common/AnimationVariants';

interface SettingsPageProps {
  user: any;
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
  categories: string[];
  onAddCategory: (category: string) => void;
  onEditCategory: (oldCategory: string, newCategory: string) => void;
  onDeleteCategory: (category: string) => void;
  onResetCategories: () => void;
  onUpdateCategories: (categories: string[]) => void;
  onLoadMockData?: () => void;
  onClearMockData?: () => void; // Add clear mock data prop
  onDeleteUserAccount?: () => void;
  onBackupData?: () => void;
  onRestoreData?: (data: any) => void;
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
  currency,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onResetCategories,
  onUpdateCategories,
  onLoadMockData,
  onClearMockData, // Add clear mock data prop
  onDeleteUserAccount,
  onBackupData,
  onRestoreData
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
  
  // Category management states
  const [showCategoryEditorModal, setShowCategoryEditorModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showResetCategoriesConfirm, setShowResetCategoriesConfirm] = useState(false);
  const [draggedCategory, setDraggedCategory] = useState<string | null>(null);

  // Delete account states
  const [showDeleteAccountWarningModal, setShowDeleteAccountWarningModal] = useState(false);
  const [showDeleteAccountConfirmationModal, setShowDeleteAccountConfirmationModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

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

  // Category management functions
  const handleOpenCategoryEditor = () => {
    setShowCategoryEditorModal(true);
  };

  const handleCloseCategoryEditor = () => {
    setShowCategoryEditorModal(false);
    setEditingCategory('');
    setNewCategoryName('');
  };

  const handleOpenEditCategoryModal = (category: string) => {
    setEditingCategory(category);
    setNewCategoryName(category);
  };

  const handleCloseEditCategoryModal = () => {
    setEditingCategory('');
    setNewCategoryName('');
  };

  const handleSaveEditedCategory = () => {
    if (newCategoryName.trim() && newCategoryName.trim() !== editingCategory) {
      onEditCategory(editingCategory, newCategoryName.trim());
      handleCloseEditCategoryModal();
    }
  };

  const handleOpenDeleteCategoryConfirm = (category: string) => {
    setCategoryToDelete(category);
  };

  const handleCloseDeleteCategoryConfirm = () => {
    setCategoryToDelete(null);
  };

  const handleConfirmDeleteCategory = () => {
    if (categoryToDelete) {
      onDeleteCategory(categoryToDelete);
      handleCloseDeleteCategoryConfirm();
    }
  };

  const handleConfirmResetCategories = () => {
    onResetCategories();
    setShowResetCategoriesConfirm(false);
  };

  const handleSaveNewCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
      onAddCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  // Drag and drop functions for rearranging categories
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, category: string) => {
    e.dataTransfer.setData('text/plain', category);
    setDraggedCategory(category);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetCategory: string) => {
    e.preventDefault();
    const draggedCategoryName = e.dataTransfer.getData('text/plain');
    
    if (draggedCategoryName !== targetCategory) {
      const newCategories = [...categories];
      const draggedIndex = newCategories.indexOf(draggedCategoryName);
      const targetIndex = newCategories.indexOf(targetCategory);
      
      // Remove the dragged category
      newCategories.splice(draggedIndex, 1);
      // Insert at the new position
      newCategories.splice(targetIndex, 0, draggedCategoryName);
      
      // Update the categories
      onUpdateCategories(newCategories);
    }
    
    setDraggedCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedCategory(null);
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

      {/* Data Management */}
      <motion.div
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.5 }}
      >
        <motion.h3
          className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6 flex items-center space-x-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Settings className="h-5 w-5" />
          <span>Data Management</span>
        </motion.h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <motion.button
              onClick={onBackupData}
              className="flex items-center justify-center space-x-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm w-full"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span>Backup Data</span>
            </motion.button>
            <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-black text-white text-xs rounded py-1 px-2">Download all your data as a JSON file.</span>
            </div>
          </div>
          <div className="relative group">
            <motion.button
              onClick={() => document.getElementById('restore-input')?.click()}
              className="flex items-center justify-center space-x-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm w-full"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span>Restore Data</span>
            </motion.button>
            <input
              type="file"
              id="restore-input"
              className="hidden"
              accept=".json"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    if (event.target?.result) {
                      try {
                        const data = JSON.parse(event.target.result as string);
                        if (onRestoreData) {
                          onRestoreData(data);
                        }
                      } catch (error) {
                        console.error("Error parsing JSON file:", error);
                      }
                    }
                  };
                  reader.readAsText(e.target.files[0]);
                }
              }}
            />
            <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-black text-white text-xs rounded py-1 px-2">Restore your data from a JSON backup file.</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category and Mock Data Buttons */}
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.3 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Mock Data</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <motion.button 
                  onClick={onLoadMockData}
                  className="flex items-center justify-center space-x-1 bg-[#007BFF] text-white px-3 py-2 rounded-lg font-medium text-sm w-full"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span>Load MockData</span>
                </motion.button>
                <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-black text-white text-xs rounded py-1 px-2">Load demo data</span>
                </div>
              </div>
              <div className="relative group">
                <motion.button 
                  onClick={onClearMockData}
                  className="flex items-center justify-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm w-full"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <span>Clear MockData</span>
                </motion.button>
                <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-black text-white text-xs rounded py-1 px-2">Clear demo data</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 dark:bg-[#1A1A1A] rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Advanced Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <motion.button 
                  onClick={handleOpenCategoryEditor}
                  className="flex items-center justify-center space-x-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm w-full"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Categories</span>
                </motion.button>
                <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-black text-white text-xs rounded py-1 px-2">Manage your transaction categories</span>
                </div>
              </div>
              <div className="relative group">
                <motion.button
                  onClick={() => setShowDeleteAccountWarningModal(true)}
                  className="flex items-center justify-center space-x-1 bg-red-500 text-white px-3 py-2 rounded-lg font-medium text-sm w-full"
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Account</span>
                </motion.button>
                <div className="absolute bottom-full mb-2 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="bg-black text-white text-xs rounded py-1 px-2">Permanently delete your account and all data</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Editor Modal */}
      <AnimatePresence>
        {showCategoryEditorModal && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseCategoryEditor}
          >
            <motion.div 
              className="bg-white dark:bg-[#242424] rounded-lg border border-gray-200 dark:border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto"
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
                  Edit Categories
                </h2>
                <motion.button
                  onClick={handleCloseCategoryEditor}
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
                {/* Add new category */}
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder="New category name"
                  />
                  <motion.button
                    onClick={handleSaveNewCategory}
                    className="bg-[#007BFF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!newCategoryName.trim() || categories.includes(newCategoryName.trim())}
                  >
                    <Plus className="h-4 w-4" />
                  </motion.button>
                </div>
                
                {/* Category list with drag and drop */}
                <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                  {categories.map((category, index) => (
                    <motion.div
                      key={category}
                      draggable
                      onDragStart={(e) => handleDragStart(e, category)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, category)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg border border-gray-200 dark:border-gray-600 cursor-move ${
                        draggedCategory === category ? 'opacity-50' : ''
                      }`}
                      variants={fadeInVariants}
                      initial="initial"
                      animate="animate"
                      transition={{ delay: 0.1 * index }}
                    >
                      <div className="flex items-center space-x-2">
                        <div className="cursor-move text-gray-400 dark:text-[#888888]">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-[#F5F5F5]">{category}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <motion.button 
                          onClick={() => handleOpenEditCategoryModal(category)}
                          className="p-1 text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] hover:bg-gray-100 dark:hover:bg-[#242424] rounded transition-all duration-200"
                          variants={buttonHoverVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button 
                          onClick={() => handleOpenDeleteCategoryConfirm(category)}
                          className="p-1 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-[#DC3545] hover:bg-gray-100 dark:hover:bg-[#242424] rounded transition-all duration-200"
                          variants={buttonHoverVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                {/* Reset and Close buttons */}
                <div className="flex justify-between pt-4">
                  <motion.button
                    onClick={() => setShowResetCategoriesConfirm(true)}
                    className="flex items-center space-x-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-lg font-medium text-sm"
                    variants={buttonHoverVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>Reset</span>
                  </motion.button>
                  <motion.button
                    onClick={handleCloseCategoryEditor}
                    className="bg-[#007BFF] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Close
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {editingCategory && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseEditCategoryModal}
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
                  Edit Category
                </h2>
                <motion.button
                  onClick={handleCloseEditCategoryModal}
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
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                    placeholder="e.g., Entertainment, Groceries"
                  />
                </motion.div>
                
                <motion.div 
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <motion.button
                    onClick={handleCloseEditCategoryModal}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleSaveEditedCategory}
                    className="bg-[#007BFF] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#0056b3] transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!newCategoryName.trim() || (newCategoryName.trim() === editingCategory) || categories.includes(newCategoryName.trim())}
                  >
                    Update Category
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Category Confirmation Modal */}
      <AnimatePresence>
        {categoryToDelete && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseDeleteCategoryConfirm}
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
                  onClick={handleCloseDeleteCategoryConfirm}
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
                  Are you sure you want to delete the category "<strong>{categoryToDelete}</strong>"? 
                  All transactions with this category will be changed to "Other".
                  This action cannot be undone.
                </p>
                
                <motion.div 
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={handleCloseDeleteCategoryConfirm}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmDeleteCategory}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Delete Category
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Categories Confirmation Modal */}
      <AnimatePresence>
        {showResetCategoriesConfirm && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowResetCategoriesConfirm(false)}
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
                  Confirm Reset
                </h2>
                <motion.button
                  onClick={() => setShowResetCategoriesConfirm(false)}
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
                  Are you sure you want to reset all categories to the default list? 
                  Your custom categories will be removed and all transactions will be updated accordingly.
                  This action cannot be undone.
                </p>
                
                <motion.div 
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => setShowResetCategoriesConfirm(false)}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleConfirmResetCategories}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Reset Categories
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* Delete Account Confirmation Modal */}
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

      {/* Delete User Account Warning Modal */}
      <AnimatePresence>
        {showDeleteAccountWarningModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteAccountWarningModal(false)}
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
                <h2 className="text-xl font-bold text-red-500">Warning: Account Deletion</h2>
                <motion.button
                  onClick={() => setShowDeleteAccountWarningModal(false)}
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
                  This is a permanent action that will delete your entire account, including all transactions, budgets, and settings. This cannot be undone. Are you sure you want to proceed?
                </p>

                <motion.div
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => setShowDeleteAccountWarningModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowDeleteAccountWarningModal(false);
                      setShowDeleteAccountConfirmationModal(true);
                    }}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Continue
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAccountConfirmationModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteAccountConfirmationModal(false)}
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
                <h2 className="text-xl font-bold text-red-500">Final Confirmation</h2>
                <motion.button
                  onClick={() => setShowDeleteAccountConfirmationModal(false)}
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
                  To confirm, please type "DELETE" in the box below.
                </p>
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-[#F5F5F5] focus:outline-none focus:border-[#007BFF]"
                  placeholder="DELETE"
                />

                <motion.div
                  className="flex items-center justify-end space-x-4 pt-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    onClick={() => setShowDeleteAccountConfirmationModal(false)}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={onDeleteUserAccount}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={deleteConfirmationText !== 'DELETE'}
                  >
                    Delete My Account
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
    </>
  );
};

export default SettingsPage;