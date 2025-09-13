import React from 'react';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { buttonHoverVariants } from './AnimationVariants';

interface FABProps {
  onClick: () => void;
}

const FAB: React.FC<FABProps> = ({ onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed md:bottom-6 md:right-6 bottom-28 right-6 bg-[#00C9A7] text-white p-4 rounded-full shadow-xl z-50"
      variants={buttonHoverVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      animate={{ 
        scale: [1, 1.1, 1],
        boxShadow: [
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
        ]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  );
};

export default FAB;