import React, { useState, useEffect } from 'react';
import { X, Tag, Type, DollarSign, Briefcase } from 'lucide-react';
import { Shortcut, Account } from '../../types/types';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../Common/AnimationVariants';
import AnimatedDropdown from '../Common/AnimatedDropdown';

interface ShortcutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (shortcut: Omit<Shortcut, 'id'>) => void;
  onUpdate: (shortcut: Shortcut) => void;
  onDelete: (id: string) => void;
  onEditShortcut: (shortcut: Shortcut) => void; // Add this prop
  editingShortcut?: Shortcut;
  shortcuts: Shortcut[];
  categories: string[];
  accounts: Account[];
}

const ShortcutModal: React.FC<ShortcutModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  onEditShortcut, // Destructure this prop
  editingShortcut,
  shortcuts,
  categories,
  accounts,
}) => {
  const [formData, setFormData] = useState({
    keyword: '',
    name: '',
    category: categories[0] || '',
    type: 'expense' as 'income' | 'expense',
    accountId: ''
  });

  useEffect(() => {
    if (editingShortcut) {
      setFormData({
        keyword: editingShortcut.keyword,
        name: editingShortcut.name,
        category: editingShortcut.category,
        type: editingShortcut.type,
        accountId: editingShortcut.accountId || ''
      });
    } else {
      setFormData({
        keyword: '',
        name: '',
        category: categories[0] || '',
        type: 'expense',
        accountId: ''
      });
    }
  }, [editingShortcut, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingShortcut) {
      onUpdate({ ...formData, id: editingShortcut.id });
    } else {
      onSave(formData);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white dark:bg-[#242424] rounded-xl border border-gray-200 dark:border-gray-700 w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]"
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">
                Manage Shortcuts
              </h2>
              <motion.button
                onClick={onClose}
                className="text-gray-500 dark:text-[#888888] hover:text-gray-800 dark:hover:text-[#F5F5F5] p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X className="h-5 w-5 md:h-6 md:w-6" />
              </motion.button>
            </div>

            <div className="p-4 md:p-6 overflow-y-auto">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <span className="font-semibold">How to use shortcuts:</span> After creating a shortcut, use it in the Add Transaction form by typing the keyword followed by a dot and amount (e.g., "coffee.50") and then clicking away from the field.
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Keyword</label>
                    <input
                      type="text"
                      required
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 px-3 transition-all"
                      placeholder="e.g., coffee, lunch, gas"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Short, memorable words to trigger this shortcut</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Transaction Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 px-3 transition-all"
                      placeholder="e.g., Morning Coffee, Lunch with Team, Gas Station"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Full description of the transaction</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Category</label>
                  <AnimatedDropdown
                    selectedValue={formData.category}
                    options={categories}
                    onChange={(value) => setFormData({ ...formData, category: value })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Category for this transaction type</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <motion.button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'income' })}
                      className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        formData.type === 'income'
                          ? 'bg-[#28A745] text-white shadow-md'
                          : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#888888] border border-gray-300 dark:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Income
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'expense' })}
                      className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        formData.type === 'expense'
                          ? 'bg-[#DC3545] text-white shadow-md'
                          : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-700 dark:text-[#888888] border border-gray-300 dark:border-gray-600'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Expense
                    </motion.button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Account (Optional)</label>
                  <AnimatedDropdown
                    selectedValue={formData.accountId}
                    options={accounts.map(acc => ({ value: acc.id, label: acc.name }))}
                    onChange={(value) => setFormData({ ...formData, accountId: value })}
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Select an account to auto-populate in transactions</p>
                </div>
                <div className="flex justify-end space-x-4 pt-4">
                  <motion.button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 dark:text-[#888888] rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {editingShortcut ? 'Update Shortcut' : 'Save Shortcut'}
                  </motion.button>
                </div>
              </form>

              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 dark:text-[#F5F5F5] mb-4">Existing Shortcuts</h3>
                <div className="space-y-2">
                  {shortcuts.map(shortcut => (
                    <div key={shortcut.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">{shortcut.keyword} &rarr; {shortcut.name}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{shortcut.category} ({shortcut.type})</p>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => {
                            onEditShortcut(shortcut);
                            onClose();
                          }}
                          className="p-2 text-gray-500 hover:text-blue-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          onClick={() => onDelete(shortcut.id)}
                          className="p-2 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ShortcutModal;
