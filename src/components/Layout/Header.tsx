import React from 'react';
import { Upload, Plus, Download } from 'lucide-react';
import AnimatedButton from '../Common/AnimatedButton';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryActionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  onAddTransaction?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  actionButton, 
  secondaryActionButton,
  onAddTransaction,
}) => {
  return (
    <motion.header 
      className="sticky top-0 z-30 px-6 py-4 pointer-events-none hidden md:block"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl border border-gray-200/50 dark:border-white/5 rounded-2xl shadow-sm px-6 py-4 flex items-center justify-between pointer-events-auto">
        
        {/* Title Section */}
        <div className="flex items-center gap-4">
          <motion.h1 
            className="text-2xl font-black text-gray-900 dark:text-white tracking-tight"
            key={title}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.h1>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-3">
          {secondaryActionButton && (
            <motion.button
              onClick={secondaryActionButton.onClick}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                secondaryActionButton.variant === 'secondary'
                  ? 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {secondaryActionButton.label === 'Import CSV' ? <Upload size={16} /> : null}
              {secondaryActionButton.label}
            </motion.button>
          )}

          {actionButton && actionButton.label !== 'Export Dashboard' && (
            <motion.button
              onClick={actionButton.onClick}
              className={`px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all ${
                actionButton.variant === 'secondary'
                  ? 'bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/10'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {actionButton.label === 'Export to CSV' ? <Download size={16} /> : null}
              {actionButton.label}
            </motion.button>
          )}

          {onAddTransaction && (
            <div className="pl-3 border-l border-gray-200 dark:border-white/10">
              <motion.button
                onClick={onAddTransaction}
                className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow"
                whileHover={{ scale: 1.05, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} strokeWidth={3} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
