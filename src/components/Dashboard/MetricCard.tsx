import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral',
  icon: Icon,
  color 
}) => {
  const changeColor = {
    positive: 'text-[#28A745]',
    negative: 'text-[#DC3545]',
    neutral: 'text-[#888888]'
  };

  return (
    <div className="bg-white dark:bg-[#242424] rounded-lg p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {change && (
          <span className={`text-sm font-medium ${changeColor[changeType]}`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-gray-500 dark:text-[#888888] mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">{value}</p>
      </div>
    </div>
  );
};

export default MetricCard;