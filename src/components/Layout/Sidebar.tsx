import React from 'react';
import { 
  Home, 
  CreditCard, 
  Receipt, 
  PieChart, 
  Settings, 
  LogOut,
  DollarSign,
  Target,
  Landmark,
  Sun,
  Moon
} from 'lucide-react';
import { Screen } from '../../types/types';
import { User } from 'firebase/auth';
import { motion } from 'framer-motion';
import { buttonHoverVariants, fadeInVariants } from '../../components/Common/AnimationVariants';

interface SidebarProps {
  currentScreen: Screen;
  onScreenChange: (screen: Screen) => void;
  user: User | null; // Allow user to be null
  onLogout: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onScreenChange, user, onLogout, darkMode, onToggleDarkMode }) => {
  const navItems = [
    { id: 'dashboard' as Screen, label: 'Dashboard', icon: Home },
    { id: 'transactions' as Screen, label: 'Transactions', icon: Receipt },
    { id: 'credit-cards' as Screen, label: 'Credit Cards', icon: CreditCard },
    { id: 'budgets' as Screen, label: 'Budgets', icon: PieChart },
    { id: 'goals' as Screen, label: 'Goals', icon: Target },
    { id: 'loans' as Screen, label: 'EMIs', icon: Landmark },
    { id: 'settings' as Screen, label: 'Settings', icon: Settings },
  ];

  // Check if we're in mobile mode (user is null indicates mobile bottom nav)
  const isMobile = !user;

  if (isMobile) {
    const mobileNavItems = navItems.filter(item => item.id !== 'goals').map(item => {
      if (item.id === 'credit-cards') {
        return { ...item, label: 'CCs' };
      }
      return item;
    });
    // Mobile bottom navigation with icons only
    return (
      <motion.div 
        className="flex justify-evenly w-full py-2"
        initial="initial"
        animate="animate"
        variants={{
          initial: { opacity: 0, y: 20 },
          animate: { 
            opacity: 1, 
            y: 0,
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentScreen === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onScreenChange(item.id)}
              className={`flex flex-col items-center justify-center py-2 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'text-[#007BFF]'
                  : 'text-gray-500 dark:text-[#888888]'
              }`}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </motion.button>
          );
        })}
      </motion.div>
    );
  }

  // Desktop sidebar
  return (
    <motion.div 
      className="bg-gray-100 dark:bg-[#242424] h-screen w-64 flex flex-col border-r border-gray-200 dark:border-gray-700"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Logo */}
      <motion.div 
        className="p-6 border-b border-gray-200 dark:border-gray-700"
        variants={fadeInVariants}
        initial="initial"
        animate="animate"
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <img src="/icon-money.svg" alt="SpendWiser Logo" className="h-25 w-20" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-[#F5F5F5]">SpendWiser</h1>
            <p className="text-xs text-gray-500 dark:text-[#888888]">The Ultimate Financial Command Center</p>
          </div>
        </div>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = currentScreen === item.id;
            return (
              <motion.li 
                key={item.id}
                variants={fadeInVariants}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 * (index + 2) }}
              >
                <motion.button
                  onClick={() => onScreenChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-[#007BFF] text-white'
                      : 'text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-200 dark:hover:bg-[#1A1A1A]'
                  }`}
                  variants={buttonHoverVariants}
                  whileHover="hover"
                  whileTap="tap"
                  layout
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.button>
              </motion.li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      {user && (
        <motion.div 
          className="p-4 border-t border-gray-200 dark:border-gray-700"
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.7 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <motion.img
              src={user.photoURL || "https://i.pinimg.com/474x/18/b9/ff/18b9ffb2a8a791d50213a9d595c4dd52.jpg"} // Use photoURL
              alt={user.displayName || 'User'} // Use displayName
              className="h-10 w-10 rounded-full object-cover"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-[#F5F5F5] truncate">{user.displayName}</p>
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <motion.button
              onClick={onLogout}
              className="flex-grow flex items-center space-x-2 px-3 py-2 text-gray-500 dark:text-[#888888] hover:text-red-500 dark:hover:text-red-500 hover:bg-gray-200 dark:hover:bg-[#1A1A1A] rounded-lg transition-all duration-200"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Logout</span>
            </motion.button>

            <motion.button
              onClick={onToggleDarkMode}
              className="p-2 rounded-full text-gray-500 dark:text-[#888888] hover:text-gray-900 dark:hover:text-[#F5F5F5] hover:bg-gray-200 dark:hover:bg-[#1A1A1A] transition-colors"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-700" />
              )}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Sidebar;
