import React, { useRef } from 'react';
import { Transaction } from '../../types/types';

interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  transactions: Transaction[];
  currency: string;
  onHover: (date: Date | null, pos: { x: number; y: number }, transactions: Transaction[]) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  date,
  isCurrentMonth,
  isToday,
  transactions,
  currency,
  onHover,
}) => {
  const cellRef = useRef<HTMLDivElement>(null);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (cellRef.current) {
        // Pass initial position
        onHover(date, { x: e.clientX, y: e.clientY }, transactions);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      onHover(date, { x: e.clientX, y: e.clientY }, transactions);
  }

  const handleMouseLeave = () => {
    onHover(null, { x: 0, y: 0 }, []);
  };

  return (
    <div
      ref={cellRef}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`
        relative h-24 md:h-32 border-b border-r border-gray-100 dark:border-gray-800 transition-colors cursor-pointer
        hover:bg-gray-50 dark:hover:bg-gray-800/50
        ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-[#1f1f1f] text-gray-400' : 'bg-white dark:bg-[#1A1A1A]'}
        ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}
      `}
    >
      {/* Date Number */}
      <div className={`
        absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium
        ${isToday ? 'bg-blue-500 text-white shadow-md' : 'text-gray-700 dark:text-gray-300'}
      `}>
        {date.getDate()}
      </div>

      {/* Content */}
      <div className="absolute top-10 left-0 w-full px-2 space-y-1">
        {totalIncome > 0 && (
           <div className="flex items-center justify-between text-[10px] md:text-xs bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded text-green-700 dark:text-green-400 font-medium">
             <span className="hidden md:inline">Income</span>
             <span>+{currency}{totalIncome.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })}</span>
           </div>
        )}
        {totalExpense > 0 && (
           <div className="flex items-center justify-between text-[10px] md:text-xs bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded text-red-700 dark:text-red-400 font-medium">
             <span className="hidden md:inline">Exp</span>
             <span>-{currency}{totalExpense.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 })}</span>
           </div>
        )}
      </div>
    </div>
  );
};

export default CalendarDay;
