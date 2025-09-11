import React from 'react';
import { Transaction } from '../../types/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface IncomeVsExpenseChartProps {
  transactions: Transaction[];
  currency: string;
}

const IncomeVsExpenseChart: React.FC<IncomeVsExpenseChartProps> = ({ transactions, currency }) => {
  const processData = () => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return { name: d.toLocaleString('default', { month: 'short' }), year: d.getFullYear(), income: 0, expense: 0 };
    }).reverse();

    transactions.forEach(t => {
      const txDate = new Date(t.date);
      const monthIndex = months.findIndex(m => txDate.toLocaleString('default', { month: 'short' }) === m.name && txDate.getFullYear() === m.year);

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

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Income vs. Expense (Last 6 Months)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(value) => `${currency}${value / 1000}k`} />
            <Tooltip formatter={(value: number) => `${currency}${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="income" fill="#28A745" name="Income" />
            <Bar dataKey="expense" fill="#DC3545" name="Expense" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default IncomeVsExpenseChart;