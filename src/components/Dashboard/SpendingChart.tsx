import React from 'react';
import { Transaction } from '../../types/types';

interface ChartData {
  category: string;
  amount: number;
  color: string;
}

interface SpendingChartProps {
  transactions: Transaction[];
}

const SpendingChart: React.FC<SpendingChartProps> = ({ transactions }) => {
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

  const data = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category);
      const amount = Math.abs(t.amount);
      if (existing) {
        existing.amount += amount;
      } else {
        acc.push({
          category: t.category,
          amount: amount,
          color: categoryColors[t.category] || '#6C757D',
        });
      }
      return acc;
    }, [] as ChartData[]);

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-[#888888]">No spending data for this month.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-6">Monthly Spending by Category</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="relative">
          <div className="w-48 h-48 mx-auto relative">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {data.map((item, index) => {
                const percentage = (item.amount / total) * 100;
                const previousPercentages = data
                  .slice(0, index)
                  .reduce((sum, prevItem) => sum + (prevItem.amount / total) * 100, 0);
                
                const circumference = 2 * Math.PI * 40;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                const strokeDashoffset = -((previousPercentages / 100) * circumference);

                return (
                  <circle
                    key={item.category}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={item.color}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-500"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">₹{total.toFixed(2)}</p>
                <p className="text-sm text-gray-500 dark:text-[#888888]">Total Spent</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.category} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-gray-900 dark:text-[#F5F5F5] font-medium">{item.category}</span>
              </div>
              <span className="text-[#888888] font-medium">₹{item.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;
