import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, TrendingUp, TrendingDown, RotateCcw, Calculator, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticFeedback } from '../../hooks/useHaptic';
import { Shortcut } from '../../types/types';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

interface EnhancedFABProps {
  onAddTransaction: () => void;
  onAddIncome: () => void;
  onAddExpense: () => void;
  onRepeatLast: () => void;
  onOpenCalculator: () => void;
  onSelectShortcut: (shortcut: Shortcut) => void;
  shortcuts: Shortcut[];
  hasLastTransaction: boolean;
}

const EnhancedFAB: React.FC<EnhancedFABProps> = ({
  onAddTransaction,
  onAddIncome,
  onAddExpense,
  onRepeatLast,
  onOpenCalculator,
  onSelectShortcut,
  shortcuts,
  hasLastTransaction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);
  const fabRef = useRef<HTMLButtonElement>(null);
  const isLongPress = useRef(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        const menuElement = document.getElementById('fab-menu');
        if (menuElement && !menuElement.contains(e.target as Node)) {
          setIsOpen(false);
          setShowShortcuts(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const quickActions: QuickAction[] = [
    {
      id: 'expense',
      label: 'Add Expense',
      icon: <TrendingDown className="w-4 h-4" />,
      color: 'bg-red-500 hover:bg-red-600',
      onClick: () => {
        hapticFeedback('light');
        onAddExpense();
        setIsOpen(false);
      },
    },
    {
      id: 'income',
      label: 'Add Income',
      icon: <TrendingUp className="w-4 h-4" />,
      color: 'bg-emerald-500 hover:bg-emerald-600',
      onClick: () => {
        hapticFeedback('light');
        onAddIncome();
        setIsOpen(false);
      },
    },
    ...(hasLastTransaction ? [{
      id: 'repeat',
      label: 'Repeat Last',
      icon: <RotateCcw className="w-4 h-4" />,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => {
        hapticFeedback('light');
        onRepeatLast();
        setIsOpen(false);
      },
    }] : []),
    {
      id: 'calculator',
      label: 'Calculator',
      icon: <Calculator className="w-4 h-4" />,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => {
        hapticFeedback('light');
        onOpenCalculator();
        setIsOpen(false);
      },
    },
    {
      id: 'shortcuts',
      label: 'Shortcuts',
      icon: <Zap className="w-4 h-4" />,
      color: 'bg-amber-500 hover:bg-amber-600',
      onClick: () => {
        hapticFeedback('light');
        setShowShortcuts(!showShortcuts);
      },
    },
  ];

  // Handle touch start (long press detection)
  const handleTouchStart = () => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      hapticFeedback('medium');
      setIsOpen(true);
    }, 500);
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
    // If it wasn't a long press, treat as normal click
    if (!isLongPress.current && !isOpen) {
      hapticFeedback('light');
      onAddTransaction();
    }
  };

  // Handle touch move (cancel long press)
  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  // Handle mouse enter (desktop hover with 2 second delay)
  const handleMouseEnter = () => {
    // Only trigger hover menu on desktop
    if (window.innerWidth < 768) return;

    hoverTimer.current = setTimeout(() => {
      setIsOpen(true);
    }, 2000); // 2 second delay
  };

  // Handle mouse leave (cancel hover timer)
  const handleMouseLeave = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  // Handle click on main FAB
  const handleClick = () => {
    // Clear hover timer if clicking
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }

    if (isOpen) {
      setIsOpen(false);
      setShowShortcuts(false);
    } else {
      hapticFeedback('light');
      onAddTransaction();
    }
  };

  return (
    <div className="fixed md:bottom-6 md:right-6 bottom-24 right-6 z-50">
      {/* Speed Dial Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="fab-menu"
            className="absolute bottom-16 right-0 flex flex-col-reverse items-end gap-3 mb-2"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onMouseLeave={() => {
              // Only close on mouse leave for desktop
              if (window.innerWidth >= 768) {
                setIsOpen(false);
                setShowShortcuts(false);
              }
            }}
          >
            {quickActions.map((action, index) => (
              <motion.div
                key={action.id}
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: 20, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Label */}
                <motion.span
                  className="px-3 py-1.5 bg-gray-900/90 dark:bg-gray-100/90 text-white dark:text-gray-900 text-sm font-medium rounded-lg shadow-lg backdrop-blur-sm whitespace-nowrap"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 + 0.1 }}
                >
                  {action.label}
                </motion.span>

                {/* Action Button */}
                <motion.button
                  onClick={action.onClick}
                  className={`w-12 h-12 rounded-full ${action.color} text-white shadow-lg flex items-center justify-center transition-colors`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {action.icon}
                </motion.button>
              </motion.div>
            ))}

            {/* Shortcuts Sub-menu */}
            <AnimatePresence>
              {showShortcuts && (
                <motion.div
                  className="absolute bottom-0 right-16 mr-3 flex flex-col gap-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 max-h-64 overflow-y-auto min-w-[200px]"
                  initial={{ opacity: 0, x: 20, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.9 }}
                >
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 uppercase tracking-wide">
                    Quick Shortcuts
                  </p>
                  {shortcuts.length > 0 ? (
                    shortcuts.slice(0, 5).map((shortcut) => (
                      <motion.button
                        key={shortcut.id}
                        onClick={() => {
                          hapticFeedback('light');
                          onSelectShortcut(shortcut);
                          setIsOpen(false);
                          setShowShortcuts(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${shortcut.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>
                          {shortcut.type === 'income' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{shortcut.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{shortcut.keyword} • {shortcut.category}</p>
                        </div>
                      </motion.button>
                    ))
                  ) : (
                    <div className="px-3 py-4 text-center">
                      <Zap className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">No shortcuts yet</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        Create them in Settings → Shortcuts
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        ref={fabRef}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchMove={handleTouchMove}
        className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-colors ${
          isOpen
            ? 'bg-gray-700 dark:bg-gray-600'
            : 'bg-[#00C9A7]'
        }`}
        animate={isOpen ? {} : {
          scale: [1, 1.05, 1],
          boxShadow: [
            "0 10px 15px -3px rgba(0, 201, 167, 0.3), 0 4px 6px -2px rgba(0, 201, 167, 0.2)",
            "0 20px 25px -5px rgba(0, 201, 167, 0.3), 0 10px 10px -5px rgba(0, 201, 167, 0.2)",
            "0 10px 15px -3px rgba(0, 201, 167, 0.3), 0 4px 6px -2px rgba(0, 201, 167, 0.2)"
          ]
        }}
        transition={isOpen ? {} : {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Plus className="w-6 h-6 text-white" />
          )}
        </motion.div>
      </motion.button>

      {/* Hint text for first-time users */}
      {!isOpen && (
        <motion.div
          className="absolute -top-8 right-0 hidden md:block"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
            Hover for more
          </span>
        </motion.div>
      )}
    </div>
  );
};

export default EnhancedFAB;
