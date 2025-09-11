import React from 'react';
import { Transaction } from '../../types/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  transactions: Transaction[];
  currency: string;
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions, currency }) => {
  const categoryColors: { [key: string]: string } = {
    'Groceries': '#007BFF',
    'Food & Dining': '#00C9A7',
    'Transportation': '#28A745',
    'Entertainment': '#FFC107',
    'Shopping': '#DC3545',
    'Utilities': '#17A2B8',
    'Health': '#6F42C1',
    'Other': '#FD7E14',
  };

  const data: ChartData[] = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.name === t.category);
      const amount = Math.abs(t.amount);
      if (existing) {
        existing.value += amount;
      } else {
        acc.push({
          name: t.category,
          value: amount,
          color: categoryColors[t.category] || '#6C757D',
        });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-[#888888]">No spending data for this month.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Monthly Spending by Category</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => `${currency}${value.toLocaleString()}`} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingChart;