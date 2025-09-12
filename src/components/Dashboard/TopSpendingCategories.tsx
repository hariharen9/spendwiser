import React from 'react';
import { Transaction } from '../../types/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { cardHoverVariants } from '../../components/Common/AnimationVariants';

interface TopSpendingCategoriesProps {
  transactions: Transaction[];
  currency: string;
}

const TopSpendingCategories: React.FC<TopSpendingCategoriesProps> = ({ transactions, currency }) => {
  const processData = () => {
    const categorySpending: { [key: string]: number } = {};
    const currentMonthTxs = transactions.filter(t => {
      const txDate = new Date(t.date);
      const today = new Date();
      return txDate.getMonth() === today.getMonth() && txDate.getFullYear() === today.getFullYear() && t.type === 'expense';
    });

    currentMonthTxs.forEach(t => {
      const amount = Math.abs(t.amount);
      if (categorySpending[t.category]) {
        categorySpending[t.category] += amount;
      } else {
        categorySpending[t.category] = amount;
      }
    });

    return Object.entries(categorySpending)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const topCategories = processData();

  if (topCategories.length === 0) {
    return (
      <motion.div 
        className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
        variants={cardHoverVariants}
        initial="initial"
        whileHover="hover"
        whileFocus="hover"
        layout
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Top Spending Categories</h3>
        <p className="text-gray-500 dark:text-[#888888]">No spending this month.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700"
      variants={cardHoverVariants}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      layout
    >
      <h3 className="text-lg font-semibold text-gray-900 dark:text-[#F5F5F5] mb-4">Top Spending Categories (This Month)</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={topCategories}
            margin={{
              top: 20, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tickFormatter={(value) => `${currency}${value / 1000}k`} />
            <YAxis dataKey="name" type="category" />
            <Tooltip formatter={(value: number) => `${currency}${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="amount" fill="#8884d8" name="Spent" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TopSpendingCategories;