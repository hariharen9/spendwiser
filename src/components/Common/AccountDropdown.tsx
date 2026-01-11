import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Account } from '../../types/types';

interface AccountDropdownProps {
  accounts: Account[];
  creditCards: Account[];
  selectedValue: string;
  onChange: (value: string) => void;
  defaultAccountId?: string | null;
  placeholder?: string;
  currency?: string;
}

const dropdownVariants = {
  initial: { opacity: 0, scale: 0.95, y: -10 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 20 },
  },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.1 } },
};

const optionVariants = {
  initial: { opacity: 0, x: -10 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.05, type: 'spring', stiffness: 400, damping: 25 },
  }),
};

const formatAccountName = (account: Account, currency: string = '₹') => {
  if (account.type === 'Credit Card') {
    return account.name;
  }
  return `${account.name} (${currency}${account.balance.toFixed(2)})`;
};

const AccountDropdown: React.FC<AccountDropdownProps> = ({
  accounts,
  creditCards,
  selectedValue,
  onChange,
  defaultAccountId,
  placeholder = 'Select an account',
  currency = '₹',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const allAccounts = [...accounts, ...creditCards];

  const handleSelect = (accountId: string) => {
    onChange(accountId);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getSelectedLabel = () => {
    const selectedAccount = allAccounts.find(acc => acc.id === selectedValue);
    if (!selectedAccount) return placeholder;
    return formatAccountName(selectedAccount, currency);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <motion.button
        type="button"
        className="w-full flex items-center justify-between rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-[#1A1A1A] dark:border-gray-600 dark:text-white py-2 px-3 transition-all text-left"
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.98 }}
      >
        <span>{getSelectedLabel()}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        >
          <ChevronDown className="h-5 w-5 text-gray-400" />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute z-10 mt-1 w-full bg-white dark:bg-[#2c2c2c] rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-y-auto max-h-60"
            variants={dropdownVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <ul className="py-1">
              {accounts.length > 0 && (
                <>
                  <li className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                    Accounts
                  </li>
                  {accounts.map((account, i) => (
                    <motion.li
                      key={account.id}
                      className={`px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 cursor-pointer ${selectedValue === account.id ? 'bg-blue-100 dark:bg-blue-800/50 font-semibold' : ''}`}
                      onClick={() => handleSelect(account.id)}
                      custom={i}
                      variants={optionVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {formatAccountName(account, currency)} {account.id === defaultAccountId ? '(Default)' : ''}
                    </motion.li>
                  ))}
                </>
              )}
              {creditCards.length > 0 && (
                <>
                  <li className="px-3 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase mt-2">
                    Credit Cards
                  </li>
                  {creditCards.map((card, i) => (
                    <motion.li
                      key={card.id}
                      className={`px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-500 cursor-pointer ${selectedValue === card.id ? 'bg-blue-100 dark:bg-blue-800/50 font-semibold' : ''}`}
                      onClick={() => handleSelect(card.id)}
                      custom={accounts.length + i}
                      variants={optionVariants}
                      initial="initial"
                      animate="animate"
                    >
                      {formatAccountName(card, currency)} {card.id === defaultAccountId ? '(Default)' : ''}
                    </motion.li>
                  ))}
                </>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AccountDropdown;
