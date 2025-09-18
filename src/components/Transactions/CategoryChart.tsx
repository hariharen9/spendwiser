import React, { useState, useCallback } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, Sector } from 'recharts';
import { motion } from 'framer-motion';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryChartProps {
  data: { name: string; value: number }[];
  currency: string;
}

const COLORS = [
  '#4C8EFF', '#22C55E', '#FFC107', '#FF5722', '#9C27B0',
  '#E91E63', '#3F51B5', '#00BCD4', '#8BC34A', '#FF9800'
];

const CustomTooltip = ({ active, payload, currency }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="font-semibold">{`${payload[0].name}`}</p>
        <p className="text-sm">{`Amount: ${currency}${payload[0].value.toFixed(2)}`}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{`Share: ${(payload[0].percent * 100).toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};

const renderActiveShape = (props: any) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent } = props;
  const RADIAN = Math.PI / 180;

  return (
    <g>
      <text x={cx} y={cy - 10} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.name}
      </text>
      <text x={cx} y={cy + 10} dy={8} textAnchor="middle" fill="#999">
        {`( ${(percent * 100).toFixed(2)}% )`}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10} // Make the active sector pop out
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
    </g>
  );
};

const CategoryChart: React.FC<CategoryChartProps> = ({ data, currency }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, [setActiveIndex]);

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/30 rounded-lg">
        <PieChartIcon className="w-12 h-12 mb-4 text-gray-400" />
        <h4 className="font-semibold text-lg">No Expense Data</h4>
        <p className="text-sm">The chart will appear here once you add some expenses.</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="w-full h-80"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <ResponsiveContainer>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            nameKey="name"
            onMouseEnter={onPieEnter}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip currency={currency} />} allowEscapeViewBox={{x: true, y: true}} />
          <Legend 
            iconSize={12} 
            wrapperStyle={{ fontSize: '14px', paddingTop: '20px' }} 
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default CategoryChart;
