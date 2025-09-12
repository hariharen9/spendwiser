import React from 'react';
import { Download, Upload, FileDown } from 'lucide-react';
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
    <motion.div 
      className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-8 py-6 hidden md:block"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <motion.h1 
          className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          {title}
        </motion.h1>
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {secondaryActionButton && (
            <motion.button
              onClick={secondaryActionButton.onClick}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${secondaryActionButton.variant === 'secondary'
                  ? 'bg-[#242424] text-[#F5F5F5] border border-gray-600 hover:bg-[#2A2A2A]'
                  : 'bg-[#007BFF] text-white hover:bg-[#0056b3]'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {secondaryActionButton.label === 'Import CSV' && <Upload className="h-4 w-4 mr-2" />}
              {secondaryActionButton.label}
            </motion.button>
          )}
          {actionButton && (
            <motion.button
              onClick={actionButton.onClick}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${actionButton.variant === 'secondary'
                  ? 'bg-[#242424] text-[#F5F5F5] border border-gray-600 hover:bg-[#2A2A2A]'
                  : 'bg-[#007BFF] text-white hover:bg-[#0056b3]'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {actionButton.label === 'Export to CSV' && <Download className="h-4 w-4 mr-2" />}
              {actionButton.label === 'Export Dashboard' && <FileDown className="h-4 w-4 mr-2" />}
              {actionButton.label}
            </motion.button>
          )}
          {onAddTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <AnimatedButton onClick={onAddTransaction} />
            </motion.div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Header;