import React from 'react';
import { motion } from 'framer-motion';

interface StyledCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  id: string;
}

const StyledCheckbox: React.FC<StyledCheckboxProps> = ({ label, checked, onChange, id }) => {
  return (
    <div className="flex items-center">
      <motion.div
        className="relative flex items-center justify-center w-6 h-6 cursor-pointer"
        onClick={() => onChange(!checked)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <motion.div
          className="absolute w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center"
          animate={{
            backgroundColor: checked ? '#3B82F6' : 'transparent',
            borderColor: checked ? '#3B82F6' : '#D1D5DB'
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.svg
          className="absolute w-3 h-3 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          initial={false}
          animate={{ pathLength: checked ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.path
            d="M5 13l4 4L19 7"
            initial={{ pathLength: 0 }}
          />
        </motion.svg>
      </motion.div>
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900 dark:text-gray-100 cursor-pointer" onClick={() => onChange(!checked)}>
        {label}
      </label>
    </div>
  );
};

export default StyledCheckbox;
