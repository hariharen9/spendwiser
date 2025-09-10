import React from 'react';

interface ChartData {
  category: string;
  amount: number;
  color: string;
}

const SpendingChart: React.FC = () => {
  const data: ChartData[] = [
    { category: 'Groceries', amount: 320, color: '#007BFF' },
    { category: 'Food & Dining', amount: 240, color: '#00C9A7' },
    { category: 'Transportation', amount: 180, color: '#28A745' },
    { category: 'Entertainment', amount: 125, color: '#FFC107' },
    { category: 'Shopping', amount: 150, color: '#DC3545' },
  ];

  const total = data.reduce((sum, item) => sum + item.amount, 0);

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
                <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">₹{total}</p>
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
              <span className="text-[#888888] font-medium">₹{item.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpendingChart;