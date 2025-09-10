import React from 'react';
import { Plus } from 'lucide-react';

interface HeaderProps {
  title: string;
  actionButton?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  onAddTransaction?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, actionButton, onAddTransaction }) => {
  return (
    <div className="bg-white dark:bg-[#1A1A1A] border-b border-gray-200 dark:border-gray-700 px-8 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-[#F5F5F5]">{title}</h1>
        <div className="flex items-center space-x-4">
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                actionButton.variant === 'secondary'
                  ? 'bg-[#242424] text-[#F5F5F5] border border-gray-600 hover:bg-[#2A2A2A]'
                  : 'bg-[#007BFF] text-white hover:bg-[#0056b3]'
              }`}
            >
              {actionButton.label}
            </button>
          )}
          {onAddTransaction && (
            <button
              onClick={onAddTransaction}
              className="bg-[#00C9A7] text-white p-3 rounded-full hover:bg-[#00B8A0] transition-all duration-200 shadow-lg"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;