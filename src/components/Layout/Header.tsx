import React from 'react';
import { Download } from 'lucide-react';
import { Transaction } from '../../types/types';
import AnimatedButton from '../Common/AnimatedButton';

interface HeaderProps {
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  onAddTransaction?: () => void;
  onExportCSV?: () => void;
  filteredTransactions?: Transaction[];
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  actionButton, 
  onAddTransaction,
  onExportCSV,
  filteredTransactions
}) => {
  const handleExport = () => {
    if (onExportCSV) {
      onExportCSV();
    }
  };

  return (
    <div className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-8 py-6 hidden md:block">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">{title}</h1>
        <div className="flex items-center space-x-4">
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center ${
                actionButton.variant === 'secondary'
                  ? 'bg-[#242424] text-[#F5F5F5] border border-gray-600 hover:bg-[#2A2A2A]'
                  : 'bg-[#007BFF] text-white hover:bg-[#0056b3]'
              }`}
            >
              {actionButton.label === 'Export to CSV' && <Download className="h-4 w-4 mr-2" />}
              {actionButton.label}
            </button>
          )}
          {onAddTransaction && (
            <AnimatedButton onClick={onAddTransaction} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;