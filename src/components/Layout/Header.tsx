import React, { useState, useEffect } from 'react';
import { Upload, Calculator, Clock, Calendar as CalendarIcon } from 'lucide-react';
import AnimatedButton from '../Common/AnimatedButton';
import { motion, AnimatePresence } from 'framer-motion';

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
  onOpenCalculator?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  actionButton, 
  secondaryActionButton,
  onAddTransaction,
  onOpenCalculator
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10);

    return () => clearInterval(timer);
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short' 
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit',
      hour12: true 
    });
  };

  const [isTimeHovered, setIsTimeHovered] = useState(false);

  return (
    <motion.div 
      className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-8 py-6 hidden md:block"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-baseline space-x-4">
          <motion.h1 
            className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            {title}
          </motion.h1>
          <div className="relative">
            <motion.div 
              className="flex items-center space-x-3 text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-[#242424] px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-800 cursor-help"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              onMouseEnter={() => setIsTimeHovered(true)}
              onMouseLeave={() => setIsTimeHovered(false)}
            >
              <div className="flex items-center">
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
                <span>{formatDate(currentTime)}</span>
              </div>
              <div className="w-px h-3 bg-gray-300 dark:bg-gray-700" />
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
                <span className="font-mono">{formatTime(currentTime)}</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {isTimeHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 p-2 bg-gray-800 text-white text-xs rounded-lg shadow-xl z-[60] whitespace-nowrap border border-gray-700 pointer-events-none"
                >
                  <div className="font-mono text-[10px]">
                    Year: {currentTime.getFullYear()} • MS: {currentTime.getMilliseconds().toString().padStart(3, '0')}
                  </div>
                  <div className="mt-1 text-blue-300">
                    Gomalaaaaaaa 😂
                  </div>
                  {/* Tooltip arrow */}
                  <div className="absolute -top-1 left-6 w-2 h-2 bg-gray-800 border-t border-l border-gray-700 transform rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {onOpenCalculator && (
            <motion.button
              onClick={onOpenCalculator}
              className="p-2.5 rounded-lg bg-gray-100 dark:bg-[#242424] text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2A2A2A] border border-gray-200 dark:border-gray-600 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Calculator"
            >
              <Calculator className="h-5 w-5" />
            </motion.button>
          )}
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
          {actionButton && actionButton.label !== 'Export Dashboard' && ( // Exclude export dashboard button
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
              {actionButton.label === 'Export to CSV' && <Upload className="h-4 w-4 mr-2" />}
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