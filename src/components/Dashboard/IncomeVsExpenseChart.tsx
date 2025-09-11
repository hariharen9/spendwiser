import React from 'react';
import { Transaction } from '../../types/types';

interface IncomeVsExpenseChartProps {
  transactions: Transaction[];
}

const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({ transactions }) => {
  const processData = () => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return { month: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), income: 0, expense: 0 };
    }).reverse();

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      const monthIndex = months.findIndex(m => txDate.toLocaleString('default', { month: 'short' }) === m.month && txDate.getFullYear() === m.year);

      if (monthIndex !== -1) {
        if (t.type === 'income') {
          months[monthIndex].income += t.amount;
        } else {
          months[monthIndex].expense += Math.abs(t.amount);
        }
      }
    });

    return months;
  };

  const data = processData();
  const maxAmount = Math.max(...data.map(d => d.income), ...data.map(d => d.expense));

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Income vs. Expense (Last 6 Months)</h3>
      <div className="h-64 w-full">
        <svg width="100%" height="100%" viewBox={`0 0 500 250`}>
          {/* Y-axis labels */}
          <text x="0" y="15" className="text-xs fill-gray-500 dark:fill-gray-400">{maxAmount > 0 ? `₹${maxAmount.toLocaleString()}` : ''}</text>
          <text x="0" y="245" className="text-xs fill-gray-500 dark:fill-gray-400">₹0</text>
          <line x1="30" y1="10" x2="30" y2="240" className="stroke-gray-300 dark:stroke-gray-600" />

          {/* X-axis and bars */}
          <line x1="30" y1="240" x2="500" y2="240" className="stroke-gray-300 dark:stroke-gray-600" />
          {data.map((monthData, index) => {
            const x = 60 + index * 70;
            const incomeHeight = maxAmount > 0 ? (monthData.income / maxAmount) * 220 : 0;
            const expenseHeight = maxAmount > 0 ? (monthData.expense / maxAmount) * 220 : 0;

            return (
              <g key={monthData.month}>
                <rect x={x} y={240 - incomeHeight} width="20" height={incomeHeight} fill="#28A745" />
                <rect x={x + 25} y={240 - expenseHeight} width="20" height={expenseHeight} fill="#DC3545" />
                <text x={x + 12.5} y="255" textAnchor="middle" className="text-xs fill-gray-500 dark:fill-gray-400">{monthData.month}</text>
              </g>
            );
          })}
        </svg>
      </div>
       <div className="flex justify-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#28A745]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Income</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-[#DC3545]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-300">Expense</span>
          </div>
        </div>
    </div>
  );
};

export default IncomeVsExpenseChart;
