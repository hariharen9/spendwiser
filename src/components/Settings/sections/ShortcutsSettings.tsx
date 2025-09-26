import React from 'react';
import { motion } from 'framer-motion';
import { Shortcut } from '../../../types/types';
import { fadeInVariants } from '../../Common/AnimationVariants';
import { HelpCircle, Zap } from 'lucide-react';

interface ShortcutsSettingsProps {
  shortcuts: Shortcut[];
  onOpenShortcutModal: () => void;
  onEditShortcut: (shortcut: Shortcut) => void;
  onOpenHelp: () => void;
}

const ShortcutsSettings: React.FC<ShortcutsSettingsProps> = ({ shortcuts, onOpenShortcutModal, onEditShortcut, onOpenHelp }) => {
  return (
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
        <Zap className="h-5 w-5" />
        <span>Transaction Shortcuts</span>
        <button 
          onClick={onOpenHelp}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-auto"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </motion.h3>
      
      <div className="space-y-4 mb-6">
        {shortcuts.map((shortcut, index) => (
          <motion.div
            key={shortcut.id}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-[#1A1A1A] rounded-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <div>
              <p className="font-medium text-gray-800 dark:text-white">{shortcut.keyword} &rarr; {shortcut.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{shortcut.category} ({shortcut.type})</p>
            </div>
            <button 
              onClick={() => onEditShortcut(shortcut)} 
              className="text-sm text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 hover:underline"
            >
              Edit
            </button>
          </motion.div>
        ))}
        {shortcuts.length === 0 && (
          <motion.p 
            className="text-gray-500 dark:text-gray-400 text-center py-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            No shortcuts created yet.
          </motion.p>
        )}
      </div>
      
      <motion.button
        onClick={onOpenShortcutModal}
        className="w-full py-2.5 px-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-sm hover:shadow-md"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Add New Shortcut
      </motion.button>
    </motion.div>
  );
};

export default ShortcutsSettings;