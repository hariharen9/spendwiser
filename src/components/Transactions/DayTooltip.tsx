import React, { useRef, useLayoutEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../../types/types';

interface DayTooltipProps {
  isVisible: boolean;
  date: Date;
  transactions: Transaction[];
  currency: string;
  mousePos: { x: number; y: number };
}

const DayTooltip: React.FC<DayTooltipProps> = ({
  isVisible,
  date,
  transactions,
  currency,
  mousePos,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (isVisible && tooltipRef.current) {
      const tooltip = tooltipRef.current;
      const { width, height } = tooltip.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = mousePos.x + 15; // Default: right of cursor
      let y = mousePos.y + 15; // Default: below cursor

      // Check right edge
      if (x + width > viewportWidth - 20) {
        x = mousePos.x - width - 15; // Switch to left of cursor
      }

      // Check bottom edge
      if (y + height > viewportHeight - 20) {
        y = mousePos.y - height - 15; // Switch to above cursor
      }

      // Ensure it doesn't go off-screen top/left
      x = Math.max(20, x);
      y = Math.max(20, y);

      setPosition({ x, y });
    }
  }, [isVisible, mousePos]);

  if (!isVisible) return null;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  return (
    <AnimatePresence>
      <motion.div
        ref={tooltipRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1, x: position.x, y: position.y }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.1, ease: "easeOut" }} // Smooth follow
        className="fixed z-50 pointer-events-none bg-white dark:bg-[#242424] rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-72 backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95 top-0 left-0"
      >
        <div className="flex justify-between items-center mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
          <h3 className="font-bold text-gray-900 dark:text-gray-100">
            {date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </h3>
          <div className="text-xs font-mono text-gray-500">
             Net: <span className={totalIncome - totalExpense >= 0 ? "text-green-500" : "text-red-500"}>
                {totalIncome - totalExpense >= 0 ? '+' : '-'}{currency}{Math.abs(totalIncome - totalExpense).toLocaleString()}
             </span>
          </div>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-2">No activity</p>
        ) : (
          <div className="space-y-3">
             {/* Actual Transactions */}
            {transactions.length > 0 && (
                <div className="space-y-1">
                {transactions.map((t) => (
                    <div key={t.id} className="flex justify-between text-xs items-center">
                    <div className="flex items-center truncate max-w-[70%]">
                        <span className={`w-1.5 h-1.5 rounded-full mr-2 ${t.type === 'income' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-gray-700 dark:text-gray-300 truncate">{t.name}</span>
                    </div>
                    <span className={`font-medium ${t.type === 'income' ? 'text-green-600' : 'text-red-500'}`}>
                        {t.type === 'income' ? '+' : '-'}{currency}{Math.abs(t.amount).toLocaleString()}
                    </span>
                    </div>
                ))}
                </div>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default DayTooltip;
