import React, { useState } from 'react';
import { Transaction } from '../../types/types';
import CalendarDay from './CalendarDay';
import DayTooltip from './DayTooltip';

interface CalendarViewProps {
  currentMonth: Date;
  transactions: Transaction[];
  currency: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  currentMonth,
  transactions,
  currency,
}) => {
  const [tooltipData, setTooltipData] = useState<{
    isVisible: boolean;
    date: Date;
    transactions: Transaction[];
    mousePos: { x: number; y: number };
  }>({
    isVisible: false,
    date: new Date(),
    transactions: [],
    mousePos: { x: 0, y: 0 },
  });

  // Helpers to generate calendar grid
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = [];
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Days from previous month to fill the first row
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) - 6 (Sat)
    // Adjust for Monday start if needed (optional, keeping Sunday start for standard US/Global view)
    const paddingDaysStart = startDayOfWeek; 

    for (let i = paddingDaysStart; i > 0; i--) {
        const d = new Date(year, month, 1 - i);
        days.push({ date: d, isCurrentMonth: false });
    }

    // Days of current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
        const d = new Date(year, month, i);
        days.push({ date: d, isCurrentMonth: true });
    }

    // Days from next month to fill the grid (optional, usually 35 or 42 cells total)
    const remainingCells = 42 - days.length; // 6 rows * 7 cols
    for (let i = 1; i <= remainingCells; i++) {
        const d = new Date(year, month + 1, i);
        days.push({ date: d, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Map transactions to dates for faster lookup
  // Key: "YYYY-MM-DD" (Local time)
  const toLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const transactionsByDate = transactions.reduce((acc, t) => {
      // Ensure we parse the transaction date correctly as local YYYY-MM-DD
      // t.date is expected to be YYYY-MM-DD string
      if (!acc[t.date]) acc[t.date] = [];
      acc[t.date].push(t);
      return acc;
  }, {} as Record<string, Transaction[]>);

  const handleDayHover = (
      date: Date | null, 
      pos: { x: number; y: number }, 
      dayTransactions: Transaction[]
    ) => {
    if (date) {
      setTooltipData({
        isVisible: true,
        date,
        transactions: dayTransactions,
        mousePos: pos,
      });
    } else {
      setTooltipData(prev => ({ ...prev, isVisible: false }));
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden select-none">
      {/* Weekday Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#242424]">
        {weekDays.map((day) => (
          <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((dayObj, index) => {
            const dateStr = toLocalDateString(dayObj.date);
            const dayTransactions = transactionsByDate[dateStr] || [];
            
            return (
                <CalendarDay
                    key={index}
                    date={dayObj.date}
                    isCurrentMonth={dayObj.isCurrentMonth}
                    isToday={dayObj.date.toDateString() === new Date().toDateString()}
                    transactions={dayTransactions}
                    currency={currency}
                    onHover={handleDayHover}
                />
            );
        })}
      </div>

      {/* Floating Tooltip */}
      <DayTooltip
        isVisible={tooltipData.isVisible}
        date={tooltipData.date}
        transactions={tooltipData.transactions}
        currency={currency}
        mousePos={tooltipData.mousePos}
      />
    </div>
  );
};

export default CalendarView;
