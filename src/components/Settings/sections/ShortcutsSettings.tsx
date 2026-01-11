import React from 'react';
import { motion } from 'framer-motion';
import { Shortcut } from '../../../types/types';
import { fadeInVariants } from '../../Common/AnimationVariants';
import { HelpCircle, Zap, Command, Plus } from 'lucide-react';

interface ShortcutsSettingsProps {
  shortcuts: Shortcut[];
  onOpenShortcutModal: () => void;
  onEditShortcut: (shortcut: Shortcut) => void;
  onOpenHelp: () => void;
}

const Keycap: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <kbd className="inline-flex items-center justify-center min-w-[24px] px-1.5 py-0.5 ml-1 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm font-mono">
    {children}
  </kbd>
);

const ShortcutsSettings: React.FC<ShortcutsSettingsProps> = ({ shortcuts, onOpenShortcutModal, onEditShortcut, onOpenHelp }) => {
  return (
    <motion.div
      className="bg-white dark:bg-[#1A1A1A] rounded-2xl p-8 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden"
      variants={fadeInVariants}
      initial="initial"
      animate="animate"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

      <motion.h3
        className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center justify-between relative z-10"
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg text-yellow-600 dark:text-yellow-400">
            <Zap size={20} />
          </div>
          <span>Quick Actions</span>
        </div>
        <button 
          onClick={onOpenHelp}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <HelpCircle size={20} />
        </button>
      </motion.h3>
      
      <div className="space-y-3 mb-6 relative z-10">
        {shortcuts.map((shortcut, index) => (
          <motion.div
            key={shortcut.id}
            onClick={() => onEditShortcut(shortcut)}
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 cursor-pointer hover:border-yellow-200 dark:hover:border-yellow-800/50 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/10 transition-all group"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
          >
            <div>
              <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{shortcut.name}</p>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                  shortcut.type === 'income' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {shortcut.type}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{shortcut.category}</span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-xs text-gray-400 mr-2 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">Press</span>
              <Keycap>{shortcut.keyword}</Keycap>
            </div>
          </motion.div>
        ))}
        {shortcuts.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
            <Command className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No shortcuts yet.</p>
          </div>
        )}
      </div>
      
      <motion.button
        onClick={onOpenShortcutModal}
        className="w-full py-3 bg-white dark:bg-[#242424] border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Plus size={16} />
        Create Shortcut
      </motion.button>
    </motion.div>
  );
};

export default ShortcutsSettings;
