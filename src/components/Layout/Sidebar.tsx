import React from 'react';
import { 
  Home, 
  CreditCard, 
  Receipt, 
  PieChart, 
  Settings, 
  LogOut,
  DollarSign
} from 'lucide-react';
import { Screen, User } from '../../types/types';

interface SidebarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  user: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onScreenChange, user, onLogout }) => {
  const navItems = [
    { id: 'dashboard' as Screen, label: 'Dashboard', icon: Home },
    { id: 'transactions' as Screen, label: 'Transactions', icon: Receipt },
    { id: 'credit-cards' as Screen, label: 'Credit Cards', icon: CreditCard },
    { id: 'budgets' as Screen, label: 'Budgets', icon: PieChart },
    { id: 'settings' as Screen, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-gray-100 dark:bg-[#242424] h-screen w-64 flex flex-col border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="bg-[#007BFF] p-2 rounded-lg">
            <DollarSign className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">SpendWise</h1>
            <p className="text-sm text-gray-500 dark:text-[#888888]">Financial Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onScreenChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#007BFF] text-white'
                      : 'text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-200 dark:hover:bg-[#1A1A1A]'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-3">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-10 w-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-[#F5F5F5] truncate">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-[#888888] truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-200 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;