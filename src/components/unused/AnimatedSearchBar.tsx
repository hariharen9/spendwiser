import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';

interface AnimatedSearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  className?: string;
}

const AnimatedSearchBar: React.FC<AnimatedSearchBarProps> = ({ 
  placeholder = 'Search...', 
  onSearch,
  className = ''
}) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <motion.form
      className={`relative ${className}`}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <motion.div
          className="absolute inset-y-0 left-0 flex items-center pl-3"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
        </motion.div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-10 text-gray-900 focus:border-[#007BFF] focus:outline-none focus:ring-1 focus:ring-[#007BFF] dark:border-gray-600 dark:bg-[#1A1A1A] dark:text-white dark:placeholder-gray-400 dark:focus:border-[#007BFF] dark:focus:ring-[#007BFF]"
        />
        {query && (
          <motion.button
            type="button"
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={clearSearch}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
          </motion.button>
        )}
      </div>
    </motion.form>
  );
};

export default AnimatedSearchBar;