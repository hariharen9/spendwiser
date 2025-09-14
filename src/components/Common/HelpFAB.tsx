import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';

interface HelpFABProps {
  onClick: () => void;
}

const HelpFAB: React.FC<HelpFABProps> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-24 md:bottom-6 left-6 md:left-72 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg z-40"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <HelpCircle className="w-6 h-6" />
    </motion.button>
  );
};

export default HelpFAB;
