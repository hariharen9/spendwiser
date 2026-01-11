import React, { useState } from 'react';
import { Trash2, X, ShieldAlert, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeInVariants, buttonHoverVariants, modalVariants } from '../../Common/AnimationVariants';

interface SecuritySettingsProps {
  onDeleteUserAccount?: () => void;
}

const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onDeleteUserAccount }) => {
  const [showDeleteAccountWarningModal, setShowDeleteAccountWarningModal] = useState(false);
  const [showDeleteAccountConfirmationModal, setShowDeleteAccountConfirmationModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  return (
    <motion.div
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <motion.h3
        className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3 relative z-10"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
          <ShieldAlert size={20} />
        </div>
        <span>Danger Zone</span>
      </motion.h3>

      <div className="relative z-10">
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 mt-1">
              <AlertTriangle size={20} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-red-700 dark:text-red-400 text-lg mb-1">Delete Account</h4>
              <p className="text-sm text-red-600/80 dark:text-red-400/70 mb-6 leading-relaxed">
                Permanently delete your account and all associated data. This action cannot be undone and you will lose all your financial records.
              </p>
              <motion.button
                onClick={() => setShowDeleteAccountWarningModal(true)}
                className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-red-500/30 hover:bg-red-700 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Trash2 size={16} />
                <span>Delete My Account</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete User Account Warning Modal */}
      <AnimatePresence>
        {showDeleteAccountWarningModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteAccountWarningModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Are you absolutely sure?</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 leading-relaxed">
                  This action will permanently delete your account, including all transactions, budgets, and settings.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowDeleteAccountWarningModal(false)}
                    className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteAccountWarningModal(false);
                      setShowDeleteAccountConfirmationModal(true);
                    }}
                    className="px-4 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete User Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteAccountConfirmationModal && (
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteAccountConfirmationModal(false)}
          >
            <motion.div
              className="bg-white dark:bg-[#1A1A1A] rounded-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md shadow-2xl"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-lg font-black text-gray-900 dark:text-white">Final Confirmation</h2>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  To confirm deletion, please type <span className="font-bold text-red-600 select-none">DELETE</span> below:
                </p>
                
                <input
                  type="text"
                  value={deleteConfirmationText}
                  onChange={(e) => setDeleteConfirmationText(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-center tracking-widest text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 mb-6"
                  placeholder="Type DELETE"
                />

                <button
                  onClick={onDeleteUserAccount}
                  disabled={deleteConfirmationText !== 'DELETE'}
                  className="w-full py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                >
                  Permanently Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SecuritySettings;